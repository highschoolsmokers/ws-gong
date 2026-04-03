#!/usr/bin/env bash
# Swiss Design layout lint — hard rules for component/page files.
# Called by Claude Code PostToolUse hook on Write|Edit.
# Reads hook JSON from stdin, extracts the file path, checks rules.

set -euo pipefail

FILE=$(jq -r '.tool_input.file_path // .tool_response.filePath // empty')
[ -z "$FILE" ] && exit 0

# Only lint TSX files under app/
case "$FILE" in
  */app/*.tsx) ;;
  *) exit 0 ;;
esac

[ -f "$FILE" ] || exit 0

WARNINGS=""

# ── 1. Section spacing: pt-8 pb-10 is the standard (pt-4 allowed on home summary) ──
BAD_PT=$(grep -nE 'border-t\s+border-black\s+pt-(?!8\b|4\b)[0-9]+' "$FILE" 2>/dev/null || true)
if [ -n "$BAD_PT" ]; then
  WARNINGS="${WARNINGS}SPACING: Non-standard top padding (use pt-8, or pt-4 for home summary only):\n${BAD_PT}\n\n"
fi

BAD_PB=$(grep -nE 'border-t\s+border-black.*pb-(?!10\b)[0-9]+' "$FILE" 2>/dev/null || true)
if [ -n "$BAD_PB" ]; then
  WARNINGS="${WARNINGS}SPACING: Non-standard bottom padding (use pb-10):\n${BAD_PB}\n\n"
fi

# ── 2. Grid system: standard is grid-cols-[1fr_2fr] ──
BAD_GRID=$(grep -nE 'grid-cols-\[' "$FILE" | grep -vE 'grid-cols-\[1fr_2fr\]' 2>/dev/null || true)
if [ -n "$BAD_GRID" ]; then
  WARNINGS="${WARNINGS}GRID: Non-standard grid ratio (standard is 1fr_2fr):\n${BAD_GRID}\n\n"
fi

# ── 3. No border-radius (Swiss = sharp corners) ──
BAD_RADIUS=$(grep -nE '\brounded-(sm|md|lg|xl|2xl|3xl|full)\b' "$FILE" 2>/dev/null || true)
if [ -n "$BAD_RADIUS" ]; then
  WARNINGS="${WARNINGS}CORNERS: Rounded corners violate Swiss Design (use rounded-none or remove):\n${BAD_RADIUS}\n\n"
fi

# ── 4. Color palette: only neutral-*, black, white, red-* (for errors) ──
# Match text-/bg-/border- color classes, exclude allowed ones
BAD_COLORS=$(grep -noE '(text|bg|border)-(blue|green|yellow|purple|pink|indigo|teal|cyan|orange|emerald|violet|fuchsia|rose|amber|lime|sky|slate|gray|zinc|stone)-[0-9]+' "$FILE" 2>/dev/null || true)
if [ -n "$BAD_COLORS" ]; then
  WARNINGS="${WARNINGS}PALETTE: Off-palette color (allowed: black, white, neutral-*, red-* for errors):\n${BAD_COLORS}\n\n"
fi

# ── 5. Typography: limited weight set ──
BAD_WEIGHT=$(grep -nE '\bfont-(thin|extralight|light|medium)\b' "$FILE" 2>/dev/null || true)
if [ -n "$BAD_WEIGHT" ]; then
  WARNINGS="${WARNINGS}TYPOGRAPHY: Non-standard font weight (use font-black, font-semibold, or default):\n${BAD_WEIGHT}\n\n"
fi

# ── 6. No inline hex colors ──
BAD_HEX=$(grep -nE '(bg|text|border)-\[#[0-9a-fA-F]+\]' "$FILE" | grep -vE '#F2EDE4' 2>/dev/null || true)
if [ -n "$BAD_HEX" ]; then
  WARNINGS="${WARNINGS}PALETTE: Inline hex color outside approved set (#F2EDE4 is the only exception):\n${BAD_HEX}\n\n"
fi

if [ -n "$WARNINGS" ]; then
  # Escape for JSON
  JSON_WARNINGS=$(printf '%s' "$WARNINGS" | jq -Rsa .)
  cat <<EOJSON
{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"Swiss Design lint violations in $FILE:\n$(echo "$WARNINGS" | head -30)\nFix these to maintain the design system."}}
EOJSON
fi
