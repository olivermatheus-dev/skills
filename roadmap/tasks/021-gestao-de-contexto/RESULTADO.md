# 021 — Medição: tarefa real lendo só o `context:` (2026-10-08)

**Tarefa:** T-0012 (PNG do carrossel da origin story, kz), rodada como rascunho pelo agente `designer` (Opus 5.5), começando por `node tools/board.mjs pacote kz T-0012`.
**Saída:** 10 PNG em `companies/kz/contents/C0001-origin-story/png/`, tarefa em `review`.

## Custo da execução (transcript do subagente)
| item | tokens | US$ |
|---|---|---|
| escrita no cache | 125.744 | 0,63 |
| leitura do cache (15 turnos) | 1.436.297 | 0,29 |
| saída | 13.468 | 0,27 |
| **total** | 15 respostas · 26 ferramentas · 2 min 19 s | **1,19** |

## Leitura de contexto: antes × depois
Não há execução antiga do designer para comparar (nenhum transcript), então o "antes" é a lista fixa de "Ler antes" do agente, que ele lia quando a tarefa não declarava nada.

| | o que lê | tamanho |
|---|---|---|
| antes (lista fixa) | roteiro + BRAND.md + brand.css + `knowledge/video/frame.md` + `protocolo.md` | ~32 KB (~9 mil tokens) |
| depois (pacote) | Estado + tarefa + mãe + BRAND.md + roteiro | 19,6 KB (~5,6 mil tokens) |
| leu a mais (registrado no log) | template do carrossel, grep no brand.css, logo SVG, um `peca.json` de exemplo | pequeno |

**Corte de ~40% na leitura de contexto (~3,5 mil tokens).** Em dinheiro é pouco (uns US$ 0,03 por tarefa): o custo de uma tarefa é dominado pelo fixo (prompt do agente + skill pré-carregada), pelas saídas das ferramentas e pela conferência dos 10 PNG, que se repetem a cada turno pelo cache.

## Conclusões
- O ganho do `context:` é **foco e previsibilidade** (o agente não abriu protocolo, frame nem VOICE e entregou certo), não economia grande.
- Para economizar de verdade, o alavanca é **menos turnos** (cada turno relê ~95 mil tokens do cache) e menos imagens conferidas por turno, não menos arquivos.
- O que faltou no pacote virou padrão: `brand/brand.css` e o logo entraram no `context:` padrão do designer (skill `orquestrar`).
- Próximo passo possível (não urgente): `pacote` com seções do BRAND.md em vez do arquivo inteiro quando ele crescer.
