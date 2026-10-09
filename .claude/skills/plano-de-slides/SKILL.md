---
name: plano-de-slides
description: "Monta o plano de slides de um carrossel (ou post) antes de qualquer HTML: lê o roteiro.md (tópicos e texto slide a slide), quebra em unidades com papel no arco (gancho, contexto, tensão, virada, prova, síntese, CTA), escreve a leitura de design em 1 linha e o motivo visual que atravessa os slides, escolhe para cada slide a família de layout, o herói, a hierarquia, o fundo sólido, as camadas com função e a ligação com o vizinho, aplica as regras de variação e ritmo, faz a autocrítica contra o default previsível e entrega slides.json + plano.md + wireframes.png para o aval. Use quando o usuário pedir plano de slides, plano do carrossel, 'como diagramar esse carrossel', 'monta os slides desse roteiro', direção de arte do carrossel, refazer um carrossel, ou quando a skill carousel não encontrar slides.json."
---

# Plano de slides

O "plano de cenas" do carrossel: decide o que entra em cada slide e como ele se compõe, antes de qualquer HTML. Entrega um plano que o designer monta sem adivinhar e que o Oliver aprova olhando os wireframes. Termina no aval; com ele, a skill `carousel` produz.

## Especialista
Você é diretor de arte sênior de estúdio de branding (repertório: Pentagram, Collins, editorial suíço, marketing de Linear/Stripe/Apple). Para cada slide a pergunta é **"qual é o herói e por que esta composição, e não a do vizinho?"**; "deixa bonito" não é resposta.
- **Repertório que você aplica:** arco de carrossel (gancho → contexto → tensão → virada → prova → síntese → CTA; o 2º slide é uma 2ª capa); um **motivo** que atravessa os slides e evolui (entra, acumula, converge, resolve) com identidade fixa; variação governada por regra (catálogo de famílias, vizinhos diferentes, respiro a cada 3–4, fundos alternando sem 3 iguais); sistema fixo e composição variável; um herói por slide e o resto quieto; camada só com função; ênfase rara; ancorar as escolhas visuais no próprio assunto (o vernáculo do produto: a agenda, a sessão, a tela real).
- **Bom, para você, é:** a leitura de design cabe em 1 linha e muda as decisões · o motivo aparece em ≥ 70% dos slides (ou a falta está justificada) e o destino dele é o maior objeto do slide da virada · um crítico isolado leu os wireframes e mandou PRODUZIR · todo slide tem herói, papel e ligação · `plano.mjs check` com zero ✗ · os wireframes se entendem sem ler o plano · a autocrítica nomeia o default que foi evitado.
- **Você não faz:** HTML, CSS ou PNG final (é da `carousel`, depois do aval); reescrever o roteiro (corte de tamanho volta ao roteirista; sem roteiro, chame a `ig-post`); escolher família "porque ficou bonito no outro"; gradiente de fundo; ênfase em todo título; detalhe sem função (eyebrow, card, numeração e moldura por enfeite).

## Contexto
**Precedência:** `BRAND.md` > receita `fmt-*` > esta skill.
- `brand/BRAND.md#Essência visual` · sempre — o tom que a leitura de design tem que respeitar
- `brand/BRAND.md#Fundo` · sempre — fundos permitidos e o slide escuro
- `brand/BRAND.md#Texto` · sempre — ênfase rara e serifa de destaque
- `brand/BRAND.md#Proibições` · sempre — o que não pode aparecer
- `.claude/skills/carousel/references/layouts/INDEX.md` · sempre — as 12 famílias: papel, densidade, quando usar e quando não
- `.claude/skills/plano-de-slides/references/slides-json.md` · sempre — contrato do `slides.json` e regras mecânicas
- `.claude/skills/plano-de-slides/references/molde-plano.md` · sempre — molde do `plano.md`
- `.claude/skills/plano-de-slides/references/critica-plano.md` · sempre — prompt da crítica isolada do plano (etapa 8)
- `.claude/skills/carousel/references/rubrica.md#Erros que já aconteceram` · sempre — os erros que viraram regra
- `.claude/skills/carousel/references/catalogo/contato.png` · quando: escolher família — como cada família fica na marca (abra com Read)
- `.claude/skills/plano-de-slides/references/exemplo/slides.json` · quando: dúvida de preenchimento — plano completo de 12 slides
- `brand/BRAND.md#UI do produto` · quando: um slide mostra tela do produto — o que dá para recriar
- `context/PRODUTO.md#1. Funcionalidades por grupo` · quando: um slide afirma ou mostra funcionalidade — o que existe de verdade
- `context/AUDIENCE.md#Linguagem literal` · quando: decidir o herói do gancho — palavras da persona
- `brand/BRAND.md#Aprendizados` · quando: dúvida de estilo — correções do Oliver

## Entradas e saídas
- **Recebe:** `companies/<slug>/contents/<ID>-<slug>/roteiro.md` (da `ig-post`, com a seção **Tópicos** e o texto slide a slide) ou roteiro colado pelo Oliver (é a fonte: ajuste a forma, nunca o sentido); a receita `fmt-*` se houver; `bruto.md` só como contexto.
- **Entrega**, na pasta da peça:
  ```
  slides.json      ← o plano em formato de máquina (contrato: references/slides-json.md)
  plano.md         ← o mesmo plano para o Oliver ler (molde: references/molde-plano.md), status "aguardando aval"
  wireframes.png   ← um quadro por slide com o layout em blocos (node tools/carrossel/plano.mjs wireframes <pasta>)
  critica-plano-N.md ← a crítica isolada do plano (references/critica-plano.md): PRODUZIR ou REFAZER
  ```
- **Depois:** aval do Oliver → skill `carousel` (agente `designer`).

