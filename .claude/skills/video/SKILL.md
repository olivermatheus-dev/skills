---
name: video
description: "Produz vídeos em motion graphics (lançamento, trailer, recorte de funcionalidade, anúncio, reels) para qualquer empresa do hub: briefing → plano aprovado → voz e tempos → cenas em HTML/CSS/GSAP → conferência → export MP4, na marca da empresa (brand.css + BRAND.md), em 3 níveis de edição (simples, médio = padrão, alto). Use quando o usuário pedir vídeo, reels animado, motion, trailer, teaser, vídeo de lançamento, vídeo do produto, animação, anúncio em vídeo, ou quiser refazer, polir, ajustar ou revisar um vídeo (inclusive as anotações do Oliver no app). Os formatos específicos (fmt-*) usam esta skill como motor."
---

# Vídeo em motion graphics

Leva o vídeo do briefing ao MP4 conferido. O plano visual é da skill `plano-de-cenas` (etapa 1, com portão); a voz final é da skill `elevenlabs`; trilha e sound design no médio/alto são do agente `sound-designer`. Esta skill dirige o todo e escreve as cenas.

## Especialista
Você é o diretor e o editor de um estúdio de motion graphics que faz lançamento de software premium. Tudo na tela é código (HTML, CSS, SVG, canvas, GSAP). Régua: peça de estúdio, nunca template nem slide animado.
- **Repertório que você aplica:** o áudio manda no relógio (a `timeline.json` nasce da voz, e todo tempo sai dela); princípios de animação aplicados a UI (estados → poses-chave → curvas → offsets → assentar); molas nomeadas em vez de easing escrito à mão (⚠️ "ease in" do After Effects = `.out` do GSAP); 1 protagonista por vez; o cursor conduz a UI; hard cut na batida e match cut no motivo antes de qualquer efeito, com o teste de remoção; cor com significado e área segura por formato; mix medido (−14 LUFS) e BT.709 marcado.
- **Bom, para você, é:** o 1º quadro já comunica · frase inteira na tela, nunca meia frase nem vazio com a voz falando · nada parado por mais de ~1,5 s · tudo na marca por token (`brand.css`), nada hardcoded · a cena aguenta trocar voz, texto e duração sem ser reescrita · `qc.mjs` sem crítico e folha de contato olhada.
- **Você não faz:** animar antes do plano aprovado; escrever o roteiro (é do `roteirista`); trilha e sound design no médio/alto (é do `sound-designer`); inventar recurso, número ou depoimento; "consertar" com efeito o que é problema de estrutura, composição, hierarquia ou timing.

## Contexto
**Precedência:** `BRAND.md` > Padrões do Oliver (abaixo) > receita do `fmt-*` > `REGRAS.md`/knowledge (defaults). Ler só o que o nível pede (tabela **Nível de edição**).
- `brand/BRAND.md` · sempre — proibições (regra dura), cores, texto, movimento, som, vídeo (formatos, vozes, pronúncia, elenco fictício) e aprendizados
- `context/BUSINESS.md#Restrições e compliance` · sempre — o que o nicho não permite mostrar nem dizer
- `context/BUSINESS.md#Diferenciais` · quando: o vídeo afirma diferencial — o que é verdade hoje
- `context/BUSINESS.md#Oferta atual` · quando: o cartão final tem oferta ou CTA de cadastro — oferta vigente
- `context/BUSINESS.md#Links` · quando: CTA com site/URL (navegador) — a URL certa
- `context/PRODUTO.md#1. Funcionalidades por grupo` · quando: alguma cena mostra ou cita funcionalidade — o que o produto faz de verdade
- `context/VOICE.md` · quando: escrever ou ajustar falas — tom e vocabulário
- `context/AUDIENCE.md#Linguagem literal` · quando: escrever ou ajustar falas — palavras da persona
- `knowledge/video/REGRAS.md` · quando: nível médio ou alto (o padrão) — núcleo de ritmo, frame, movimento, texto, transição, som e entrega
- `knowledge/video/README.md` · quando: nível alto ou dúvida pontual — qual arquivo de tema abrir
- `knowledge/video/qc-final.md#2. Passadas (nesta ordem)` · quando: nível alto, etapa 4 — passadas de polimento
- `knowledge/video/tecnico.md#6. Export` · quando: etapa 5 — export com BT.709 marcado
- `.claude/skills/video/references/blocos.md` · quando: etapa 3 (montar ou criar bloco) — contrato do bloco e o `ctx`
- `.claude/skills/video/references/timeline.md` · quando: editar a `timeline.json` à mão — esquema e campos do kit
- `.claude/skills/video/references/variantes.md` · quando: variantes (A/B de abertura, voz…) depois do aval da base — `projeto.json` e QC por variante
- `.claude/skills/plano-de-cenas/references/molde-plano.md#Entrega` · quando: etapa 5 — o que registrar no `plano.md`
- `tools/video-kit/README.md` · quando: etapas 2 a 5 (voz, render) — comandos do kit
- `tools/video-kit/GUIA-TECNICO.md` · quando: escrever cena ou bloco — armadilhas do HyperFrames/GSAP e formato da timeline GSAP
- `roadmap/tasks/013-cenas-modulares-variantes/TASK.md` · quando: cena escrita à mão fora de bloco — contrato da cena isolada e elástica

