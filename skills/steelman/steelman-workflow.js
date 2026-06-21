// steelman-workflow.js — adapt-and-run template for a heavy first-principles steelman.
//
// HOW TO USE: copy into a Workflow({script: ...}) call. Edit (1) the DESIGN string
// to describe the plan under attack + the originator's actual goals, and (2) the
// PILLARS and ALTERNATIVES arrays for the specific case. Keep the schemas.
//
// Proven in practice on a load-bearing bet: 6 critics + 4 alternatives + a judge
// surfaced two fatal attacks the author had missed and produced a better direction.
// Roughly 370k tokens. Worth it when the decision is expensive to get wrong.
//
// NOTE: write the synthesis yourself if the judge agent dies — it's the load-bearing
// judgment and you have all the critic outputs to do it.

export const meta = {
  name: 'steelman',
  description: 'First-principles adversarial review of a plan + ground-up alternatives + synthesis',
  phases: [
    { title: 'Attack', detail: 'one adversarial critic per load-bearing pillar' },
    { title: 'Alternatives', detail: 'ground-up alternative designs' },
    { title: 'Synthesize', detail: 'fatal attacks, what survives, recommended path' },
  ],
}

// === EDIT THIS: the plan under attack + the originator's real goals/constraints ===
const DESIGN = `
[Describe the plan/design/thesis under attack in full. Include: the goal, the core
mechanism, the format/economics, and — critically — the ORIGINATOR'S ACTUAL GOALS
and constraints, so critics can judge fit-to-purpose. Include the evidence the plan
cites as support, so critics can turn it against the plan.]
`

const CRITIC_SCHEMA = {
  type: 'object',
  required: ['pillar', 'strongest_attack', 'attacks', 'what_survives', 'better_idea', 'verdict'],
  properties: {
    pillar: { type: 'string' },
    strongest_attack: { type: 'string', description: 'the single most damaging objection, stated as forcefully as an intelligent enemy would' },
    attacks: { type: 'array', items: { type: 'object', required: ['claim', 'why_it_bites', 'severity'], properties: {
      claim: { type: 'string' }, why_it_bites: { type: 'string' }, severity: { type: 'string', enum: ['fatal', 'serious', 'fixable'] } } } },
    what_survives: { type: 'string' },
    better_idea: { type: 'string', description: 'concrete alternative or modification, from first principles' },
    verdict: { type: 'string', enum: ['keep', 'modify', 'replace', 'kill'] },
  },
}
const ALT_SCHEMA = {
  type: 'object',
  required: ['name', 'one_liner', 'how_it_works', 'why_better', 'why_worse', 'first_step', 'beats_current_on'],
  properties: {
    name: { type: 'string' }, one_liner: { type: 'string' },
    how_it_works: { type: 'string', description: 'concrete mechanics: what a participant does, how it is scored, the artifact' },
    why_better: { type: 'string' }, why_worse: { type: 'string', description: 'honest downsides vs the current plan' },
    first_step: { type: 'string' }, beats_current_on: { type: 'array', items: { type: 'string' } },
  },
}

const critic = (pillar, mandate) => `${DESIGN}
You are a brilliant, adversarial first-principles critic. Be a genuine enemy of the idea — attack the parts the originator is most attached to HARDEST; politeness is malpractice. Find the single objection that, if true, sinks this. Where it helps, turn the plan's OWN cited evidence/data against it. Use WebSearch/WebFetch (load via ToolSearch "select:WebSearch,WebFetch") to ground an attack.
YOUR PILLAR: ${pillar}
MANDATE: ${mandate}
Then say honestly what survives and what you'd do instead from first principles. Return the structured object only.`

// === EDIT THIS: the load-bearing pillars for this specific plan ===
const PILLARS = [
  ['THE PREMISE', 'Is this worth doing at all, and is it durable? What external trend (timeline, competitor, tech curve) could make it irrelevant before it ships? Does it actually serve the originator\'s stated goals, or is it a detour?'],
  ['THE CORE ASSUMPTION', 'The load-bearing belief everything rests on — is it true? Does the originator\'s own cited evidence actually support it, or (re-read it) quietly undercut it?'],
  ['THE MECHANISM', 'Does the core engine actually work, at the scale claimed, without a confound or a self-defeating dependency?'],
  ['THE FORMAT / ECONOMICS', 'Does the chosen shape fit the stage (resources, distribution, liquidity, cost)? Is there a structurally cheaper/simpler shape that gets most of the value?'],
  ['THE MOAT / WHY-NOW', 'What stops an incumbent or the obvious competitor from doing this faster? Is the timing right or is it early/late?'],
  ['FIT TO THE ACTUAL GOAL', 'Given who the originator is and what they actually want, is this the highest-leverage use of their time/capital — or a more impressive-looking detour from it?'],
]

// === EDIT THIS: 3-4 genuinely different alternative shapes (not variations) ===
const ALTERNATIVES = [
  ['ALT A — a fundamentally different shape', 'Design, fully and concretely, the best version of [a structurally different approach to the same goal]. Be specific: mechanics, scored artifact, first build step. Address whether it dodges the current plan\'s biggest weaknesses.'],
  ['ALT B — invert the order / de-risk first', 'Design the cheapest sequence that answers the make-or-break question BEFORE the expensive build. What is the one experiment that decides whether to build at all?'],
  ['ALT C — a different target entirely', 'What if we measured/built/sold the adjacent thing instead? Design it.'],
  ['ALT D — fit to the originator\'s thesis', 'Design the version that most directly serves the originator\'s actual stated goals/thesis, even if it looks less like the current plan.'],
]

phase('Attack')
const critics = (await parallel(PILLARS.map(([p, m]) =>
  () => agent(critic(p, m), { label: `critic:${p.slice(0, 18)}`, phase: 'Attack', schema: CRITIC_SCHEMA })))).filter(Boolean)

phase('Alternatives')
const alts = (await parallel(ALTERNATIVES.map(([n, m]) =>
  () => agent(`${DESIGN}\nYou are a first-principles designer. ${m}\nName it and return the structured object only.`,
    { label: `alt:${n.slice(0, 18)}`, phase: 'Alternatives', schema: ALT_SCHEMA })))).filter(Boolean)

log(`Steelman: ${critics.length} critics, ${alts.length} alternatives. Synthesizing.`)
phase('Synthesize')
const synthesis = await agent(`${DESIGN}
You are the synthesis judge. You have adversarial critiques and ground-up alternatives. The originator wants the unvarnished truth and is willing to KILL or PIVOT a workstream — do NOT be a yes-machine. Identify the FATAL attacks, what genuinely survives, and the single recommended path (current / modified / an alternative / a hybrid de-risking sequence). Justify against the originator's real goals. Then give the concrete next moves, front-loading the cheapest experiment that decides whether to build at all.
CRITIQUES:\n${JSON.stringify(critics, null, 2)}
ALTERNATIVES:\n${JSON.stringify(alts, null, 2)}
Return the structured object only.`, {
  label: 'synth', phase: 'Synthesize', schema: {
    type: 'object', required: ['headline', 'fatal_attacks', 'what_survives', 'recommended_path', 'why', 'sequence', 'risks'],
    properties: {
      headline: { type: 'string' }, fatal_attacks: { type: 'array', items: { type: 'string' } },
      what_survives: { type: 'array', items: { type: 'string' } }, recommended_path: { type: 'string' },
      why: { type: 'string' }, sequence: { type: 'array', items: { type: 'string' } }, risks: { type: 'array', items: { type: 'string' } },
    },
  },
})
return { critics, alternatives: alts, synthesis }
