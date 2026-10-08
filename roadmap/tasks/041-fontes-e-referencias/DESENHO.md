# 041 — Desenho: Fontes e referências → "Pesquisar ideias"

Desenho de 2026-10-08 (agente `pesquisador`, papel de estrategista de conteúdo e pesquisador). Nada de código do app ainda: este documento espera o aval do Oliver.
Base: brief do `TASK.md`, 029 §3–5 (fontes e fluxo), 012 (banco de ideias, ficha de pauta), skill `content-ideas`, `CONTENT_STRATEGY.md` (pilares 1–6, séries 3 · 4 · 6 · 8 · 12), `APP.md` > Princípio central.

## 0. A ideia em 5 linhas
1. **Fonte** = onde procurar (SciELO, CFP, Agência Brasil…). Cadastro curto, editado pelo Oliver, com "como a IA consulta".
2. **Referência** = um item achado numa fonte (artigo, notícia, resolução) que foi **verificado por script** (link abre, DOI resolve, trecho existe no texto).
3. **Ideia** (012) = pauta com ficha. Ideia vinda de pesquisa **sempre aponta para 1+ referências**; sem referência verificada, não nasce.
4. **Rodada** = um clique em "Pesquisar ideias" → pedido na fila → script busca (grátis) → subagentes baratos triam → script verifica → Opus sintetiza e ranqueia → ideias no banco.
5. Tudo sob comando. Nada agendado (corrige a 029, que previa coleta semanal pelo heartbeat).

**Por que o script vem antes dos subagentes:** metade das fontes boas tem API ou RSS grátis (PubMed, Europe PMC, OpenAlex, Crossref, DOAJ, CFP, Agência Brasil, Google Notícias). O script traz título, resumo, data, DOI e link sem gastar modelo. Subagente só lê o que o script trouxe ou abre as poucas páginas sem API. É a mesma regra da 012: ninguém lê tudo.

---

## 1. Modelo de dados (schema exato)

### 1.1 Onde mora cada coisa
```
companies/<slug>/curadoria/
  fontes.json                       ← cadastro de fontes (Source[]), no git
  referencias/R-NNNN.json           ← 1 arquivo por referência verificada (SourceRef), no git
  rodadas/AAAA-MM-DD-HHmm-<tema>/   ← 1 pasta por rodada, no git (pequeno)
    pedido.json                     ← ResearchRequest (o que o Oliver pediu)
    resultado.json                  ← ResearchResult (ideias criadas, refs, erros por fonte, custo)
data/curadoria/<slug>/<rodada>/     ← fora do git: brutos.json (tudo que o script trouxe), achados.json (triagem), páginas baixadas
companies/<slug>/ideas/I-NNNN-*.md  ← banco de ideias da 012 (ganha campos: origin, refs, pillar, series, round)
```
Por que `fontes.json` único (e não 1 arquivo por fonte): são 20–40 fontes, editadas juntas na mesma tela; um arquivo só é mais simples de ler pela IA. Referências e rodadas crescem sem limite, então são 1 arquivo/pasta cada.

**Nome:** a skill `referencias` e o `intel/referencia.json` já existem com outro sentido (conteúdo de concorrente; a própria empresa no Comparar). Para não confundir: na interface, "Referência"; no código e no schema, `SourceRef` e a pasta `curadoria/referencias/`.

