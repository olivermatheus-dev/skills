---
name: video
description: "Produz vídeos em motion graphics (lançamento, trailer, recorte de funcionalidade, anúncio, reels) para qualquer empresa do hub: briefing → plano aprovado → voz e tempos → cenas em HTML/CSS/GSAP → conferência → export MP4, na marca da empresa (brand.css + BRAND.md), em 3 níveis de edição (simples, médio = padrão, alto). Use quando o usuário pedir vídeo, reels animado, motion, trailer, teaser, vídeo de lançamento, vídeo do produto, animação, anúncio em vídeo, ou quiser refazer, polir ou revisar um vídeo. Os formatos específicos (fmt-*) usam esta skill como motor."
---

# Vídeo em motion graphics

Você é o **diretor e o editor**. Tudo na tela é código (HTML, CSS, SVG, canvas, GSAP). Régua: **lançamento de software premium feito por estúdio**, nunca template ou slide animado.

## Nível de edição (decida primeiro)
Se o pedido não disser, é **médio**. "Rápido", "simples", "só um teste" → simples. "Caprichado", "premium", "alto", lançamento principal → alto.

| | **simples** | **médio (padrão)** | **alto** |
|---|---|---|---|
| ler | `BRAND.md` + receita `fmt-*` | + `knowledge/video/REGRAS.md` | + o arquivo de `knowledge/video/` de cada tema que o vídeo usa (`README.md` diz qual) |
| plano | falas + folha de batidas curta **no chat**; segue sem portão se o pedido já veio claro | `plano.md` enxuto + **1 style frame** → **aval** | `plano.md` completo (estilo e 8 controles) + 2–3 style frames → **aval** |
| áudio | 1 trilha do catálogo, sem SFX extra | trilha (2–3 candidatas) + SFX nos gestos-chave | sound-designer completo (camadas, texturas, mix) |
| conferência | `timeline.mjs check` + `qc.mjs` | + 1 rodada de folhas de contato | passadas de `qc-final.md` + agente `revisor` + **2ª iteração** de polimento |
| entrega | 1 formato | formatos pedidos (default 4:5 + 9:16) | idem + motion blur com 4–8 amostras |

**Não leia além do nível.** Dúvida pontual → abra só o arquivo do tema. Precedência: **BRAND.md > Padrões do Oliver (abaixo) > receita do fmt-* > REGRAS/knowledge (defaults)**.

## Sempre ler
- `companies/<slug>/brand/BRAND.md` (proibições = regra dura) e `context/BUSINESS.md` (o que é verdade). Persona e voz (`AUDIENCE.md`, `VOICE.md`) só se for escrever falas.
- Receita do formato: `.claude/skills/fmt-<formato>/SKILL.md`.
- Vídeo anterior da empresa: o `plano.md` dele e o feedback registrado (ponto de partida, não modelo).

## Briefing (4 variáveis)
Recorte (obrigatório) · duração (default 15–20 s; lançamento 30 s) · formatos (default 4:5 + 9:16) · áudio (default: trilha + efeitos, sem locução). **Nunca fundo mudo.** Pergunte só o que faltar e não tiver default.

## Pasta do vídeo
`companies/<slug>/contents/AAAA-MM-DD-<nome>/` (anúncio: `campaigns/…`):
```
plano.md · locucao.json · timeline.json · composition.html · data/*.json
audio/ render/ exports/      ← gerados, fora do git
```
Moldes: `references/plano.md` (médio usa só §1, 4, 5, 7 e 8), `references/timeline.md`.

## Etapas

### 0. Galeria antes de criar
Antes de escrever fundo, gráfico, mapa, transição ou bloco de cena: consulte `library/INDEX.md` e `companies/<slug>/video-templates/` (quando existirem; tarefa 014). Reaproveite e ajuste parâmetros; crie do zero só se não houver nada adaptável.

