# Fichas de análise (tarefa 040, fases A e B)

Uma ficha por conteúdo/anúncio de concorrente: `companies/<empresa>/competitors/<id>/fichas/<plataforma>__<itemId>.json`
(schema em `schema/ficha.ts`; vocabulário em `library/analise/vocabulario.json`; temas, ângulos e públicos em `companies/<empresa>/tags.yml`, campo `grupo`).
Desenho: `roadmap/tasks/040-analise-de-conteudos-e-anuncios/DESENHO.md`. Esta pasta não chama LLM.

```
npm run fichas -- preparar <empresa> <concorrente> <plataforma:id>… [--reanalisar]
npm run fichas -- pacote   <empresa> <concorrente> <plataforma:id>
npm run fichas -- salvar   <empresa> <concorrente> <arquivo.json> [--reanalisar]
npm run fichas -- validar                     # o mesmo roda dentro do npm run validate
```
Chave = `<plataforma>:<idDoItem>` (`youtube:cqGT7R6JImo`, `tiktok:7690…`, `instagram:DeKnYQFRBpY`), a mesma do `marks.json`.

## preparar (script, sem LLM, idempotente)
1. **YouTube:** legenda automática (`yt-dlp --write-auto-subs`, `pt-orig`/`pt`) vira a transcrição.
2. **Vídeo** em até 720p (uma vez só) → `ffmpeg` extrai o áudio (mono, 16 kHz) → **faster-whisper `small`, pt** (só se não veio legenda). Sem fala detectada → `faltou: audio-sem-fala`.
3. **Quadros** a 540 px: 0 · 0,5 · 1,5 · 3 · 5 s + meio + último + até 3 cortes de cena dos 5 s iniciais (detecção `scene>0.3`, que também dá `cenas[]` = ritmo).
4. **O vídeo é apagado** (decisão do Oliver). Ficam áudio, quadros e legenda bruta em `data/intel/<empresa>/<concorrente>/<plataforma>__<id>/` (**fora do git**, regra `data/intel/` no `.gitignore`); a transcrição, o hash e os tempos vão **dentro da ficha**.
5. **Idempotência:** `insumos.hashEntrada` = sha1(id + legenda + duração + url). Mesmo hash e quadros presentes → pula sem baixar nada. Preparo parcial (`midia-indisponivel`) tenta de novo. `--reanalisar` refaz tudo; `salvar` recusa sobrescrever análise existente sem a mesma flag (a antiga vai para `anteriores`, o `override` do Oliver nunca é tocado).
6. As medidas (views, × perfil, × mercado, por seguidor…) usam a mesma conta do app (`buildRows` + `withMarketOutlier`).

## salvar (como o Opus grava, fase C)
Arquivo `{ "key": "instagram:ID", "analise": { versaoPrompt, modelo, termosNovos, campos: {…} } }` (ou os campos da análise soltos ao lado do `key`).
Valida o schema e **todo valor categórico contra o vocabulário** (mais `tags.yml` e `library/formatos/`); erro sai com o campo, o valor, "você quis dizer…" e a lista aceita. Valor que não cabe entra em `termosNovos` (vale como "proposto"). Marca o item como `analisada` no `marks.json`.

## Dependências (uma vez)
- `ffmpeg` e `ffprobe` no PATH; `yt-dlp` (`python -m pip install -U yt-dlp`).
- `python -m pip install faster-whisper` (já instalado; o modelo `small` baixa ~460 MB na 1ª vez e fica em cache).
- **YouTube:** o cliente web do yt-dlp hoje falha com "The page needs to be reloaded" (SABR). O preparo usa `player_client=android_vr,tv,web`, que funciona na 2025.10.14.
- **TikTok:** o extrator do yt-dlp 2025.10.14 (último que roda no Python 3.9) não acha os dados da página. Plano B em `tiktok.ts`: lê a página pública e baixa o MP4 direto (sem login). Um Python ≥ 3.10 com yt-dlp atual provavelmente resolve de vez.
- **Instagram:** o vídeo exige login. Defina `YTDLP_COOKIES_FROM_BROWSER=chrome` (app → Configurações da empresa, ou `.env`) para o preparo baixar reels; sem isso a ficha sai parcial (legenda + miniatura, `faltou: midia-indisponivel`). Carrossel e post usam só a miniatura.

## Tempos medidos (CPU, `small`, vídeos de 6–24 s)
Short do YouTube com legenda: ~12 s. TikTok com fala: ~8–11 s (baixar 2–6 s, Whisper 4–5 s, quadros 1–1,5 s). 2ª execução: 0 s por item.