### 1.2 `schema/curadoria.ts` (novo; exportado em `schema/index.ts`)
```ts
import { z } from 'zod';
import { IsoDate, IsoDateTime, Slug, Url, TagList, nullish } from './common';

/** vocabulário do brief */
export const SourceType = z.enum([
  'periodico',        // periódico científico (ex.: Psicologia: Ciência e Profissão)
  'base-artigos',     // base/indexador (SciELO, PePSIC, PubMed, OpenAlex)
  'noticia',          // veículo ou agregador de notícias
  'orgao-oficial',    // CFP, CRPs, Ministério da Saúde, OPAS/OMS
  'livro-editora',    // catálogo de livros ou editora
  'podcast',
  'newsletter',
  'perfil-criador',   // perfil/criador (texto ou vídeo); vídeo de concorrente continua na 012
  'outro',
]);

/** como a IA consulta. `adapter` = qual coletor do script usa (sem LLM); 'web' = subagente lê a página */
export const SourceAccess = z.object({
  method: z.enum(['api', 'rss', 'busca-site', 'pagina', 'web']),
  adapter: nullish(z.enum(['pubmed', 'europepmc', 'openalex', 'crossref', 'doaj', 'openlibrary', 'google-news', 'rss', 'html-diff'])),
  /** URL da API/feed/busca; `{q}` é trocado pela consulta. Ex.: https://news.google.com/rss/search?q={q}&hl=pt-BR&gl=BR&ceid=BR:pt-419 */
  endpoint: nullish(Url.or(z.string().includes('{q}'))),
  /** filtros fixos do adaptador (ex.: { "openalexSource": "S2739370219" } ou { "pubType": "systematic-review" }) */
  filters: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}),
});

export const Source = z.object({
  id: Slug,                                   // ex.: 'scielo', 'cfp-noticias'
  name: z.string().min(1),
  url: Url,                                   // página pública (o que o Oliver abre)
  type: SourceType,
  language: z.enum(['pt', 'en', 'es', 'multi']).default('pt'),
  access: SourceAccess,
  /** consulta padrão quando o pedido não traz tema (texto livre, na sintaxe da fonte) */
  defaultQuery: nullish(z.string()),
  /** palavras-chave somadas ao tema do pedido (ex.: ["psicoterapia", "consultório"]) */
  keywords: z.array(z.string()).default([]),
  /** o que alimenta: números dos pilares e das séries do CONTENT_STRATEGY.md (o validate confere se existem) */
  pillars: z.array(z.number().int().positive()).default([]),
  series: z.array(z.number().int().positive()).default([]),
  tags: TagList,
  /** confiabilidade editorial: 3 = revisão por pares/órgão oficial · 2 = jornalismo profissional · 1 = opinião/criador */
  trust: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  /** prioridade na rodada (1 baixa · 3 alta); a síntese usa para desempatar */
  weight: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(2),
  /** sugerida = proposta pela IA, espera aceite · ativa · pausada · arquivada (recusada ou morta) */
  status: z.enum(['sugerida', 'ativa', 'pausada', 'arquivada']).default('sugerida'),
  notes: z.string().default(''),
  /** quando um humano ou script abriu o link e ele funcionou; null = não conferido */
  verifiedAt: nullish(IsoDate),
  lastUsedAt: nullish(IsoDateTime),           // a rodada atualiza
  addedBy: z.enum(['oliver', 'ai']).default('ai'),
  created: IsoDate,
});
export type Source = z.infer<typeof Source>;
export const SourceList = z.array(Source).superRefine((l, ctx) => {
  const ids = new Set<string>();
  l.forEach((s, i) => { if (ids.has(s.id)) ctx.addIssue({ code: 'custom', path: [i, 'id'], message: `id repetido: ${s.id}` }); ids.add(s.id); });
});

/** companies/<slug>/curadoria/referencias/R-NNNN.json — um item achado e VERIFICADO */
export const SourceRef = z.object({
  id: z.string().regex(/^R-\d{4}$/),
  sourceId: Slug,                             // de qual fonte veio
  kind: z.enum(['artigo', 'revisao', 'noticia', 'documento-oficial', 'livro', 'podcast', 'post', 'outro']),
  title: z.string().min(1),                   // título original, sem tradução
  url: Url,                                   // link que abre o item (não a home da fonte)
  doi: nullish(z.string().regex(/^10\.\d{4,9}\/\S+$/)),
  authors: z.array(z.string()).default([]),
  venue: nullish(z.string()),                 // periódico, veículo ou órgão
  publishedAt: nullish(IsoDate),
  language: z.enum(['pt', 'en', 'es', 'outro']).default('pt'),
  /** só para artigo/revisão: o que o resumo declara (não o que a IA acha) */
  evidence: nullish(z.enum(['meta-analise', 'revisao-sistematica', 'ensaio-clinico', 'observacional', 'qualitativo', 'revisao-narrativa', 'documento', 'opiniao'])),
  /** trecho LITERAL curto (≤ 40 palavras) que sustenta a ideia, e de onde saiu */
  quote: z.string().min(1).max(400),
  quoteFrom: z.enum(['resumo', 'texto-completo', 'pagina', 'feed']),
  /** paráfrase em pt-BR, palavras nossas (o que o item diz, sem extrapolar) */
  summary: z.string().min(1),
  verify: z.object({
    checkedAt: IsoDateTime,
    linkOk: z.boolean(),
    doiOk: nullish(z.boolean()),              // null quando não há DOI
    quoteFound: z.boolean(),                  // o trecho existe no texto baixado (normalizado)
  }).refine((v) => v.linkOk && v.quoteFound && v.doiOk !== false, 'referência só existe se o link abrir, o DOI resolver e o trecho for achado'),
  round: nullish(z.string()),                 // pasta da rodada que achou
  ideas: z.array(z.string().regex(/^I-\d{4}$/)).default([]),
  starred: z.boolean().default(false),        // ★ do Oliver (vale guardar mesmo sem ideia)
  created: IsoDate,
});
export type SourceRef = z.infer<typeof SourceRef>;

/** curadoria/rodadas/<id>/pedido.json — o que o Oliver pediu no diálogo (a IA consome) */
export const ResearchRequest = z.object({
  id: z.string().regex(/^\d{4}-\d{2}-\d{2}-\d{4}-[a-z0-9-]+$/),
  topic: nullish(z.string()),                 // tema livre; ou pilar/série abaixo (pelo menos um dos três)
  pillar: nullish(z.number().int().positive()),
  series: nullish(z.number().int().positive()),
  sources: z.array(Slug).min(1),              // padrão do diálogo: as ativas do pilar/série
  period: z.object({ from: IsoDate, to: IsoDate }),
  maxIdeas: z.number().int().min(1).max(20).default(8),
  depth: z.enum(['rapida', 'normal']).default('normal'), // rápida = só fontes com API/RSS, sem subagente Sonnet
  languages: z.array(z.enum(['pt', 'en', 'es'])).default(['pt', 'en']),
  instructions: z.string().default(''),
  estimate: z.object({ minutes: z.number(), usdLow: z.number(), usdHigh: z.number() }),
  requestedAt: IsoDateTime,
  status: z.enum(['pendente', 'rodando', 'feito', 'erro']).default('pendente'),
}).refine((r) => r.topic || r.pillar || r.series, 'informe tema, pilar ou série');

/** curadoria/rodadas/<id>/resultado.json — o que voltou (o app mostra na aba Pesquisas) */
export const ResearchResult = z.object({
  finishedAt: IsoDateTime,
  perSource: z.array(z.object({
    sourceId: Slug,
    status: z.enum(['ok', 'vazio', 'erro', 'bloqueado']),
    fetched: z.number().int(),                // itens que o script trouxe
    kept: z.number().int(),                   // passaram na triagem
    verified: z.number().int(),               // passaram na verificação
    error: nullish(z.string()),
  })),
  ideas: z.array(z.string().regex(/^I-\d{4}$/)),
  refs: z.array(z.string().regex(/^R-\d{4}$/)),
  dropped: z.array(z.object({ title: z.string(), url: Url, reason: z.string() })).default([]), // o que caiu na verificação (transparência)
  cost: nullish(z.object({ usd: z.number(), byModel: z.record(z.string(), z.number()) })), // tools/usage.mjs
  notes: z.string().default(''),
});
```

