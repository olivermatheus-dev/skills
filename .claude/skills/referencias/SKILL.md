---
name: referencias
description: "Coleta, ranqueia e analisa conteúdos de concorrentes e referências: puxa perfis e vídeos (YouTube, Instagram, TikTok), mostra o que performou fora da curva, e analisa só os itens marcados pelo Oliver (transcrição barata + tema, gancho, estrutura, estilo), transformando-os em ideias com briefing. Use quando o usuário pedir 'puxar concorrentes', 'atualizar concorrentes', 'o que está viralizando', 'analisar esses vídeos', 'analisar o que marquei', 'virar ideia', 'banco de ideias'."
---

# Referências: coletar → ranquear → analisar o marcado

## 1. Coletar (sem LLM)
- `npm run collect -- <slug> <competitorId|--all> [--max 30]` ou botão "Puxar" no app (`npm run app` → Concorrentes).
- Cada coleta grava uma **nova** `snapshots/<plataforma>-<perfil>/<data>.json` (histórico imutável) e baixa avatar, capa e thumbnails em `media/` (fora do git).
- Requisitos no PC: `yt-dlp` (YouTube/TikTok), `APIFY_TOKEN` no `.env` para Instagram com views; `YOUTUBE_API_KEY` opcional. Erros por perfil ficam no snapshot (`errors`) e no log.

## 2. Ranquear (sem LLM)
O app ordena por **outlier score = views ÷ mediana de views do perfil** (≥ 3× = destaque), engajamento e recência. O Oliver marca: ★ favorito, `marcada` (analisar), `descartada`.

## 3. Analisar só o marcado (modelo barato)
Para cada item com `status: marcada` em `competitors/<id>/marks.json`:
1. **Texto da fala:** YouTube → legenda automática (`yt-dlp --write-auto-subs --skip-download --sub-langs pt.*,en.* <url>`); Instagram/TikTok → baixar só esse vídeo (`yt-dlp <url>`), `ffmpeg -i v.mp4 -vn -ac 1 -ar 16000 a.wav`, transcrever com Whisper local (`faster-whisper` modelo `small`). Arquivos em `data/intel/` (fora do git).
2. **Análise** (JSON curto): tema · gancho (texto + tipo) · promessa · estrutura (blocos com tempo) · CTA · estilo editorial e tom (`knowledge/video/direcao.md`) · formato `fmt-*` equivalente · por que funcionou (1 linha) · o que adaptar para a marca.
3. **Ideia:** criar `ideas/I-NNNN-*.md` (schema `Idea`; botão "Virar ideia" no app faz o esqueleto) com `source` preenchido e o corpo na **ficha de pauta** (objetivo · mensagem · público · gancho que nunca engana · estrutura · prova · métrica) + "Observações do Oliver" vazio.
4. Marcar o item como `analisada` e com `ideaId`.

## Regras
- Nunca analisar tudo: só o marcado. Nunca copiar: adaptar tema, estrutura e estilo à marca e ao `VOICE.md`.
- Nicho de saúde: nada de promessa de resultado nem depoimento de paciente nas ideias.
- `npm run validate` sem erro ao terminar.
