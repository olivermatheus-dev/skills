# 033 — Upgrade do HyperFrames 0.8.94 → 0.8.141 + motion blur nativo

Status: **medido (2026-10-08)** · branch `claude/hf-upgrade-0-8-141-38b00e` pronto, **sem merge** (aguarda aval do Oliver) · Depende de: 003 (kit de vídeo)

## Veredito
1. **Atualizar para 0.8.141: sim.** Mesmo visual (SSIM ≥ 0,997 em todos os quadros, diferença só em borda de texto, invisível a 100%), mesmo tempo de render, `check`/`lint`/`qc` limpos, nenhuma mudança de comando no kit. Ganha as correções da 0.8.113–0.8.141 sem custo.
2. **Motion blur nativo: deixar opcional, não trocar.** O nativo (adaptativo, até 16 amostras) faz um rastro liso onde o nosso 2 passes mostra **3 cópias** do texto num deslize rápido, mas leva **~7–8× mais tempo** (4:5 de 13 s: 365 s × 53 s; 9:16: 501 s × 59 s) e não funciona com transição de shader. O padrão continua o 2 passes; `produce.mjs --blur=nativo` fica para a versão final de vídeo com movimento rápido.

## O que mudou no branch (pronto para merge)
- `package.json`: `hyperframes` **0.8.141** (exato). `npm install` com Node 22.
- `tools/video-kit/scripts/native-blur.mjs` (novo): render com o blur nativo. O CLI **não expõe** a opção `motionBlur` (nem na 0.8.141: `render --help` não tem flag); ela existe só na API do producer, que vem embutido no pacote `hyperframes` (`dist/src-*.js`, carregado como o próprio CLI faz). Força captura por screenshot (exigência do nativo). Se o pacote mudar de estrutura, o script avisa e o padrão continua.
- `produce.mjs`: `--blur=nativo` (amostras adaptativas) e `--blur=nativo:N` (N fixas). Um passe a 30 quadros, sem `__TIME_OFFSET__`; o resto (BT.709, áudio, nome) igual.
- Docs: README do kit (versão + parágrafo do nativo), GUIA-TECNICO (2 armadilhas remedidas + nativo), DECISAO da 003, skill `video` e ESTADO (versão).
- **Não mudou:** `runtime/motion.js` (o `M.offset` continua servindo ao 2 passes).

## Como foi medido
Vídeo: `companies/kz/contents/2026-10-07-teste-kit/` (13,4 s, 4:5 e 9:16, voz + trilha + SFX). `audio/` copiado do checkout principal (fora do git). Node 22.23.1, Windows 11, GPU AMD (Chrome em hardware).

```
fnm exec --using=22 npm.cmd install
node tools/video-kit/scripts/produce.mjs <pasta> --build-only
node tools/video-kit/scripts/check.mjs <pasta>
node tools/video-kit/scripts/produce.mjs <pasta> --only=4x5 --v=94     (e 9x16; depois --v=141 na 0.8.141)
node tools/video/qc.mjs <pasta> --sheet
# em render/<formato>/: hyperframes validate|check . e hyperframes lint .
# comparação: ffmpeg ssim por quadro (script de rascunho, ver "Comparação")
node tools/video-kit/scripts/produce.mjs <pasta> --only=9x16 --blur=nativo --v=201
```

## Tempos (render completo do produce: 2 passes a 60 + intercalação + encode)
| | 4:5 | 9:16 |
|---|---|---|
| 0.8.94, blur do kit | 54 s | 59 s |
| 0.8.141, blur do kit | 53 s | 59 s |
| 0.8.141, nativo 4 amostras (só o render) | 78 s | — |
| 0.8.141, nativo adaptativo (até 16) (só o render) | 365 s | 501 s (505 s com mix e encode; `qc` limpo: bt709, −14 LUFS) |

O nativo usa captura por screenshot + PNG (o padrão usa a captura rápida em streaming com 3 workers): é daí que vem a diferença.

## Comparação 0.8.94 × 0.8.141 (SSIM por quadro)
| par | quadros | SSIM médio | mínimo | < 0,99 |
|---|---|---|---|---|
| 4:5 passe A (60 q/s, sem blur) | 804 | 0,99933 | 0,99737 | 0 |
| 4:5 passe B | 804 | 0,99933 | 0,99727 | 0 |
| 9:16 passe A | 804 | 0,99953 | 0,99807 | 0 |
| 9:16 passe B | 804 | 0,99953 | 0,99811 | 0 |
| 4:5 MP4 final (30 q/s, com blur) | 402 | 0,99928 | 0,99755 | 0 |
| 9:16 MP4 final | 402 | 0,99948 | 0,99821 | 0 |
| **ruído:** 0.8.94 × 0.8.94 (mesmo projeto, 2 renders) | 804 | 0,99979 | 0,99896 | 0 |

