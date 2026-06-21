---
description: List every user-authored skill, slash command, subagent, plugin, and active hook in this Claude Code setup. Run at the top of a session to remember what you have.
---

# Inventory

Print a single scannable summary of everything the user has built into or installed in their Claude Code environment. This answers "what do I have available right now?"

The user has 300+ Claude Code sessions and a habit of building skills and then forgetting they exist. The whole point of this command is *discoverability*. Be terse, scannable, and complete.

## What to scan

Do these in parallel where possible.

### 1. Custom skills — `~/.claude/skills/`
- Both flat files (e.g., `git-push.md`) and directories (e.g., `deep-research/SKILL.md`)
- For each, read **only the frontmatter** to extract `name` and `description`
- Capture `mtime` so the user can see what's recent vs. stale

### 2. Custom slash commands — `~/.claude/commands/`
- For each `.md` file, read frontmatter `description` (or first non-frontmatter line if missing)
- Capture `mtime`

### 3. Custom subagents — `~/.claude/agents/`
- For each agent definition, extract name and 1-line purpose
- If the folder doesn't exist, say so

### 4. Installed plugins — from `~/.claude/settings.json`
- Look at the `enabledPlugins` field (or equivalent)
- Print each plugin name with a 1-line purpose
- Do NOT list every skill inside each plugin — just the plugin names. Mention the 1–2 plugins the user uses most heavily based on session history if obvious.

### 5. Active hooks — from `~/.claude/settings.json`
- List every entry under `hooks.*` (SessionStart, Stop, PostToolUse, etc.)
- For each: hook event → 1-line description of what it does

## Output format

Use this exact structure:

```
# Your Claude Code Inventory

## Skills ({count})
- {name} — {description}{ · stale if mtime > 90d}

## Slash commands ({count})
- /{name} — {description}{ · stale if mtime > 90d}

## Subagents ({count})
- {name} — {description}

## Installed plugins ({count})
- {plugin} — {purpose}

## Active hooks ({count})
- {event}: {what it does}

## Summary
{One sentence: total counts + any obvious gap, e.g. "a skill that duplicates a plugin you already have, or no hooks despite a repetitive manual step worth automating."}
```

## Constraints

- **Do not read full file bodies.** Frontmatter and first content line only.
- **Do not execute** any of the inventoried items.
- **Stay under ~60 lines** of output total. If something would push past that, abbreviate.
- If a directory doesn't exist, print `## {Category} (0)\n  _none — folder doesn't exist_` rather than silently skipping it.
- Sort each category by `mtime` descending (newest first) so recent work surfaces.

## Edge cases

- **Skill is a directory with no SKILL.md**: skip it, don't crash
- **Frontmatter missing**: use the filename as `name` and `(no description)` as description
- **Plugin name is namespaced** (e.g., `superpowers:executing-plans`): treat as a single plugin called `superpowers`
- **`enabledPlugins` not in settings.json**: fall back to listing folders under `~/.claude/plugins/cache/`
