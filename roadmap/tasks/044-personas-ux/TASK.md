# 044 — Personas: UX/UI da lista e do painel (cor por persona, ícones, leitura de relance)

**Status:** em revisão (implementado em 2026-10-08, aguardando o orquestrador revisar e commitar).
**Escopo:** `app/src/pages/Personas.tsx`, `app/src/components/personas/*`, `schema/persona.ts`. Não mexe em Concorrentes, `core/*`, `tools/fichas/*` (outras sessões).

## Pedido do Oliver (2026-10-08)
"melhorar a parte de Personas visualmente. Tanto o menu [a lista/página] quanto o sheet [o painel lateral de detalhe]. O sheet está todo branco, sem uma boa UX, sem ficar fácil de identificar as informações. Preciso de uma melhoria de UX/UI, usando ícones, deixando algumas coisas mais compactas, podendo colocar uma cor também para cada persona, deixando tudo mais amigável."

## Diagnóstico (antes) — prints `prints/antes-*`
- **Painel = formulário cru.** Abrir a persona mostrava só campos de edição (textareas com 1 item por linha), tudo branco, rótulos em caixa-alta cinza iguais para tudo. Não havia modo de leitura: para "ver" a persona, lia-se dentro de caixas de texto, com rolagem interna e texto cortado (Dores e Canais cortados no meio).
- **Sem hierarquia nem identidade:** nome longo ("Mariana — a terapeuta que…") repetido no título e no campo; nenhum ícone; dores, desejos e objeções com o mesmo peso visual; consciência só como `<select>`.
- **Lista:** card sem identidade (sem avatar/cor), nome truncado no meio, resumo em 3 linhas, só as dores aparecem (desejos, objeções, gatilhos e frases somem), sem filtro nem busca.

## O que mudou
- **Cor por persona:** campo opcional `color` no schema (`schema/persona.ts`, paleta `PERSONA_COLORS` com 10 tons: índigo, violeta, rosa, vermelho, laranja, âmbar, esmeralda, petróleo, azul, grafite). Vazio = cor automática estável (hash do id). Persona nova nasce com a cor menos usada do projeto. Escolha no painel: clique no avatar (selo de paleta) → popover com as 10 cores + "Automática". Branco sobre a cor ≥ 4,7:1 e texto `ink` sobre o fundo suave ≥ 6,3:1 (`node tools/contrast.mjs`). Os fundos suaves são `color-mix` com `--card`, então acompanham um tema escuro se ele vier a existir.
- **Lista:** filtros por papel (com ícone e contagem) + busca à vista; grade rola por dentro (`FillBox`). Card compacto: faixa superior e avatar na cor, nome curto (o "Nome — apelido" vira nome + subtítulo), papel com ícone, resumo em 2 linhas, ocupação/idade com ícone, consciência na cor da persona, 1 frase real em destaque e contagem de dores/desejos/objeções/gatilhos/canais com ícone. Anti-persona com borda tracejada.
- **Painel:** cabeçalho com identidade (fundo suave da cor, avatar grande, nome + subtítulo, papel e tags, resumo) e fatos em grade (Ocupação, Idade, Consciência com medidor). Seções em cards com ícone Lucide e tom próprio (Dores, Desejos, Objeções, Gatilhos de compra em 2 colunas; Onde encontrar como chips; Frases reais como balões na cor da persona), com contagem. **Leitura por padrão; lápis por bloco** edita só aquele bloco ("Pronto" volta à leitura); "Editar" no cabeçalho edita nome, papel, resumo, dados e tags. Persona nova abre tudo em edição. História e observações recolhível. Rodapé fixo: Salvar só habilita com alteração, aviso "Alterações não salvas", Apagar com ícone.
- Servidor: nada mudou (o `savePersona` do store já valida pelo schema; o campo novo passa a ser gravado).

## Arquivos
- `schema/persona.ts` (campo `color`, `PERSONA_COLORS`)
- `app/src/pages/Personas.tsx` (lista, filtros, busca)
- `app/src/components/personas/identity.tsx` (novo: paleta, cor automática, avatar, papel, seletor de cor)
- `app/src/components/personas/sections.tsx` (novo: seções com ícone e tom)
- `app/src/components/personas/PersonaCard.tsx` (novo)
- `app/src/components/personas/PersonaSheet.tsx` (novo: painel; lógica de salvar/apagar/desfazer mantida)
- `app/src/components/personas/awareness.tsx` (medidor aceita cor)
- `companies/kz/personas/mariana.md` (teste: `color: teal` gravado pelo app; `updated` foi para 2026-10-08)

## Pendências / observações
- O app **não tem tema escuro** (só `:root` claro em `index.css`, nenhuma classe `.dark`); os prints "escuro" ficariam iguais aos claros, por isso não foram feitos. As cores da persona já misturam com `--card` para funcionar quando houver.
- Só há 1 persona no `kz`: filtros e grade com várias personas foram conferidos só no código.

## Log
- 2026-10-08 — registrada. Prints "antes" (`prints/antes-pagina-1280|1920.png`, `antes-sheet-1280|1920.png`).
- 2026-10-08 — implementado (lista + painel + cor). `npx tsc --noEmit -p app` limpo, `npm run validate` limpo, console sem erros da página. Cor salva pelo app persistiu no arquivo e voltou após recarregar. Esc no seletor de cor fecha só o seletor (não dispara o "descartar alterações" do painel). Prints "depois": `depois-pagina`, `depois-sheet`, `depois-cor`, `depois-editar-secao`, `depois-nova` (1280 e 1920).
