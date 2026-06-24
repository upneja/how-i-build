// GTM action registry. /finish fills this from the launch sequence in the GTM plan
// (references/gtm-playbook.md). Each action: { id, label, proposal, execute }.
//
// ┌─ SAFETY CONTRACT (do not break) ─────────────────────────────────────────┐
// │ execute() is STUBBED. It records the confirmation and returns a summary.   │
// │ It does NOT post, send, or publish anything. The handler only ever calls   │
// │ execute() after an explicit "go <id>" confirm from the owner's number.     │
// │ To make a move real, wire the actual outward call inside that move's       │
// │ execute() (e.g. import { sendSms } from "./notify.mjs", or POST to X), and │
// │ keep it reachable ONLY through the confirm path.                            │
// └────────────────────────────────────────────────────────────────────────────┘

export function defaultActions() {
  return [
    {
      id: "soft-launch",
      label: "Soft launch to the friend network",
      proposal:
        'Soft launch: drop the link in the group chats. Draft: "built a thing, wanted you to be first. <link>", reply: go soft-launch',
      execute: async () => ({
        ok: true,
        note: "CONFIRMED. TODO: wire the real send (group chat / SMS via ./notify.mjs).",
      }),
    },
    {
      id: "x-thread",
      label: "Public X thread",
      proposal:
        'Public X thread. Hook: "I kept losing track of <problem>, so I built <product>." 3 posts, ends on the link., reply: go x-thread',
      execute: async () => ({
        ok: true,
        note: "CONFIRMED. TODO: wire the X post.",
      }),
    },
  ];
}