### 1.3 Mudança em `schema/idea.ts` (compatível com as ideias atuais)
```ts
  origin: z.enum(['concorrente', 'pesquisa', 'manual']).default('manual'),
  refs: z.array(z.string().regex(/^R-\d{4}$/)).default([]),   // referências verificadas que sustentam a ideia
  pillar: nullish(z.number().int().positive()),
  series: nullish(z.number().int().positive()),
  round: nullish(z.string()),                                  // rodada que gerou
  score: nullish(z.number().min(0).max(10)),                   // nota da síntese (ranking)
// + .superRefine: origin === 'pesquisa' exige refs.length >= 1
```
`source` (concorrente/plataforma/item) continua igual para ideias vindas da 012.

### 1.4 Como a ideia guarda fonte e link verificáveis
Três camadas, da máquina para o humano:
1. **Frontmatter** da ideia: `refs: [R-0012, R-0015]` → cada `R-NNNN.json` tem `url`, `doi`, `quote` literal, `quoteFrom` e o carimbo `verify` (link, DOI, trecho). O schema recusa referência sem os três ok.
2. **Corpo da ideia** (ficha de pauta da 012) ganha a seção `## Fontes`, escrita pela rodada:
   ```
   ## Fontes
   - [R-0012] Título original do artigo — Psicologia: Ciência e Profissão, 2025. https://doi.org/10.xxxx/... (revisão sistemática)
     Trecho do resumo: "…trecho literal curto…"
     O que dá para afirmar: paráfrase de 1 linha, sem ir além do trecho.
   ```
3. **Prova** da ficha (item 6 da 012) aponta para `R-NNNN`, nunca para "estudos mostram".

Regras duras (vão para a skill e para o `revisor`):
- Afirmação técnica só com referência de `trust: 3`. Notícia (`trust: 2`) é **gatilho** de pauta, não prova: se a notícia cita um estudo, a rodada busca o estudo original.
- O trecho é literal e curto (≤ 40 palavras): serve para conferir, não para copiar. A peça usa paráfrase.
- Artigo pago: vale o resumo (`quoteFrom: resumo`); a ideia não pode afirmar o que só estaria no texto completo.
- Série 12 (kz recomenda) com livro: a referência existe, mas a ideia nasce com `status: nova` e a nota "precisa de alguém que leu" (029, pergunta 3).
- Nicho de saúde: nada de promessa de resultado terapêutico nem caso de paciente.

---

## 2. Tela

### 2.1 Onde fica
**Recomendação: abas dentro de Ideias** (`Ideias · Fontes · Pesquisas`), sem item novo no menu. Motivo: fonte só existe para gerar ideia; o botão "Pesquisar ideias" fica no cabeçalho das três abas e o resultado cai na aba Ideias, no mesmo lugar. Item próprio no menu faria sentido só se Fontes virar biblioteca de leitura do Oliver (pergunta 1).
Rotas: `ideias` (banco, como hoje) · `ideias/fontes` · `ideias/pesquisas` · `ideias/pesquisas/:rodada`. Em `pages/index.ts`, `children` no item Ideias (mesmo padrão de Concorrentes).

Ícones (Lucide, nomes conferidos no pacote `lucide-react` 1.53 do repo):
| uso | ícone |
|---|---|
| aba Ideias / menu | `Lightbulb` (já é) |
| aba Fontes | `Library` |
| aba Pesquisas (histórico de rodadas) | `ScrollText` |
| botão Pesquisar ideias | `Sparkles` |
| tipos: periódico · base · notícia · órgão · livro · podcast · newsletter · criador · outro | `BookOpen` · `Database` · `Newspaper` · `Landmark` · `Library` · `Mic` · `Mail` · `UserRound` · `Shapes` |
| como consulta: API · RSS · página/web | `FlaskConical` · `Rss` · `Globe` |
| link conferido / não conferido | `ShieldCheck` / `CircleAlert` |
| trecho literal | `Quote` |
| pausar / ativar / editar / adicionar / abrir | `Pause` / `Play` / `Pencil` / `Plus` / `ExternalLink` |
| filtros · tempo · custo | `ListFilter` · `Clock` · `Coins` |