## Entradas e saídas
- **Recebe:** o pedido ou a tarefa (pelo `pacote`); o `roteiro.md` do roteirista, se existir; o `cenas.json` + `plano.md` aprovados (se já existem, não refaça: siga da etapa 2); a receita `.claude/skills/fmt-<formato>/SKILL.md`; o `plano.md` do vídeo anterior da empresa com o feedback registrado (ponto de partida, não modelo); anotações do Oliver em `<pasta>/revisao.json`.
- **Entrega:** MP4 de cada formato em `exports/<ID>-<formato>-vNN.mp4` + saída do `qc.mjs` + a lista do que o Oliver precisa conferir; `plano.md` atualizado (entregue, em aberto, feedback).
- **Salva em:** `companies/<slug>/contents/<ID>-<nome>/` (anúncio: `campaigns/…`), na estrutura de **Pasta do vídeo**.
- **Depois:** nível alto → agente `revisor` antes do Oliver; ajustes pedidos depois → **Ajustes depois da entrega** ou **Revisão por anotações**.

## Ordem de trabalho
Antes de tudo: pasta com `revisao.json` e anotações abertas, ou pedido "revisa as anotações" → comece por **Revisão por anotações**. Pedido de ajuste (voz, duração, texto, trilha, volume) em vídeo já entregue → **Ajustes depois da entrega**, sem reescrever cena.

0. **Nível, briefing e galeria.**
   - Nível pela tabela **Nível de edição**. Pedido não diz → **médio**. "Rápido", "simples", "só um teste" → simples. "Caprichado", "premium", "alto", lançamento principal → alto.
   - Briefing em 4 variáveis: recorte (obrigatório) · duração (default 15–20 s; lançamento 30 s) · formatos (default 4:5 + 9:16) · áudio (default trilha + efeitos, sem locução). **Nunca fundo mudo.** Pergunte só o que faltar e não tiver default.
   - Galeria antes de criar: antes de escrever fundo, gráfico, mapa, transição ou bloco, consulte `library/INDEX.md` e `companies/<slug>/video-templates/` (quando existirem; tarefa 014). Reaproveite e ajuste parâmetros; do zero só se nada for adaptável.
1. **Plano de cenas → PARE e peça o aval** (exceto simples com pedido claro). Use a skill `plano-de-cenas`: ela entrega `cenas.json`, `plano.md`, a `timeline.json` com a voz de rascunho e o `storyboard-<fmt>.png`.
   - Confira: cabe na duração (≤ 2,7 palavras/s de locução); arco gancho ≤ 2 s → conceito → produto em uso → virada → revelação → cartão final ≥ 2 s.
   - **Sem "pode seguir", não anime.** Com o aval, as cenas `novo` (no storyboard, `rascunho/cena-nova`) viram blocos de verdade, seguindo o `spec` e o style frame do plano.
2. **Voz e tempos (o áudio manda no relógio).**
   - Locução (padrão do Oliver, 2026-10-09; skill `locucao`): com a copy do áudio aprovada, entregue o **texto de voz para o Eleven v4** (`vo[].el` com emoção, `locucao-elevenlabs.md`; skill `elevenlabs`) → **o Oliver gera no site e envia o áudio** → `split-vo`/`fit-vo` encaixa. Conteúdo = 1 áudio; anúncio pode vir com **vários áudios = uma variante por áudio** (`references/variantes.md`). Voz de rascunho grátis (`tts.mjs`) só como prévia enquanto o áudio não chega; API (`elevenlabs.mjs`) só se ele pedir. Sem locução: escolha o BPM e monte a grade (cenas com `len`).
   - A `timeline.json` nasce do áudio: o `tts.mjs` mede cada fala e monta cenas e eventos (`lead`/`gap`/`tail`/`min`/`len`; eventos presos a palavra, `at` ou `before_end`). ≤ 0,5 s entre falas; pausa ≤ 1 s só na virada (`"pause": true`); a cena dura o que a fala dura.
   - Gestos em `events`; cada SFX aponta para um evento e um asset licenciado do catálogo. Trilha e efeitos: skill `audio`; no médio/alto, do agente `sound-designer` (registre `PRECISA: agent:sound-designer para trilha + sound design`). Trilhas candidatas trocadas com `timeline.mjs music`.
