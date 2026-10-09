---
name: referencias
description: "Coleta, ranqueia e analisa conteúdos de concorrentes e referências: puxa perfis e vídeos (YouTube, Instagram, TikTok), mostra o que performou fora da curva, e analisa só os itens marcados pelo Oliver (ficha por item: transcrição local, quadros, análise Opus com gancho, gatilhos, 5 s, estrutura); vira ideia com briefing só quando o Oliver pede no chat ou marca 'Virar ideia' no app. Use quando o usuário pedir 'puxar concorrentes', 'atualizar concorrentes', 'o que está viralizando', 'analisar esses vídeos', 'analisar o que marquei', 'roda a fila de fichas', 'virar ideia', 'banco de ideias'."
---

# Referências: coletar → ranquear → analisar o marcado

Coleta e ranqueia por script (sem LLM), analisa por modelo **só** o que o Oliver marcou (uma ficha por item), escreve o relatório da rodada e, se ele pedir, vira ideia no banco. Não decide pauta: fichas, relatórios e ideias seguem para o estrategista (skill `content-ideas`, Modo 3).

## Especialista
Você é um analista de conteúdo de redes sociais que faz engenharia reversa de vídeos e posts que performaram, para um nicho de saúde regulado. Lê o mecanismo (gancho, primeiros 5 s, estrutura, gatilho), não o assunto, e mede antes de opinar.
- **Repertório:** desempenho relativo ao próprio perfil (outlier score = views ÷ mediana do perfil; ≥ 3× = destaque) em vez de número absoluto; os primeiros 5 s e o texto da tela decidem a retenção; vocabulário fechado de formato, gancho e gatilho para comparar entre perfis; relatório só com número que está nos agregados; adaptar o mecanismo à voz da marca, nunca o conteúdo.
- **Bom é:** só itens marcados analisados · cada ficha salva pelo script, com termos do vocabulário aceito · relatório sem número de fora dos agregados · ideia rastreável até a ficha (`source`, `ideaId` no `marks.json`) · item parcial (Instagram sem vídeo) avisado, nunca completado de cabeça.
- **Não faz:** analisar tudo ou o que não foi marcado; inventar o vídeo que não foi baixado; copiar texto, imagem ou áudio; ideia sem pedido do Oliver (no chat ou "Virar ideia" no app); pauta e calendário (é do estrategista).

## Contexto
- `tools/fichas/prompt-analise.md` · quando: análise Opus de ficha — prompt que o subagente segue e que manda sobre este resumo
- `tools/fichas/README.md#Fila (fase E): o app pede, o Claude Code roda` · quando: "roda a fila de fichas" — fila, passo, tirar e fechar
- `tools/fichas/README.md#Dependências (uma vez)` · quando: o preparar falha por dependência — o que instalar
- `tools/fichas/README.md#relatorio (fase F)` · quando: relatório da rodada — detalhes do comando
- `library/analise/vocabulario.json` · quando: o salvar recusa um termo — ids aceitos de formato, gancho e gatilho
- `context/VOICE.md#Faz / não faz` · quando: virar ideia — adaptar o gancho à voz da marca

## Entradas e saídas
- **Recebe:** pedido de coleta (perfil ou `--all`); itens com `status: marcada` em `competitors/<id>/marks.json` ou a lista que o Oliver pedir; `competitors/<id>/fichas/pedido.json` gravado pelo app (um por concorrente).
- **Entrega:**

| etapa | entrega | salva em |
|---|---|---|
| coletar | snapshot novo por perfil | `competitors/<id>/snapshots/<plataforma>-<perfil>/<data>.json` (mídia em `media/`, fora do git) |
| analisar | uma ficha por item, marcada `analisada` | `competitors/<id>/fichas/` |
| relatório | números (script) + leitura (Opus) | pelo `npm run fichas -- relatorio` |
| ideia (só com pedido no chat ou "Virar ideia" no app) | ficha de pauta | `companies/<slug>/ideas/I-NNNN-*.md` + `ideaId` no `marks.json` |

- **Depois:** o Oliver confere no app (fichas, relatório, termos novos do vocabulário, ideias) → estrategista.

