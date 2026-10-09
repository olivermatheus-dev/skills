# Produção — apresentação kz "As peças da rotina" (aprovado em 2026-10-08)

Pacote comum dos agentes que escrevem os blocos. **Leia isto inteiro antes de começar.**

## O que já existe
- Plano aprovado: `cenas.json` (fonte da verdade: cada cena tem `acrescenta`, `composicao`, `poses`, `gestos` com `o_que`, `entra`/`sai`, `novo.spec` ou `ajuste_bloco`) e `plano.md`.
- Visual aprovado: `style/png/slide-01..04.png` (4:5: s3, s4, s6, s7) e `slide-05..08.png` (9:16), gerados por `style/gerar.mjs` (o HTML/CSS ali é a referência de medida, cor e tipografia: copie de lá).
- Storyboard: `storyboard-4x5.png`, `storyboard-9x16.png`.
- Voz final (Carla, Eleven v4) já encaixada na `timeline.json` (44,6 s). **Não rode `tts.mjs` nem `fit-vo.mjs` nesta pasta.**

## Contrato do bloco
`.claude/skills/video/references/blocos.md` (arquivos, ctx, regras) e `tools/video-kit/runtime/blocos.js` (ctx real). Antes de animar: `tools/video-kit/GUIA-TECNICO.md` (armadilhas). Exemplos de bloco da marca: `companies/kz/video-templates/blocos/*/*/` (leia 1 ou 2 parecidos com o seu).
- Nada de tempo, texto ou cor fixos: tempo por `cue()`/`cena`, texto por slot (`texto()`), cor por token do `brand.css` (`companies/kz/brand/brand.css`) e classes da marca (`companies/kz/video-templates/base.css`: `.t-coral` etc.).
- Ícones: `{{i:<lucide>}}` no HTML. Molas do kit: `M.SNAP/FAST/SOFT/GENTLE` (BRAND.md: prefira GENTLE/FAST).
- Classes, nunca id. CSS com seletores simples (o compor prefixa). `bloco.js` sem fecho de tag script.
- Formatos 4:5 (1080×1350) e 9:16 (1080×1920): o palco tem `data-format`; área segura 9:16 = x 65–930, y 270–1440.

## Padrões do Oliver (regra dura, sem ele pedir)
Skill `video` > "Padrões do Oliver". O essencial: frase inteira de uma vez (cascata ≤ 0,5 s), nunca palavra a palavra esperando a voz; nada começa vazio (algo entra no 1º quadro); a palavra da fala só dispara **gestos**; ≤ 1,5 s sem algo novo ou vivo; card com linha atrás é opaco (anime o conteúdo, não a opacidade do card); eco de clique com `immediateRender: false`; "dados ilustrativos" pequeno no rodapé ou cabeçalho, em `--muted`; contraste ≥ 4,5:1 (`node tools/contrast.mjs <texto> <fundo>`).

## Como testar o seu bloco (sem mexer na timeline principal)
1. Crie `_teste-<id>/` dentro desta pasta. Copie para lá a `timeline.json` desta pasta **mantendo só a(s) sua(s) cena(s)**, os `vo` delas, os `events` delas e a `camadas`. Em `scenes[].use`, ponha o seu bloco. Copie os wav das falas usadas (`audio/vo/fN.wav`) para `_teste-<id>/audio/vo/`. Rode `node tools/video-kit/scripts/relayout.mjs _teste-<id>` (recalcula os tempos a partir de 0).
2. `node tools/video-kit/scripts/produce.mjs <pasta-de-teste> --build-only` e depois `fnm exec --using=22 node tools/video-kit/scripts/check.mjs <pasta-de-teste>` (o HyperFrames pede Node 22). Olhe os PNG em `render/<fmt>/check/` com Read, nos 2 formatos, e compare com o style frame.
3. Itere até bater com o style frame e com as poses do `cenas.json`. Apague a pasta `_teste-<id>/` no fim.

## Entrega
Responda com: arquivos criados/alterados, slots, cues e params finais (e o que mudou em relação ao spec, se mudou), os quadros que você olhou e o que ainda não ficou bom. Não faça commit. Não edite `cenas.json`, `timeline.json`, `plano.md` nem blocos que não são seus.
