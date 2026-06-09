# Fixit247 Voice Bot

An AI phone receptionist for the Fixit247 line (`0342403111`). When someone calls,
"Jack" — a natural-sounding male Australian agent — greets them, works out whether
it's an **emergency** or a **planned repair/trade job**, captures their details, and
reassures them a Fixer will be dispatched. After the call, the conversation is
summarised into a structured request and logged to `voice_call_logs` for the admin
team to action.

It uses **Twilio ConversationRelay** (Twilio handles speech-to-text and
text-to-speech) bridged to **Claude** over a WebSocket. Because it needs a
persistent WebSocket connection, it runs as its **own always-on service**, separate
from the Next.js app.

## How it works

```
Caller dials 0342403111
        │
        ▼
Twilio  ──POST /incoming-call──▶  this service returns TwiML:
                                   <Connect><ConversationRelay url="wss://…/conversation" …/>
        │
        ▼
Twilio opens a WebSocket to /conversation
   • caller speech  → {type:"prompt", voicePrompt:"…"}  → Claude (streamed) → TTS tokens back
   • on hangup      → transcript summarised → inserted into voice_call_logs
```

## Deploy on Render (separate web service)

1. **New → Web Service**, point at this repo, set **Root Directory** to `voice-bot`.
2. Build command: `npm install`  ·  Start command: `npm start`
3. Environment variables:

| Var | Required | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ | Claude API key |
| `VOICE_PUBLIC_HOST` | ✅ | The service's public host with **no protocol**, e.g. `fixit247-voice.onrender.com`. Used to build the `wss://` URL. |
| `SUPABASE_URL` | optional | Enables logging calls to `voice_call_logs` |
| `SUPABASE_SERVICE_ROLE_KEY` | optional | Service-role key for the insert |
| `VOICE_MODEL` | optional | Default `claude-haiku-4-5` (low latency = natural phone pace) |
| `VOICE_TTS_VOICE` | optional | Default `en-AU-Neural2-B` (male Australian). See voices below. |
| `VOICE_TTS_PROVIDER` | optional | Default `Google`. Can be `Amazon` or `ElevenLabs` (ElevenLabs needs a key configured in the Twilio console). |
| `VOICE_WELCOME` | optional | Override the spoken opening line |

4. Run the DB migration `supabase/migrations/20260609160000_voice_call_logs.sql`.

## Point the Twilio number at it

In the Twilio console → **Phone Numbers → 0342403111 → Voice Configuration**:

- **A call comes in** → Webhook → `https://<VOICE_PUBLIC_HOST>/incoming-call` → **HTTP POST**

That's it — calls now reach Jack.

## Male Australian voice options

`VOICE_TTS_VOICE` (with `VOICE_TTS_PROVIDER=Google`, language `en-AU`):

| Voice | Style |
|---|---|
| `en-AU-Neural2-B` *(default)* | Male, natural |
| `en-AU-Neural2-D` | Male, alternate |
| `en-AU-Wavenet-B` / `-D` | Male, WaveNet |

For the most human-like result, set `VOICE_TTS_PROVIDER=ElevenLabs` and a male
ElevenLabs voice ID (requires connecting your ElevenLabs key in the Twilio console).

## A note on disclosure

Jack is written to sound like a real person and not volunteer that it's automated.
Some Australian guidance encourages disclosing AI involvement to callers. If you
want a light disclosure, set `VOICE_WELCOME` to something like:
*"G'day, you've reached Fixit247 — you're speaking with our virtual assistant Jack.
How can I help?"* The triage and capture behaviour is unchanged.