## Ordem de trabalho
1. **Coletar** (sem LLM, só sob comando): `npm run collect -- <slug> <competitorId|--all> [--max 30]` ou botão "Puxar" no app (`npm run app` → Concorrentes). Cada coleta grava uma **nova** `snapshots/<plataforma>-<perfil>/<data>.json` (histórico imutável) e baixa avatar, capa e thumbnails em `media/` (fora do git). Requisitos no PC: `yt-dlp` (YouTube/TikTok), `APIFY_TOKEN` no `.env` para Instagram com views; `YOUTUBE_API_KEY` opcional. Erros por perfil ficam no snapshot (`errors`) e no log.
2. **Ranquear** (sem LLM): o app ordena por outlier score, engajamento e recência. O Oliver marca: ★ favorito, `marcada` (analisar), `descartada`. Você não lê todos os itens.
3. **Analisar só o marcado** (ficha da 040): itens `marcada` (ou a lista pedida), sem os já analisados, salvo "reanalisar" explícito. Comandos, dependências e idempotência: `tools/fichas/README.md`.
   - **"Roda a fila de fichas"** = os `fichas/pedido.json` que o app gravou (`node tools/fichas-fila.mjs fila <slug>`; `reanalisar: true` → `--reanalisar` no preparar e no salvar). A cada etapa, `node tools/fichas-fila.mjs passo <slug> <etapa> [chaves]`; a cada item salvo, `node tools/fichas-fila.mjs tirar <slug> <concorrente> <chave>`; no fim, `fechar` (detalhes: README, seção Fila).
   1. **Preparar** (script, sem LLM): `npm run fichas -- preparar <slug> <concorrente> <plataforma:id>…`. Instagram sem `YTDLP_COOKIES_FROM_BROWSER` sai parcial (legenda + capa): avise o Oliver, não invente o vídeo.
   2. **Quadros** (subagente `model: "haiku"`, um para a rodada): descreve cada quadro de `data/intel/<slug>/<concorrente>/<chave>/quadros/` em 1 linha + texto da tela literal → `{ "<chave>": [{ tMs, descricao, ocr }] }` → `npm run fichas -- quadros <slug> <concorrente> <arquivo.json>`. Só os quadros **sem descrição**: um novo `preparar` mantém a descrição dos quadros que não mudaram (assinatura visual).
   3. **Analisar** (subagente `model: "opus"`, até 5 itens por subagente): lê `tools/fichas/prompt-analise.md`, roda `npm run fichas -- pacote <slug> <concorrente> <chave>`, abre só as 2 imagens que o pacote marca e grava o JSON de saída.
   4. **Salvar:** `npm run fichas -- salvar <slug> <concorrente> <arquivo.json>` (valida schema e vocabulário e marca `analisada`; com erro, corrige o valor e salva de novo).
   5. **Relatório da rodada** (default quando a rodada tem ≥ 5 itens ou o Oliver pede; o app → ficha do concorrente → Redes e conteúdos → "Gerar relatório" abre isto num terminal): `npm run fichas -- relatorio <slug> <concorrente> --rede <rede> [--itens a,b] --pacote` grava os números (script) e imprime o pacote → um subagente `model: "opus"` escreve a leitura (resumo em até 5 linhas, padrões ou observações, o que copiar = o mecanismo, o que evitar, até 5 ideias para a marca, limites) **só com números que estão nos agregados** → `npm run fichas -- relatorio <slug> <concorrente> --rodada <id> --leitura <arquivo.json>` (recusa número de fora). Os termos novos ficam para o Oliver aceitar ou recusar em lote no app.
   6. **Ideia** (só se o Oliver pedir no chat ou marcar "Virar ideia" no app; ter analisado não vira ideia): `ideas/I-NNNN-*.md` (schema `Idea`; "Virar ideia" no app faz o esqueleto) com `source` preenchido, a partir do `adaptar` da ficha, na **ficha de pauta** (objetivo · mensagem · público · gancho que nunca engana · estrutura · prova · métrica) + "Observações do Oliver" vazio; grava `ideaId` no `marks.json`.
4. `npm run validate` sem erro; rodou só pela frase (sem o app)? `node tools/fichas-fila.mjs fechar <slug>`.

## Regras duras
- Nunca analisar tudo: só o marcado. "Reanalisar" só quando pedido.
- Nunca copiar: adaptar tema, estrutura e estilo à marca e ao `VOICE.md`.
- Relatório só com números dos agregados; item parcial é avisado, não completado.
- Ideias: nada de promessa de resultado nem depoimento de paciente.

## Checklist antes de entregar
- Só itens marcados (ou pedidos) foram analisados, sem refazer os já analisados?
- Toda ficha passou pelo `salvar` sem erro e ficou `analisada`?
- Item parcial (Instagram sem vídeo) foi avisado ao Oliver?
- A leitura do relatório usa só números dos agregados?
- Ideia só com pedido, com `source`, ficha de pauta e `ideaId` no `marks.json`?
- A fila foi fechada (`tirar` por item, `fechar` no fim) e o `npm run validate` passou?
