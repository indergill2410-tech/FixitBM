import http from "node:http";
import express from "express";
import { WebSocketServer } from "ws";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

// --- Configuration -----------------------------------------------------------
const PORT = process.env.PORT || 8080;
const PUBLIC_HOST = process.env.VOICE_PUBLIC_HOST || ""; // e.g. fixit247-voice.onrender.com (no protocol)
const CONVERSATION_MODEL = process.env.VOICE_MODEL || "claude-haiku-4-5"; // low latency for natural phone turns
const TTS_PROVIDER = process.env.VOICE_TTS_PROVIDER || "Google";
const TTS_VOICE = process.env.VOICE_TTS_VOICE || "en-AU-Neural2-B"; // male Australian English
const TTS_LANGUAGE = process.env.VOICE_TTS_LANGUAGE || "en-AU";

const WELCOME_GREETING =
  process.env.VOICE_WELCOME ||
  "G'day, you've reached Fixit247. I'm Jack — how can I help you today? Is this an emergency, or are you after a planned repair or trade job?";

const SYSTEM_PROMPT = `You are Jack, a friendly Australian phone agent for Fixit247, an emergency repair and trades service in Australia.

You are speaking to a caller on the phone. Keep it natural, warm, and conversational — like a real Aussie bloke working the front desk. Speak in short, spoken-sounding sentences (this is a phone call, not an email). Use natural Australian phrasing ("no worries", "too easy", "righto", "I'll get that sorted"). Never sound robotic or scripted. Never say you are an AI, a bot, an assistant, automated, or a computer. If asked if you're a real person, deflect warmly and naturally and steer back to helping them ("I'm here to help you get this sorted — what's going on?").

Your job on every call:
1. Greet warmly (already done by the opening line) and find out what they need.
2. Work out whether it's an EMERGENCY (urgent — burst pipe, gas leak, no power, lockout, flooding, no hot water in winter, safety risk) or a PLANNED job (renovation, quote, non-urgent repair, maintenance, a trade booking for later).
3. If it's an emergency: reassure them, tell them you'll get a Fixer dispatched as a priority, and gather the key details quickly.
4. If it's planned: let them know the team will arrange a suitable time and a quote.
5. Gather, conversationally (don't interrogate — ask one thing at a time):
   - Their name
   - The suburb / address of the job
   - A callback number
   - What the problem or job is
   - Whether it's emergency or planned
6. Once you have the essentials, confirm them back briefly, reassure the caller that Fixit247 will be in touch shortly to dispatch a Fixer, and close warmly.

Keep responses to one or two short sentences at a time so the conversation flows naturally on the phone. Do not read out long lists. Do not mention prices or make guarantees about timing beyond "shortly" or "as a priority".`;

const SUMMARY_SYSTEM = `You extract a structured job request from a phone-call transcript between a Fixit247 agent and a caller. Return only the facts present in the transcript; use null for anything not stated.`;

// --- Clients -----------------------------------------------------------------
const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase =
  SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } })
    : null;

// --- HTTP: Twilio incoming-call webhook returns ConversationRelay TwiML -------
const app = express();
app.use(express.urlencoded({ extended: false }));

app.get("/", (_req, res) => res.status(200).send("Fixit247 voice bot is running."));

