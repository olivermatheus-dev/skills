# 001 — Estrutura de empresa + pasta de marca + `_inbox`

**Status:** feita (falta só receber os arquivos reais da kz) · **Depende de:** —

## Objetivo
Ter a estrutura mínima para as skills de vídeo usarem os arquivos de marca (logo, vetores, ícones, fontes), e a kz já migrada.

## Escopo
- Molde `companies/_modelo/`: `context/`, `brand/{logo,vectors,icons,fonts,photos,screenshots}/`, `video-templates/`, `contents/`, `campaigns/`, `tasks.md`.
- `_inbox/` na raiz (fora do git): o usuário solta os arquivos e o Claude classifica, renomeia (`logo-horizontal-cor.svg`, `icone-<nome>.svg`) e move para o lugar certo.
  - Arquivo arrastado para o terminal: o Claude recebe o caminho e consegue copiar. ✅
  - Imagem colada no chat: o Claude só vê, não salva. ⚠️ Por isso a `_inbox/`.
- `.gitignore`: `_inbox/`, `**/renders/`, `*.mp4 *.mov *.wav *.mp3 *.psd *.ai *.aep *.fig`.
- Skill `setup`: incluir a triagem da `_inbox/` e a pasta `brand/`.
- `CLAUDE.md`: documentar o molde, a `_inbox/` e a convenção de nomes.
- **Arquivo de marca** (genérico, com valores default quando faltar algo): `brand/BRAND.md` + `brand/brand.css`.
  - `BRAND.md` — regras de uso, em seções fixas:
    - **Cores:** papel de cada cor (fundo, título, texto, destaque, status) e o significado.
    - **Texto:** cor do título, caixa alta permitida?, pesos, tamanhos mínimos.
    - **Fundo:** liso, gradiente permitido?, texturas.
    - **Formas:** raio, bordas, sombras (níveis), espaçamento.
    - **Ícones e ilustração.**
    - **Movimento:** só ajustes sobre o default da skill ("mais calmo", estilo do cursor).
    - **Vídeo:** formatos padrão, voz (TTS), trilha.
    - **Proibições** (regras duras, entram no QA).
    - **Aprendizados:** feedback do dono vídeo a vídeo.
  - `brand.css` — tokens: cores, fontes, raio, borda, sombras (sm/md/lg), espaçamentos. Lido por carrossel e vídeo.
  - Precedência: marca > default da skill. Ver `knowledge/video/esteira-de-producao.md` §1.
  - Hoje `context/VISUAL.md` faz parte desse papel; migrar para `brand/` e apontar.
  - **Exemplo real de regras de marca** (Ludus, nascidas de feedback do dono), para usar como modelo do `BRAND.md`:
    - fundo liso `#F5F5F7` ou branco;
    - título em tinta `#1D1D1F`;
    - ouro `#F2A61C` só no símbolo, no botão principal e no fecho, e brilho só nele;
    - cor de status só dentro do app;
    - Inter, com logotipo em 700 e −0,055 em;
    - nunca caixa alta;
    - elenco fictício (Gaby, Mariana, Lucas, Beatriz, Pedro).
    Ver `../002-conhecimento-motion/material/2026-10-07-guia-de-movimento-ludus.md`.
  - O molde `_modelo/brand/BRAND.md` vem com as seções vazias + os defaults de `knowledge/video/visual-e-cor.md`.
- **Migrar a kz:** criar `companies/kz/brand/` e receber os arquivos de marca reais do usuário.

## Perguntas em aberto
- [ ] Usuário envia os arquivos de marca da kz (logo SVG final, vetores, ícones).

## Critérios de pronto
- [x] Molde e `.gitignore` criados; `CLAUDE.md` e `setup` atualizados
- [x] `companies/kz/brand/` criado com `brand.css` + `BRAND.md` (vindos do antigo VISUAL.md)
- [ ] Arquivos reais da kz (logo SVG, ícones, prints) organizados e `_inbox/` vazia: aguarda o usuário

## Log
- 2026-10-06 — criada.
- 2026-10-07 — **executada:**
  - molde `companies/_modelo/`;
  - contrato de tokens em `brand.css`, com defaults neutros;
  - `BRAND.md` com seções fixas;
  - kz migrada, com `VISUAL.md` → `brand/` e `assets/` → `brand/`;
  - o carrossel agora **linka** `../../brand/brand.css` em vez de copiar tokens. Testado com a kz: render ok;
  - `tools/contrast.mjs` criado. Ele achou branco sobre coral = 2,8:1, então `--on-primary` da kz virou tinta, e coral como texto = 2,6:1, então o dado grande usa `--accent`;
  - skill `setup` reescrita com triagem da `_inbox/`;
  - `.gitignore` para arquivos pesados.
- 2026-10-07 — incluída a especificação do arquivo de marca (BRAND.md + brand.css), inspirada na skill ludus-video.