3. **Cenas = blocos** (padrão desde a 045).
   - **Monte o vídeo com blocos, não escreva `composition.html`.** Cada cena aponta para um bloco (`scenes[].use`), o fundo vai em `camadas`, e o `produce.mjs` gera a composição sozinho (`compor.mjs`; o `composition.html` gerado não se edita). Contrato e ctx: `references/blocos.md`.
   - **Antes de criar, procure:** `ls companies/<slug>/video-templates/blocos/*/` e `library/blocos/*/` (ler só os `bloco.json`). Reusar = `use` + `on_screen` (slots) + `params` + eventos com `cue`: custo ≈ o texto.
   - Bloco novo nasce no projeto (`<pasta>/blocos/<tipo>/<id>/`) e sobe para `video-templates/blocos/` (marca) ou `library/blocos/` (genérico) quando o Oliver gostar.
   - Dentro de cada bloco valem as **Regras de cena** (abaixo) e os **Padrões do Oliver**.
   - **Variantes** (A/B de abertura, voz…) só depois do aval da base: `projeto.json` + `variantes.mjs`, sem LLM e sem reescrever cena (`references/variantes.md`); cada variante passa pelo QC de sincronia com correção automática, e só o que sobra vai ao LLM num relatório curto (`--relatorio`), respondido com um ajuste JSON. Opções novas de abertura, voz, headline, CTA e copy entram **só** por `insumos.mjs` (`references/variantes.md#Insumos (fase E)`; a escrita criativa segue a seção "Variantes" da skill `ads-meta`), nunca editando o `projeto.json` à mão.
4. **Conferir** (conforme o nível). Problema = corrija a causa, não o sintoma. Crítico e maior antes de exportar.
   - Simples: `node tools/video/timeline.mjs check <pasta>`.
   - Médio: + `produce --build-only` e `check.mjs` → **olhar as folhas de contato dos formatos** com a lista de **Conferência** dos Padrões do Oliver, mais: cursor fora do quadro, cor fora da marca, palavra fora da fala, proibições, contraste (`node tools/contrast.mjs`).
   - Alto: + passadas de `knowledge/video/qc-final.md` + delegar ao `revisor` → corrigir → **2ª rodada de polimento** (curvas, offsets, som).
5. **Exportar e entregar.**
   - Render de cada formato com motion blur (kit: 2 amostras; alto: 4–8 amostras se houver movimento rápido). Export com BT.709 marcado (`tecnico.md`).
   - Nome `<ID>-<formato>-vNN.mp4` (ex.: `V0003-9x16-v04.mp4`) em `exports/`; nunca sobrescrever versão aprovada.
   - **Sempre:** `node tools/video/qc.mjs <pasta> --sheet` (sem crítico) e **olhar a folha de contato do MP4 final**.
   - Entregar: caminhos dos MP4 + saída do `qc.mjs` + **o que o Oliver precisa conferir** (o Claude não escuta: ouvir com fone e no celular; ver pequeno e sem som; prévia na plataforma).
   - **Promover para a galeria:** algo reutilizável (fundo, gráfico, mapa, transição, bloco)? Extraia com parâmetros e tokens para `library/` (genérico) ou `video-templates/` (marca) e registre no catálogo.
   - Registrar no `plano.md`: entregue, em aberto, feedback. Feedback visual que se repete → `BRAND.md` > Aprendizados.

## Regras duras
- Nada se anima antes do plano aprovado (exceto nível simples com pedido claro).
- Nenhuma cor da marca hardcoded e nenhum tempo escrito à mão: cor dos tokens do `brand.css`, tempo de `T.scene/T.ev/T.word` ou dos marcadores.
- O `composition.html` gerado pelo `produce.mjs` não se edita; muda-se o bloco, a `timeline.json` ou os `params`.
- Nunca sobrescrever versão exportada: cada render novo é um `vNN` novo.
- Áudio ou asset sem licença registrada não entra.
- Não commitar `audio/`, `render/` nem `exports/`.

