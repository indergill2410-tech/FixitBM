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

  if (!supabase) {
    console.log("Voice call (no Supabase configured):", { from: session.from, summary });
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

  if (error) console.error("Supabase insert failed:", error.message);
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