### 2.2 Página Fontes
```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ Ideias                                                    [Pesquisar ideias]   │
│ [Ideias 24]  [Fontes 31]  [Pesquisas 3]                                   │
├──────────────────────────────────────────────────────────────────────────────────┤
│ (!) 14 fontes sugeridas esperando você            [Ver sugeridas]  [Aceitar todas] │
├──────────────────────────────────────────────────────────────────────────────────┤
│ [buscar nome ou domínio____]  Tipo [Todos ▾]  Pilar/série [Todos ▾]           │
│ Status [Ativas ▾]  Idioma [Todos ▾]                         [+ Adicionar fonte]  │
├───┬───────────────────────────────┬────────────┬──────────┬───────────┬────┬──────┤
│ ● │ Fonte                         │ Tipo       │ Consulta │ Alimenta  │Peso│ Uso  │
├───┼───────────────────────────────┼────────────┼──────────┼───────────┼────┼──────┤
│ ● │ PubMed                   [ok] │ Base       │ API      │ P4 P6 S3  │ ●●●│ 2 d  │
│   │ pubmed.ncbi.nlm.nih.gov     ↗ │            │          │           │    │ II / │
│ ● │ CFP: notícias            [ok] │ Órgão      │ RSS      │ P4 P6 S6  │ ●●●│ —    │
│ ● │ Psicologia: Ciência e P. [ok] │ Periódico  │ API*     │ P4 S3     │ ●● │ —    │
│ ○ │ Cochrane Library         (!)  │ Base       │ Web      │ S3        │ ●● │ —    │
│   │ não conferido: bloqueio anti-robô                                 │ Aceitar ✕ │
└───┴───────────────────────────────┴────────────┴──────────┴───────────┴────┴──────┘
  ● ativa  ◐ pausada  ○ sugerida · [ok] link conferido (ShieldCheck) · (!) não conferido (CircleAlert)
  ↗ abrir (ExternalLink) · II pausar (Pause) · / editar (Pencil) · * via OpenAlex
  No app, cada marcador do desenho é o ícone Lucide da tabela 2.1 (nada de emoji).
```
- Clique na linha → gaveta (`Drawer`, como em Ideias) com todos os campos, notas, "últimas referências desta fonte" e "ideias que esta fonte gerou" (sinal para o peso).
- Ação rápida por linha: pausar/ativar, abrir o link, editar. Arquivar fica dentro da gaveta.

### 2.3 Adicionar fonte (colar o link)
```
┌ Adicionar fonte ─────────────────────────────────────────┐
│ Link  [https://www.scielo.br/j/pcp/_______________]  [→] │
│                                                          │
│ ✓ abriu · título da página: "Psicologia: Ciência e       │
│   Profissão" · feed RSS: não achado · API: via OpenAlex  │
│                                                          │
│ Nome   [Psicologia: Ciência e Profissão        ]         │
│ Tipo   [Periódico científico ▾]  Idioma [pt ▾]           │
│ Consulta [API · OpenAlex ▾] (sugerido)                   │
│ Alimenta  Pilares [4] [6]   Séries [3]  [+]              │
│ Confiabilidade (●●●) revisão por pares                   │
│ ▸ Avançado (palavras-chave, consulta padrão, peso, notas)│
│                                  [Cancelar] [Salvar]     │
└──────────────────────────────────────────────────────────┘
```
Sugestão **sem IA** na fase 1 (script no servidor): abre o link, lê `<title>`, procura `<link rel="alternate" type="application/rss+xml">`, reconhece domínios conhecidos (lista em código: `scielo.br/j/*` → periódico via OpenAlex; `*.org.br` de CRP → órgão; `news.google.com` → notícia…). Só se o script não reconhecer, o botão "Pedir à IA" (Haiku, centavos) preenche tipo e consulta. O Oliver sempre confirma.

### 2.4 Diálogo "Pesquisar ideias" (um clique, padrões preenchidos)
```
┌ Pesquisar ideias ───────────────────────────────────────────────┐
│ Sobre o quê?                                                      │
│ (●) Série  [3 · Mito, verdade ou… depende? ▾]                     │
│ ( ) Pilar  [6 · Conversa do ofício ▾]                             │
│ ( ) Tema   [ex.: terapia online, cansaço do terapeuta_______]     │
│                                                                   │
│ Fontes    9 ativas desta série  [PubMed] [SciELO] [PePSIC] [+6]   │
│           [Trocar fontes]                                         │
│ Período   [Últimos 24 meses ▾]       Quantas ideias  [ 8 ]        │
│                                                                   │
│ ▸ Avançado: profundidade (normal | rápida), idiomas (pt, en),     │
│             instruções para esta rodada                           │
│ ───────────────────────────────────────────────────────────────── │
│ Tempo ~8 min · Custo US$ 1,30–3,00 (média das últimas rodadas: —) │
│ As ideias chegam na aba Ideias com fonte e link conferidos.       │
│                                      [Cancelar] [Pesquisar]     │
└───────────────────────────────────────────────────────────────────┘
```
Padrões: série ou pilar mais antigo sem ideia nova (o app sabe pela data das ideias) · fontes = ativas cujo `pillars`/`series` cruza a escolha (tema livre = todas as ativas de ciência, notícia e órgão; livro/podcast só para pilar 6 e série 12) · período 24 meses para ciência, 60 dias para notícia (aplicado por tipo) · 8 ideias.

