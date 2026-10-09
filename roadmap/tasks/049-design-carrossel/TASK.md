# 049 · Design de carrossel (refazer a skill e o fluxo)

> Pedido do Oliver (2026-10-09): o carrossel da kz (origin story, T-0012) ficou "horrível". Quer uma skill especializada que pegue o conteúdo e monte o **plano de slides** (o que entra em cada post), mantendo a paleta da marca, minimalista mas **profissional**: camadas, detalhes finos, espaçamento pensado, hierarquia de texto, equilíbrio, **variação entre slides**, menos gradiente e mais cor sólida. Fluxo: conteúdo bruto → tópicos/etapas → plano de slides → o artista analisa, revisa e produz → **crítico isolado e ácido** → **outro agente implementa** as melhorias.
> Pesquisas: `pesquisa-skills.md` (skills e repositórios) · `pesquisa-direcao-de-arte.md` (regras com números).
> Status: **proposta, aguardando o aval do Oliver nas decisões do fim.**

## 1. Diagnóstico (origin story, 10 slides, `contents/2026-10-07-origin-story/png/`)
| o que se vê | causa na skill |
|---|---|
| 9 de 10 slides com o **mesmo layout** (bloco de texto à esquerda, centralizado na vertical) | `template.html`: todo `.slide` tem `justify-content:center`; os 8 "tipos" trocam o conteúdo, não a composição |
| ~50% da tela **vazia** em cima e embaixo: vazio, não respiro | não há grid nem regra de ocupação; texto pequeno para o quadro (título 76 px num 1080×1350) |
| **zero camadas**: sem card, moldura, rótulo, índice, régua, elemento gráfico | o template não tem componentes de detalhe; a regra "na dúvida, remova" sem contrapeso |
| hierarquia rasa: título + parágrafo cinza | só 2 níveis; sem eyebrow, sem número de capítulo, sem contraste de escala |
| variação só pelo fundo rosa (`.inverse`) | a única ferramenta de ritmo prevista é o `.inverse` |
| cada slide igual ao vizinho | não existe etapa de **plano por slide** nem regra de "não repetir layout vizinho" |
| quem fez é quem conferiu | não existe crítica isolada: o checklist é do próprio designer e mede só legibilidade (fonte, margem, contraste), nunca beleza |

Resumo: a skill é um **diagramador de texto** com checklist de acessibilidade. Ela não tem direção de arte (plano), sistema de layout (catálogo + componentes) nem crítico.

## 2. O que a pesquisa ensina (o que vamos roubar)
- **Plano antes do código** (Anthropic `frontend-design`, taste-skill): "leitura de design" em 1 linha, tokens travados, wireframe por slide; revisar o plano contra "o default previsível".
- **Variação governada por regra, não por "seja criativo"** (taste-skill): catálogo de famílias de layout; vizinhos nunca iguais; ≥ 4 famílias em 8 slides; eyebrow/card com teto; slide de respiro a cada 3–4.
- **Sistema fixo, composição variável**: um acento, um raio, um tema; o que varia é layout, escala e fundo sólido.
- **Camadas com função** (direção de arte): 5 planos (fundo sólido → forma/campo de cor → card → conteúdo → microdetalhe: hairline 1–2 px, índice, rótulo, marca de registro); sombra em camadas tingida (nunca cinza chapado); grão 3–8% opcional.
- **Números**: margem 96 px, 6 colunas (gutter 24), escala 8 (8…192), títulos 80–96 (capa 120–144), corpo 36–40, rótulo 24–26; entrelinha display 1,0–1,1; tracking −0,02 a −0,04 em display; título ≤ 18 caracteres por linha.
- **Cor**: fundo sólido por padrão; gradiente só como brilho local, num slide especial, ≤ 30% da área; 60-30-10 no conjunto.
- **Crítica**: duas vias isoladas (lint determinístico sem LLM + crítico visual Opus que não viu a conversa), nota por critério com severidade, 3–5 problemas com correção **direcional** ("mais quieto", "destilar", "aumentar escala"), região do slide apontada. Aceitar a correção só se a nota subir; guardar a melhor versão; máx. 3 rodadas; passada final que só **remove**.
- **Anti-genérico** (vira lint): mesmo layout em todos, cards idênticos em grade, tile de ícone redondo sobre cada título, eyebrow em todo slide, numeração 01/02/03 sem sequência real, texto flutuando nos cantos, gradiente decorativo, cinza sobre cor.

## 3. Fluxo novo
```
bruto.md ──► roteiro.md ──► plano-slides (slides.json + plano.md + wireframes) ──► carrossel.html + png/
 (Oliver,     (roteirista/     (diretor de arte: sistema, layout por slide,          (designer: produz pelo
  ideia,       ig-post:          camadas, ritmo; lint do plano)                       sistema de layouts)
  transcrição) tópicos/etapas)                                                              │
                                                                                            ▼
                                              crítica isolada (revisor Opus, só PNG + plano + rubrica)
                                                            + lint determinístico (check.mjs)
                                                                                            │
                                                                                            ▼
                                              implementador (designer em sessão limpa: aplica, re-renderiza;
                                              aceita só se a nota subir; máx. 3 rodadas) ──► aval do Oliver
```
| etapa | quem | entrega |
|---|---|---|
| 0 bruto | Oliver / app (Novo conteúdo) | `bruto.md` (texto livre, transcrição, ideia, link) |
| 1 tópicos | `roteirista` + `ig-post` | `roteiro.md`: tese, tópicos/etapas, texto slide a slide (já existe; ganha a seção "tópicos") |
| 2 plano de slides | **skill nova `plano-de-slides`** (agente `designer`, chapéu de diretor de arte) | `slides.json` + `plano.md` + `wireframes.png` (folha com os layouts em blocos cinza) |
| 3 produção | skill `carousel` reescrita (agente `designer`) | `carrossel.html` + `png/` + `contato.png` (folha do feed) |
| 4 crítica | agente `revisor` (Opus), contexto limpo | `critica-N.md` (rubrica, P0–P3, região, correção direcional) + saída do `check.mjs` |
| 5 implementação | agente `designer` novo (Sonnet), contexto limpo, lê só a crítica + arquivos | nova versão `v2/`, nota antes/depois |
| 6 aval | Oliver no app (aba Slides com pinos) | `revisao.json` → volta ao 5 |

