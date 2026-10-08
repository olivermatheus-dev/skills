# 029 — Motor de curadoria e séries automáticas

Status: rascunho (análise feita, aguardando aval do Oliver) · Depende de: 027 (formatos), 028 (mockups) · Conversa com: 012 (motor de ideias)
Pedido do Oliver em 2026-10-07: descobrir quais tipos de conteúdo dá para gerar com qualidade alta por um **processo quase automático**, com skills que pesquisam e puxam material (notícias, pesquisas, conteúdos).

**Diferença para a 012:** a 012 olha **criadores e concorrentes** (o que viraliza, ganchos, formatos). A 029 olha **material de fonte** (estudos, notícias, livros, documentos oficiais) para alimentar séries fixas. As duas desembocam no mesmo banco de ideias e na mesma ficha de pauta.

## 1. Decisões do Oliver (2026-10-07)
- **Séries aprovadas:** 3 Mito, verdade ou… depende? · 4 Só quem atende entende · 6 Salva isso para depois · 8 kz na prática · 12 kz recomenda. Cortadas: 1, 2, 5, 7, 9, 10, 11 (o motor de pesquisa ainda cobre notícias e estudos, que alimentam 3 e 12).
- **Instagram = vitrine**, não máquina de engajamento. Os 12 primeiros posts montam um feed de empresa de tecnologia de ponta: bonito, útil, com copy forte e **focado nas melhores partes do produto**.

## 2. O que dá para automatizar (por série)
O que define se uma série automatiza bem: **a fonte é estruturada?** (API/RSS), **a moldura é fixa?** (mesma estrutura de copy e de layout), **o risco de erro é checável por script?** (link, DOI, citação existe na fonte).

| série | fonte | automação da pesquisa | automação da produção | gargalo humano | risco |
|---|---|---|---|---|---|
| **12 kz recomenda** | catálogo de fontes (CFP, relatórios, livros, podcasts, estudos) | **alta**: RSS e APIs, triagem barata | **alta**: template fixo (capa do recurso + 3 motivos + para quem) | marcar o que vale recomendar | recomendar algo que ninguém leu → regra: só com resumo do editor/abstract e link; livro só se o Oliver ou o time conhecer |
| **3 Mito, verdade ou… depende?** | banco de mitos + bases científicas | **alta**: PubMed, Europe PMC, OpenAlex, SciELO (todas grátis) | **alta**: template fixo (afirmação → veredito → nuance → fonte) | aprovar o veredito | afirmar além da evidência → regra: veredito com nível de evidência e DOI; o `revisor` confere se a frase está no abstract |
| **6 Salva isso para depois** | práticas de consultório, documentos do CFP, o próprio produto | média: banco de temas + pesquisa pontual | **alta**: checklist/mini-framework em carrossel fixo | escolher os temas | regra do CFP citada errado → conferir no documento oficial |
| **4 Só quem atende entende** | dores reais (AUDIENCE, entrevistas, comentários, Reclame Aqui de concorrentes, fóruns de terapeutas) | média: coleta de frases reais | **alta**: gerar 20 variações e o Oliver escolhe 2 (`fmt-meme`) | **humor é gosto**: só o Oliver aprova | piada que expõe paciente → nunca |
| **8 kz na prática** | **o próprio produto** (inventário de funcionalidades + prints) | baixa necessidade: a fonte é interna | **alta depois do inventário**: mockup + `fmt-recorte-funcionalidade` | prints e confirmar o que o produto faz | prometer o que não existe → só funcionalidade confirmada no inventário |

**Conclusão:** 12 e 3 são as séries mais automatizáveis (fonte estruturada + moldura fixa + checagem por script). 6 e 8 automatizam a produção depois de um trabalho único (banco de temas, inventário do produto). 4 automatiza a geração, mas a curadoria do humor é do Oliver.

## 3. Fontes (grátis por padrão)
| tipo | fontes | como puxar |
|---|---|---|
| **Pesquisas** | PubMed (E-utilities), Europe PMC, OpenAlex, Semantic Scholar, SciELO (pt-BR), Cochrane | APIs grátis; filtro: revisão sistemática/meta-análise primeiro, últimos 3 anos, idioma |
| **Notícias** | Google News RSS por consulta ("CFP", "terapia online", "saúde mental trabalho", "psicologia IA"), site do CFP e dos CRPs, Agência Brasil (saúde) | RSS; onde não houver, vigiar a página (diff do HTML) |
| **Documentos oficiais** | resoluções e notas técnicas do CFP, Ministério da Saúde, OMS/OPAS | vigiar páginas de publicação |
| **Livros** | Google Books / Open Library (dados e sinopse), listas das editoras de psicologia | API; recomendação só com aval humano |
| **Podcasts e vídeos** | feeds RSS de podcasts do tema; YouTube via `tools/intel/` (já existe, 012) | RSS / coletor existente |

