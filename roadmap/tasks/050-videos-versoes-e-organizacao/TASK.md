# 050 — Vídeos: versão de verdade, anotação que funciona e organização para 100–200 peças

Status: A, B e C feitas (2026-10-09); falta migrar a origin-story (em uso pela 049) · D depois

## Pedido do Oliver (2026-10-09)
- Anotou um elemento num quadro do vídeo (c1 da `V0003-apresentacao-janela`, 9:16, 14,88 s: "a janela da sessão, quando fala que é o que realmente importa, deve crescer e ficar centralizada, o resto com menos opacidade"), pediu ajuste ao Claude pelo app e **nada mudou**.
- A nomenclatura e a organização dos vídeos confundem; precisa aguentar 100–200 vídeos.
- Decidiu: **ID `V0012` + slug na pasta, data na ficha** · c1 pelo caminho (a): recuperar a v01, aplicar e exportar.

## Diagnóstico (por que o c1 não saiu)
1. **A fonte do vídeo anotado não existia mais.** O MP4 foi exportado às 23:55; às 00:02 a `timeline.json` foi trocada pelo esqueleto do plano (blocos `rascunho/cena-nova`) e a pasta `blocos/` da peça sumiu. Os 7 blocos só sobreviviam dentro do HTML montado (`render/<fmt>/index.html`). "Versão" era só o nome do MP4.
2. **O agente tentou extrair com script improvisado** (`node -e`, `cd … &&`), que o heartbeat não libera (correto); o kit em si (`node tools/*`) estava liberado.
3. **A pergunta dele não chegou ao Oliver:** terminou com texto no chat (log da atividade) em vez de `review.mjs responde`; o app só mostrou "0 de 1 resolvida".
4. `compor.mjs --listar` reescrevia o `composition.html` (listar não pode gravar).
5. `review.mjs` tirava o quadro do "mais recente" por ordem alfabética (`9x16-v01` > `4x5-v02`), não do MP4 anotado; e 4:5 e 9:16 da mesma fonte saíam com números diferentes.

## A — Fluxo (feita)
- `produce.mjs` grava **`versoes/vNN/`** a cada export: `timeline.json`, `composition.html` (modelo), **todos** os blocos usados (qualquer escopo), `data/`, `versao.json` (hash da fonte, formatos → MP4). **Versão = fonte**: mesma fonte e formato que faltava = mesmo número.
- `tools/video-kit/scripts/versao.mjs <pasta> listar | diff vNN | restaurar vNN` (restaurar guarda a atual em `versoes/_backup-…`).
- `tools/video-kit/scripts/recuperar.mjs <pasta> --de render/<fmt>`: reconstrói timeline + blocos do projeto a partir do HTML montado (peças anteriores à 050). Testado: remonta **byte a byte igual**.
- `review.mjs`: quadro do MP4 anotado; linha "fonte do vídeo anotado: versoes/vNN → diff/restaurar"; aviso quando o MP4 não tem versão; "mais recente" pela versão.
- `compor.mjs --listar` só lê.
- Fecho do pedido (`tools/lib/pedidos-ia.mjs`): anotação que ficou aberta sem `responde` recebe o texto final do agente como resposta no card ("Não resolvi nesta rodada. …").
- Prompt do "Pedir ajustes" (`core/pedidos-ia.ts`): travou → `responde`; só scripts do hub a partir da raiz; onde está a fonte. Heartbeat libera `git status|diff|log|grep`.
- Skill `video` (Pasta do vídeo + Revisão por anotações) e `tools/video-kit/README.md` atualizados.

## B — c1 (feita, falta o aval)
- Fonte da v01 recuperada → `versoes/v02/` (é a fonte do `4x5-v02` e do `9x16-v01`, mesmo HTML). Esqueleto do plano que tinha sobrescrito: `_antes-050/`.
- `blocos/cena/janelas-espremem`: cue novo `destaca` (palavra "importa", −0,15 s): a Sessão sai do canto, cresce (×1,3) e para no centro; Agenda, Pacientes e Anotações apagam a 22%; em "atender" a Sessão pulsa (anel + coração). Params `destaque`, `escala_destaque`, `apagado`.
- Exportada a **v03** (4:5 + 9:16).