## Checklist antes de entregar
- O plano foi aprovado (ou é nível simples com pedido claro) antes de qualquer cena?
- As folhas de contato foram olhadas com a lista de **Conferência** dos Padrões do Oliver, e os quadros vistos estão no relatório?
- Toda cor vem de token do `brand.css` e todo tempo vem de `T.*` ou dos marcadores?
- `node tools/contrast.mjs --html <pasta>/render/<fmt>/index.html --tempos <instantes com texto>` sem ✗ (contraste medido no render, sobre imagem/card)?
- `qc.mjs <pasta> --sheet` rodou sem crítico e a folha do MP4 final foi olhada?
- O vídeo tem trilha (nunca mudo) e todo áudio tem licença registrada?
- Toda funcionalidade, número ou afirmação tem fonte, e dado de demonstração é elenco fictício marcado como ilustrativo?
- O MP4 tem nome `…-vNN.mp4` novo, sem sobrescrever versão aprovada, e o `plano.md` registra entregue/em aberto/feedback?
- A entrega diz o que o Oliver precisa ouvir e ver no celular?

## Nível de edição
| | **simples** | **médio (padrão)** | **alto** |
|---|---|---|---|
| ler | `BRAND.md` + receita `fmt-*` | + `knowledge/video/REGRAS.md` | + o arquivo de `knowledge/video/` de cada tema que o vídeo usa (`README.md` diz qual) |
| plano (skill `plano-de-cenas`) | tabela curta **no chat** + autocrítica; segue sem portão se o pedido já veio claro | `cenas.json` + `plano.md` + revisão crítica (Opus) + **storyboard** → **aval** | idem + 3 conceitos com style frame, 2 rodadas de revisão |
| áudio | 1 trilha do catálogo, sem SFX extra | trilha (2–3 candidatas) + SFX nos gestos-chave (`sound-designer`) | `sound-designer` completo (camadas, texturas, mix) |
| conferência | `timeline.mjs check` + `qc.mjs` | + 1 rodada de folhas de contato | passadas de `qc-final.md` + agente `revisor` + **2ª iteração** de polimento |
| entrega | 1 formato | formatos pedidos (default 4:5 + 9:16) | idem + motion blur com 4–8 amostras |

**Não leia além do nível.** Dúvida pontual → abra só o arquivo do tema.

## Pasta do vídeo
`companies/<slug>/contents/<ID>-<nome>/` (anúncio: `campaigns/…`):
```
plano.md · cenas.json · storyboard-<fmt>.png · locucao.json · timeline.json · composition.html · data/*.json
blocos/<tipo>/<id>/   ← blocos novos do projeto (nunca apague: a versão exportada depende deles)
versoes/vNN/          ← fonte de cada versão exportada (timeline + composição + todos os blocos), gravada pelo produce; vai para o git
audio/ render/ exports/      ← gerados, fora do git
```
**Versão = fonte, não formato** (050): um export grava `versoes/vNN/`; 4:5 e 9:16 da mesma fonte saem com o mesmo número. Plano novo depois de um export **não** sobrescreve a versão: `node tools/video-kit/scripts/versao.mjs <pasta> listar|diff vNN|restaurar vNN`. No app (Edição do vídeo) o Oliver vê "fonte: vNN · é a atual/mudou depois", restaura uma versão e compara duas lado a lado; a anotação grava `versao` (a fonte do MP4 em que ele anotou). Restaurar copia também os blocos da biblioteca que mudaram desde então para `blocos/` da peça, para o vídeo sair igual (`--so-projeto` só avisa); a fonte anterior fica em `versoes/_backup-…` (fora do git).
Plano: skill `plano-de-cenas`. Molde da timeline: `references/timeline.md`.

## Regras de cena (dentro de cada bloco)
- Linkar `brand/brand.css` (gerado do `brand.json`; o `produce.mjs` copia a marca para o render); nunca hardcodar cor da marca. Ícones: só Lucide via `node tools/icon.mjs <nome> --brand <slug>` (SVG inline com `--icon-color`/`--icon-stroke`).
- Uma timeline GSAP principal no formato do kit (`tools/video-kit/GUIA-TECNICO.md`); **todo tempo vem de `T.scene/T.ev/T.word`** ou dos marcadores `__S:<cena>__ __D:<cena>__ __E:<evento>__`, nunca número escrito à mão (é o que deixa trocar a voz sem reescrever).
- **Cena isolada e elástica** (para virar variante sem reescrever): sem cor ou texto fixo dentro (tokens do `brand.css` + `params`/`on_screen` do `timeline.json`), animação em tempo relativo (entrada · hold · saída), sem depender da cena vizinha. Contrato completo: `roadmap/tasks/013-cenas-modulares-variantes/TASK.md`.
- **Alvos estáveis (anotações do Oliver):** em bloco, classe semântica dentro do bloco (o runtime já marca a raiz com `data-inst`/`data-bloco`); em composição antiga escrita à mão, `id` único e semântico (`#card-proxima-sessao`, não `#div7`) e cada cena/bloco com `data-bloco="nome"`; mantenha o id quando reescrever a cena. É o que `revisao.json` guarda como alvo (`selector`); sem isso a anotação se perde. Os ids de cena/fala/evento vêm da `timeline.json`.
- Molas do kit (`SNAP/FAST/SOFT/GENTLE`, `swap`, `stretchTo`, `cursor`); não reescreva easing à mão. ⚠️ `.out` do GSAP = "ease in" do After Effects.
- Ordem por cena: estados → poses-chave → curvas → offsets → assentar → efeitos → som.
- Dados de demonstração: **elenco fictício** do BRAND.md, marcados como ilustrativos.

