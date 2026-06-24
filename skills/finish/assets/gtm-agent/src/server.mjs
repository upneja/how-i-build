// GTM agent HTTP server. Zero external deps (Node built-ins only).
// Routes: POST /sms (Twilio inbound webhook) · GET /health
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "./lib/env.mjs";
import { handleMessage } from "./lib/handler.mjs";
import { loadState, saveState } from "./lib/state.mjs";
import { defaultActions } from "./lib/actions.mjs";
import { validateTwilioSignature, twiml } from "./lib/twilio.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadEnv(path.join(__dirname, "..", "secrets.env"));

const STATE_PATH = process.env.STATE_PATH || path.join(__dirname, "..", "state.json");
const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_URL = process.env.PUBLIC_URL || "";
const SKIP_VALIDATION = process.env.SKIP_TWILIO_VALIDATION === "1";
const actions = defaultActions();

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => resolve(data));
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ ok: true, fired: loadState(STATE_PATH).fired }));
  }

  if (req.method === "POST" && req.url.split("?")[0] === "/sms") {
    const raw = await readBody(req);
    const params = Object.fromEntries(new URLSearchParams(raw));
    const fullUrl = PUBLIC_URL
      ? PUBLIC_URL.replace(/\/$/, "") + "/sms"
      : `https://${req.headers.host}/sms`;
    const sig = req.headers["x-twilio-signature"];

    if (!SKIP_VALIDATION && !validateTwilioSignature(process.env.TWILIO_AUTH_TOKEN, fullUrl, params, sig)) {
      res.writeHead(403);
      return res.end("invalid signature");
    }

    const state = loadState(STATE_PATH);
    const { reply, newState } = await handleMessage(
      state,
      params.From || "",
      params.Body || "",
      actions,
      { ownerPhone: process.env.NOTIFY_PHONE },
    );
    saveState(STATE_PATH, newState);

    res.writeHead(200, { "Content-Type": "text/xml" });
    return res.end(twiml(reply));
  }

  res.writeHead(404);
  res.end("not found");
});

server.listen(PORT, () => {
  console.log(`[gtm-agent] listening on :${PORT} (state: ${STATE_PATH})`);
  if (SKIP_VALIDATION) console.warn("[gtm-agent] WARNING: Twilio signature validation is OFF");
});
