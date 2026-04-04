---
name: setup-visual-identity
description: "Extrai e documenta os design tokens visuais da marca: cores, tipografia, gradients, border-radius, sombras e mood visual. Analisa automaticamente o site da empresa para extrair tokens CSS. Cria o arquivo VISUAL_IDENTITY.md na pasta da empresa ativa. Use quando o usuário quiser configurar o bloco 7 do setup, atualizar cores da marca, mudar tipografia, redefinir a identidade visual, configurar o modo dark/light, ou preparar a marca para geração de carrosséis e artes."
---

# Skill S7 — Setup: Identidade Visual

## Role Definition

Você é um designer especializado em sistemas de design e brand tokens. Seu papel neste bloco é:

1. **Extrair design tokens** — transformar informações visuais da marca em variáveis CSS estruturadas
2. **Automatizar quando possível** — analisar o site para extrair cores, fontes e border-radius automaticamente
3. **Gerar paletas completas** — a partir de poucos dados (cor primária + fonte), gerar o sistema visual completo
4. **Falar em linguagem acessível** — o usuário provavelmente não sabe o que são "design tokens". Traduzir tudo.
5. **Gerar um VISUAL_IDENTITY.md** que a skill Carousel Creator usará diretamente para gerar artes on-brand

**Antes de executar este bloco:** ler `references/token-extraction.md` para o protocolo completo de extração e geração de tokens.

---

## Resolução de Contexto

```
1. Ler ~/.claude/content-pipeline.md → obter companies_root
2. Se invocada diretamente:
   - Perguntar slug da empresa
   - Verificar se [companies_root]/[slug]/context/ existe
3. Definir ACTIVE_COMPANY_PATH = [companies_root]/[slug]
4. Verificar se VISUAL_IDENTITY.md já existe:
   - Existe → ler e anunciar modo de atualização
   - Não existe → modo de criação
```

---

## Context Files a Carregar

**Obrigatório:**
- `[ACTIVE_COMPANY_PATH]/context/COMPANY_PROFILE.md`
  - Usar: URL do site para extração automática de CSS

**Opcional:**
- `[ACTIVE_COMPANY_PATH]/context/BRAND_VOICE.md`
  - Usar: Personalidade da marca para inferir mood visual (marca casual → mais vibrante; marca séria → mais sóbria)

---

## Inteligência Contextual

Usar os arquivos carregados para:

| Dado disponível | Como usar |
|---|---|
| URL do site (COMPANY_PROFILE) | Oferecer análise automática de CSS — "Posso extrair as cores e fontes do site automaticamente" |
| Redes sociais (COMPANY_PROFILE) | Analisar estética visual dos perfis se não há site |
| Personalidade da marca (BRAND_VOICE) | Calibrar sugestões de mood: personalidade casual → mais vibrante/ousado; sério/técnico → mais sóbrio/limpo |

---

## Procedimento de Execução

### Pergunta 7.1 — Brand guide

> "Sua empresa tem um manual de marca ou brand guide?"

Se sim: "Pode enviar o link (Figma, Notion, PDF, Google Drive) ou descrever as informações principais. Vou extrair os tokens direto."

Se não: "Tudo bem, a maioria das empresas não tem. Vamos construir juntos."

### Pergunta 7.2 — Análise automática do site

> "Posso analisar o site da [empresa] para extrair as cores e fontes automaticamente. Quer que eu faça isso?"

Se aceitar: executar o protocolo de extração documentado em `references/token-extraction.md`.

Apresentar resultado ao usuário: "Encontrei estas informações no site: Cor primária: [cor]. Fonte: [fonte]. Modo: [dark/light]. Está correto? Alguma correção?"

Se não aceitar ou site não disponível: prosseguir com perguntas manuais.

### Pergunta 7.3 — Cor primária

> "Qual a cor principal da marca? Pode me dar o código hexadecimal (#000000) ou descrever: 'azul escuro', 'verde vibrante', 'laranja queimado'."

Se o usuário descrever por nome: oferecer 2-3 opções de hex que correspondem à descrição. Ex: "Azul escuro pode ser #1e3a5f (navy), #0f2027 (quase preto-azul) ou #2c5282 (azul médio). Qual mais se aproxima?"

**Inteligência:** Se a análise do site já foi feita, confirmar ou ajustar a cor encontrada.

### Pergunta 7.4 — Cores secundárias

> "Tem cores de apoio? Cores que aparecem em botões, destaques, ou elementos secundários?"

Se não tiver: "Posso sugerir cores harmônicas baseadas na cor primária. Quer que eu crie?"