app.post("/incoming-call", (req, res) => {
  const host = PUBLIC_HOST || req.headers.host;
  const wsUrl = `wss://${host}/conversation`;

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay url="${wsUrl}" welcomeGreeting="${escapeXml(WELCOME_GREETING)}" ttsProvider="${TTS_PROVIDER}" voice="${TTS_VOICE}" language="${TTS_LANGUAGE}" transcriptionProvider="Google" interruptible="true" />
  </Connect>
</Response>`;

  res.type("text/xml").send(twiml);
});

const server = http.createServer(app);

// --- WebSocket: the live ConversationRelay session ---------------------------
const wss = new WebSocketServer({ server, path: "/conversation" });

wss.on("connection", (ws) => {
  const session = {
    callSid: null,
    from: null,
    history: [] // Anthropic message array
  };

  ws.on("message", async (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    switch (msg.type) {
      case "setup":
        session.callSid = msg.callSid || null;
        session.from = msg.from || null;
        break;

      case "prompt":
        // Caller said something (final transcription)
        if (msg.voicePrompt) {
          session.history.push({ role: "user", content: msg.voicePrompt });
          await respond(ws, session);
        }
        break;

      case "interrupt":
        // Caller talked over the agent — we just let the next prompt drive.
        break;

      case "error":
        console.error("ConversationRelay error:", msg.description || msg);
        break;

      default:
        break;
    }
  });

  ws.on("close", () => {
    // Fire-and-forget: summarise the call and log the request.
    logCallRequest(session).catch((err) => console.error("logCallRequest failed:", err.message));
  });
});

// Stream one assistant turn back to ConversationRelay as TTS tokens.
async function respond(ws, session) {
  let assistantText = "";

  try {
    const stream = anthropic.messages.stream({
      model: CONVERSATION_MODEL,
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: session.history
    });

    stream.on("text", (delta) => {
      assistantText += delta;
      send(ws, { type: "text", token: delta, last: false });
    });

    await stream.finalMessage();
  } catch (err) {
    console.error("Anthropic stream failed:", err.message);
    const fallback = "Sorry mate, I didn't quite catch that — could you say it again?";
    assistantText = fallback;
    send(ws, { type: "text", token: fallback, last: false });
  }

  // Signal end of this assistant turn.
  send(ws, { type: "text", token: "", last: true });

  if (assistantText.trim()) {
    session.history.push({ role: "assistant", content: assistantText });
  }
}

// After the call ends, extract a structured request and store it.
async function logCallRequest(session) {
  if (!session.history.length) return;

  const transcript = session.history
    .map((turn) => `${turn.role === "user" ? "Caller" : "Jack"}: ${turn.content}`)
    .join("\n");

  let summary = null;
  try {
    const response = await anthropic.messages.create({
      model: CONVERSATION_MODEL,
      max_tokens: 500,
      system: SUMMARY_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Transcript:\n\n${transcript}\n\nExtract the job request.`
        }
      ],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              caller_name: { type: ["string", "null"] },
              callback_number: { type: ["string", "null"] },
              suburb_or_address: { type: ["string", "null"] },
              issue: { type: ["string", "null"] },
              urgency: { type: ["string", "null"], enum: ["emergency", "planned", null] },
              summary: { type: ["string", "null"] }
            },
            required: ["caller_name", "callback_number", "suburb_or_address", "issue", "urgency", "summary"]
          }
        }
      }
    });

    const block = response.content.find((b) => b.type === "text");
    if (block) summary = JSON.parse(block.text);
  } catch (err) {
    console.error("Summary extraction failed:", err.message);
  }

  const isEmergency = summary?.urgency === "emergency";

  if (!supabase) {
    console.log("Voice call (no Supabase configured):", { from: session.from, summary });
    if (isEmergency) await sendEmergencyAlerts(session, summary, null);
    return;
  }

  const { error } = await supabase.from("voice_call_logs").insert({
    call_sid: session.callSid,
    from_number: session.from,
    caller_name: summary?.caller_name ?? null,
    callback_number: summary?.callback_number ?? session.from ?? null,
    suburb_or_address: summary?.suburb_or_address ?? null,
    issue: summary?.issue ?? null,
    urgency: summary?.urgency ?? null,
    summary: summary?.summary ?? null,
    transcript
  });

  if (error) console.error("voice_call_logs insert failed:", error.message);

  // Phase 3 — drop the captured request into the admin dispatch queue.
  let reference = null;
  if (summary?.issue) {
    reference = await createDispatchJob(session, summary);
  }

  // Phase 1 + 2 — alert the desk the instant an emergency comes in.
  if (isEmergency) {
    await sendEmergencyAlerts(session, summary, reference);
  }
}