"Pesquisar" grava `pedido.json` e chama o mesmo mecanismo do **Rodar IA** do Quadro (`tools/heartbeat.mjs`, segundo plano, sob comando; ou "abrir no terminal"). O diálogo vira o painel de progresso:
```
┌ Pesquisa · Série 3 · rodando 3 min ───────────────────────────────┐
│ ✓ PubMed          42 achados → 9 na triagem → 7 conferidos        │
│ ✓ Europe PMC      30 → 6 → 6                                      │
│ .. CFP: notícias   lendo…                                          │
│ ✕ Cochrane        bloqueado (anti-robô) · seguiu sem ela          │
│ ○ Síntese         espera                                          │
│                                     [Fechar, aviso quando acabar] │
└───────────────────────────────────────────────────────────────────┘
```
Fim: "8 ideias novas · 19 referências · 4 itens caíram na verificação [ver]" → abre Ideias filtrada pela rodada. Cada cartão de ideia mostra os chips das referências (`Quote` + veículo + ano, link abre o item).

### 2.5 Aba Pesquisas
Lista de rodadas (data, tema, fontes, ideias geradas, quantas aprovadas depois, custo real). Abrir uma mostra o `resultado.json`: por fonte, o que caiu e por quê. Serve para calibrar peso de fonte e a estimativa de custo.

---

## 3. Fluxo da rodada (subagentes, modelos, custo)

| # | etapa | quem | modelo | lê | grava |
|---|---|---|---|---|---|
| 0 | Pedido | app (diálogo) ou terminal `npm run curadoria -- pedir kz --serie 3` | — | — | `rodadas/<id>/pedido.json` |
| 1 | **Buscar** nas fontes com API/RSS; normalizar; deduplicar por DOI/URL; filtrar período e idioma | script `tools/curadoria/buscar.ts` | nenhum | APIs/feeds | `data/…/brutos.json` |
| 2a | **Triar ciência** (bases e periódicos): nota 0–10 pela rubrica, separa os ~10 melhores, extrai trecho literal do resumo e paráfrase | subagente | **Haiku** | só título + resumo dos brutos | `achados.json` (parte) |
| 2b | **Triar notícias**: manchete + linha fina; descarta repetido e sensacionalista; marca "procurar estudo original" | subagente | **Haiku** | brutos do grupo | `achados.json` (parte) |
| 2c | **Ler fontes sem API** (CFP legislação, CRPs, OPAS, editoras): abre a página/busca do site, acha itens do período, extrai trecho | subagente | **Sonnet** | até ~8 páginas | `achados.json` (parte) |
| 3 | **Verificar**: link responde, DOI resolve (doi.org/Crossref), trecho existe no texto baixado (normalizado: caixa, acento, espaço) | script `tools/curadoria/verificar.ts` | nenhum | achados | marca ok/caiu |
| 4 | **Sintetizar e ranquear**: cruza achados verificados com pilares, persona, séries, ideias e conteúdos já existentes → N ideias com ficha de pauta, nota e refs | **sessão principal** | **Opus** | só achados verificados + seções do contexto (`tools/contexto.mjs`) + títulos de ideias/contents | `ideas/I-NNNN`, `referencias/R-NNNN`, `resultado.json` |
| 5 | Conferir regras por script: toda ideia `origin: pesquisa` tem ref; toda ref tem `verify` ok; `npm run validate` | script | nenhum | — | — |

- **Um subagente por grupo de fontes, não por fonte:** 30 fontes viram 2–3 subagentes. Subagente por fonte multiplica a sobrecarga fixa (instruções + ferramentas, ~15–20 mil tokens cada) sem ganho de qualidade.
- **Por que Haiku na triagem:** entrada estruturada (título + resumo), rubrica fixa, saída em JSON. Sonnet só onde precisa navegar e ler página sem estrutura.
- **Opus só no passo 4**, e lendo o já filtrado (~30–60 achados de ~150 tokens). Nunca lê os brutos.
- **Rubrica da triagem (fixa, na skill):** aderência à persona (terapeuta autônoma) · rende qual pilar/série · força da evidência (meta-análise > revisão > estudo > opinião) · novidade (≤ período; não repete ideia existente) · risco ético/CFP (penaliza) · dá para explicar em 1 carrossel ou reels de 30 s.
- **Ranking da síntese (nota 0–10 na ideia):** os mesmos critérios + sinal-alvo (envio/salvar) + peso da fonte + variedade (no máximo 2 ideias da mesma referência).
- Rodada **rápida**: pula 2c (só fontes com API/RSS).