## C — Organização com ID (feita, falta a origin-story)
Decisões do Oliver: ID + slug na pasta, data na ficha; **todos os tipos ganham ID**.
- **Regra** (`tools/lib/pecas.mjs`): `<letra><4 dígitos>-<slug>`, letra = tipo (`V` vídeo · `C` carrossel · `P` post · `M` mockup · `R` roteiro), contador por tipo e por empresa, nunca reaproveitado. ID novo: `node tools/pecas.mjs proximo <slug> <tipo>`; o app (Novo conteúdo pelo formato, editor de Mockups) e `tools/mockup/render|cena.mjs` já criam assim.
- **Ficha** (`schema/piece.ts`): `id`, `criado`, `familia`, `campanha`. Status continua no `revisao.json` (o app já filtra por ele).
- **Exports:** `<ID>-<formato>-vNN.mp4` (`V0003-9x16-v03.mp4`); `qc.mjs` aceita o padrão novo.
- **Testes do hub** em `contents/_testes/`: fora da lista e das contagens; caixa "testes (N)" no app.
- **App (Conteúdos):** ID no card, na lista e no título da peça; busca "V3", "v0003", "3"; família no subtítulo; ordem por data de criação; subpastas de peça com ID (`versoes/`, `style/`, `comparacao/`) não viram peças soltas.
- **Migração** (`node tools/pecas.mjs migrar <slug> [--aplicar] [--slug pasta=novo] [--familia pasta=nome] [--teste pasta] [--exceto pasta]`): simulação por padrão; renomeia MP4 e pasta, preenche a ficha, troca o caminho em todo texto do hub (pula `.claude/worktrees`) e recalcula o hash das versões (`versao.mjs rehash`).
- **Aplicada na kz (2026-10-09):**

| antes | agora | família |
|---|---|---|
| 2026-10-07-apresentacao-kz | V0001-apresentacao-kz | apresentacao-kz |
| 2026-10-08-apresentacao-kz-pecas | V0002-apresentacao-pecas-da-rotina | apresentacao-kz |
| 2026-10-08-apresentacao-kz-plano | V0003-apresentacao-janela | apresentacao-kz |
| 2026-10-07-mockup-painel · -inicio · -premium | M0001-painel · M0002-painel-inicio · M0003-painel-premium | mockup-painel |
| teste-kit · teste-plano-de-cenas · ab-sessao | _testes/… | — |
| 2026-10-07-origin-story | **pendente** → C0001-origin-story | — |

- **Falta:** a `origin-story` ficou de fora porque a sessão do carrossel (tarefa 049) está trabalhando nela; avisada para rodar `node tools/pecas.mjs migrar kz --aplicar` ao terminar.

## D — Depois
- App: anotação guarda a versão (`video` já guarda o MP4; somar `versao`), botão "Restaurar esta versão" e comparação lado a lado vNN × vMM no player; `principal` por versão em vez de arquivo.
- Campanhas (`campaigns/AAAA-MM-DD-…`) e capturas seguem com data no nome; decidir se ganham ID quando crescerem.

## Log
- 2026-10-09 · diagnóstico do c1 (log `logs/atividade/20261009032445-ajustes-suyz.json`) · A feita · B: fonte recuperada (idêntica), ajuste aplicado, quadros conferidos em 4:5 e 9:16, v03 exportada.
- 2026-10-09 · C feita: regra de ID, app, ferramentas, docs (skills, agentes, CLAUDE.md, protocolo); migração aplicada (9 pastas, 18 MP4, 52 textos); app conferido no navegador (busca "v3", ID no título, player na V0003-9x16-v03, sem erro no console). Tarefa renumerada de 049 para 050 (a 049 é a do carrossel, de outra sessão).
