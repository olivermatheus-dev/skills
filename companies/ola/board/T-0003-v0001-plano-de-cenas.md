---
id: T-0003
title: V0001 · plano de cenas + storyboard
board: conteudo
status: done
assignee: agent:editor-de-video
priority: alta
due:
depends: []
parent: T-0002
links: [contents/V0001-apresentacao-aluno-professor/]
context: [contents/V0001-apresentacao-aluno-professor/roteiro.md, brand/BRAND.md#Referência obrigatória, brand/BRAND.md#Combinações, brand/BRAND.md#Proibições]
skills: [plano-de-cenas]
---

Plano de cenas do V0001 (skill `plano-de-cenas`, nível **alto**, 9:16 principal + 4:5) a partir do roteiro aprovado com direção visual por tela (`contents/V0001-apresentacao-aluno-professor/roteiro.md`, ler inteiro) e do `brand/BRAND.md` inteiro (dobras = regra dura; abrir as páginas do manual e os prints do site citados). Falas f01…f20 sem reescrever; um narrador pt-BR.

Entregas na pasta da peça: `cenas.json` + `plano.md` (check sem ✗) → **revisão crítica pelo orquestrador** (o revisor/Opus roda numa subtarefa à parte: ao terminar o check, comente com `--tipo revisar` pedindo a revisão e pare) → aplicar a revisão → `storyboard-9x16.png` e `storyboard-4x5.png` → portão do aval do Oliver.

Recursos resolvidos: `brand/voices.json` (rascunho `edge-thalita`); bandeiras do elenco em `library/visual/flags/flag-icons/{co,ar,mx}.svg` (MIT, registrada; 1:1, recorte redondo). Sem `context/`: só os fatos conferidos que o roteiro lista.

## Estado
- Parou em: protótipo, voz de teste edge-thalita-rapida (+30%%), timeline.json medida em 45,9 s, 68 eventos por palavra; plano.mjs check sem ✗.
- Próximo: cenas (blocos novos) com o plano atual; sound-designer em paralelo lendo os events.
- Falta do Oliver: nada para seguir.

## Checklist
- [x] cenas.json + plano.md, `plano.mjs check` sem ✗
- [ ] revisão crítica rodada 1 aplicada (revisao-plano-1.md)
- [ ] revisão crítica rodada 2 aplicada (alto)
- [ ] storyboard 9:16 e 4:5
- [ ] plano.md em `aguardando aval`

## Comentários
### 2026-10-26 16:14 · agent:editor-de-video · revisar
Plano de cenas pronto para a revisão crítica (fase E, rodada 1 de 2, nível alto). Conceito: 'A hora que muda de lado' (motivo = a pílula vermelha do tempo, que o aluno divide e que chega paga na agenda do professor). 11 cenas, ≈67 s, check sem ✗ (11 ⚠, todos 'sem style_frame', esperado antes da fase F). Pedido: rodar o agent:revisor (Opus) com a rubrica .claude/skills/plano-de-cenas/references/rubrica.md sobre companies/ola/contents/V0001-apresentacao-aluno-professor/cenas.json + companies/ola/contents/V0001-apresentacao-aluno-professor/check-1.txt (+ roteiro.md e brand/BRAND.md para dobras), saída companies/ola/contents/V0001-apresentacao-aluno-professor/revisao-plano-1.md. Depois me chame para aplicar e gerar storyboard + style frames. Perguntas para o Oliver já em companies/ola/contents/V0001-apresentacao-aluno-professor/plano.md §9.

### 2026-10-26 16:17 · ai
Oliver pediu até ~45 s e protótipo direto: revisão crítica cancelada, sem storyboard/style frames. Seguir para voz de teste + timeline + cenas.

## Log
- 2026-10-26 · agent:editor-de-video · plano de cenas (11 cenas, ≈67 s, conceito "A hora que muda de lado"), check sem ✗; aguardando revisão crítica rodada 1 → contents/V0001-apresentacao-aluno-professor/cenas.json, plano.md, check-1.txt
- 2026-10-26 · agent:editor-de-video · protótipo ≤45 s (pedido do Oliver): tempos enxutos, voz de teste win-maria-rapida (edge 403), timeline 43,3 s / 68 eventos; revisão crítica, style frames e storyboard cancelados → contents/V0001-apresentacao-aluno-professor/timeline.json, audio/vo/
PRECISA: agent:sound-designer para trilha + sound design (eventos na timeline.json)
- 2026-10-26 · agent:editor-de-video · voz de teste refeita com edge-thalita-rapida (+30%, 3,45 pal/s), eventos de volta à âncora por palavra, silêncios f02→f03/f03→f04 ≤ 0,5 s; timeline 45,9 s; brand/voices.json draft = edge-thalita-rapida