## 4. Peças a construir
**A. `plano-de-slides` (skill nova)** — o "plano de cenas" do carrossel:
1. lê `roteiro.md`; quebra em **unidades** (gancho, contexto, tensão, virada, prova, síntese, CTA) com o papel de cada slide no arco;
2. **sistema do carrossel** em 1 linha ("leitura de design") + motivo visual que atravessa os slides (ex.: as 5 janelas de app que viram uma só);
3. **ficha por slide**: papel · família de layout (catálogo) · elemento herói · hierarquia (âncora/apoio/rótulo/meta) · fundo sólido · camadas e detalhes (com função) · o que liga ao slide vizinho;
4. regras mecânicas: vizinhos nunca com a mesma família; ≥ 4 famílias em 8 slides; respiro a cada 3–4; gradiente local no máx. 1 slide;
5. `node tools/carrossel/plano.mjs check` + wireframes; autocrítica contra "o default previsível".

**B. `carousel` reescrita (motor)** — sistema de design em vez de template único:
- `references/sistema.css`: grid 6 col, escala 8, escala tipográfica, componentes de detalhe (eyebrow, índice, hairline, régua, card em camadas, chip, número gigante, moldura com marcas, citação com Fraunces, fragmento de UI);
- `references/layouts/`: **~12 famílias** (capa tipográfica, capa com objeto, split 50/50, campo de cor sólida, número gigante, citação, lista em trilho, pilha de cards, comparação, zoom/detalhe, diagrama, CTA) com HTML de referência e quando usar;
- render com `deviceScaleFactor` e espera de fontes; **folha de contato do feed** (3 por linha, recorte 3:4) e do carrossel em sequência.

**C. `tools/carrossel/check.mjs` (lint sem LLM, no navegador)**: texto fora da margem, fonte < mínimo, contraste medido, ocupação (área vazia > X%), vizinhos com mesma família, eyebrow/card acima do teto, gradiente em mais de 1 slide, placeholder, cor fora do `brand.css`.

**D. Crítica e implementação**: `references/rubrica.md` (10 critérios 0–4, eliminatórios, pesos: originalidade e qualidade > craft), prompt do crítico isolado (persona: diretor de arte cético de estúdio de branding; só vê PNG, `slides.json`, BRAND e rubrica), prompt do implementador (aplica P0/P1, recusa com motivo, compara notas). Ligado ao `orquestrar` e ao `heartbeat`.

**E. Prova**: refazer o origin story (T-0012) pelo fluxo novo e comparar lado a lado com a v1.

## 5. Decisões do Oliver (antes de construir)
Respondidas em 2026-10-09:
1. **Cor:** quase sempre **tons e variações da cor principal da marca** (claros e escuros); pastéis só como cor **semântica** (de uma funcionalidade, categoria). → **F. Paleta tonal no kit de marca:** a partir da cor principal, gerar automaticamente a escala clara→escura (50…950) e sugestões, visível e escolhível no app (Contexto e marca → Kit de marca), gravada no `brand.json` → `brand.css` (`--tone-50` … `--tone-950`).
2. **Contraste:** um **verificador de contraste** que o Claude usa ao gerar posts **e vídeos**: mede no navegador cada texto contra o fundo real (não só pares de token). → **G. `tools/contrast.mjs --html`**.
3. **Ênfase:** rara — no máximo 1 a cada 3 slides, alternando coral e Fraunces itálico, só na palavra da virada.
4. **Escopo:** tudo (A–G) + refazer o origin story lado a lado com a v1.
5. **Rodadas:** crítica → implementação automática até 3 rodadas, aceita só se a nota subir, guarda a melhor; mostra a final com as notas.

## Ondas
- **Onda 1 (paralelo):** F paleta tonal (Sonnet) · G contraste no navegador (Sonnet) · A–D motor + plano + lint + rubrica (Opus, design).
- **Onda 2:** prova no origin story: plano → produção → crítica isolada (revisor Opus) → implementador (Sonnet, contexto limpo) ×≤3 → comparação v1 × final.

## Log
- 2026-10-09 · diagnóstico do origin story + 2 pesquisas (Sonnet) + esta proposta.
- 2026-10-09 · A–D construídos (Opus): skill `plano-de-slides` (slides.json + plano.md + wireframes; exemplo em `references/exemplo/`) · `carousel` reescrita (`sistema.css`, 12 famílias em `references/layouts/` + `INDEX.md`, `catalogo.html` → `references/catalogo/png` + `contato.png`, `base.html`; `template.html` e os `layout.html` dos fmt-* saíram) · `render.mjs` (--escala, fontes, contato com grade do perfil) · `scripts/catalogo.mjs` (catálogo + `--expandir` tokens) · `tools/carrossel/check.mjs` (lint + contraste via `contraste-pagina.mjs`) · `tools/carrossel/plano.mjs` (check + wireframes) · `rubrica.md` (10 critérios com peso, P0–P3, prompts do crítico e do implementador, ciclo de 3) · designer/revisor/orquestrar/ig-post (Tópicos)/fmt-* de imagem/CLAUDE.md. Próximo: onda 2 (origin story pelo fluxo novo).
