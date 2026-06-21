#!/usr/bin/env bash
# Validates ~/.claude/skills/reskin/archetypes.json structurally.
# Required fields per archetype: slug, name, family, video_cut_score (0-10),
# font_display, font_text, font_import_url, palette {primary, background, accent},
# radii_scale (array), shadow_recipe, motion_dna, two_sec_hook, reference_urls (array of 2+),
# anti_rules (array of 2+).

set -euo pipefail

ARCHETYPES_FILE="${ARCHETYPES_FILE:-$HOME/.claude/skills/reskin/archetypes.json}"

if [[ ! -f "$ARCHETYPES_FILE" ]]; then
  echo "FAIL: $ARCHETYPES_FILE does not exist"
  exit 1
fi

count=$(jq 'length' "$ARCHETYPES_FILE")
if [[ "$count" -lt 28 ]]; then
  echo "FAIL: expected >=28 archetypes, got $count"
  exit 1
fi

# Check each archetype has all required fields
errors=$(jq -r '
  to_entries | map(
    .value as $a |
    . as $entry |
    [
      (if $a.slug then empty else "missing slug at index \($entry.key)" end),
      (if $a.name then empty else "missing name in \($a.slug // "unknown")" end),
      (if $a.family then empty else "missing family in \($a.slug)" end),
      (if ($a.video_cut_score // -1) | (. >= 0 and . <= 10) then empty else "video_cut_score out of range in \($a.slug)" end),
      (if $a.font_display then empty else "missing font_display in \($a.slug)" end),
      (if $a.font_text then empty else "missing font_text in \($a.slug)" end),
      (if $a.font_import_url then empty else "missing font_import_url in \($a.slug)" end),
      (if $a.palette.primary then empty else "missing palette.primary in \($a.slug)" end),
      (if $a.palette.background then empty else "missing palette.background in \($a.slug)" end),
      (if $a.palette.accent then empty else "missing palette.accent in \($a.slug)" end),
      (if ($a.radii_scale | type) == "array" then empty else "radii_scale not array in \($a.slug)" end),
      (if $a.shadow_recipe then empty else "missing shadow_recipe in \($a.slug)" end),
      (if $a.motion_dna then empty else "missing motion_dna in \($a.slug)" end),
      (if $a.two_sec_hook then empty else "missing two_sec_hook in \($a.slug)" end),
      (if ($a.reference_urls | length) >= 2 then empty else "reference_urls < 2 in \($a.slug)" end),
      (if ($a.anti_rules | length) >= 2 then empty else "anti_rules < 2 in \($a.slug)" end)
    ] | map(select(. != null))
  ) | flatten | .[]
' "$ARCHETYPES_FILE")

if [[ -n "$errors" ]]; then
  echo "FAIL:"
  echo "$errors"
  exit 1
fi

# Check uniqueness of slugs
dupes=$(jq -r '[.[].slug] | group_by(.) | map(select(length > 1) | .[0]) | .[]' "$ARCHETYPES_FILE")
if [[ -n "$dupes" ]]; then
  echo "FAIL: duplicate slugs: $dupes"
  exit 1
fi

# Check at least 4 distinct families
family_count=$(jq -r '[.[].family] | unique | length' "$ARCHETYPES_FILE")
if [[ "$family_count" -lt 4 ]]; then
  echo "FAIL: only $family_count families; expected >=4 for diversity sampling"
  exit 1
fi

echo "PASS: $count archetypes validated; $family_count families"
