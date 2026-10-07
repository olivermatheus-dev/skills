# 009 — MCP de edição de vídeo

**Status:** rascunho · **Depende de:** 003 (kit de render)

## Objetivo
Um servidor MCP local para o Claude (e, depois, a interface) editar vídeos com **comandos determinísticos e baratos em tokens**: trocar a voz, a trilha, a duração ou o texto, gerar uma prévia e renderizar. Sem reescrever HTML a cada ajuste.

## Base já pronta
`tools/video/timeline.mjs`, com os comandos `show`, `check`, `vo`, `dur`, `text` e `music` (testado em 2026-10-07). O `composition.html` lê tempos e textos da `timeline.json`.

## Ferramentas do MCP (proposta)
- `timeline_show`, `timeline_check`;
- `set_voice(fala, arquivo)`, `set_duration(cena, s)`, `set_text(cena, texto)`;
- `music_candidates(mood, energy, bpm, n=3)`, `set_music(id)`;
- `preview(formato, qualidade=baixa)` → MP4 rápido;
- `render(formatos)`.

## Critérios de pronto
- [ ] O MCP roda localmente e está registrado no `.mcp.json` do repo
- [ ] Trocar a trilha e gerar a prévia custa menos de ~1 mil tokens por iteração

## Log
- 2026-10-07 — criada a partir do pedido do usuário (trocar áudios e ajustar duração e legendas gastando quase zero token).
