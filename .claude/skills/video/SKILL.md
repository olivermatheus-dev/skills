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

**Não leia além do nível.** Dúvida pontual → abra só o arquivo do tema. Precedência: **BRAND.md > receita do fmt-* > REGRAS/knowledge (defaults)**.

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

### 3. Cenas (`composition.html`)
- Linkar `brand/brand.css` (o `produce.mjs` copia a marca para o render); nunca hardcodar cor da marca. Uma timeline GSAP principal no formato do kit (`tools/video-kit/GUIA-TECNICO.md`); **todo tempo vem de `T.scene/T.ev/T.word`** ou dos marcadores `__S:<cena>__ __D:<cena>__ __E:<evento>__`, nunca número escrito à mão (é o que deixa trocar a voz sem reescrever).
- **Cena isolada e elástica** (para virar variante sem reescrever): sem cor ou texto fixo dentro (tokens do `brand.css` + `params`/`on_screen` do `timeline.json`), animação em tempo relativo (entrada · hold · saída), sem depender da cena vizinha. Contrato completo: `roadmap/tasks/013-cenas-modulares-variantes/TASK.md`.
- Molas do kit (`SNAP/FAST/SOFT/GENTLE`, `swap`, `stretchTo`, `cursor`); não reescreva easing à mão.
- **Ritmo (feedback do Oliver, 2026-10-07):** nenhuma tela vazia esperando a fala. Toda cena começa com algo entrando no 1º quadro; toda frase falada tem **headline animada** no tempo da palavra (troca a cada frase); cada ideia ganha **ícone ou elemento gráfico** de apoio (relógio que esvazia, alerta, coração, pílula com ícone); entradas e saídas de card têm **efeito sonoro discreto**. Abertura: a 1ª frase grande, entrando animada, depois encolhe e sobe para dar lugar ao resto.
- Ordem por cena: estados → poses-chave → curvas → offsets → assentar → efeitos → som.
- Dados de demonstração: **elenco fictício** do BRAND.md, marcados como ilustrativos.
- **Texto entra como frase inteira** (cascata ≤ 0,5 s) no início da fala/cena, **nunca palavra a palavra esperando a locução**; logo e elementos-chave sem atraso; cena nunca começa vazia. Palavra da fala só dispara gesto (clique, pop, ícone). Regra completa: `knowledge/video/REGRAS.md` §2.
- Cartão final pode passar do áudio. Site/URL no CTA → `library/motion/cta/navegador/` (`lib/motion/...` no render).

### 4. Conferir
- Simples: `node tools/video/timeline.mjs check <pasta>`.
- Médio: + `produce --build-only` e `check.mjs` → **olhar as folhas de contato dos formatos** (texto cortado/fora da área segura, sobreposição, cursor fora do quadro, cor fora da marca, palavra fora da fala, proibições, contraste com `node tools/contrast.mjs`).
- Alto: + passadas de `knowledge/video/qc-final.md` + delegar ao `revisor` → corrigir → **2ª rodada de polimento** (curvas, offsets, som).
- Problema = corrija a causa, não o sintoma. Crítico e maior antes de exportar.

### 5. Exportar e entregar
- Render de cada formato com motion blur (kit: 2 amostras; alto: 4–8 amostras se houver movimento rápido). Export com BT.709 marcado (`tecnico.md`).
- Nome `<AAAA-MM-DD>-<nome>-<formato>-vNN.mp4` em `exports/`; nunca sobrescrever versão aprovada.
- **Sempre:** `node tools/video/qc.mjs <pasta> --sheet` (sem crítico) e **olhar a folha de contato do MP4 final**.
- Entregar: caminhos dos MP4 + saída do `qc.mjs` + **o que o Oliver precisa conferir** (o Claude não escuta: ouvir com fone e no celular; ver pequeno e sem som; prévia na plataforma).
- **Promover para a galeria:** algo reutilizável (fundo, gráfico, mapa, transição, bloco)? Extraia com parâmetros e tokens para `library/` (genérico) ou `video-templates/` (marca) e registre no catálogo.
- Registrar no `plano.md`: entregue, em aberto, feedback. Feedback visual que se repete → `BRAND.md` > Aprendizados.

## Ajustes depois da entrega (quase zero token)
`node tools/video/timeline.mjs show|check|vo|dur|text|music <pasta> …` troca voz, duração, texto e trilha e reencaixa o resto. **Pedido de ajuste → tente primeiro por aqui**, sem reescrever `composition.html`.

## Kit (motor de render)
`tools/video-kit/` (HyperFrames 0.8.94 fixo + GSAP + `motion.js` + `tl.js`). **Leia `tools/video-kit/README.md` (comandos) e `GUIA-TECNICO.md` (armadilhas) antes de animar.** Molde de pasta nova: `library/templates/video/base/`. Exemplo funcionando: `companies/kz/contents/2026-10-07-teste-kit/`.
Ordem: `tts` → `music` (ou trilha do catálogo) → `sfx` → `mix` → `produce --build-only` → `check` (olhar) → `produce` → `qc.mjs --sheet` (olhar).

## Regras de entrega visual (feedback do Oliver, 2026-10-07; teste A/B B-sonnet)
- **Olhar os frames é obrigatório antes de entregar:** extrair `hyperframes snapshot` (contact sheet + quadros de início/meio/fim de cada cena e de cada entrada/saída de texto) e **inspecionar**: espaçamento, sobreposição (headline saindo por cima de card), camadas, texto cortado, vácuo > 0,5 s. Listar no relatório quais quadros foram vistos.
- Texto na tela **não** é sincronizado palavra a palavra: frase de impacto entra completa e junta (pode diferir da fala); nunca meia frase, nunca vazio esperando a narração; logo e elementos-chave entram no início da cena.
- O vídeo **não precisa durar o áudio**: o CTA final pode ter cauda de 2–4 s com microanimação (`library/motion/cta/navegador`: URL digitada + clique) e SFX.
- Aviso **"dados ilustrativos" sempre no rodapé** (pequeno, embaixo), nunca no meio da tela.
- **Cards e linhas:** não animar a opacidade de um card que tem linha/conector atrás (a linha aparece por trás ou por cima); use `transform`/`clip-path` no card, tracejado dentro do próprio card, e z-order explícito. Eco de clique e cursor: criar o eco só no instante do clique (`fromTo` com `immediateRender` deixa um fantasma em 0,0); mirar a ponta do cursor na borda do botão para não cobrir texto/ícone.

## Nunca
- Animar antes do plano aprovado (exceto nível simples com pedido claro).
- Recurso, número, métrica, depoimento ou preço sem fonte.
- Quebrar proibição do BRAND.md (saúde: nada de promessa de resultado terapêutico nem depoimento de paciente).
- Áudio ou asset sem licença registrada.
- Commitar `audio/`, `render/` ou `exports/`.
