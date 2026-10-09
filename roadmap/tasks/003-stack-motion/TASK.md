# 003 — Stack de render de motion + protótipo

**Status:** feita (falta só o teste 3D, que depende dos prints da kz) · **Depende de:** 001

## Objetivo
Escolher **uma** forma de o Claude escrever animações (HTML/CSS/JS) e renderizar em MP4 localmente, com qualidade e de forma previsível. Provar com um protótipo de 10–15 s usando a marca da kz.

## Fato novo (2026-10-07)
O usuário **já usa HyperFrames + GSAP em produção** no produto Ludus (skill `ludus-video`, ver `../002-conhecimento-motion/material/2026-10-07-skill-ludus-video.md`). O kit de lá tem:
- `motion.js`: molas, `swap`, `stretchTo`, `cursor`, `offset`.
- scripts `tts`, `words`, `music`, `sfx`, `mix`, `produce`, `check`.
- motion blur.
- um `GUIA-DE-MOVIMENTO.md`.

→ **HyperFrames + GSAP vira o candidato nº 1.** Antes de pesquisar alternativas, avaliar **reaproveitar o kit do Ludus** de forma genérica (sem regras do Ludus).

## Requisito novo (2026-10-07)
O kit nasce com a **galeria** (tarefa 014): componentes de `library/motion` carregáveis por id com parâmetros.
O kit precisa carregar **cenas isoladas por id** e aplicar **CSS de tema por variante** (tarefa 013), para gerar variantes de anúncio sem reescrever código.

## Candidatos (pesquisa curta: verificar licença, maturidade, se suporta fontes, SVG, áudio e 60 fps)
- **HyperFrames + GSAP** (em uso no Ludus): framework HTML → vídeo pensado para agentes.
- **Remotion**: React → MP4; maduro, com preview no navegador (Studio); licença gratuita para empresas pequenas (confirmar).
- **Playwright + ffmpeg**: captura frame a frame; nenhuma dependência nova (o carrossel já usa Playwright).
- Bibliotecas de animação a considerar dentro do HTML: GSAP (agora gratuita), Lottie (para vetores animados).
- **3D** (o usuário vai usar animações e recursos 3D): Three.js / React Three Fiber, modelos glTF, cenas exportadas do Spline. Verificar se o render escolhido captura WebGL frame a frame sem perder qualidade.

Critérios de escolha: (1) qualidade final, (2) o Claude escreve com facilidade, (3) render determinístico (frame a frame, sem travadas), (4) preview rápido, (5) depois dá para conectar com uma timeline (ver `DEPOIS.md`).

## Perguntas em aberto
- [ ] Máquina do usuário: provavelmente **Windows** (o Ludus usa `Start-Process` e `fnm` com Node 22). Confirmar se tem ffmpeg e Python.
- [ ] **Pode trazer o `_kit` do Ludus** (motion.js, scripts, GUIA-DE-MOVIMENTO.md) para este repo como base genérica?
- [ ] Qual provedor de TTS o Ludus usa (voz "Thalita")? Mesma conta serve aqui?
- [ ] 2–3 vídeos de referência de motion que o usuário acha excelentes

## Critérios de pronto
- [x] `DECISAO.md` nesta pasta (escolha, prós/contras, como instalar)
- [x] Protótipo 9:16 (e 4:5) de 15 s com tipografia animada, marca em texto (logo final pendente) e cores da kz, renderizado em MP4 — `companies/kz/contents/_testes/2026-10-07-teste-kit/`
- [ ] Teste com 1 elemento 3D (ex.: celular girando com print do produto) renderizado sem perda de qualidade — **aguarda prints da kz**

## Log
- 2026-10-06 — criada.
- 2026-10-07 — HyperFrames + GSAP vira o candidato nº 1 (já em produção no Ludus). Próximo passo: reaproveitar o kit.
- 2026-10-07 — Kit trazido e adaptado em `tools/video-kit/` (ver `DECISAO.md`). Respostas do Oliver: pode copiar o kit; **sem voz definida** → rascunho sempre com voz grátis do Windows, final na ElevenLabs só após aprovar copy e estrutura, depois tratar e encaixar (`fit-vo.mjs`); catálogo geral de vozes (`library/voices/`) e vozes por projeto (`brand/voices.json`); skill própria de ElevenLabs → tarefa 020. Teste da kz renderizado e com QC limpo (BT.709, −14 LUFS, sem tela parada); o QC final pegou 2 sobreposições em transições que os quadros de conferência não pegam (registrado no `GUIA-TECNICO.md`). Fonte Montserrat local na kz (OFL). Encaixe da voz final testado: a timeline encolheu 15,2 → 13,5 s e os eventos acompanharam.