- O pior trecho (2,2–2,5 s, cartão "Paciente") difere só na **borda dos glifos e do cartão** (diferença ampliada 20×: `provas/diff-n142-ampliada-20x.png`; lado a lado no zoom: `provas/texto-zoom-v94-cima-v141-baixo.png`). A olho, idêntico. O próprio 0.8.94 já não é bit a bit idêntico entre dois renders (linha "ruído").
- **Folhas de contato** (`qc.mjs --sheet`, 1 quadro a cada 0,5 s): `provas/folha-4x5-v94.png` e `provas/folha-4x5-v141.png` — iguais quadro a quadro, inclusive as transições (fade do cartão, entrada do "Feito por terapeuta", CTA com cursor). As de 9:16 ficaram em `companies/kz/contents/2026-10-07-teste-kit/render/qc/` (fora do git) no worktree.
- `hyperframes check` (novo nome do `validate`, que agora avisa "deprecated") e `lint`: 0 erros, 0 avisos, 24/24 contrastes nas duas versões. `check.mjs` do kit: 12 quadros por formato, sem erro.

## Armadilhas do GUIA-TECNICO remedidas (mini composição, 0.8.94 × 0.8.141, quadro 0/15/31 a 30 q/s)
| teste | 0.8.94 | 0.8.141 |
|---|---|---|
| `fromTo({opacity:.7},{opacity:0})` começando em 1 s | "de" visível desde o quadro 0 | **igual** (armadilha continua: use `immediateRender:false`) |
| CSS `opacity:0` + `tl.set(opacity:1, 0)` | aparece no quadro 0 | igual |
| `tl.set(opacity:1, 0.5)` | entra no quadro 15 (certo) | igual |
| `from({opacity:0})` em 1 s | 0 até 1 s | igual |

Nenhuma armadilha sumiu nem mudou. O "set em 0 não aparece no quadro 0" não se reproduziu num caso simples em nenhuma das versões; a regra do GUIA fica (o lint a sustenta e custa nada). As correções da 0.8.113 (set no quadro certo), 0.8.122 (scripts esperam webfont) e 0.8.139 (fromTo segura o "de") não mudaram nada **neste vídeo**: o kit já contornava esses casos.

## Motion blur: nativo × kit
Quadro 155 do 4:5 (5,17 s, balão "Oi! Sua sessão…" deslizando), zoom no texto: `provas/blur-n155-zoom-kit-nativo4-nativo16.png` (cima → baixo: kit 2 passes, nativo 4, nativo adaptativo). Quadro inteiro (sem blur · kit · nativo 4 · nativo adaptativo): `provas/blur-n155-4-colunas.png`.
- **Kit (3 amostras em 1/60 s):** em deslize rápido o texto vira **3 cópias** sobrepostas (efeito estroboscópico). Em movimento lento ou fade, igual aos outros.
- **Nativo 4:** 4 cópias, um pouco mais liso.
- **Nativo adaptativo (até 16):** rastro contínuo, o certo. Ele também integra rotação, escala e opacidade (o kit também, por recapturar a cena; a diferença é o número de amostras).
- Fora dos quadros de movimento rápido, kit × nativo: SSIM médio 0,99894, mínimo 0,99289 (todo o resto praticamente igual).
- **Complexidade:** o kit precisa de 2 projetos por formato, `M.offset`/`__TIME_OFFSET__` na composição e um filtro de intercalação no ffmpeg; o nativo é 1 passe e 1 opção, mas depende de API **não pública no CLI** (bundle com hash) e recusa a rota em camadas (transição de shader / HDR).
- **Alternativa barata que não testei:** subir o kit para 4 passes (240 amostras/s) daria 5 amostras por quadro a ~2× o tempo atual, sem depender do producer.

## Observações
- O `-q high` continua significando "delivery" na 0.8.141 (mesma ajuda da 0.8.94).
- O render ainda baixa **Roboto e Inter do Google Fonts** no compilador (`Fetched 11 font face(s)… cached`), nas duas versões, apesar do GUIA dizer "fontes locais". Vem de alguma pilha de fallback no CSS. Não quebrou nada (fica em cache), mas é dependência de internet escondida: vale uma tarefa.
- O render avisa "6 capture workers may exceed this process's V8 heap (~4)". Não falhou aqui; se falhar, `NODE_OPTIONS=--max-old-space-size=8192`.

## Falta
- **Oliver:** aprovar o merge do branch (upgrade + `--blur=nativo` opcional). Assistir `exports/2026-10-07-teste-kit-9x16-v141.mp4` e `…-v201.mp4` (nativo) no worktree se quiser ver a diferença do rastro em movimento.
- Depois do merge, em cada máquina: `npm install` (Node 22).

## Log
- 2026-10-08 — linha de base 0.8.94, upgrade para 0.8.141, comparação quadro a quadro, teste das armadilhas, blur nativo (4:5 adaptativo e 4 amostras; 9:16 adaptativo pelo `produce.mjs`), opção `--blur=nativo` no kit, docs. Commit no branch, sem push.
