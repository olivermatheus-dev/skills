# 050 — Vídeos: versão de verdade, anotação que funciona e organização para 100–200 peças

Status: A e B feitas (2026-10-09) · C (organização com ID) é a próxima · D depois

## Pedido do Oliver (2026-10-09)
- Anotou um elemento num quadro do vídeo (c1 da `2026-10-08-apresentacao-kz-plano`, 9:16, 14,88 s: "a janela da sessão, quando fala que é o que realmente importa, deve crescer e ficar centralizada, o resto com menos opacidade"), pediu ajuste ao Claude pelo app e **nada mudou**.
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

## C — Organização com ID (próxima)
Proposta aprovada no princípio (ID + slug, data na ficha). Desenho para executar:
1. **Pasta:** `contents/V0001-<slug>/`. Numeração única por empresa, nunca reaproveitada; `node tools/pecas.mjs <slug> --next-id` (como o `board.mjs --next-id`). O slug pode mudar; o ID não.
2. **Ficha (`peca.json`):** `id`, `criado` (a data que saiu do nome), `status` (`ideia → roteiro → plano → producao → revisao → aprovado → publicado`), `formato`, `familia` (tentativas do mesmo vídeo), `campanha`, `principal` = versão (`v03`), não arquivo.
3. **Exports:** `exports/V0001-v03-9x16.mp4` (curto; o slug fica na pasta). Versões antigas continuam ali; o app mostra só a principal e "outras versões".
4. **Testes do hub** (`teste-kit`, `teste-plano-de-cenas`, `ab-sessao`) → `contents/_testes/`, fora da lista principal.
5. **Gerados** (`render/`, `qc*/`, `check*.txt`, `*.bak.*`) → nada disso na raiz da peça; `render/` já é fora do git.
6. **Migração por script** (`tools/pecas.mjs migrar <slug> --dry`): renomeia pasta e MP4s, preenche a ficha, reescreve referências (`revisao.json` > `video`, `peca.json` > `principal`, `board/T-*.md`, `roadmap/`, `variantes/indice.json`, `projeto.json`, `logs/pedidos-ia`), e só então move. Rodar com `--dry` e mostrar a tabela ao Oliver antes.
7. **App:** Conteúdos lista por status/formato/família (não por nome), busca por `V12`; aba Vídeo com seletor de versão (anotar sempre numa versão).
Mapa proposto (confirmar no --dry):
| hoje | vira | família |
|---|---|---|
| 2026-10-07-apresentacao-kz (v03 + variantes) | V0001-apresentacao-kz | apresentacao-kz |
| 2026-10-08-apresentacao-kz-plano | V0002-apresentacao-janela | apresentacao-kz |
| 2026-10-08-apresentacao-kz-pecas | V0003-apresentacao-pecas-da-rotina | apresentacao-kz |
| 2026-10-07-teste-kit · 2026-10-08-teste-plano-de-cenas · 2026-10-07-ab-sessao | _testes/… | — |
Pergunta aberta: carrossel/post/mockup também ganham ID (`C0001`, `M0001`) ou só vídeo por enquanto? Recomendação: um prefixo por tipo, mesma regra, na mesma migração.

## D — Depois
- App: anotação guarda a versão (`video` já guarda o MP4; somar `versao`), botão "Restaurar esta versão" e comparação lado a lado vNN × vMM no player.

## Log
- 2026-10-09 · diagnóstico do c1 (log `logs/atividade/20261009032445-ajustes-suyz.json`) · A feita · B: fonte recuperada (idêntica), ajuste aplicado, quadros conferidos em 4:5 e 9:16, v03 exportada.
