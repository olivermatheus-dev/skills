# 001 — Estrutura de empresa + pasta de marca + `_inbox`

**Status:** pronta · **Depende de:** —

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
- **Migrar a kz:** criar `companies/kz/brand/` e receber os arquivos de marca reais do usuário.

## Perguntas em aberto
- [ ] Usuário envia os arquivos de marca da kz (logo SVG final, vetores, ícones).

## Critérios de pronto
- [ ] Molde e `.gitignore` criados; `CLAUDE.md` e `setup` atualizados
- [ ] `companies/kz/brand/` com os arquivos reais organizados e a `_inbox/` vazia

## Log
- 2026-10-06 — criada.
- 2026-10-07 — incluída a especificação do arquivo de marca (BRAND.md + brand.css), inspirada na skill ludus-video.