### Custo estimado por rodada (8 ideias, ~150 itens brutos)
Preços de `tools/usage.mjs` (US$/milhão de tokens): Opus 5.5 4/20 · Sonnet 5.5 2/10 · Haiku 4.5 1/5; leitura de cache 0,20/0,20/0,10.

| etapa | modelo | tokens (estimativa) | US$ |
|---|---|---|---|
| 1 e 3 (scripts) | — | 0 | 0 |
| 2a triagem ciência | Haiku | ~55 mil entrada + ~10 mil saída, 3–5 voltas com cache | 0,10–0,20 |
| 2b triagem notícias | Haiku | ~30 mil + ~6 mil | 0,05–0,15 |
| 2c fontes sem API | Sonnet | ~50 mil + ~8 mil, 6–10 voltas com cache | 0,30–0,80 |
| 4 síntese e ranking | Opus | ~45 mil + ~15 mil | 0,50–1,00 |
| orquestração da sessão (rodar scripts, despachar, gravar) | Opus | sobrecarga | 0,30–0,80 |
| **total normal** | | | **~US$ 1,30–3,00** (~0,15–0,35 por ideia) |
| **total rápida** (sem 2c) | | | **~US$ 1,00–2,10** |

São estimativas, não medidas. As 3 primeiras rodadas são medidas com `node tools/usage.mjs <sessão>`; o custo real vai para `resultado.json` e o diálogo passa a mostrar a média real. Se o Claude Code rodar pela assinatura (não pela API), o custo é cota do plano, não cobrança (pergunta 4). Tempo: 5–12 min.

### Pelo terminal e pela skill
- Nova skill **`curadoria`** (prevista na 029 §6), do agente `pesquisador`: "roda a fila de pesquisa", "pesquisa ideias sobre X na série 3".
- **`content-ideas`** ganha o **Modo 4: pesquisar em fontes** (chama a `curadoria`) e, no Modo 1, passa a ler as referências ★ e as ideias `origin: pesquisa` ainda não usadas como "origem real" de pauta.
- Comandos: `npm run curadoria -- pedir <slug> [--serie N | --pilar N | --tema "…"] [--rapida]` · `fila <slug>` · `buscar <slug> <rodada>` · `verificar <slug> <rodada>` · `status <slug>`.

---

## 4. Lista inicial de fontes para a kz (todas `status: sugerida`, para o Oliver aceitar)

Conferidas em 2026-10-08: "[ok] conferido" = abriu com resposta 200 e o título da página bate (por `curl`; os bloqueados por anti-robô foram abertos no navegador). "(!) não conferido" = não abriu ou só mostrou verificação anti-robô (não contornei). Pilares (P) e séries (S) do `CONTENT_STRATEGY.md`.

### 4.1 Bases de artigos e periódicos (trust 3)
| id | nome | link | consulta | alimenta | conferido |
|---|---|---|---|---|---|
| scielo | SciELO Brasil | https://www.scielo.br/ · busca: https://search.scielo.org/ | busca do site bloqueia robô (403 no `curl`) → via **OpenAlex** filtrando periódicos SciELO; busca do site pelo subagente | P4 P6 · S3 S12 | [ok] (busca: só no navegador) |
| pepsic | PePSIC (Periódicos Eletrônicos em Psicologia) | https://pepsic.bvsalud.org/ (redireciona para pepsic.scielo.org) | web (403 no `curl`) | P3 P4 P6 · S3 | [ok] no navegador |
| pubmed | PubMed | https://pubmed.ncbi.nlm.nih.gov/ · API: https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi | API (E-utilities, grátis) | P3 P4 P6 · S3 | [ok] (API respondeu) |
| europepmc | Europe PMC | https://europepmc.org/ · API: https://www.ebi.ac.uk/europepmc/webservices/rest/search | API (grátis) | P3 P4 P6 · S3 | [ok] (site no navegador; API respondeu) |
| openalex | OpenAlex | https://api.openalex.org/works | API (grátis) | P4 P6 · S3 S12 | [ok] |
| doaj | DOAJ (acesso aberto) | https://doaj.org/api/search/articles/{q} | API | P4 P6 · S3 | [ok] |
| crossref | Crossref | https://api.crossref.org/works | API; **uso: verificar DOI e metadados**, não gerar ideia | — | [ok] |
| pcp | Psicologia: Ciência e Profissão (revista do CFP) | https://www.scielo.br/j/pcp/ | API via OpenAlex (fonte S2739370219) | P4 P6 · S3 | [ok] |
| ptp | Psicologia: Teoria e Pesquisa | https://www.scielo.br/j/ptp/ | API via OpenAlex | P4 · S3 | [ok] |
| prc | Psicologia: Reflexão e Crítica | https://prc.springeropen.com/ (redireciona para link.springer.com/journal/41155) | API via OpenAlex | P4 · S3 | [ok] |
| estpsi | Estudos de Psicologia (Campinas) | https://www.scielo.br/j/estpsi/ | API via OpenAlex | P3 P4 · S3 | [ok] |
| pusf | Psico-USF | https://www.scielo.br/j/pusf/ | API via OpenAlex | P4 · S3 | [ok] |
| rbtc | Revista Brasileira de Terapias Cognitivas | https://www.rbtc.org.br/ | web / OpenAlex | P3 P4 · S3 | [ok] |
| rbp | Brazilian Journal of Psychiatry | https://www.scielo.br/j/rbp/ | API via OpenAlex | P6 · S3 | [ok] |
| jbpsiq | Jornal Brasileiro de Psiquiatria | https://www.scielo.br/j/jbpsiq/ | API via OpenAlex | P6 · S3 | [ok] |
| cochrane | Cochrane Library | https://www.cochranelibrary.com/ | web | S3 | (!) não conferido (anti-robô) |
| bvs-psi | BVS-Psi | https://www.bvs-psi.org.br/ | web | P4 P6 | (!) não conferido (não abriu) |
| semantic-scholar | Semantic Scholar | https://api.semanticscholar.org/ | API (pede chave para uso contínuo) | S3 | (!) não conferido (429 sem chave) |
| lancet-psy | The Lancet Psychiatry | https://www.thelancet.com/journals/lanpsy/home | web | P6 · S3 | (!) não conferido (anti-robô) |
| apa-monitor | APA Monitor on Psychology | https://www.apa.org/monitor | web | P3 P4 | (!) não conferido (página vazia, anti-robô) |

