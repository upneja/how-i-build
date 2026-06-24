// Core message handler, pure function, no I/O, so it's directly testable.
// Returns { reply, newState, fired, ignored }. The server wires it to real
// SMS/TwiML; the test calls it directly.
//
// SAFETY: action.execute() is called from EXACTLY ONE place below, the confirm
// branch. Nothing else can trigger an outward action. Do not add other call sites.
import { e164, clean } from "./notify.mjs";

const HELP = "Commands: next · status · go <id> · draft <topic> · help";

const norm = (p) => e164(p);
const byId = (actions, id) => actions.find((a) => a.id === id);
const nextUnfired = (actions, state) =>
  actions.find((a) => !state.fired.includes(a.id));

export async function handleMessage(state, from, body, actions, cfg = {}) {
  const owner = cfg.ownerPhone ? norm(cfg.ownerPhone) : null;

  // Allowlist: silently ignore anyone who is not the owner.
  if (owner && norm(from) !== owner) {
    return { reply: null, newState: state, fired: null, ignored: true };
  }

  const raw = String(body || "").trim();
  const text = raw.toLowerCase();
  const s = { ...state, fired: [...state.fired], log: [...state.log] };

  // ── confirm: "go <id>" | "confirm <id>" | "yes <id>" | "send it" (uses pending) ──
  const go = text.match(/^(?:go|confirm|yes|send it)\b\s*(\S+)?/);
  if (go) {
    const id = go[1] || (s.pending && s.pending.id);
    const action = id && byId(actions, id);
    if (!action) return { reply: `Nothing to confirm. ${HELP}`, newState: s, fired: null };
    if (s.fired.includes(action.id))
      return { reply: `Already done: ${action.id}.`, newState: s, fired: null };

    const result = await action.execute(); // ← ONLY call site of execute()

    s.fired.push(action.id);
    s.pending = null;
    s.log.push({ t: "fired", id: action.id });
    const note = result && result.note ? result.note : "done";
    return { reply: `✓ ${action.label}, ${note}`, newState: s, fired: action.id };
  }

  // ── next: propose the next un-fired move (draft only, no fire) ──
  if (/^(next|what'?s next|whats next)\b/.test(text) || text === "n") {
    const a = nextUnfired(actions, s);
    if (!a) return { reply: "All launch moves fired. Reply: status", newState: s, fired: null };
    s.pending = { id: a.id, token: a.id + "-" + (s.log.length + 1) };
    s.log.push({ t: "proposed", id: a.id });
    return { reply: a.proposal, newState: s, fired: null };
  }

  // ── status ──
  if (/^status\b/.test(text)) {
    const remaining = actions.filter((a) => !s.fired.includes(a.id)).map((a) => a.id);
    return {
      reply: `Fired: ${s.fired.join(", ") || "none"}. Remaining: ${remaining.join(", ") || "none"}.`,
      newState: s,
      fired: null,
    };
  }

  // ── draft: returns a draft, never sends ──
  if (/^draft\b/.test(text)) {
    const topic = raw.replace(/^draft\s*/i, "") || "the launch";
    return {
      reply: `Draft (NOT sent) about ${clean(topic, 120)}: "<write in voice, no em dashes>". Reply with edits, or: go <id>`,
      newState: s,
      fired: null,
    };
  }

  // ── help / greeting / empty ──
  if (/^(help|\?|hi|hey|hello)\b/.test(text) || raw === "") {
    return { reply: HELP, newState: s, fired: null };
  }

  return { reply: `Didn't catch that. ${HELP}`, newState: s, fired: null };
}