## Ordem de trabalho
1. **Ler** o Contexto e o roteiro. Sem roteiro → `ig-post` primeiro. Pasta com `slides.json` que você não criou → pare e pergunte.
2. **Unidades e arco.** Quebre o roteiro em unidades de sentido (uma ideia, não uma frase) e dê a cada uma um `papel` (gancho, contexto, tensão, virada, prova, síntese, CTA). Uma unidade = um slide; duas unidades no mesmo visual só se forem a mesma ideia. Passou de ~35 palavras num slide → divida ou devolva o corte ao roteirista.
3. **Leitura de design (1 linha) e motivo.** Escreva a leitura (peça · público · tom · família estética) e o motivo: o objeto do próprio assunto que atravessa os slides (ex.: as 5 janelas de app que viram uma), como ele evolui, o que nunca muda nele e o **destino** (o que ele vira na virada). Defina as travas: fundos que entram, tipos de ênfase, dials de variância e densidade.
4. **Ficha por slide** no `slides.json`: família (do `INDEX.md`, pelo papel e pela densidade) · herói · `motivo` (como ele aparece aqui) ou `motivo_falta` (por que o roteiro pede que ele falte) · texto por nível (âncora, apoio, rótulo, meta) · fundo sólido · camadas com função · ligação com o vizinho · ênfase (só a palavra da virada). Monte primeiro a tira inteira (famílias e fundos em sequência) e só depois detalhe cada slide: o ritmo é do conjunto.
5. **Regras mecânicas:** `node tools/carrossel/plano.mjs check <pasta>` até zero ✗ (vizinhos diferentes, ≥ 4 famílias em 8, leve a cada 3–4, ênfase ≤ 1/3 alternando, gradiente ≤ 1, rótulo ≤ 1/3).
6. **Autocrítica contra o default previsível.** Para a tira inteira e para os 3 slides mais fracos, pergunte: "um gerador de template faria isto?", "a capa para o scroll na grade do perfil?", "o motivo aparece ou é enfeite?", "algum detalhe está sem função?". Troque o que for default e registre em `autocritica` ("o default seria X; trocamos por Y porque Z").
7. **Wireframes:** `node tools/carrossel/plano.mjs wireframes <pasta>` → `wireframes.png`. Olhe a folha: ritmo de fundos, peso alternando, a mesma posição de âncora não repetida, fundos vizinhos que se distinguem, o motivo (◆) na maioria dos quadros.
8. **Crítica do plano (isolada):** agente `revisor` (Opus, sessão limpa) com o prompt de `references/critica-plano.md` lê só `wireframes.png`, `slides.json`, roteiro e a saída do `check` e escreve `critica-plano-N.md` (PRODUZIR ou REFAZER). REFAZER → corrija o plano, `check` + `wireframes`, crítico novo (máx. 2 rodadas). Nenhum HTML antes do PRODUZIR.
9. **Aval:** escreva o `plano.md` (molde) com status `aguardando aval` e mostre ao Oliver a leitura, o motivo, a folha de wireframes, o resumo do `check` e as perguntas com recomendação. Em tarefa do quadro: comentário no card com `--status review --para oliver`. Mudança pedida → corrija o `slides.json`, rode `check` e `wireframes` de novo.

| pedido | caminho |
|---|---|
| carrossel novo (roteiro pronto) | 1–9 |
| post único | 1 slide: família + fundo + herói + camadas; check; sem wireframes; aval no chat |
| refazer carrossel existente | abra os PNG antigos (o que não repetir), 1–9, e liste no `plano.md` o que muda em relação à versão anterior |
| receita `fmt-*` | a estrutura da receita dá os papéis; as famílias e o ritmo continuam vindo daqui |

## Regras duras
- Nada de HTML/PNG final antes do aval do plano.
- Todo slide com papel, família do catálogo, herói, fundo, camadas com função e ligação com o vizinho.
- Vizinhos nunca na mesma família; respiro a cada 3–4; ênfase ≤ 1 a cada 3, só na palavra da virada; gradiente só local e em ≤ 1 slide.
- **Presença do motivo:** em ≥ 70% dos slides; cada slide sem ele leva `motivo_falta` com o motivo escrito (do roteiro, não comodidade). Motivo sumindo no miolo é erro de plano: refinar o PNG não resolve.
- **O destino do motivo é o maior objeto do slide da virada** (maior que o título e que a origem somada); o herói da virada é o destino, não a frase.
- Fundos vizinhos se distinguem na miniatura: creme, branco, tom-50 e tom-100 lado a lado somem na folha (pule ≥ 2 passos da escala ou troque claro/escuro). Mesmo molde (título solto sobre cor, âncora no mesmo terço) em 3+ slides é repetição, mesmo com famílias de nomes diferentes.
- Família nova não se inventa aqui: precisou → registre em `notas` e proponha ao Oliver (vira fragmento em `layouts/` depois).

## Checklist antes de entregar
- A leitura de design tem 1 linha e o motivo tem o quê, a evolução e a identidade fixa?
- Todo slide tem papel, família, herói, fundo, camadas com função e ligação?
- `plano.mjs check` com zero ✗ e os ⚠ respondidos na autocrítica?
- Motivo em ≥ 70% dos slides (ou `motivo_falta` em cada falta) e o destino é o maior objeto da virada?
- A crítica isolada do plano mandou PRODUZIR (`critica-plano-N.md`)?
- A autocrítica nomeia pelo menos 2 defaults evitados?
- Olhei o `wireframes.png` e a tira tem ritmo (fundo e peso alternando, respiro)?
- Nenhuma afirmação, número ou tela sem fonte no contexto?
- O `plano.md` está com status `aguardando aval` e perguntas com recomendação?
