# 047 — Skill de plano de cenas (roteiro/transcrição → ideias → conceito → ficha por cena → revisão crítica → storyboard)

Status: fazendo (fase A feita em 2026-10-08; próxima: B) · Liga com: 045 (blocos), skill `video`, `ig-post`, agentes `editor-de-video` e `revisor`
Pedido do Oliver em 2026-10-08: uma skill **muito boa**, que roda **antes** da produção, analisa o conteúdo (roteiro, transcrição do áudio ou tema) e monta o **plano de cenas**: como cada bloco de motion é construído e como a imagem se conecta com o que é falado e mostrado (encaixa, complementa e deixa claro). Tem que ter **pelo menos uma camada de revisão crítica de melhoria**, ser bonito e bem feito, e depois do aval gerar com o máximo de qualidade.
Decisões do Oliver (2026-10-08): **skill separada** da `video` · revisão crítica por **subagente Opus no médio e no alto** (no simples, autocrítica) · **storyboard com quadros obrigatório no médio**.

## 1. Diagnóstico (o que estava errado)
1. O plano era só a etapa 1 da skill `video`: dizia *o que* entregar, mas não *como pensar*. "Na tela" era texto livre.
2. As falhas da v01 da apresentação kz (tela vazia, sem headline, sem ícone, sem elemento que ilustre a fala) eram falhas de plano e viraram regra de execução (Padrões do Oliver).
3. Não existia gramática "tipo de ideia → tratamento visual" nem repertório do que o Oliver já aprovou.
4. Sem conceito condutor: cada cena com um recurso diferente, cenas sem ligação (match, olhar).
5. O plano não falava a língua dos blocos (045): quem animava traduzia de novo.
6. Nenhuma revisão crítica do plano; o `revisor` só via o vídeo pronto.
7. Aval às cegas: o plano da apresentação não tinha nenhum style frame.
8. Entrada rígida (sem transcrição); `ig-post` também decidia "cenas".

## 2. Desenho
Skill `.claude/skills/plano-de-cenas/` com as fases **A entrada → B mapa de ideias → C conceito (motivo, transição, curva) → D ficha de cena → E revisão crítica → F storyboard → G aval e passagem**.
- `cenas.json` = plano de máquina (contrato em `references/cenas-json.md`): cada cena com `relacao` (mostra/complementa/contrasta/prova/literal ≤ 30%), `acrescenta`, `composicao`, `olhar`, `poses`, `gestos` presos a palavra, `entra`/`sai`, `use` ou `novo` (spec + style frame), `fontes`.
- `references/gramatica.md` (tipo de ideia → recursos → evite; ligações; testes rápidos), `references/rubrica.md` (12 critérios 0–3, 5 eliminatórios, passa com ≥ 27/36; prompt do revisor Opus), `references/molde-plano.md`.
- `knowledge/video/repertorio.md`: soluções aprovadas por tipo de ideia (semeado com as 7 cenas da apresentação kz v03) + Evitar.
- `tools/video/plano.mjs`: `blocos` (lista curta dos blocos disponíveis) · `check` (✗ bloqueia / ⚠ avisa: campos, slots × on_screen, cues sem gesto, palavra fora da fala, ideia ou fala sem cena, fonte, vão > 1,5 s, curva, literal > 30%, motivo fraco, duração) · `timeline` (cenas.json → timeline.json; `novo` entra como `library/blocos/rascunho/cena-nova`) · `storyboard` (1 quadro assentado por cena → `storyboard-<fmt>.png`, style frame substitui o rascunho).

## 3. Fases
- **A (feita, 2026-10-08):** skill, referências, repertório, `plano.mjs`, bloco `rascunho/cena-nova`, integração (skill `video` etapa 1, `editor-de-video`, `orquestrar`, `ig-post`, CLAUDE.md, README do knowledge). Teste de ponta a ponta: `companies/kz/contents/2026-10-08-teste-plano-de-cenas/` (3 cenas, 1 bloco novo): check → timeline → tts → build → storyboard ok.
- **B (plano feito, aguardando o julgamento do Oliver, 2026-10-08):** refazer o plano da apresentação kz com a skill (roteiro atual como entrada), com revisão Opus e storyboard; comparar com a v03 (o Oliver julga) e calibrar rubrica, gramática e avisos do `check`.
- **C:** entrada por transcrição com tempos (vídeo/áudio já gravado): `entrada.tempos` → falas com `words` já medidas, sem TTS (liga com cortes e edits da 045).
- **D (talvez):** storyboard no app (Conteúdos → plano: quadros + ficha + anotar por cena, como a revisão 022).

## 4. Critérios de pronto
- [x] Skill separada com as fases A–G e os 3 níveis.
- [x] Revisão crítica por subagente (rubrica com nota e eliminatórios).
- [x] Storyboard em quadros gerado por script, com bloco novo no lugar certo.
- [x] `cenas.json` vira `timeline.json` sem retrabalho.
- [ ] Fase B: plano da apresentação refeito e julgado pelo Oliver.

## Log
- 2026-10-08: análise crítica da skill `video` (etapa de plano) com o Oliver; 3 decisões dele (acima). Fase A feita. Nota: o HyperFrames pede Node 22 (`fnm exec --using=22 node …` quando o terminal está no 20).
- 2026-10-08 (fase B, sessão Fluxo IA): plano "Uma janela só" em `companies/kz/contents/2026-10-08-apresentacao-kz-plano/` (voz real da Carla, sem TTS). Revisão Opus: rodada 1 22/36 → rodada 2 28/36 (passa). Storyboard 4:5 + 9:16, style frames das 7 cenas, gestos na palavra real ±0,15 s (fit-vo). Comparação com a v03: `comparacao/v03-x-janela-4x5.png` + `COMPARACAO.md`; 6 perguntas no `plano.md`. Calibragem da skill/check: `notas-calibragem.md` (33 pontos), aplicada pela outra sessão (dona do `plano.mjs`), que fez um 2º conceito em `2026-10-08-apresentacao-kz-pecas/`. Incidente: as duas sessões escreveram na mesma pasta; regra → conferir sessões antes de criar pasta de saída.
