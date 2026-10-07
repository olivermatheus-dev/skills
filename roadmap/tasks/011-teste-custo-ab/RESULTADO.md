# 011 — Resultado do A/B de custo (2026-10-07)

Mesmo pedido nos dois: vídeo de apresentação da kz (62 s, 9:16, nível médio) com a voz final da Carla já pronta e 4 prints da plataforma (`companies/kz/contents/2026-10-07-ab-sessao/input/`).
Medido com `node tools/usage.mjs <sessão> --until <entrega>`, que lê os transcripts do Claude Code e soma os subagentes. Preços: Opus 5.5 = US$ 4 entrada / 20 saída / 0,20 leitura de cache por milhão; Sonnet 5.5 = 2 / 10 / 0,20; escrita de cache = 1,25× a entrada.

| | **A: Opus 5.5 sozinho** | **B: Sonnet 5.5 médio + subagentes Sonnet** |
|---|---|---|
| Até a entrega final do teste | v02 · 69 min | v05 (2ª rodada, com o feedback do Oliver) · 80 min |
| Chamadas ao modelo | 96 | 24 orquestrador + 122 subagentes |
| Tokens de saída | 111 mil | 180 mil |
| Leitura de cache | 22,0 mi | 21,2 mi |
| Escrita de cache | 0,29 mi | 1,95 mi |
| **Custo estimado** | **US$ 8,91** | **US$ 11,03** (orquestrador 0,85 + subagentes 10,19) |
| Sessão inteira (com o que veio depois) | US$ 10,56 | US$ 13,10 |
| Vídeo | `A-opus/exports/…-A-opus-9x16-v02.mp4` | `B-sonnet/exports/B-sonnet-9x16-v06.mp4` (v06 = ajustes da revisão 022) |

## Leitura
- **O Sonnet com subagentes saiu ~24% mais caro, mesmo custando metade por token.** O custo dominante é **reler o contexto** (≈ 22 mi de tokens de cache nos dois). Cada subagente começa do zero: relê skill, marca e kit, e escreve cache de novo (1,95 mi × 0,29 mi). Além disso, B gerou mais saída e precisou de mais versões (v01→v05).
- **Qualidade:** o revisor do B deu um falso positivo (leu um plano desatualizado) e deixou sugestões sem aplicar. A teve 1 crítico e 1 maior no QC, ambos corrigidos na hora. **Falta a nota cega do Oliver** (1–5, vendo os dois MP4 sem saber qual é qual).
- As condições não foram idênticas: os dois receberam o feedback do Oliver no meio, em rodadas diferentes. Vale como ordem de grandeza, não como medida exata.

## Decisão provisória (confirmar depois da nota)
- **Vídeo = 1 sessão Opus sozinha** (sem subagentes) como padrão.
- Subagente só quando o trabalho é **isolado e barato de contextualizar** (pesquisa, coleta, revisão curta), nunca para cenas que dependem de todo o contexto do vídeo.
- Para baratear o Opus: menos releitura (tarefa 021: contexto declarado por tarefa, índices em vez de arquivos grandes) e reaproveitar cenas e componentes (013/014).

## Pendente do Oliver
- [ ] Nota cega A × B (1–5) e os ajustes pontuais que ele vai pedir nos dois vídeos (as fichas já estão na central: app → Conteúdos).
