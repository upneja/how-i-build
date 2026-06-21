# Philosophy

The principles behind the skills. Each one is a bet about where the cost actually is when you build with AI.

## Compute is cheap, attention is the bottleneck

The scarce resource stopped being tokens a while ago. It's your judgment and your time. On a flat-rate plan, the marginal cost of another agent is close to zero, so treating compute as precious is optimizing the wrong variable.

So I spend it. More critics on a claim. More independent research passes. More attempts at a design, scored against each other. A hundred-agent review doesn't multiply the noise; it lowers the chance that something real slips through.

The failure mode people worry about is wasted tokens. The failure mode that actually hurts is a wrong decision you shipped because you only looked once. Spend compute to avoid the second one.

## Verify adversarially, not optimistically

A model trying to be helpful will agree with you. That makes a single model a bad reviewer of its own work, and a bad reviewer of yours if it can read what you want to hear.

The fix is structural, not a better prompt. Make models argue. Have one agent build the case and another try to break it. Have a second, independent model review code the first one wrote, with the explicit job of finding what's wrong. Require a finding to survive a skeptic before it counts as real.

This is why `deep-research`, `steelman`, and `project-audit` all have a critic built into them, and why I run code review through a different model than the one that wrote the code.

## Parallelize anything independent

If two pieces of work don't share state, there's no reason to do them one after another. One agent per file. One critic per claim. One researcher per angle of a question. The wall-clock cost is the slowest single piece, not the sum.

This only works if the pieces are genuinely independent, so part of the skill is decomposing the work correctly first. Get that right and breadth becomes free.

## Code wins over docs

When the README and the code disagree, the code is what runs, so the docs are wrong. Documentation rots the moment it's written. I trust what the program does over what a file says it does, and `project-audit` is built on exactly this: re-derive the truth from the source, then flag every place the docs drifted.

## Ship the MVP, then improve it

Something people use beats a perfect thing they don't. The point of building fast is not to skip quality. It's to get the thing in front of reality early, because reality tells you which parts of your plan were wrong, and it tells you sooner than any amount of planning.

## Evidence before "done"

"Done" is a claim, and claims get verified. The test passes or it doesn't. The deploy is live or it isn't. The fix works or it doesn't, and I run it before I say so. Asserting success without checking is the single easiest way to ship a regression, and it's avoidable for the cost of one command.
