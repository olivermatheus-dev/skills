# 011 — Teste A/B de custo e qualidade (solo × orquestrador com subagentes)

Status: rascunho · Depende de: 003 (kit de render), 010 (níveis)

## Pergunta
O que compensa mais por vídeo: **A)** Opus no esforço médio fazendo tudo sozinho, ou **B)** Opus no médio como orquestrador de subagentes Sonnet no médio?

## Desenho
- **Mesmo pedido nos dois** (sugestão: kz, `fmt-recorte-funcionalidade`, 15 s, 9:16, nível médio), mesmo commit do repo, sessão nova (`/clear`) para cada um.
- **A:** sessão principal Opus médio, skill `video` direto, sem subagentes.
- **B:** sessão principal Opus médio com a skill `orquestrar`; roteirista, editor-de-video, sound-designer e revisor rodando com `model: sonnet` e esforço médio (frontmatter do agente ou parâmetro na delegação).
- **Medir:**
  - custo: tokens de entrada/saída/cache e US$ (`/cost` ao fim, ou uso da sessão), somando subagentes;
  - tempo total e número de interações do Oliver;
  - qualidade: `qc.mjs` (críticos/maiores), checklist de aprovação (`qc-final.md` §7) e **nota cega do Oliver (1–5)** vendo os 2 MP4 sem saber qual é qual.
- **Registrar** em `roadmap/tasks/011-teste-custo-ab/RESULTADO.md`: tabela A × B + decisão (qual vira padrão e para quais níveis).

## Hipótese
B deve custar menos por vídeo (Sonnet faz o grosso), com risco de mais iterações no código das cenas. Se a nota cair ≥ 1 ponto, B fica só para roteiro e áudio.

## Log
- 2026-10-07: teste registrado a pedido do Oliver.
