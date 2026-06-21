// audit-workflow.js — adapt-and-run template for a comprehensive project audit.
//
// HOW TO USE: copy into a Workflow({script: ...}) call. Edit REPO, CONTEXT, and the
// AREAS array (one auditor per subsystem of the project at hand). Keep the schemas
// and the synthesis stage. Run `git log --oneline` + the tests FIRST (outside the
// workflow) so you can hand auditors the ground truth.
//
// Proven in practice on a full-project audit: 7 area auditors + a citation verifier +
// a synthesis judge surfaced ~18 defects (several critical) that a single pass missed,
// including a leaked answer-key, a forgeable judge, and silently-violated "locked"
// decisions. Roughly 1.8M tokens for a full rethink. Scale AREAS down for smaller projects.

export const meta = {
  name: 'project-audit',
  description: 'Adversarial multi-area audit + citation verification + synthesis (defects + decision-debt)',
  phases: [
    { title: 'Audit', detail: 'one adversarial auditor per subsystem' },
    { title: 'Verify', detail: 'citation/claim verification + research' },
    { title: 'Synthesize', detail: 'master defect list + cross-cutting contradictions + decision debt' },
  ],
}

const REPO = '[/abs/path/to/repo]'
const CONTEXT = `
[Describe the project so auditors with no prior context can judge it: what it is,
its history, what shipped, what the current plan is. Include any "LOCKED"/"final"
decisions so auditors can check whether they were actually honored. State today's date.]
`

const AUDIT_SCHEMA = {
  type: 'object',
  required: ['summary', 'findings', 'strengths', 'stale_or_contradictory'],
  properties: {
    summary: { type: 'string' },
    findings: { type: 'array', items: { type: 'object', required: ['severity', 'location', 'issue', 'fix'], properties: {
      severity: { type: 'string', enum: ['critical', 'major', 'minor', 'nit'] },
      location: { type: 'string', description: 'file path + line/section' }, issue: { type: 'string' }, fix: { type: 'string' } } } },
    strengths: { type: 'array', items: { type: 'string' } },
    stale_or_contradictory: { type: 'array', items: { type: 'object', required: ['location', 'claim', 'reality'], properties: {
      location: { type: 'string' }, claim: { type: 'string', description: 'what the doc/code claims' }, reality: { type: 'string', description: 'what is actually true (per git/code/source)' } } } },
  },
}
const RESEARCH_SCHEMA = {
  type: 'object', required: ['summary', 'key_findings'],
  properties: { summary: { type: 'string' }, key_findings: { type: 'array', items: { type: 'object', required: ['claim', 'verdict', 'correction'], properties: {
    claim: { type: 'string' }, verdict: { type: 'string', enum: ['confirmed', 'wrong', 'partially-right', 'not-found'] },
    correction: { type: 'string', description: 'the correct citation/fact + what the project should say instead' }, source: { type: 'string' } } } } },
}

const auditPrompt = (area, files, focus) => `${CONTEXT}
You are a skeptical staff-engineer auditor. Read these files COMPLETELY and verify claims against the ACTUAL repo state (use Bash/Grep/Glob; run \`git log\`, run the tests):
${files}
AREA: ${area}\nFOCUS: ${focus}
Find every mistake FIRST — the owner explicitly does not want to discover more later. Check: internal contradictions, claims that don't match the code/git reality, decisions invalidated by later pivots, security issues, statistical errors, anything stale. Severity: critical = wrong AND load-bearing; major = wrong but recoverable; minor = stale/confusing; nit = polish. Return the structured object only.`

// === EDIT THIS: one auditor per subsystem ===
const AREAS = [
  ['Strategy / planning docs', `[doc paths]`, 'Which strategic claims are invalidated by later pivots? Which docs contradict each other?'],
  ['Decisions / specs / "locked" choices', `[ADR + spec paths]`, 'CRITICAL: which "LOCKED"/final decisions were silently violated? Compare every locked claim to git log + the actual code/file tree. Map all decision debt.'],
  ['Core library + tests', `[src + test paths]`, 'Correctness: are the algorithms right? Are tests meaningful or tautological? Is any "validated" result circular? Run the tests.'],
  ['App / live surface + security', `[app paths]`, 'Security audit of a LIVE surface: exposed endpoints, auth that fails open, forgeable inputs, leaked secrets/keys, anything callable to forge state.'],
  ['Outputs (paper / content / claims)', `[output paths]`, 'Is anything overclaimed relative to what exists? List every external citation (title + id + claimed finding) for the verifier.'],
]

phase('Audit')
const audits = (await parallel(AREAS.map(([a, f, focus]) =>
  () => agent(auditPrompt(a, f, focus), { label: `audit:${a.slice(0, 18)}`, phase: 'Audit', schema: AUDIT_SCHEMA })))).filter(Boolean)

phase('Verify')
const verify = await agent(`${CONTEXT}
You are a rigorous fact-checker. For EVERY external citation or load-bearing factual claim in this project, find the primary source (WebSearch/WebFetch — load via ToolSearch "select:WebSearch,WebFetch") and return a verdict + correction. Misattributed authors, wrong venues, fabricated papers, and cherry-picked numbers are credibility-killers — find them. Return the structured object only.`,
  { label: 'verify:citations', phase: 'Verify', schema: RESEARCH_SCHEMA })

log(`Audit: ${audits.length} areas + citation verification. Synthesizing.`)
phase('Synthesize')
const synthesis = await agent(`${CONTEXT}
You are the synthesis judge. Below are area-audit reports + a citation-verification report. Produce: (1) a deduped, severity-ranked MASTER DEFECT LIST with file paths + concrete fixes; (2) the CROSS-CUTTING contradictions no single auditor could see (doc A's locked decision vs doc B's pivot vs what the code does); (3) the DECISION-DEBT list — every locked decision silently violated/invalidated, each needing a superseding ADR. Order the recommended fixes by REVERSIBILITY/blast-radius (irreversible + outward-facing first), not severity.
AUDITS:\n${JSON.stringify(audits, null, 2)}
CITATIONS:\n${JSON.stringify(verify, null, 2)}
Return the structured object only.`, {
  label: 'synth', phase: 'Synthesize', schema: {
    type: 'object', required: ['overall_assessment', 'master_defects', 'decision_debt', 'fix_order'],
    properties: {
      overall_assessment: { type: 'string' },
      master_defects: { type: 'array', items: { type: 'object', required: ['rank', 'severity', 'title', 'locations', 'fix'], properties: {
        rank: { type: 'number' }, severity: { type: 'string' }, title: { type: 'string' }, locations: { type: 'array', items: { type: 'string' } }, fix: { type: 'string' } } } },
      decision_debt: { type: 'array', items: { type: 'object', required: ['violated_decision', 'what_happened', 'proposed_adr'], properties: {
        violated_decision: { type: 'string' }, what_happened: { type: 'string' }, proposed_adr: { type: 'string' } } } },
      fix_order: { type: 'array', items: { type: 'string' }, description: 'ordered by reversibility/blast-radius, irreversible+outward first' },
    },
  },
})
return { audits, citation_verification: verify, synthesis }
