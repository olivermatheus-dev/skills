# 001 — Padrão de marca por empresa: tokens + pasta de assets

**Status:** rascunho · **Fase:** 1 · **Depende de:** —

## Objetivo
Cada empresa tem uma pasta de marca com **tokens visuais em formato único** (lidos por HTML, carrossel e vídeo) e **arquivos de marca** organizados (logos, vetores, fontes, fotos).

## Contexto
Usuário: "registrar os tokens visuais de cada marca, bem como ter arquivos para logotipos, vetores etc." Os tokens são críticos porque haverá skills de vídeo (base real e motion design) que precisam das mesmas cores, fontes e estilo. Hoje os tokens vivem só como bloco CSS dentro de `context/VISUAL.md` — serve para HTML, não para vídeo.

## Proposta inicial (validar)
```
companies/<slug>/brand/
  tokens.json      ← fonte única: cores, tipografia, raio, espaçamento, sombras, motion (durações, easings)
  tokens.css       ← gerado a partir do JSON (para HTML/carrossel)
  logo/            ← SVG (principal, horizontal, símbolo, mono claro/escuro) + PNG de apoio
  vectors/         ← ícones, ilustrações, grafismos (SVG)
  fonts/           ← arquivos de fonte quando não houver no Google Fonts
  photos/          ← fotos aprovadas da marca
  BRAND.md         ← regras de uso (o que é hoje o VISUAL.md: quando usar cada cor, estilo de imagem, do/don't)
```
- `context/VISUAL.md` vira `brand/BRAND.md` (ou aponta para ele) — evitar duas fontes de verdade.
- Script simples `tokens.json → tokens.css` (e, se a stack de vídeo pedir, `tokens.ts`).

## Escopo
- Entra: estrutura de pastas, formato do `tokens.json`, convenção de nomes dos arquivos, script de geração, atualização da skill `setup` e do `CLAUDE.md`.
- Não entra: migrar a kz (002), adaptar as skills (003).

## Perguntas em aberto
- [ ] Arquivos pesados (vídeos, fotos em alta, .ai/.psd/.fig): versionar no git, usar Git LFS ou guardar link para Drive?
- [ ] Tokens de motion (durações, easings, estilo de transição) já entram aqui ou só na fase de vídeo?
- [ ] Usar padrão W3C Design Tokens (`$value`, `$type`) ou JSON simples próprio?
- [ ] Usuário tem arquivos de marca (Figma, manual de marca) para servir de base?

## Critérios de pronto
- [ ] Estrutura documentada no `CLAUDE.md` e na skill `setup`
- [ ] `tokens.json` de exemplo válido + script gera `tokens.css` sem erro
- [ ] Convenção de nomes de logo/vetores definida (ex.: `logo-horizontal-cor.svg`)

## Arquivos afetados
- `CLAUDE.md`, `.claude/skills/setup/SKILL.md`, novo script em `tools/` ou na skill, `.gitignore`/`.gitattributes`

## Log
- 2026-10-06 — criada a partir do pedido do usuário.