### 1. Plano → PARE e peça o aval (exceto simples)
1. Médio/alto: 2–3 conceitos em 1 linha, recomende 1.
2. Plano: recorte, falas exatas, **folha de batidas** (tempo · na tela · o que entender · som · intensidade 0–4), cor/fundo por cena, **afirmações com fonte** (sem fonte = não entra), perguntas com recomendação.
3. **Style frames:** quadros-chave **estáticos** com o `brand.css` real (inclua o quadro mais cheio). Um aval cobre roteiro e visual.
4. Confira: cabe na duração (≤ 2,7 palavras/s de locução); arco gancho ≤ 2 s → conceito → produto em uso → virada → revelação → cartão final ≥ 2 s.
5. **Sem "pode seguir", não anime.**

### 2. Voz e tempos (o áudio manda no relógio)
- Locução: **v1.0 com voz gratuita** (`tts.mjs`, voz de rascunho da empresa; skill `locucao`); voz final só depois do aval: **Eleven v4** pela API com a chave do projeto (skill `elevenlabs`: `vo[].el` com emoção → `elevenlabs.mjs`, que encaixa sozinho). Sem locução: escolha o BPM e monte a grade (cenas com `len`).
- `timeline.json` nasce do áudio: o `tts.mjs` mede cada fala e monta cenas e eventos (`lead`/`gap`/`tail`/`min`/`len`; eventos presos a palavra, `at` ou `before_end`). ≤ 0,5 s entre falas; pausa ≤ 1 s só na virada (`"pause": true`); a cena dura o que a fala dura.
- Gestos em `events`; cada SFX aponta para um evento e um asset licenciado do catálogo. Trilha e efeitos: skill `audio` (agente `sound-designer` no médio/alto). Trilhas candidatas trocadas com `timeline.mjs music`.