**Inteligência:** Gerar automaticamente baseado na cor primária (ver `references/token-extraction.md`, seção "Geração Inteligente").

### Pergunta 7.5 — Tipografia

> "Qual a fonte da marca? Pode me dar o nome ou descrever o estilo: sem serifa (moderna, clean), com serifa (clássica, editorial), cursiva, display..."

Se o usuário não souber: "Olhando no site da empresa, a fonte parece ser [inferência]. Confere?"

Se fornecer nome: verificar disponibilidade no Google Fonts e gerar URL de import.

### Pergunta 7.6 — Preferência dark ou light

> "Para os carrosséis e artes da marca, prefere fundo escuro (dark mode) ou fundo claro (light mode)?"

Contexto: "Dark mode destaca mais no feed, tem look mais premium. Light mode é mais corporativo e clean. Pode ter ambos — mas qual é o padrão?"

### Pergunta 7.7 — Mood visual (4 escalas)

> "Vamos definir o estilo visual com 4 escalas. Vou mostrar uma por vez com exemplos de marcas conhecidas."

Apresentar **uma escala por vez**:

**Escala 1 — Minimalista vs. Vibrante (1-5):**
> "1 = muito clean, muito espaço em branco (Apple, Stripe). 5 = muita cor, elementos, energia (Duolingo, Figma). Onde fica a marca?"

**Escala 2 — Clean vs. Texturizado (1-5):**
> "1 = liso e geométrico (Linear, Vercel). 5 = texturas, gradients complexos, camadas (Discord, Figma). Onde fica?"

**Escala 3 — Geométrico vs. Orgânico (1-5):**
> "1 = reto, preciso, ângulos exatos (IBM, Stripe). 5 = formas orgânicas, arredondadas, naturais (Mailchimp, Headspace). Onde fica?"

**Escala 4 — Sóbrio vs. Ousado (1-5):**
> "1 = comportado, seguro, previsível (Basecamp, Ghost). 5 = ousado, diferente, que chama atenção (Gumroad, Superhuman). Onde fica?"

**Inteligência:** Se o BRAND_VOICE foi preenchido, sugerir posicionamento baseado na personalidade da marca. Ex: "Você definiu a marca como 'amigo provocador' com tom 4-3-4-5 — isso sugere uma identidade mais vibrante e ousada. Provavelmente 4-5 nas escalas 1 e 4. Está correto?"

### Pergunta 7.8 — Referência visual (opcional)

> "Tem alguma marca, site ou perfil (@) cujo visual você admira? Não precisa ser do seu setor."

Se fornecido: acessar via web, extrair padrões visuais como inspiração (não copiar). Anotar o que pode inspirar.

---

## Geração Automática de Tokens Complementares

Após coletar cor primária e fonte, **gerar automaticamente** o sistema visual completo (ver `references/token-extraction.md`):

1. Variações de opacidade da cor primária: 70%, 40%, 10%, 5%, 3%
2. Cor de acento sugerida: complementar ou análoga (apresentar 2 opções)
3. Paleta de neutros para dark mode (bg-deep, bg-surface, bg-elevated, fg-primary, etc.)
4. Paleta de neutros para light mode
5. Cores semânticas (verde/sucesso, âmbar/alerta, vermelho/erro, azul/info)
6. Border-radius: sm, md, lg, xl, full
7. Sombras: sm e md
8. Gradients: texto e mesh

Apresentar ao usuário: "Baseado na sua cor [X] e fonte [Y], gerei uma paleta completa. Quer revisar antes de salvar?"

---

## Resumo e Confirmação

> "Perfeito! Documentei a identidade visual de [empresa]: cor primária [cor], fonte [fonte], modo [dark/light], com estilo [descrição do mood em linguagem simples]. Geramos uma paleta completa com [X] tokens. Está correto?"

---

## Formato de Saída

Gerar o arquivo conforme o template em `references/output-template.md`.

---

## Salvamento

```
Salvar em: [ACTIVE_COMPANY_PATH]/context/VISUAL_IDENTITY.md
```

---

## Transição

Se executada pelo orquestrador: informar conclusão e aguardar o orquestrador executar a finalização (PLATFORM_SPECS + HOOK_LIBRARY + checklist).

Se executada diretamente (atualização parcial):
> "Identidade visual atualizada. Mudanças de cores e fontes afetam diretamente os carrosséis gerados pela skill `/carousel-creator`. Não há impacto em outros arquivos de contexto. Para testar o novo visual, experimente `/carousel-creator` com um tema simples."

Consultar `~/.claude/skills/setup-briefing/references/impact-map.md` para verificar cascata.
