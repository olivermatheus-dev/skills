---
name: referencias
description: "Coleta, ranqueia e analisa conteúdos de concorrentes e referências: puxa perfis e vídeos (YouTube, Instagram, TikTok), mostra o que performou fora da curva, e analisa só os itens marcados pelo Oliver (ficha por item: transcrição local, quadros, análise Opus com gancho, gatilhos, 5 s, estrutura), transformando-os em ideias com briefing. Use quando o usuário pedir 'puxar concorrentes', 'atualizar concorrentes', 'o que está viralizando', 'analisar esses vídeos', 'analisar o que marquei', 'virar ideia', 'banco de ideias'."
---

# Referências: coletar → ranquear → analisar o marcado

## 1. Coletar (sem LLM)
- `npm run collect -- <slug> <competitorId|--all> [--max 30]` ou botão "Puxar" no app (`npm run app` → Concorrentes).
- Cada coleta grava uma **nova** `snapshots/<plataforma>-<perfil>/<data>.json` (histórico imutável) e baixa avatar, capa e thumbnails em `media/` (fora do git).
- Requisitos no PC: `yt-dlp` (YouTube/TikTok), `APIFY_TOKEN` no `.env` para Instagram com views; `YOUTUBE_API_KEY` opcional. Erros por perfil ficam no snapshot (`errors`) e no log.

## 2. Ranquear (sem LLM)
O app ordena por **outlier score = views ÷ mediana de views do perfil** (≥ 3× = destaque), engajamento e recência. O Oliver marca: ★ favorito, `marcada` (analisar), `descartada`.

## 3. Analisar só o marcado (ficha da 040)
Uma **ficha por item** em `competitors/<id>/fichas/`. Comandos, dependências e idempotência: `tools/fichas/README.md`. Prompt do Opus: `tools/fichas/prompt-analise.md` (manda sobre este resumo).
Para os itens com `status: marcada` em `competitors/<id>/marks.json` (ou a lista que o Oliver pedir), sem os já analisados, salvo "reanalisar" explícito:
1. **Preparar** (script, sem LLM): `npm run fichas -- preparar <slug> <concorrente> <plataforma:id>…`. Instagram sem `YTDLP_COOKIES_FROM_BROWSER` sai parcial (legenda + capa): avise o Oliver, não invente o vídeo.
2. **Quadros** (subagente `model: "haiku"`): descreve cada quadro de `data/intel/<slug>/<concorrente>/<chave>/quadros/` em 1 linha + texto da tela literal → `{ "<chave>": [{ tMs, descricao, ocr }] }` → `npm run fichas -- quadros <slug> <concorrente> <arquivo.json>`.
3. **Analisar** (subagente `model: "opus"`, até 5 itens por subagente): lê o prompt, roda `npm run fichas -- pacote <slug> <concorrente> <chave>`, abre só as 2 imagens que o pacote marca e grava o JSON de saída.
4. **Salvar:** `npm run fichas -- salvar <slug> <concorrente> <arquivo.json>` (valida schema e vocabulário e marca `analisada`; com erro, corrige o valor e salva de novo). Depois, `npm run validate`.
5. **Ideia** (só se o Oliver pedir): `ideas/I-NNNN-*.md` (schema `Idea`; "Virar ideia" no app faz o esqueleto) com `source` preenchido, a partir do `adaptar` da ficha, na **ficha de pauta** (objetivo · mensagem · público · gancho que nunca engana · estrutura · prova · métrica) + "Observações do Oliver" vazio; grava `ideaId` no `marks.json`.

## Regras
- Nunca analisar tudo: só o marcado. Nunca copiar: adaptar tema, estrutura e estilo à marca e ao `VOICE.md`.
- Nicho de saúde: nada de promessa de resultado nem depoimento de paciente nas ideias.
- `npm run validate` sem erro ao terminar.
