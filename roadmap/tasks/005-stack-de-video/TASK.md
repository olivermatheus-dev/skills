# 005 — Pesquisa e decisão da stack de vídeo

**Status:** rascunho · **Fase:** 3 · **Depende de:** 001

## Objetivo
Decidir (com prós/contras e um protótipo mínimo) quais ferramentas o Claude Code vai operar localmente para: (a) editar vídeo com base real e (b) gerar vídeo 100% motion design — ambos usando os tokens da marca.

## Contexto
Usuário: "skills de edição e produção de vídeos (vídeos que podem conter uma base real ou vídeos inteiramente gerados com motion design)". Os tokens de 001 precisam ser consumíveis pela stack escolhida.

## Candidatos a avaliar
- Base real: ffmpeg (cortes, legendas queimadas, reframe 9:16), Whisper (transcrição → legendas .srt), detecção de silêncio/jump cuts.
- Motion: Remotion (React → MP4, lê tokens em JS), alternativas HTML→vídeo, Lottie.
- Híbrido: filmagem + overlays de motion (lower thirds, legendas animadas, CTA) com a identidade da marca.

## Perguntas em aberto
- [ ] Máquina do usuário (Windows/Mac, GPU?) e se aceita instalar Node/Python/ffmpeg
- [ ] Exemplos de vídeos de referência (estilo desejado)
- [ ] Formatos-alvo: reels 9:16, feed 4:5, YouTube 16:9?

## Critérios de pronto
- [ ] Documento de decisão curto (`DECISAO.md` nesta pasta)
- [ ] Protótipo: 1 vídeo curto de teste renderizado com tokens da kz

## Arquivos
- `ref-roteiros-video-antigo.md`: plano antigo de skills de roteiro de vídeo (TikTok/Reels/YouTube). Só referência — roteiro de reels já está na skill `ig-post`.

## Log
- 2026-10-06 — criada.
