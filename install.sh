#!/usr/bin/env bash
# Instala as skills do repositório em ~/.claude/skills/
# Uso: bash install.sh

set -e

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DST="$HOME/.claude/skills"

# Remove todas as skills gerenciadas por este script antes de reinstalar
echo "Removendo skills anteriores..."
mkdir -p "$SKILLS_DST"
MANAGED_SKILLS=(
  setup-briefing setup-company-profile setup-product-context
  setup-brand-voice setup-audience-profiles setup-competitor-map
  setup-content-pillars setup-visual-identity
  content content-ideation content-research hooks-factory
  content-writer platform-adapter carousel-creator
  content-derivatives editorial-calendar content-performance
)
for skill in "${MANAGED_SKILLS[@]}"; do
  rm -rf "$SKILLS_DST/$skill"
done

# Mapeamento: pasta-fonte → nome-destino (= slash command)
declare -A SETUP_SKILLS=(
  ["setup/00-orchestrator"]="setup-briefing"
  ["setup/01-company-profile"]="setup-company-profile"
  ["setup/02-product-context"]="setup-product-context"
  ["setup/03-audience-profiles"]="setup-audience-profiles"
  ["setup/04-brand-voice"]="setup-brand-voice"
  ["setup/05-competitor-map"]="setup-competitor-map"
  ["setup/06-content-pillars"]="setup-content-pillars"
  ["setup/07-visual-identity"]="setup-visual-identity"
)

declare -A CONTENT_SKILLS=(
  ["content/00-orchestrator"]="content"
  ["content/02-ideation"]="content-ideation"
  ["content/03-research"]="content-research"
  ["content/04-hooks-factory"]="hooks-factory"
  ["content/05-writer"]="content-writer"
  ["content/06-platform-adapter"]="platform-adapter"
  ["content/07-carousel-creator"]="carousel-creator"
  ["content/08-derivatives"]="content-derivatives"
  ["content/09-editorial-calendar"]="editorial-calendar"
  ["content/10-performance"]="content-performance"
)

echo "Instalando skills em $SKILLS_DST..."

for src_rel in "${!SETUP_SKILLS[@]}"; do
  dst_name="${SETUP_SKILLS[$src_rel]}"
  src="$REPO_DIR/$src_rel"
  dst="$SKILLS_DST/$dst_name"

  if [ ! -d "$src" ]; then
    echo "  SKIP: $src_rel (não encontrado)"
    continue
  fi

  rm -rf "$dst"
  cp -r "$src" "$dst"

  if [ -f "$dst/SKILL.md" ] && [ ! -f "$dst/skill.md" ]; then
    cp "$dst/SKILL.md" "$dst/skill.md"
  fi

  echo "  OK: /$dst_name"
done

for src_rel in "${!CONTENT_SKILLS[@]}"; do
  dst_name="${CONTENT_SKILLS[$src_rel]}"
  src="$REPO_DIR/$src_rel"
  dst="$SKILLS_DST/$dst_name"

  if [ ! -d "$src" ]; then
    echo "  SKIP: $src_rel (não encontrado)"
    continue
  fi

  rm -rf "$dst"
  cp -r "$src" "$dst"

  # Garante que existe skill.md em lowercase (padrão do Claude Code)
  if [ -f "$dst/SKILL.md" ] && [ ! -f "$dst/skill.md" ]; then
    cp "$dst/SKILL.md" "$dst/skill.md"
  fi

  echo "  OK: /$dst_name"
done

# skill-creator (Anthropic) — preservar se já existir, instalar se ausente
if [ -d "$SKILLS_DST/skill-creator" ]; then
  echo "  SKIP: /skill-creator (já instalada — gerenciada manualmente)"
else
  echo "Instalando skill-creator (Anthropic)..."
  TMP_DIR=$(mktemp -d)
  if git clone --depth=1 --filter=blob:none --sparse \
       https://github.com/anthropics/claude-plugins-official.git \
       "$TMP_DIR" 2>/dev/null \
     && git -C "$TMP_DIR" sparse-checkout set plugins/skill-creator/skills/skill-creator 2>/dev/null \
     && [ -d "$TMP_DIR/plugins/skill-creator/skills/skill-creator" ]; then
    cp -r "$TMP_DIR/plugins/skill-creator/skills/skill-creator" "$SKILLS_DST/skill-creator"
    echo "  OK: /skill-creator"
  else
    echo "  WARN: skill-creator não instalada (sem acesso ao repositório Anthropic)"
    echo "        Instale manualmente: bash install.sh após clonar o repo da Anthropic"
  fi
  rm -rf "$TMP_DIR"
fi

echo ""
echo "Pronto! Skills disponíveis:"
echo ""
echo "  /setup-briefing            → orquestrar setup completo de empresa"
echo "  /setup-company-profile     → bloco 1: perfil institucional"
echo "  /setup-product-context     → bloco 2: produto e proposta de valor"
echo "  /setup-brand-voice         → bloco 3: tom de voz e vocabulário"
echo "  /setup-audience-profiles   → bloco 4: personas e público-alvo"
echo "  /setup-competitor-map      → bloco 5: concorrentes e gaps"
echo "  /setup-content-pillars     → bloco 6: pilares e estratégia editorial"
echo "  /setup-visual-identity     → bloco 7: identidade visual e tokens"
echo ""
echo "  /content              → orquestrador (ponto de entrada)"
echo "  /content-ideation     → gerar ideias"
echo "  /content-research     → pesquisar temas"
echo "  /hooks-factory        → criar hooks e headlines"
echo "  /content-writer       → escrever conteúdo"
echo "  /platform-adapter     → adaptar para cada rede"
echo "  /carousel-creator     → criar carrosséis"
echo "  /content-derivatives  → formatos derivados"
echo "  /editorial-calendar   → calendário editorial"
echo "  /content-performance  → analisar performance"
echo "  /skill-creator        → criar e melhorar skills (Anthropic)"
echo ""
echo "Reinicia o Claude Code para as skills serem carregadas."

# Criar config do pipeline se não existir
CONFIG="$HOME/.claude/content-pipeline.md"
if [ ! -f "$CONFIG" ]; then
  cat > "$CONFIG" << EOF
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
  echo "Config criado: $CONFIG"
  echo "Companies Root: $REPO_DIR/companies"
else
  echo ""
  echo "Config já existe: $CONFIG (não alterado)"
fi