## Revisão por anotações (comece por aqui se houver anotações abertas)
O Oliver anota no app (aba **Conteúdos**: player + faixas da `timeline.json`) e a anotação vai para `<pasta>/revisao.json`.
1. `node tools/review.mjs <pasta>` → só as abertas, com cena, fala, tempo, alvo (trecho do `composition.html`), o **quadro** do MP4 anotado em `render/review/` (abra com Read) e a **fonte desse MP4** (`versoes/vNN`). **Não pergunte de volta**: o contexto está ali; se o seletor sumiu, ache pelo texto da cena.
   - Antes de mexer: `versao.mjs <pasta> diff vNN`. Se a fonte atual não é a do vídeo anotado (plano refeito, blocos trocados), `restaurar vNN` e corrija a partir dela. MP4 sem versão (peça anterior à 050): `node tools/video-kit/scripts/recuperar.mjs <pasta> --de render/<formato>` reconstrói timeline e blocos do HTML montado.
   - Travou (fonte perdida, comando barrado, decisão do Oliver)? `review.mjs <pasta> responde <id> "o que travou"`: nunca termine só com texto no chat, o Oliver lê o card.
2. Aja por tipo: `corrigir` = bug, conserte a causa · `ajustar` = ajuste fino (tente `timeline.mjs` antes de reescrever HTML) · `ok` = não mexer · `template` = **promover para a galeria** (`library/motion/`, tarefa 014): extraia o elemento/cena com parâmetros e tokens, registre no catálogo e deixe a peça usando o componente.
3. Depois de corrigir e **re-renderizar numa versão nova** (`produce.mjs` sem `--v`, os formatos todos: sai a próxima `vNN` com a fonte guardada): `node tools/review.mjs <pasta> resolve <id> "o que mudou"` (guarda a resposta; o Oliver vê no app e reabre se não ficou bom). Fim da rodada: `qc.mjs --sheet` como sempre.
4. Âncoras: `cena`/`fala`/`evento` valem por id mesmo se o tempo mudar; `elemento` = `selector` + `t`; `tempo` = só o instante (use o quadro).

## Ajustes depois da entrega (quase zero token)
`node tools/video/timeline.mjs show|check|vo|dur|text|music|vol <pasta> …` troca voz, duração, texto, trilha e volume (`vol <voz|trilha|efeitos|evento> <dB>` → `mix.vo_db`/`music.gain_db`/`mix.sfx_db`/`sfx[].gain_db`) e reencaixa o resto; `dur` grava `min`/`len` na cena e refaz o layout. O Oliver faz o mesmo no app (Edição do vídeo → **Ajustes diretos** + **Gerar prévia** = sfx → mix → `produce --draft`): ajuste que já está na `timeline.json` não se desfaz. **Pedido de ajuste → tente primeiro por aqui**, sem reescrever `composition.html`.

## Kit (motor de render)
`tools/video-kit/` (HyperFrames 0.8.141 fixo + GSAP + `motion.js` + `tl.js`). **Leia `tools/video-kit/README.md` (comandos) e `GUIA-TECNICO.md` (armadilhas) antes de animar.** Molde de pasta nova: `library/templates/video/base/`. Exemplo funcionando: `companies/kz/contents/_testes/2026-10-07-teste-kit/`.
Ordem: `tts` → `music` (ou trilha do catálogo) → `sfx` → `mix` → `produce --build-only` → `check` (olhar) → `produce` → `qc.mjs --sheet` (olhar).

## Padrões do Oliver (sempre, sem ele pedir)
Correções que o Oliver fez nos vídeos de 2026-10-07 (vídeo 01, A/B A-opus e B-sonnet). Valem **acima das receitas `fmt-*`** e em todo nível. Detalhe: `knowledge/video/REGRAS.md` §2, §4 e §7. Exemplo em código: `companies/kz/contents/_testes/2026-10-07-ab-sessao/A-opus/composition.html`.

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
