// Local simulation, proves the draft-by-default contract without a live server or
// real Twilio. Run: node test/simulate.mjs   (exits non-zero on any failure)
import crypto from "node:crypto";
import { handleMessage } from "../src/lib/handler.mjs";
import { validateTwilioSignature, twiml } from "../src/lib/twilio.mjs";

let pass = 0,
  fail = 0;
const check = (name, cond) => {
  if (cond) {
    pass++;
    console.log("  ✓", name);
  } else {
    fail++;
    console.error("  ✗", name);
  }
};

const OWNER = "+15555550100";
const STRANGER = "+12125550000";
const freshState = () => ({ pending: null, fired: [], log: [] });
function spyActions() {
  const calls = [];
  return {
    calls,
    actions: [
      { id: "soft-launch", label: "Soft launch", proposal: "propose soft-launch. go soft-launch", execute: async () => { calls.push("soft-launch"); return { ok: true, note: "stub" }; } },
      { id: "x-thread", label: "X thread", proposal: "propose x-thread. go x-thread", execute: async () => { calls.push("x-thread"); return { ok: true, note: "stub" }; } },
    ],
  };
}

console.log("gtm-agent simulation:");

// 1. "next" proposes without firing
{
  const { actions, calls } = spyActions();
  const r = await handleMessage(freshState(), OWNER, "next", actions, { ownerPhone: OWNER });
  check("'next' returns a proposal", /soft-launch/.test(r.reply));
  check("'next' sets pending", r.newState.pending?.id === "soft-launch");
  check("'next' fires NO executor", calls.length === 0);
  check("'next' fired=null", r.fired === null);
}

// 2. "go <id>" fires exactly that executor, once
{
  const { actions, calls } = spyActions();
  let st = freshState();
  ({ newState: st } = await handleMessage(st, OWNER, "next", actions, { ownerPhone: OWNER }));
  const r = await handleMessage(st, OWNER, "go soft-launch", actions, { ownerPhone: OWNER });
  check("'go soft-launch' fires once", calls.length === 1 && calls[0] === "soft-launch");
  check("'go soft-launch' marks fired", r.newState.fired.includes("soft-launch"));
  check("'go soft-launch' clears pending", r.newState.pending === null);
  check("'go soft-launch' reply confirms", /✓/.test(r.reply));
}

// 3. NO outward action fires without an explicit confirm
{
  const { actions, calls } = spyActions();
  let st = freshState();
  for (const msg of ["status", "draft a post about the launch", "help", "hello", "next", "what's next"]) {
    ({ newState: st } = await handleMessage(st, OWNER, msg, actions, { ownerPhone: OWNER }));
  }
  check("no executor fires across status/draft/help/next", calls.length === 0);
}

// 4. non-owner is ignored, no reply, cannot fire
{
  const { actions, calls } = spyActions();
  const r = await handleMessage(freshState(), STRANGER, "go soft-launch", actions, { ownerPhone: OWNER });
  check("stranger ignored (no reply)", r.reply === null && r.ignored === true);
  check("stranger cannot fire", calls.length === 0);
}

// 5. double-confirm is idempotent (can't fire twice)
{
  const { actions, calls } = spyActions();
  let st = freshState();
  ({ newState: st } = await handleMessage(st, OWNER, "go soft-launch", actions, { ownerPhone: OWNER }));
  const r = await handleMessage(st, OWNER, "go soft-launch", actions, { ownerPhone: OWNER });
  check("re-confirm does not fire again", calls.length === 1);
  check("re-confirm says already done", /already done/i.test(r.reply));
}

// 6. Twilio signature: correct passes, tampered/missing fail closed
{
  const token = "test_auth_token";
  const url = "https://example.com/sms";
  const params = { From: OWNER, Body: "next" };
  const data = Object.keys(params).sort().reduce((acc, k) => acc + k + params[k], url);
  const sig = crypto.createHmac("sha1", token).update(Buffer.from(data, "utf-8")).digest("base64");
  check("valid signature passes", validateTwilioSignature(token, url, params, sig) === true);
  check("tampered signature fails", validateTwilioSignature(token, url, params, "AAAA" + sig.slice(4)) === false);
  check("missing token fails closed", validateTwilioSignature("", url, params, sig) === false);
}

// 7. TwiML shape + escaping
{
  check("twiml wraps a message", twiml("hi").includes("<Message>hi</Message>"));
  check("empty twiml is a bare Response", twiml(null).includes("<Response></Response>"));
  check("twiml escapes XML", twiml("a<b>&c").includes("a&lt;b&gt;&amp;c"));
}

console.log(`\n${fail === 0 ? "✓ ALL PASS" : "✗ FAIL"}, ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
