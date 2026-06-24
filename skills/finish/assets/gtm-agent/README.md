# GTM agent (scaffold)

A textable launch agent. You text it; it proposes the next GTM move from the launch
plan and only acts after you reply `go <id>`. Scaffolded by `/finish` for public-tier
projects. Zero dependencies, plain Node (built-ins only), no build step.

## The safety model (do not break)

- **Draft by default.** The agent never sends or posts on its own. Every outward move
  is proposed; it executes only on an explicit confirm from your number.
- **Owner allowlist.** It talks to exactly one number (`NOTIFY_PHONE`). Anyone else is
  silently ignored.
- **Executors are stubbed.** `src/lib/actions.mjs` `execute()` functions only record the
  confirmation. They cannot post until *you* wire the real outward call, and even then,
  the handler reaches `execute()` only through the confirm path.
- **Signed webhooks.** Inbound requests are rejected unless the `X-Twilio-Signature`
  validates against your auth token.

## Run it

```bash
cp secrets.env.example secrets.env   # fill with your own Twilio credentials
npm test                             # safety simulation, must pass
SKIP_TWILIO_VALIDATION=1 npm start   # local run (validation off for local only)
# then: curl -X POST localhost:3000/sms -d 'From=+1...&Body=next'
```

## Texting it (once deployed)

- `next`: the next un-fired move + its drafted copy (a proposal, not sent).
- `go <id>`: confirm and run that move.
- `status`: what's fired, what's left.
- `draft <topic>`: a draft in voice, never auto-sent.
- `help`: the command list.

## Deploy

`./deploy.sh` (Railway by default; runs the safety sim first). After it's live, set the
Twilio number's Messaging webhook to `<PUBLIC_URL>/sms` and put `PUBLIC_URL` in
`secrets.env`. State lives in `state.json`, mount a volume if your host is ephemeral.

## Wiring a real move

In `src/lib/actions.mjs`, replace a move's `execute()` body with the real call (e.g.
`import { sendSms } from "./notify.mjs"` for a text blast, or a `fetch` POST to X).
Keep it reachable only via the confirm path. Test with `npm test` before deploying.