IDs dos demais periódicos no OpenAlex: a fase 2 busca e grava em `access.filters` (só conferi o da PCP).

### 4.2 Órgãos oficiais e conselhos (trust 3)
| id | nome | link | consulta | alimenta | conferido |
|---|---|---|---|---|---|
| cfp-noticias | CFP: notícias | https://site.cfp.org.br/noticias/ · feed: https://site.cfp.org.br/feed/ | RSS (feed traz itens recentes) | P4 P6 · S6 S12 | [ok] |
| cfp-legislacao | CFP: legislação | https://site.cfp.org.br/legislacao/ · https://transparencia.cfp.org.br/legislacao/ | página (diff) | P4 P6 · S6 | [ok] |
| cfp-atos | Atos oficiais do CFP | https://atosoficiais.com.br/cfp | web | S6 | (!) não conferido (anti-robô) |
| crepop | CREPOP (referências técnicas do Sistema Conselhos) | https://crepop.cfp.org.br/ | página | P4 · S6 S12 | [ok] |
| crp-sp | CRP-SP | https://www.crpsp.org/ | página | P4 P6 · S6 | [ok] |
| crp-rj | CRP-RJ | https://www.crprj.org.br/ | página | P4 P6 · S6 | [ok] |
| crp-mg | CRP-MG | https://crp04.org.br/ | página | P4 P6 · S6 | [ok] |
| crp-pr | CRP-PR | https://crppr.org.br/ | página | P4 P6 · S6 | [ok] |
| crp-rs | CRP-RS | https://www.crprs.org.br/ | página | P4 P6 · S6 | [ok] |
| ms-noticias | Ministério da Saúde: notícias | https://www.gov.br/saude/pt-br/assuntos/noticias (redireciona para /noticias-ms) | página | P6 | [ok] |
| ms-desmad | Ministério da Saúde: Saúde Mental, Álcool e outras Drogas | https://www.gov.br/saude/pt-br/composicao/saes/desmad | página | P6 · S12 | [ok] |
| opas | OPAS/OMS: saúde mental | https://www.paho.org/pt/topicos/saude-mental · feed geral: https://www.paho.org/pt/rss.xml | RSS + página | P3 P6 · S12 | [ok] |
| oms | OMS: mental health | https://www.who.int/health-topics/mental-health | página (en) | P6 · S3 S12 | [ok] |

Os CRPs são 5 de 24 (estados onde a persona mais está, `AUDIENCE.md`: SP/RJ/MG/Sul). Conferi a home; a página de notícias de cada um a fase 4 mapeia (a de `crpsp.org/noticias` deu 404).

### 4.3 Notícias (trust 2: gatilho, não prova)
| id | nome | link | consulta | alimenta | conferido |
|---|---|---|---|---|---|
| gnews | Google Notícias (busca por consulta) | https://news.google.com/rss/search?q={q}&hl=pt-BR&gl=BR&ceid=BR:pt-419 | RSS; consultas iniciais: "Conselho Federal de Psicologia", "saúde mental" trabalho, terapia online, psicólogo autônomo | P2 P3 P6 · S3 | [ok] (2 consultas testadas) |
| agencia-brasil | Agência Brasil: saúde | https://agenciabrasil.ebc.com.br/saude · feed: https://agenciabrasil.ebc.com.br/rss/saude/feed.xml | RSS | P6 | [ok] |
| veja-saude | Veja Saúde | https://saude.abril.com.br/ | página/gnews | P3 P6 · S3 | [ok] |
| folha-equilibrio | Folha: Equilíbrio e Saúde | https://www1.folha.uol.com.br/equilibrioesaude/ | página/gnews (paywall parcial) | P3 P6 | [ok] |

