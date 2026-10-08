# 041 — Fontes e referências (catálogo no app que a IA usa para pesquisar ideias e temas)

**Status:** desenho (registrada pelo orquestrador em 2026-10-08). Um Opus no papel de estrategista de conteúdo e pesquisador desenha (`DESENHO.md`) → aval → implementação.
**É a 1ª peça da 029** (motor de curadoria), que já previa `companies/<slug>/curadoria/fontes.json` (seção 3 do TASK da 029: pesquisas, notícias, documentos oficiais, livros, podcasts). **Conversa com:** 012 (motor de ideias), skill `content-ideas`, agente `pesquisador`, 040 (análise de conteúdos).
**Correção de regra:** a 029 previa coleta "semanal pelo heartbeat"; pela regra do hub (nada agendado), tudo aqui roda **sob comando**.

## Pedido do Oliver (2026-10-08, ditado)
- Um lugar no app, integrado à produção de conteúdo, para **salvar fontes e referências**: revistas e periódicos científicos, sites de informação, etc.
- Cada fonte tem **link, nome e tipo**, e o que mais for útil para a IA usar.
- Quando o Claude pesquisar **ideias e temas de conteúdo**, ele **dispara subagentes nas fontes específicas** (um por fonte ou por grupo) e usa essas fontes como referência para encontrar e listar ideias e temas.
- Disparar tem que ser fácil (regra em `roadmap/APP.md` > Princípio central): um clique, diálogo simples.

## Brief para o desenho
1. **Modelo da fonte** (schema Zod em `schema/`, arquivo em `companies/<slug>/curadoria/fontes.json` ou um arquivo por fonte): nome, link, tipo (vocabulário: periódico científico, base de artigos, notícia, órgão oficial/conselho, livro/editora, podcast, newsletter, perfil/criador, outro), idioma, como a IA consulta (API/RSS/busca no site/página a vigiar), consulta padrão ou palavras-chave, temas/pilares e séries que alimenta (`CONTENT_STRATEGY.md`, 029), confiabilidade/peso, notas, ativa/pausada, último uso. Diferença entre **fonte** (onde procurar) e **referência** (um item salvo: artigo, notícia, post) e onde a referência mora (banco de ideias da 012? arquivo próprio?).
2. **Tela**: página "Fontes" (onde fica na navegação: dentro de Ideias? item próprio?), lista/tabela com filtros por tipo e tema, adicionar colando o link (a IA sugere nome, tipo e consulta e o Oliver confirma), editar, pausar.
3. **Disparo**: botão "Pesquisar ideias" → diálogo (tema ou pilar, quais fontes (padrão: as ativas daquele tema), período, quantas ideias) → grava um pedido de fila → o Claude Code roda: subagentes por fonte (Haiku/Sonnet para buscar e resumir; Opus só para a síntese e o ranking de ideias) → ideias no banco (012) com a fonte e o link de cada uma, nada inventado (citação e link verificáveis). Também pelo terminal/skill (`content-ideas` passa a ler as fontes).
4. **Lista inicial sugerida** para a kz (nicho psicologia/terapia no Brasil), marcada como sugestão para o Oliver aceitar: as da seção 3 da 029 e outras que valham (SciELO, PePSIC, CFP, CRPs, periódicos brasileiros de psicologia), com link conferido.
5. **Fases** com critério de pronto e o que reaproveita (029, 012, `tools/intel/`), e perguntas para o Oliver.

## Log
- 2026-10-08 — registrada pelo orquestrador a partir do áudio do Oliver; desenho disparado.
- 2026-10-08 — `DESENHO.md` entregue (pesquisador): schema `curadoria.ts` (Source, SourceRef, ResearchRequest/Result) + campos novos em `idea.ts`, abas Ideias · Fontes · Pesquisas, diálogo Pesquisar ideias, fluxo script → Haiku/Sonnet por grupo → verificação por script → síntese Opus (~US$ 1,30–3,00/rodada, estimado), 43 fontes sugeridas para a kz (36 conferidas, 7 não conferidas), fases F0–F4 e 9 perguntas. Aguarda aval do Oliver (F0).
