# Relatório · A-opus (Opus 5.5, sessão única, sem subagentes)

**MP4:** `A-opus/exports/2026-10-07-ab-sessao-A-opus-9x16-v01.mp4` (fora do git)
**Duração:** 62,5 s · 1080×1920 · 30 fps · H.264 · BT.709 · −14 LUFS, true peak −1,5 dBTP · 12,6 MB
**QC:** `node tools/video/qc.mjs` → ✅ limpo (na rodada final). Folha: `A-opus/qc/2026-10-07-ab-sessao-A-opus-9x16-v01-sheet.png` (vista).
**Plano e decisões:** `A-opus/plano.md`. Só o 9:16; o HTML já suporta 4:5 (`formats` no timeline.json), mas não renderizei.

## Etapas e tempo (relógio local, início 15:39:35, fim ~16:12)
| etapa | horário | tempo |
|---|---|---|
| Leitura (briefing, skill video, BRAND, REGRAS, kit, vídeo 01, prints) | 15:39–15:41 | ~2 min |
| timeline.json + `split-vo` da voz (faster-whisper, 9 falas) | 15:41–15:46 | ~4 min (3,5 min de ASR) |
| Trilha sintetizada + SFX + mix (em segundo plano) | 15:46 | 10 s |
| composition.html (9 cenas) | 15:46–15:49 | ~3 min |
| Feedback do vídeo 01 enviado pelo Oliver no meio: texto + 33 SFX + edições | 15:49–15:50 | ~1 min |
| build + check + 2 bugs + folhas + correções visuais | 15:50–15:53 | ~3 min |
| Render 1 (falhou: EBUSY) → render 2 + QC | 15:53–16:02 | ~8 min (3 min de captura) |
| Correção do QC (1 crítico, 1 maior) | 16:02–16:03 | ~1 min |
| Render 3 + QC + folha final | 16:03–16:12 | ~8,5 min |
| **Total** | | **~33 min** (~20 min só de render/ASR) |

## Problemas encontrados
1. **Node 20 no PATH** (o HyperFrames exige ≥ 22): `check`/`produce` falham. Usei o Node 22 do fnm no PATH (`%APPDATA%\fnm\node-versions\v22.23.1`).
2. **Whisper ouviu "tudo que"** (o roteiro tem "tudo o que"): 16 × 17 palavras na f1. Ajustei o texto da fala ao áudio.
3. **Bug meu:** `T.word('f1:Se', k)` (passei rótulo e índice juntos) → todos os quadros vazios. Corrigido para `T.word('f1', k)`.
4. **Bug meu:** `String.replace` com `$$` no texto de substituição virou `$` → `$(...).forEach`. Corrigido.
5. **Render 1 falhou com EBUSY**: o terminal estava dentro de `render/9x16/check`. Rodei de novo de outra pasta.
6. **QC crítico "flash branco em 33,0 s"**: não era flash. A cena 5 tinha quase só pixels claros, e o brilho do fundo cruzava o limite do detector. Corrigi a causa (o mesmo vazio que o Oliver apontou): os 3 cards já entram apagados e acendem na palavra.
7. **QC maior "tela parada em 20,2 s"**: a sala online ficava parada até o clique. Agora desliza e o microfone pulsa.
8. **Biblioteca sem música** (music 0): trilha própria sintetizada no kit, sem 2–3 candidatas. Registrado no plano.
9. Folhas do `check`: título da abertura cortado nas bordas, linhas do "menos" saindo do quadro, ponto final solto em "paciente", vazios em s1, s2 e s4. Tudo corrigido antes do render.

## Feedback do vídeo 01 (mandado pelo Oliver durante a sessão), aplicado aqui
Abertura com "Se você é *terapeuta*" grande, que encolhe e sobe; cenas começando com algo na tela; headline animada na tela dos blocos; mais ícones e retorno visual; 33 SFX discretos (antes, 17).

## Em aberto / para o Oliver conferir
- Ouvir (o Claude não escuta): quantidade de pops/whooshes e a trilha sob a voz.
- "Mais espaço para" fica ~1,5 s com pouca coisa na tela antes de "o seu paciente" (só um brilho e o coração).
- Sala online com fundo pastel, não o preto do app.

---

## v02 · correções pedidas pelo Oliver (16:14–16:40, ~25 min)
**MP4:** `A-opus/exports/2026-10-07-ab-sessao-A-opus-9x16-v02.mp4` · 64,0 s (cartão final passa 3,7 s do fim da voz). A v01 foi para `exports/anteriores/`.

| pedido | o que mudou |
|---|---|
| Texto demorando, frase incompleta ("tudo" sozinho) | Função `phrase`: a frase entra **inteira** em cascata de ≤ 0,5 s no início da fala/cena. A sincronia por palavra fica só para gestos. |
| Linha atrás dos cards (s5) | Cards sempre opacos; só o conteúdo apaga/acende. A linha aparece só entre os cards. |
| "Mais espaço para" + vazio (s7) | Frase de impacto inteira no 1º quadro + coração com anel; "o seu *paciente.*" inteira antes da palavra. |
| Logo atrasada (s8) | Logo se desenha no 1º quadro da cena (antes esperava "KZ", ~1 s), com frase e pílulas em seguida; ícones dos recursos em "organizar". |
| CTA com microanimação reutilizável | `library/motion/cta/navegador/` (novo): aba abre, digita kz.app.br, cursor clica em Ir, barra carrega, página abre. Teclado, clique e ding licenciados. O `produce.mjs` agora copia `library/motion` para o render. |
| Registrar como regra | `knowledge/video/REGRAS.md` §1–2, skill `video` (etapa 3), `library/motion/README.md`, armadilha nova no `GUIA-TECNICO.md`, memória de feedback. |

Problemas: o comentário do componente tinha a tag de fechar script e quebrou o build (o HyperFrames embute o JS), corrigido e registrado no GUIA-TECNICO; QC acusou 1,8 s parado na s3, corrigido com o botão "Ir para a sessão" pulsando até o clique.