Lista viva por empresa em `companies/<slug>/curadoria/fontes.json` (fonte, tipo, consulta, série que alimenta, peso).

## 4. O fluxo (mesma regra da 012: ninguém analisa tudo)
| # | etapa | quem | custo |
|---|---|---|---|
| 1 | **Coletar** das fontes, deduplicar, normalizar (título, resumo, data, link, DOI, tipo) | script `tools/curadoria/coletar.mjs`, semanal pelo heartbeat (`board/recorrentes.json`) | zero |
| 2 | **Triar**: nota 0–10 com rubrica fixa (relevância para a persona, novidade, força da evidência, "rende qual série?", risco ético/CFP) | modelo mais barato, só título + resumo | centavos |
| 3 | **Painel** ordenado por nota → **Oliver marca** ✓/✗ | app (mesma tela do banco de ideias) | — |
| 4 | **Aprofundar só o marcado**: lê abstract/texto, extrai 3–5 afirmações com citação literal curta + link/DOI | `pesquisador` (Sonnet) | baixo |
| 5 | **Verificar por script**: link abre, DOI resolve, cada citação existe no texto baixado | script | zero |
| 6 | **Ficha de pauta** na moldura da série → `ig-post` → formato → `carousel` → `revisor` | agentes, via Kanban | médio |

## 5. O que garante qualidade sem o Oliver revisar tudo
1. **Ficha por série** (`companies/<slug>/series/<serie>.md`): mecânica, estrutura de copy slide a slide, layout, fontes permitidas, checklist e **exemplos aprovados** (a IA copia o padrão do que o Oliver já aprovou).
2. **Template visual fixo por série**: o feed fica coeso (vitrine) e a produção vira preencher campos.
3. **Checagem por script** de link, DOI e citação (passo 5): a parte que mais erra deixa de depender de LLM.
4. **Portões do Oliver só em dois pontos**: marcar na triagem e aprovar a peça final.

## 6. Skills e arquivos propostos
- **Skill nova `curadoria`** (agente `pesquisador`): fontes → coleta → triagem → painel → aprofundamento → verificação. Reaproveita `tools/intel/` (normalização, coletores) e o banco de ideias da 012.
- **Fichas de série** em `companies/kz/series/` (3, 4, 6, 8, 12), lidas pela `ig-post` e pela `content-ideas` quando a pauta tiver `serie`.
- **Inventário do produto** `companies/kz/context/PRODUTO.md`: cada funcionalidade → dor que resolve → print/captura → benefício em 1 frase → status (confirmada/em breve). É a fonte da série 8 e trava promessa falsa.
- **Banco de mitos** e **banco de situações** (`companies/kz/series/banco-*.md`): alimentados uma vez e crescendo com a coleta.
- Campo `serie` no `peca.json` (schema) para medir retorno por série.

## 7. Os 12 primeiros posts (vitrine)
Proposta de mix (ajustar com o Oliver na 006):
- **6 kz na prática**: as melhores partes do produto (agenda com recorrência, videochamada com sala de espera, notas de sessão, portal do paciente, lembrete no WhatsApp, perfil público). Mockup premium + copy de dor → solução.
- **2 Salva isso para depois** (ex.: checklist antes da sessão online; fechamento do dia).
- **2 Mito, verdade ou… depende?** (ex.: "terapia online funciona menos?", com fonte).
- **1 kz recomenda** e **1 Só quem atende entende**.
- **Grade pensada em linhas de 3** (o perfil é visto como mosaico): alternar produto / educativo / produto; capa de cada série com assinatura visual própria. **3 fixados:** o que é a kz, origin story, a melhor funcionalidade.

## 8. Ordem sugerida
1. **Inventário do produto + prints** (Oliver confirma o que existe; destrava a série 8 e metade da vitrine). Pode começar já.
2. **Fichas das 5 séries** com estrutura de copy e template visual (1 exemplo aprovado de cada = parte da 027 fase B).
3. **Coletor de pesquisas e notícias** (PubMed/OpenAlex/SciELO + Google News RSS) → triagem → painel.
4. Verificação por script e recorrência semanal no heartbeat.

## Perguntas para o Oliver
1. Concorda com o mix da vitrine (6 produto + 6 valor)?
2. Quais 6 funcionalidades são "as melhores partes"? Há alguma ainda não pronta que não pode aparecer?
3. kz recomenda: só material que alguém do time conhece, ou pode recomendar estudo/relatório só pelo abstract?
4. Idioma das fontes científicas: aceita estudo em inglês (explicado em pt-BR) ou prioriza SciELO?

## Log
- 2026-10-07 — criada a partir da análise pedida pelo Oliver; séries 3, 4, 6, 8, 12 aprovadas; Instagram como vitrine.
