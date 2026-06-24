#!/usr/bin/env bash
# One-command deploy for the GTM agent. Default target: Railway (the stack default
# for services). The app is plain Node, so any Node host works (Render/Fly/Vercel).
set -euo pipefail
cd "$(dirname "$0")"

echo "── GTM agent deploy ──"
if [ ! -f secrets.env ]; then
  echo "✗ secrets.env not found. Copy secrets.env.example → secrets.env and fill it first."
  exit 1
fi

echo "1/3  Running the safety simulation before deploy…"
node test/simulate.mjs || { echo "✗ simulation failed, not deploying"; exit 1; }

echo "2/3  Deploying…"
if command -v railway >/dev/null 2>&1; then
  railway up
else
  echo "  railway CLI not found (npm i -g @railway/cli && railway login)."
  echo "  Or deploy this dir to any Node host. The container entrypoint is: node src/server.mjs"
  exit 1
fi

echo "3/3  Post-deploy:"
echo "  • Put the live URL in secrets.env as PUBLIC_URL."
echo "  • Set your Twilio number's Messaging webhook to <PUBLIC_URL>/sms (HTTP POST)."
echo "  • Text 'next' to your Twilio number to start the launch."
echo "  • Outward actions stay stubbed until you wire them in src/lib/actions.mjs."
