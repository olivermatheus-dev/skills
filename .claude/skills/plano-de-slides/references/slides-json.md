# Contrato do `slides.json`

Fica na pasta da peça (`companies/<slug>/contents/<ID>-<slug>/slides.json`). É a fonte do `carrossel.html`: o designer monta um `<section class="slide fundo-<fundo>" data-layout="<familia>">` por item de `slides`, na ordem. Conferência: `node tools/carrossel/plano.mjs check <pasta>`. Exemplo completo (12 slides, todas as famílias): `references/exemplo/slides.json`.

## Topo
| campo | obrigatório | o que é |
|---|---|---|
| `versao` | ✓ | `1` |
| `peca` | ✓ | id da pasta (`C0001-origin-story`) |
| `empresa` | ✓ | slug (`kz`); o `wireframes` lê os tons do `brand.css` dela |
| `formato` | ✓ | `1080x1350` (padrão) · `1080x1080` · `1080x1920` |
| `leitura` | ✓ | **leitura de design em 1 linha**: tipo de peça · público · tom · família estética ("carta de fundador, editorial e calma, voz de par para terapeuta autônoma, tipo grande em grafite sobre creme, coral só em pontos") |
| `motivo` | ✓ | `{ o_que, evolucao, identidade }`: o objeto/forma que atravessa os slides, como ele muda com a história (entra → acumula → converge → resolve) e o que nunca muda nele (quantidade, ícone, cor) |
| `sistema` | | `{ fundos: [...], enfase: ["serifa","cor"], dials: { variancia 1–10, densidade 1–10 } }`: as travas desta peça (variância alta em provocação, baixa em educativo) |
| `autocritica` | ✓ | 2–4 linhas: "o default seria X; trocamos por Y porque Z" |

## Cada slide (`slides[]`)
| campo | obrigatório | valores / regra |
|---|---|---|
| `n` | ✓ | 1…N, na ordem |
| `papel` | ✓ | `gancho` · `contexto` · `tensao` · `virada` · `prova` · `sintese` · `cta` (o lugar no arco) |
| `familia` | ✓ | uma das 12 de `.claude/skills/carousel/references/layouts/INDEX.md` (`node tools/carrossel/plano.mjs familias`) |
| `fundo` | ✓ | `creme` · `branco` · `tom-50` · `tom-100` · `tom-200` · `tom-300` · `tom-800` · `tom-900` |
| `densidade` | ✓ | `leve` (respiro) · `media` · `densa` |
| `heroi` | ✓ | o elemento que o olho vê primeiro, concreto ("o numeral 2", "a pilha de 5 cards tortos") |
| `texto` | ✓ | `{ ancora, apoio, rotulo, meta }`: texto exato do roteiro por nível. `rotulo` = eyebrow (≤ 1 a cada 3 slides). `meta` = "arraste", "dados ilustrativos" |
| `hierarquia` | | tamanhos por nível quando sair do padrão ("âncora 136 · apoio 48") |
| `camadas` | ✓ | `[{ o_que, funcao, gradiente? }]`: cada detalhe com a **função** (sem função, sai). `gradiente: true` marca o único gradiente local |
| `liga` | ✓ (menos o último) | `{ anterior, proximo }`: o que passa de um slide para o outro (o motivo, a cor, a posição do olho) |
| `enfase` | ✓ | `null` ou `{ tipo: "cor"|"serifa", palavra }`: só a palavra da virada |
| `notas` | | o que o designer precisa saber (foto a confirmar, dado a checar) |

## Regras mecânicas (o `check` mede)
- ✗ família ou fundo fora da lista · camada sem função · capa (s1) fora de `capa-*` ou com > 10 palavras na âncora.
- ✗ **vizinhos com a mesma família** · < 4 famílias em 8+ slides.
- ✗ 4 slides seguidos sem `densidade: leve` (respiro a cada 3–4).
- ✗ ênfase em mais de 1 slide numa janela de 3 (citação conta como serifa) · gradiente em mais de 1 slide · rótulo em mais de 1/3.
- ⚠ ênfases seguidas do mesmo tipo · 3 fundos iguais seguidos · escuros > 1/3 · card > 40% · âncora+apoio > 35 palavras · último ≠ `cta` · sem `liga.proximo` · sem autocrítica.

## Fundos e significado (kz)
`creme`/`branco` = padrão (~60%) · `tom-50`/`tom-100` = variação clara · `tom-200`/`tom-300` = campo de cor (inteiro ou parcial no `split`) · `tom-800`/`tom-900` = virada, golpe, CTA (≤ 1/3). Pastéis não são fundo (só cor semântica dentro de UI).