### 4.4 Livros e editoras (trust 2; série 12 só com aval de quem leu)
| id | nome | link | consulta | alimenta | conferido |
|---|---|---|---|---|---|
| openlibrary | Open Library | https://openlibrary.org/search.json?q={q} | API | P6 · S12 | [ok] |
| google-books | Google Books | https://www.googleapis.com/books/v1/volumes?q={q} | API (pede chave) | P6 · S12 | (!) não conferido (429 sem chave) |
| grupo-a | Grupo A (Artmed) | https://loja.grupoa.com.br/ | página | P4 P6 · S12 | [ok] |
| sinopsys | Sinopsys Editora | https://www.sinopsyseditora.com.br/ | página | P4 P6 · S12 | [ok] |
| summus | Grupo Editorial Summus | https://www.gruposummus.com.br/ | página | P3 P6 · S12 | [ok] |
| vozes | Editora Vozes | https://www.vozes.com.br/ | página | P3 P6 · S12 | [ok] |

### 4.5 Fora da lista, de propósito
- **Podcasts, newsletters e criadores:** nenhum sugerido. Não achei por busca algo que eu pudesse conferir com segurança, e `AUDIENCE.md` diz que a persona consome "newsletters da área" sem nomear quais (pergunta 5). Quando houver nomes, entram pelo "Adicionar fonte"; criador com vídeo continua no radar da 012.
- **Referência fixa, não fonte:** documentos que se consultam sempre, mas onde não se "procura" nada novo, viram referência ★ direto. Exemplo conferido: Lei 14.510/2022 (telessaúde), https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2022/lei/l14510.htm [ok].
- Saíram na conferência: BBC Brasil (tópico 404), Nature Mental Health (404 no endereço testado), `e-psi.cfp.org.br` (redireciona para a home do CFP).

---

## 5. Fases

| fase | entrega | pronto quando | reaproveita |
|---|---|---|---|
| **F0 · aval** (este doc) | Oliver responde as perguntas e aceita/corta a lista | perguntas respondidas no Log | — |
| **F1 · cadastro** | `schema/curadoria.ts` (+ `idea.ts` estendido, compatível), `curadoria/fontes.json` com a lista da §4 como `sugerida`, abas Ideias · Fontes no app (lista, filtros, gaveta, pausar, aceitar/recusar, adicionar colando link com sugestão por script) | Oliver aceita as fontes no app; `npm run validate` sem erro; ideias antigas continuam válidas | padrão de lista/gaveta de `Ideas.tsx`, `Drawer`, `TagsInput`, `core/platform.ts` (detectar link), validate |
| **F2 · rodada pelo terminal** | `tools/curadoria/` (adaptadores pubmed, europepmc, openalex, crossref, doaj, rss, google-news; `buscar.ts`, `verificar.ts`), skill `curadoria`, Modo 4 na `content-ideas`, `SourceRef`, seção `## Fontes` na ideia | 1 rodada real da série 3 gera ≥ 5 ideias, **100% das refs com link, DOI e trecho verificados**, 0 ideia sem ref; custo medido com `usage.mjs` e gravado | 029 §3–5, `tools/intel/` (normalize, env/keys, runner, padrão de erros por perfil), ficha de pauta da 012, `contexto.mjs` |
| **F3 · diálogo no app** | botão Pesquisar ideias, diálogo com padrões e estimativa, `pedido.json` → Rodar (mesmo caminho do Rodar IA), progresso por fonte, aba Pesquisas, chips de referência no cartão da ideia | Oliver roda uma pesquisa sem abrir terminal e vê o resultado no lugar (regra do `APP.md`) | `heartbeat.mjs` (sob comando, sem `--watch`), padrão `analysis/pedido.json`, estimativa a partir de `resultado.json` |
| **F4 · refino** | diff de páginas sem RSS (CRPs, editoras), "Pedir à IA" ao colar link (Haiku), peso sugerido pelo histórico (fonte que gera ideia aprovada sobe), fichas de série lendo as refs (029 §5) | após 5 rodadas reais | 029 §5–6 |

Fora do escopo: coleta periódica (regra do hub), ler texto completo pago, resumir livro que ninguém leu.

---

## 6. Perguntas para o Oliver
1. **Navegação:** Fontes como aba dentro de Ideias (recomendo) ou item próprio no menu?
2. **Idioma:** aceita estudo em inglês explicado em pt-BR, ou prioriza SciELO/PePSIC? (é a pergunta 4 da 029; o padrão do diálogo hoje é pt + en)
3. **Padrões da rodada:** 8 ideias, 24 meses para ciência e 60 dias para notícia. Ok?
4. **Custo:** o Claude Code roda pela assinatura ou pela API? Quer um teto por rodada (ex.: avisar acima de US$ 3)?
5. **Podcasts, newsletters e criadores** que você ou suas clientes seguem: quais? Não sugeri nenhum sem conferir.
6. **Notícia** só como gatilho (a afirmação sempre exige a fonte primária), como proposto?
7. **Fontes "não conferido"** (Cochrane, BVS-Psi, Atos oficiais do CFP, Semantic Scholar, Lancet Psychiatry, APA Monitor, Google Books): abre no seu navegador e diz se ficam? As de API (Semantic Scholar, Google Books) só funcionam bem com chave.
8. **CRPs:** só os 5 da persona (SP, RJ, MG, PR, RS) ou todos os 24?
9. **Referências no git** (JSON com trecho curto e link; brutos e páginas ficam fora): ok?
