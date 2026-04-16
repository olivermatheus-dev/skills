#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
MANIFEST_FILE="${SKILLS_MANIFEST:-$SCRIPT_DIR/skills-manifest.txt}"
CLAUDE_HOME_DIR="${CLAUDE_HOME_DIR:-$HOME/.claude}"
SKILLS_DST="${SKILLS_DST:-$CLAUDE_HOME_DIR/skills}"
CONFIG_FILE="${CONTENT_PIPELINE_CONFIG:-$CLAUDE_HOME_DIR/content-pipeline.md}"

if [ ! -f "$MANIFEST_FILE" ]; then
  echo "Manifesto nao encontrado: $MANIFEST_FILE" >&2
  exit 1
fi

declare -a ORDERED_SKILLS=()
declare -A PREFERRED_SOURCES=()
declare -A LEGACY_SOURCES=()
declare -A DESCRIPTIONS=()

resolve_source() {
  local preferred_rel="$1"
  local legacy_rel="$2"
  local preferred_abs="$REPO_DIR/$preferred_rel"

  if [ -d "$preferred_abs" ]; then
    echo "$preferred_abs"
    return 0
  fi

  if [ -n "$legacy_rel" ]; then
    local legacy_abs="$REPO_DIR/$legacy_rel"
    if [ -d "$legacy_abs" ]; then
      echo "$legacy_abs"
      return 0
    fi
  fi

  return 1
}

while IFS='|' read -r area kind published_name preferred_source legacy_source description || [ -n "${area:-}" ]; do
  if [ -z "$area" ] || [[ "$area" == \#* ]]; then
    continue
  fi

  ORDERED_SKILLS+=("$published_name")
  PREFERRED_SOURCES["$published_name"]="$preferred_source"
  LEGACY_SOURCES["$published_name"]="$legacy_source"
  DESCRIPTIONS["$published_name"]="$description"
done < "$MANIFEST_FILE"

echo "Removendo skills anteriores..."
mkdir -p "$SKILLS_DST"
for skill_name in "${ORDERED_SKILLS[@]}"; do
  rm -rf "$SKILLS_DST/$skill_name"
done

echo "Instalando skills em $SKILLS_DST..."
for skill_name in "${ORDERED_SKILLS[@]}"; do
  preferred_source="${PREFERRED_SOURCES[$skill_name]}"
  legacy_source="${LEGACY_SOURCES[$skill_name]}"

  if ! source_dir="$(resolve_source "$preferred_source" "$legacy_source")"; then
    echo "  SKIP: $skill_name (fonte nao encontrada: $preferred_source | $legacy_source)"
    continue
  fi

  destination_dir="$SKILLS_DST/$skill_name"
  rm -rf "$destination_dir"
  cp -r "$source_dir" "$destination_dir"

  if [ -f "$destination_dir/SKILL.md" ] && [ ! -f "$destination_dir/skill.md" ]; then
    cp "$destination_dir/SKILL.md" "$destination_dir/skill.md"
  fi

  echo "  OK: /$skill_name"
done

if [ -d "$SKILLS_DST/skill-creator" ]; then
  echo "  SKIP: /skill-creator (ja instalada - gerenciada manualmente)"
else
  echo "Instalando skill-creator (Anthropic)..."
  TMP_DIR="$(mktemp -d)"
  if git clone --depth=1 --filter=blob:none --sparse \
       https://github.com/anthropics/claude-plugins-official.git \
       "$TMP_DIR" 2>/dev/null \
     && git -C "$TMP_DIR" sparse-checkout set plugins/skill-creator/skills/skill-creator 2>/dev/null \
     && [ -d "$TMP_DIR/plugins/skill-creator/skills/skill-creator" ]; then
    cp -r "$TMP_DIR/plugins/skill-creator/skills/skill-creator" "$SKILLS_DST/skill-creator"
    echo "  OK: /skill-creator"
  else
    echo "  WARN: skill-creator nao instalada (sem acesso ao repositorio Anthropic)"
    echo "        Instale manualmente depois se precisar dela"
  fi
  rm -rf "$TMP_DIR"
fi

echo ""
echo "Pronto! Skills disponiveis:"
echo ""
for skill_name in "${ORDERED_SKILLS[@]}"; do
  printf '  /%-24s -> %s\n' "$skill_name" "${DESCRIPTIONS[$skill_name]}"
done
echo "  /skill-creator            -> criar e melhorar skills (Anthropic)"
echo ""
echo "Reinicia o Claude Code para as skills serem carregadas."

if [ ! -f "$CONFIG_FILE" ]; then
  mkdir -p "$CLAUDE_HOME_DIR"
  cat > "$CONFIG_FILE" <<EOF
# Content Pipeline Config

## Companies Root
$REPO_DIR/companies

## Como usar
# Informe a empresa no inicio de cada chat:
# "/content empresa-a" ou "trabalhando para empresa-a"
#
# Para criar uma nova empresa:
# "/setup-briefing nova empresa"
#
# Para continuar uma peca existente:
# "/content empresa-a -- continua 2026-04-01-slug-do-post"
EOF
  mkdir -p "$REPO_DIR/companies"
  echo ""
  echo "Config criado: $CONFIG_FILE"
  echo "Companies Root: $REPO_DIR/companies"
else
  echo ""
  echo "Config ja existe: $CONFIG_FILE (nao alterado)"
fi