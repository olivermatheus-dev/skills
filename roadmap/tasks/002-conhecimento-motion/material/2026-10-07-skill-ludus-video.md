# [BRUTO] Skill `ludus-video` (prévia, repositório do produto Ludus)

> Enviado pelo usuário em 2026-10-07, copiado sem edição. É uma skill interna de outro produto do usuário (Ludus), usada como referência de arquitetura. O que foi aproveitado está em `knowledge/video/esteira-de-producao.md` e nas tarefas 001, 003 e 004.

---
name: ludus-video
description: >
  Produz vídeos de marketing do Ludus em motion graphic — lançamento, recorte de uma função,
  anúncio — com o kit de videos/_kit/ (HyperFrames + GSAP, voz Thalita, trilha e efeitos
  sintetizados, motion blur), nos formatos 4:5 e story. Conduz as cinco etapas: plano aprovado
  pelo dono antes de qualquer código, voz e tempos, cenas, conferência por quadros e silêncios,
  export. Use quando pedirem um vídeo, reel, story, trailer, animação de lançamento ou motion
  graphic do Ludus; quando pedirem para refazer, polir ou revisar um vídeo de videos/; ou para
  planejar o próximo. Não use para B-roll sobre vídeo de alguém falando (é a motion-broll), nem
  para animação dentro do app (é a ludus-motion), nem para tela do produto (ludus-ui).
---

# Vídeos do Ludus

Você faz vídeos de marketing do Ludus em motion graphic: tudo em código, com o HyperFrames, e o
produto aparece **em uso**, com cursor. O público é o professor independente (a Gaby). Tudo o que
precisa está em `videos/`:

| arquivo | o que é |
|---|---|
| `videos/README.md` | a esteira, passo a passo, e os comandos |
| `videos/_kit/GUIA-DE-MOVIMENTO.md` | 🔴 as regras do dono (cor, texto, fundo, ritmo), as seis ideias de movimento, as armadilhas medidas. **Leia inteiro antes de planejar** |
| `videos/_kit/prompts/video-ludus.md` | o prompt que o dono usa para pedir um vídeo — o contrato |
| `videos/_kit/brand/` | `brand.css`, `motion.js` (molas, `swap`, `stretchTo`, `cursor`, `offset`), logos, ícones |
| `videos/_kit/scripts/` | `tts` · `words` · `music` · `sfx` · `mix` · `produce` · `check` |
| `videos/NNN-<nome>/` | um vídeo por pasta: `plano.md`, `locucao.json`, `timeline.json`, `composition.html` |

O vídeo anterior é o ponto de partida, não o modelo: leia o `plano.md` (ou `roteiro.md`) dele e o
que o dono disse sobre ele antes de começar o próximo.

## As cinco etapas

### 1. Plano — e o aval do dono antes de qualquer código

> **Decisão do dono, 2026-09-30:** *"faria muito sentido que tivéssemos um planejamento antes das
> próximas gerações, para que tenhamos uma consistência maior."*

Escreva `videos/NNN-<nome>/plano.md` com estas seções, nesta ordem:

1. **O recorte** — o que o vídeo vende, em uma frase, e para quem.
2. **O que muda em relação ao anterior** — cada pedido do dono, e como o plano atende.
3. **As falas** — o texto exato de cada uma (vai para o `locucao.json`).
4. **A folha de batidas** — uma linha por cena: tempo aproximado · o que está na tela · o que
   quem assiste precisa entender · o que o som faz.
5. **Cor e fundo por cena** — conferidos contra a tabela *Cor, texto e fundo* do guia.
6. **As afirmações sobre o produto**, cada uma com a fonte (a linha da landing, ou o código).
   O que não tiver fonte fica em *a confirmar* e **não entra** no vídeo até ter.
7. **Perguntas ao dono** — só as que mudam o que se constrói, com a sua recomendação.

**Pare aqui e peça o aval.** Recomendação não é decisão: sem a frase dele, não se gera nada.

### 2. Voz e tempos

- `node _kit/scripts/tts.mjs <pasta>` grava as falas; `python _kit/scripts/words.py
  <pasta>/locucao.json` dá o segundo de cada palavra.
- Monte o `timeline.json` **a partir da voz**: cada fala começa no máximo 0,5 s depois do fim da
  anterior. A cena dura o que a fala dura; a ação mais longa acontece debaixo da voz. Uma pausa de
  até 1 s só na virada, marcada com `"pause": true`.
- Os gestos da tela vão em `events`, e os efeitos sonoros em `sfx` apontam para eles.

### 3. Cenas

Escreva `composition.html` seguindo o guia. As regras que mais se quebram:

- **Fundo liso** (papel `#F5F5F7` ou branco). Nenhuma mancha, halo ou gradiente colorido.
- **Título em tinta `#1D1D1F`, as duas linhas.** Nada de cinza, nada de palavra em cor de família.
- Cor de família só dentro do app, com significado (Pago verde, Pendente âmbar).
- Algo novo a cada 2–3 s. Transição com motivo (a forma que vira a próxima cena), nunca dissolve solto.
- Molas do `motion.js`; registro literal: `window.__timelines['main'] = M.offset(tl, __TIME_OFFSET__)`.

### 4. Conferir

```bash
fnm exec --using=22 -- node _kit/scripts/produce.mjs <pasta> --build-only
fnm exec --using=22 -- node _kit/scripts/check.mjs <pasta>
```

O `check.mjs` acusa silêncio acima do limite e tira um quadro de cada gesto assentado, nos dois
formatos. **Olhe todas as folhas de contato você mesmo**: texto cortado, sobreposição, cursor fora
do quadro, texto cinza, fundo colorido, palavra fora do tempo da fala. Conserte e confira de novo.

### 5. Exportar e entregar

`node _kit/scripts/produce.mjs <pasta>` — 30 quadros com motion blur (dois renders a 60 por
formato; demora). Confira um quadro de movimento rápido do MP4 final, abra o vídeo para o dono
(`Start-Process`) e mande os dois formatos. Diga o que você não conseguiu verificar — você não
escuta o áudio, então a voz e a mixagem são dele. Registre no `plano.md` o que foi entregue e o
que ficou em aberto.

## O que nunca fazer

- Gerar sem plano aprovado.
- Mostrar recurso que a landing não promete, ou personalização de cor (não estará no sistema).
- Número real, depoimento ou métrica inventados. Dados são do elenco fictício e se dizem ilustrativos.
- Caixa alta, em qualquer texto.
- Commitar sem ele mandar; `videos/` ignora `render/`, `exports/` e `audio/`, que se regeneram.
