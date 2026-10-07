# 002 — Base de conhecimento de motion (contínua)

**Status:** contínua · **Depende de:** —

## Objetivo
Transformar a documentação, ideias e técnicas de editores profissionais que o usuário vai mandar em **conhecimento operacional curto** dentro das skills de vídeo, com regras objetivas que o Claude consegue executar em código (HTML/CSS/JS), e não teoria.

## Como funciona
1. O usuário manda o material (texto no chat, links, PDFs, vídeos de referência). Os arquivos vão para `material/` nesta pasta; os pesados ficam fora do git.
2. O Claude registra cada material em `INDICE.md` (data · fonte · tema · status: novo/destilado).
3. Destilação: verificar se é verdade, melhorar e transformar cada aprendizado em **regra executável** ("entrada de título: 400–600 ms, ease-out, deslocamento de 40 px + fade"), em `knowledge/video/<tema>.md`, a base compartilhada por todas as skills de vídeo. Não duplicar o que já existe. Notas de verificação vão no `INDICE.md`.
4. Conflito entre fontes: escolher a regra mais simples e profissional e anotar o porquê.

## Temas esperados (organizar as referências por eles)
Ritmo e timing · easing e física do movimento · tipografia cinética · hierarquia e composição · transições · cor e contraste · retenção (hook nos 3 primeiros segundos, quebra de padrão) · sound design e sincronia · formatos e áreas seguras por plataforma · estrutura de vídeo persuasivo (anúncio, lançamento, demo de SaaS).

## Critérios de pronto
Contínua. Cada lote de material termina com o índice atualizado e as referências da skill revisadas.

## Arquivos
- `material/ref-roteiros-video-antigo.md`: plano antigo de skills de roteiro de vídeo (hooks, retenção, tipos de vídeo). Destilar o que servir.

## Log
- 2026-10-06 — criada.
- 2026-10-07 — 1º lote: Etapa 1, cortes e montagem → `knowledge/video/cortes-e-montagem.md`. Criada a pasta `knowledge/video/`.