### 3. Cenas = blocos (padrão desde a 045)
- **Monte o vídeo com blocos, não escreva `composition.html`.** Cada cena aponta para um bloco (`scenes[].use`), o fundo vai em `camadas`, e o `produce.mjs` gera a composição sozinho (`compor.mjs`; o `composition.html` gerado não se edita). Contrato e ctx: `references/blocos.md`.
- **Antes de criar, procure:** `ls companies/<slug>/video-templates/blocos/*/` e `library/blocos/*/` (ler só os `bloco.json`). Reusar = `use` + `on_screen` (slots) + `params` + eventos com `cue`: custo ≈ o texto.
- **Variantes (A/B de abertura, voz…) depois do aval da base:** `projeto.json` + `variantes.mjs`, sem LLM e sem reescrever cena (`references/variantes.md`).
- Bloco novo nasce no projeto (`<pasta>/blocos/<tipo>/<id>/`) e sobe para `video-templates/blocos/` (marca) ou `library/blocos/` (genérico) quando o Oliver gostar.
- As regras abaixo valem dentro de cada bloco.
- Linkar `brand/brand.css` (gerado do `brand.json`; o `produce.mjs` copia a marca para o render); nunca hardcodar cor da marca. Ícones: só Lucide via `node tools/icon.mjs <nome> --brand <slug>` (SVG inline com `--icon-color`/`--icon-stroke`). Uma timeline GSAP principal no formato do kit (`tools/video-kit/GUIA-TECNICO.md`); **todo tempo vem de `T.scene/T.ev/T.word`** ou dos marcadores `__S:<cena>__ __D:<cena>__ __E:<evento>__`, nunca número escrito à mão (é o que deixa trocar a voz sem reescrever).
- **Cena isolada e elástica** (para virar variante sem reescrever): sem cor ou texto fixo dentro (tokens do `brand.css` + `params`/`on_screen` do `timeline.json`), animação em tempo relativo (entrada · hold · saída), sem depender da cena vizinha. Contrato completo: `roadmap/tasks/013-cenas-modulares-variantes/TASK.md`.
- **Alvos estáveis (anotações do Oliver):** em bloco, classe semântica dentro do bloco (o runtime já marca a raiz com `data-inst`/`data-bloco`); em composição antiga escrita à mão, `id` único e semântico (`#card-proxima-sessao`, não `#div7`) e cada cena/bloco com `data-bloco="nome"`; mantenha o id quando reescrever a cena. É o que `revisao.json` guarda como alvo (`selector`); sem isso a anotação se perde. Os ids de cena/fala/evento vêm da `timeline.json`.
- Molas do kit (`SNAP/FAST/SOFT/GENTLE`, `swap`, `stretchTo`, `cursor`); não reescreva easing à mão.
- **Siga os [Padrões do Oliver](#padrões-do-oliver-sempre-sem-ele-pedir)** em toda cena (texto inteiro, nada vazio, ícones, headline, SFX, camadas, cartão final).
- Ordem por cena: estados → poses-chave → curvas → offsets → assentar → efeitos → som.
- Dados de demonstração: **elenco fictício** do BRAND.md, marcados como ilustrativos.

### 4. Conferir
- Simples: `node tools/video/timeline.mjs check <pasta>`.
- Médio: + `produce --build-only` e `check.mjs` → **olhar as folhas de contato dos formatos** com a lista de conferência dos Padrões do Oliver (texto cortado/fora da área segura, sobreposição, cursor fora do quadro, cor fora da marca, palavra fora da fala, proibições, contraste com `node tools/contrast.mjs`).
- Alto: + passadas de `knowledge/video/qc-final.md` + delegar ao `revisor` → corrigir → **2ª rodada de polimento** (curvas, offsets, som).
- Problema = corrija a causa, não o sintoma. Crítico e maior antes de exportar.

### 5. Exportar e entregar
- Render de cada formato com motion blur (kit: 2 amostras; alto: 4–8 amostras se houver movimento rápido). Export com BT.709 marcado (`tecnico.md`).
- Nome `<AAAA-MM-DD>-<nome>-<formato>-vNN.mp4` em `exports/`; nunca sobrescrever versão aprovada.
- **Sempre:** `node tools/video/qc.mjs <pasta> --sheet` (sem crítico) e **olhar a folha de contato do MP4 final**.
- Entregar: caminhos dos MP4 + saída do `qc.mjs` + **o que o Oliver precisa conferir** (o Claude não escuta: ouvir com fone e no celular; ver pequeno e sem som; prévia na plataforma).
- **Promover para a galeria:** algo reutilizável (fundo, gráfico, mapa, transição, bloco)? Extraia com parâmetros e tokens para `library/` (genérico) ou `video-templates/` (marca) e registre no catálogo.
- Registrar no `plano.md`: entregue, em aberto, feedback. Feedback visual que se repete → `BRAND.md` > Aprendizados.

## Revisão por anotações (comece por aqui se houver anotações abertas)
O Oliver anota no app (aba **Conteúdos**: player + faixas da `timeline.json`) e a anotação vai para `<pasta>/revisao.json`. Quando o pedido for "revisa as anotações" ou a pasta tiver `revisao.json` com abertas:
1. `node tools/review.mjs <pasta>` → só as abertas, com cena, fala, tempo, alvo (trecho do `composition.html`) e o **quadro** do momento em `render/review/` (abra com Read). **Não pergunte de volta**: o contexto está ali; se o seletor sumiu, ache pelo texto da cena.
2. Aja por tipo: `corrigir` = bug, conserte a causa · `ajustar` = ajuste fino (tente `timeline.mjs` antes de reescrever HTML) · `ok` = não mexer · `template` = **promover para a galeria** (`library/motion/`, tarefa 014): extraia o elemento/cena com parâmetros e tokens, registre no catálogo e deixe a peça usando o componente.
3. Depois de corrigir e **re-renderizar numa versão nova** (`vNN`, nunca sobrescrever): `node tools/review.mjs <pasta> resolve <id> "o que mudou"` (guarda a resposta; o Oliver vê no app e reabre se não ficou bom). Fim da rodada: `qc.mjs --sheet` como sempre.
4. Âncoras: `cena`/`fala`/`evento` valem por id mesmo se o tempo mudar; `elemento` = `selector` + `t`; `tempo` = só o instante (use o quadro).

## Ajustes depois da entrega (quase zero token)
`node tools/video/timeline.mjs show|check|vo|dur|text|music|vol <pasta> …` troca voz, duração, texto, trilha e volume (`vol <voz|trilha|efeitos|evento> <dB>` → `mix.vo_db`/`music.gain_db`/`mix.sfx_db`/`sfx[].gain_db`) e reencaixa o resto; `dur` grava `min`/`len` na cena e refaz o layout. O Oliver faz o mesmo no app (Edição do vídeo → **Ajustes diretos** + **Gerar prévia** = sfx → mix → `produce --draft`): ajuste que já está na `timeline.json` não se desfaz. **Pedido de ajuste → tente primeiro por aqui**, sem reescrever `composition.html`.

## Kit (motor de render)
`tools/video-kit/` (HyperFrames 0.8.141 fixo + GSAP + `motion.js` + `tl.js`). **Leia `tools/video-kit/README.md` (comandos) e `GUIA-TECNICO.md` (armadilhas) antes de animar.** Molde de pasta nova: `library/templates/video/base/`. Exemplo funcionando: `companies/kz/contents/2026-10-07-teste-kit/`.
Ordem: `tts` → `music` (ou trilha do catálogo) → `sfx` → `mix` → `produce --build-only` → `check` (olhar) → `produce` → `qc.mjs --sheet` (olhar).

## Padrões do Oliver (sempre, sem ele pedir)
Correções que o Oliver fez nos vídeos de 2026-10-07 (vídeo 01, A/B A-opus e B-sonnet). Valem **acima das receitas `fmt-*`** e em todo nível. Detalhe: `knowledge/video/REGRAS.md` §2, §4 e §7. Exemplo em código: `companies/kz/contents/2026-10-07-ab-sessao/A-opus/composition.html`.

**Texto e ritmo**
- **Frase inteira de uma vez** (cascata ≤ 0,5 s) no início da fala ou da cena. Nunca palavra a palavra esperando a locução, nunca meia frase na tela, nunca vazio enquanto a narração segue. Frase de impacto entra completa (pode diferir da fala). A palavra da fala só dispara **gestos** (clique, pop de card, ícone). No código: função `phrase`, não sincronia por palavra.
- **Nada começa vazio, nada atrasa:** toda cena tem algo entrando no 1º quadro; logo e elementos-chave sem atraso (a logo se desenha enquanto a voz diz "Essa é a…", não espera a palavra "kz").
- **Abertura:** a 1ª frase grande e destacada, entrando animada no 1º quadro; depois encolhe e sobe para dar lugar ao resto.
- **Tela de cards/UI sempre com headline animada** no topo, dizendo a ideia da cena.
- **Cada ideia com ícone ou elemento gráfico** de apoio (ícone no bloco, selo ✓, chip com ícone, relógio, coração). Vídeo dinâmico: no máximo ~1,5 s sem algo novo ou vivo (o `qc.mjs` acusa tela parada).

**Som**
- **SFX discreto em toda entrada e saída de card, chip e troca de cena** (pop, whoosh fino, click; variantes da mesma família), 12–20 dB abaixo da voz.

**Camadas e UI**
- **Card com linha/conector atrás é sempre opaco:** para apagar/acender, anime o conteúdo (`card > *`), nunca a opacidade do card (senão a linha aparece por trás ou por cima). z-order explícito.
- Eco de clique só no instante do clique (`immediateRender: false`, senão fica um fantasma em 0,0); a ponta do cursor mira a borda do botão, sem cobrir texto nem ícone.
- "dados ilustrativos" sempre no rodapé, pequeno, nunca no meio da tela.

**Final**
- **O vídeo não precisa durar o áudio:** cartão final com cauda de 2–4 s, microanimação, SFX e trilha resolvendo. **CTA com site/URL → `library/motion/cta/navegador/`** (aba abre, URL digitada, cursor clica em Ir, página carrega), mesmo sem fala.

**Conferência (antes de entregar, nas folhas do `check.mjs` e do `qc.mjs --sheet`)**
- Procure: meia frase na tela, vácuo > 0,5 s com a voz falando, cena começando vazia, logo atrasada, linha aparecendo atrás de card, texto cortado ou saindo da área segura, headline por cima de card. Liste no relatório os quadros vistos.

## Nunca
- Animar antes do plano aprovado (exceto nível simples com pedido claro).
- Recurso, número, métrica, depoimento ou preço sem fonte.
- Quebrar proibição do BRAND.md (saúde: nada de promessa de resultado terapêutico nem depoimento de paciente).
- Áudio ou asset sem licença registrada.
- Commitar `audio/`, `render/` ou `exports/`.