// Insert a guest job so the request lands in /admin/jobs with Fixer suggestions.
async function createDispatchJob(session, summary) {
  if (!supabase) return null;

  const callback = summary?.callback_number ?? session.from ?? "Unknown";
  const isEmergency = summary?.urgency === "emergency";
  const title = (summary?.issue || "Phone request").slice(0, 120);
  const description = [
    "Captured by the Fixit247 voice line.",
    summary?.summary ? `Summary: ${summary.summary}` : null,
    `Issue: ${summary?.issue ?? "Not stated"}`,
    `Urgency: ${summary?.urgency ?? "Not stated"}`,
    `Caller: ${summary?.caller_name ?? "Unknown"} · ${callback}`,
    `Location: ${summary?.suburb_or_address ?? "Not stated"}`
  ]
    .filter(Boolean)
    .join("\n");

  const { data: job, error } = await supabase
    .from("jobs")
    .insert({
      customer_id: null,
      type: "home",
      category: "Phone enquiry",
      urgency: isEmergency ? "emergency" : "flexible",
      title,
      description,
      suburb: summary?.suburb_or_address ?? null,
      guest_name: summary?.caller_name ?? "Phone caller",
      guest_phone: callback,
      guest_email: null,
      preferred_contact_method: "call",
      consent_to_contact: true,
      status: "received",
      credit_cost: isEmergency ? 120 : 50
    })
    .select("id, public_reference")
    .single();

  if (error) {
    console.error("dispatch job insert failed:", error.message);
    return null;
  }

  await supabase.from("job_status_events").insert({
    job_id: job.id,
    status: "received",
    title: isEmergency ? "Emergency phone request posted" : "Phone request posted",
    note: "Captured by the Fixit247 voice line."
  });

  return job.public_reference ?? null;
}

// Email (Resend) + optional SMS (Twilio) alert for emergency calls.
async function sendEmergencyAlerts(session, summary, reference) {
  const callback = summary?.callback_number ?? session.from ?? "Unknown";
  const lines = [
    `Caller: ${summary?.caller_name ?? "Unknown"}`,
    `Callback: ${callback}`,
    `Location: ${summary?.suburb_or_address ?? "Not stated"}`,
    `Issue: ${summary?.issue ?? "Not stated"}`,
    summary?.summary ? `Summary: ${summary.summary}` : null,
    reference ? `Request reference: ${reference}` : null
  ].filter(Boolean);

  await Promise.all([sendEmailAlert(lines), sendSmsAlert(summary, callback, reference)]);
}

async function sendEmailAlert(lines) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.FIXIT_ALERT_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL || "Fixit247 <hello@fixit247.com.au>";
  if (!apiKey || !to) return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fixit247.com.au";
  const html = `<h2>🚨 Emergency call received</h2><p>${lines.join("<br>")}</p><p><a href="${appUrl}/admin/calls">Open the call in the admin console</a></p>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject: "🚨 Emergency call — Fixit247", html })
    });
    if (!res.ok) console.error("Resend alert failed:", res.status, await res.text());
  } catch (err) {
    console.error("Resend alert error:", err.message);
  }
}

async function sendSmsAlert(summary, callback, reference) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_SMS_FROM || process.env.TWILIO_PHONE_NUMBER;
  const to = process.env.ADMIN_SMS_ALERT_PHONE;
  // Dormant until an SMS-capable number + admin mobile are configured.
  if (!sid || !token || !from || !to) return;

  const body = `🚨 Fixit247 EMERGENCY call. ${summary?.caller_name ?? "Caller"} (${callback}) — ${summary?.issue ?? "no detail"} @ ${summary?.suburb_or_address ?? "?"}.${reference ? ` Ref ${reference}.` : ""} Check admin.`;

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }).toString()
    });
    if (!res.ok) console.error("Twilio SMS alert failed:", res.status, await res.text());
  } catch (err) {
    console.error("Twilio SMS alert error:", err.message);
  }
}

// --- Helpers -----------------------------------------------------------------
function send(ws, payload) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(payload));
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

server.listen(PORT, () => {
  console.log(`Fixit247 voice bot listening on :${PORT} (model: ${CONVERSATION_MODEL}, voice: ${TTS_VOICE})`);
});
