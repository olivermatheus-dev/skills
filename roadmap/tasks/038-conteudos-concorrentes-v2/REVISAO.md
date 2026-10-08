# Revisão 038 + 039 (produto e código)

**Revisor:** agente revisor · 2026-10-08 · commits `4e90d77` → `b7968e4` (9 commits, 36 arquivos em `app/` e `tools/`).
**Como:** leitura do diff contra os TASK.md, os dois DASHBOARD.md e `APP.md#Princípio central`. App rodando no Node 22 (porta 5198), navegado com Playwright a 1280×800 e 1920×1080: Panorama, Lista, Brechas, Conteúdos (Grade, Tabela, Painel, gaveta por `?item=`, popover Filtros, select de Rede), Anúncios (Grade, Lista, ordenação pelo cabeçalho), ficha da Corpora (Diagnóstico, Redes e conteúdos em grade e em tabela), Quadro e Ideias. Console sem erro nem aviso em todas as telas, exceto o caso de `?ordem=` (corrigido, item 3). `npm run typecheck` limpo, `npm run validate` ok, `npx tsx tools/intel/test-outlier.ts` ok (5 casos feitos à mão + dados reais).

## Resultado
Nenhum achado de gravidade alta é regressão destas tarefas. As contas × perfil, × mercado (rede + formato, recuo para a rede inteira com menos de 10 itens, "—" com menos de 3 concorrentes) e por seguidor batem com o desenho e com o teste. A barra fica numa linha a 1280 px em todas as telas, nenhum `<select>` nativo sobrou e a StatStrip não deixa card sozinho na linha de baixo. O Painel e o Panorama seguem os DASHBOARD.md. A correção do servidor (`try/catch` + `pipeFile`) funciona: URI malformada dá 400, pasta no lugar de arquivo dá 404 e o processo não cai.

| gravidade | qtde |
|---|---|
| alta | 1 (anterior a estas tarefas) |
| média | 7 |
| baixa | 12 |
| corrigido na revisão | 3 itens, em 4 arquivos |

## Corrigido nesta revisão (trivial, sem commit)
1. **Loop de `requestAnimationFrame` infinito**: `app/src/components/fill.tsx`, no `watch` do `useFillHeight`. Quando `DataTable` ou `SortTable` rodam com `fill=false` (ex.: a tabela da ficha, `CompetitorDetail.tsx:389`), o ref nunca é ligado e o `watch` reagendava a si mesmo a cada quadro. Medido: 61 rAF/s na ficha com a vista tabela; 0 depois da correção. Agora o `watch` sai cedo quando não há caixa.
2. **Links do Panorama para Anúncios abriam a Grade**: `pages/concorrentes/Panorama.tsx:72` e `:246` usavam `?vista=tabela`, mas Anúncios só conhece `grade|lista`. A Grade aparecia e o ToggleGroup ficava sem nada selecionado. Trocado para `?vista=lista` (o DASHBOARD 039 §7 pede "Anúncios › Tabela").
3. **`?ordem=constructor` derrubava a página**: `components/competitors/ContentsView.tsx:63` e `pages/concorrentes/Anuncios.tsx:59` usavam `v.ordem in SORTS`, que aceita chaves do protótipo. Com isso, `SORTS.constructor.get` não é função e o `<main>` ficava em branco (confirmado no navegador). Trocado por `Object.hasOwn(SORTS, v.ordem)`.

Depois das correções: typecheck limpo e teste do fora da curva ok.

## Alta
**A1 · `/media` lê qualquer arquivo dentro de `companies/` (path traversal; o código é anterior, não é regressão).** `app/server/api.ts:251-252`: o arquivo é `normalize(join(ROOT, P.media(slug, comp), decodeURIComponent(resto)))`, e a checagem é só `startsWith(join(ROOT,'companies'))`. Confirmado: `GET /media/kz/corpora/..%2F..%2F..%2Fproject.yml` → 200 com o `project.yml`. Pelo CLAUDE.md, as chaves de API ficam em `companies/<slug>/.env`; hoje esse arquivo não existe, mas vai existir. O risco é limitado: o Vite só escuta em localhost e a resposta não tem CORS. Mesmo assim, qualquer processo local ou página com DNS rebinding consegue ler o arquivo. A prefixação também aceita `companies-x/`.
*Correção:* `const base = join(S.ROOT, P.media(m[1], m[2])); if (!file.startsWith(base + sep) ...)` e validar `m[1]` e `m[2]` com `/^[a-z0-9][a-z0-9-]*$/`, como já é feito em `/piece-file`. O `/brand-file` (`:259`) só bloqueia `..` literal e pode passar pela mesma regra.

## Média
**M1 · "Aposta de cada concorrente" esconde quem parou de postar.** `components/competitors/ContentsPanel.tsx:407-426`: o bloco agrupa só as linhas filtradas. No período padrão (30 d), um concorrente sem post no período nem aparece. A PersonCare, exemplo do próprio DASHBOARD ("último post em 27/08"), só aparece com "Tudo" (verificado: "há 6 sem" com alerta). O alerta "≥ 21 d" nunca dispara para quem parou de vez.
*Correção:* listar todos os concorrentes de `all` que tiverem perfil coletado; para quem não tem item no período, mostrar posts/sem = 0 e "último" calculado sobre `all`.

**M2 · Botão "tarefa" das Brechas cria duplicata e manda tudo para Produto.** `pages/concorrentes/PanoramaBrechas.tsx:69` e `:230`: o "já criada" vive num `useState` de cada componente. Depois de recarregar, ou ao passar do Panorama para a página Brechas, o mesmo tema cria outra tarefa. `:217` usa sempre `board: 'produto'`, mas o DASHBOARD 039 §2 (bloco 2) diz "Mensagem e oferta → roteirista/landing-page; produto → quadro produto".
*Correção:* antes de criar, procurar no quadro uma tarefa com "tema <id>" no Log (o corpo já grava isso) e mostrar "Criada T-NNNN" fixo; escolher o quadro pelo `kind` (produto → produto; oferta → vendas; mensagem e público → conteudo).

**M3 · Sem error boundary: um erro de render apaga a página inteira.** O caso do `?ordem=` está corrigido, mas o app não tem nenhum `ErrorBoundary` ou `errorElement` (grep vazio). Qualquer exceção nas telas novas (Recharts, dado inesperado de coleta) deixa o `<main>` em branco sem aviso. O mesmo padrão `raw in VIEWS` continua em `pages/concorrentes/Comparar.tsx:20` (fora do escopo, não mexi).
*Correção:* `errorElement` nas rotas de `App.tsx` ou um `ErrorBoundary` em volta do `<Outlet>` do `Layout`, com "Algo quebrou nesta tela · Recarregar".

**M4 · Tabelas cortam as colunas da medida a 1280 px.** Em Conteúdos › Tabela, a tabela tem 1309 px numa caixa de 1158 px: "Por seguidor" e "Status" ficam fora, atrás de rolagem horizontal. Na ficha (Redes e conteúdos › tabela, `fill=false`) já cortam em "Engaj.", ou seja, **× perfil e × mercado, o centro da 038 B2, ficam fora da tela**. Como a ficha não usa `fill`, a barra de rolagem horizontal só aparece no fim das 66 linhas. Em Anúncios › Lista, "Status" e parte de "Onde roda" ficam fora.
*Correção:* na ficha, esconder "Concorrente" (já é) e "Envios" (só TikTok tem; o DASHBOARD tira envios); em Conteúdos, levar "Envios" e "Coment." para depois das medidas, ou trocar a miniatura de 56 px para 40 px e o título para 160 px; em Anúncios, juntar "Início" e "Dias no ar" numa coluna. Alternativa: colunas fixas à direita (`sticky right-0`) para × perfil e × mercado.

**M5 · Contraste do cabeçalho das tabelas novas abaixo de AA.** `components/competitors/toolbar.tsx:197`: `text-muted-foreground` (#71717a) sobre `bg-muted` (#f0f0f2) dá 4,25:1 em texto de 12 px (`node tools/contrast.mjs`). O mesmo par aparece no rótulo "SEM MERCADO" do mapa (9 px) e nos chips inativos do ToggleGroup.
*Correção:* cabeçalho com `bg-card` + borda, ou texto `text-foreground/70`; ou escurecer `--muted-foreground` para ~#6b6b74.

**M6 · Selo "Novo" de Anúncios e textos em verde reprovam no contraste.** `pages/concorrentes/Anuncios.tsx:128`: `text-success` sobre `bg-success/15` = 2,96:1 (reprovado); `text-success` sobre branco = 3,3:1 ("você tem" em Brechas, toggle "Só novos" ligado, "Criada T-…").
*Correção:* usar `text-green-700` (#15803d, ~5:1) nesses textos pequenos, ou um token `--success-ink`.

**M7 · Contagens dos selects ignoram o período e os outros filtros.** `components/competitors/ContentsView.tsx:86-91`: o select de Rede mostra "YouTube 60" com o período em 30 dias, que tem 0 itens do YouTube. Escolher essa opção dá "Nada com esses filtros". O mesmo vale para Formato e Concorrente.
*Correção:* contar sobre as linhas já filtradas por período, status e busca (sem o próprio filtro), e marcar `disabled` quando a contagem for 0, como a Lista já faz com o Tipo.

## Baixa
- **B1 · Ficha sem aba Anúncios.** O pedido 9 e a fase D da 038 citam "a aba Anúncios da ficha", mas a ficha não tem essa aba (`CompetitorDetail.tsx:31`), e o log da D não fala dela. Confirmar com o Oliver se ela ainda é desejada.
- **B2 · A faixa da ficha ainda é a antiga** (`CompetitorDetail.tsx:348-349`, divisórias sem ícone). A 039 A2 pedia o StatStrip novo "nas 6 telas".
- **B3 · Ícones que não são Lucide nas telas mexidas:** `↻` em `Anuncios.tsx:132,138,144` e `CompetitorDetail.tsx:385`; `⚠ ✓ ✗` em `CompetitorDetail.tsx:333`, `Coletas.tsx:64-79` e `Lista.tsx:226,257,275,332`; `×` em `Lista.tsx:278`; setas `↑ ↓` no `SortTable` (`area.tsx:146`); "+ Nova ideia" em `Ideas.tsx:90`. Trocar por `RefreshCw`, `TriangleAlert`, `Check`, `X`, `ArrowUp`/`ArrowDown` e `Plus`. Na mesma tela, a Lista já usa `RefreshCw` e Anúncios ainda usa `↻`.
- **B4 · `withMarketOutlier` mistura formatos no recuo para a rede** (`components/competitors/lib.tsx:175-178`). No escopo "rede", a mediana de curtidas junta reels e carrosséis, e o DASHBOARD §0.4 diz "nunca somar com reels numa mesma mediana". Hoje nenhum grupo cai no recuo com base em curtidas (carrossel n=12, 5 concorrentes; post n=13, 5 concorrentes), mas vai cair com período/coleta menores. *Correção:* para base `likes`, recuar só entre formatos sem views ou mostrar "—".
- **B5 · Concorrente de outro `kind` entraria no mercado.** O feed (`app/server/api.ts:105`) filtra só `status === 'ativo'`, e `useMarketRows` (`market.ts:12`) não filtra por `kind`. Hoje os 11 são `concorrente`; quando entrar uma "referência" de outro nicho, ela muda a mediana do × mercado. *Correção:* filtrar `kind === 'concorrente'` antes do `withMarketOutlier`.
- **B6 · Tooltip do escopo "rede" nem sempre está certo.** `Items.tsx:36` diz "Poucos … desse formato (< 10)", mas o recuo também acontece com ≥ 10 itens e menos de 3 concorrentes. *Correção:* citar o motivo real (n ou concorrentes).
- **B7 · Resumo da ideia com "—" sem motivo.** `useMakeIdea.ts:27-28`: no TikTok, a ficha da ideia mostra "— a mediana de views dos concorrentes (toda a rede TikTok, 30 itens)" e "(— o típico do mercado)". *Correção:* quando `outlierMercado == null`, escrever "sem mercado: menos de 3 concorrentes nesta rede".
- **B8 · O eixo Y do mapa perde o rótulo "1×".** `ContentsPanel.tsx:184`: com o tick extra em 2×, o Recharts esconde o 1× por colisão (visto a 1280 e a 1920). *Correção:* tirar o `L2` do `yTicks` (a linha tracejada já marca o 2×) ou `interval={0}` com fonte menor.
- **B9 · Rótulos do mapa se sobrepõem com período "Tudo"** (o "PsicoManager" fica por cima de outro rótulo no topo da área de 2×). *Correção:* rótulo só nos pontos fora da massa, ou deslocar quando houver colisão.
- **B10 · "Criando…" aparece com ícone de check** (`PanoramaBrechas.tsx:138` e `:286`). *Correção:* usar `Spinner` enquanto cria.
- **B11 · Texto vermelho em estado normal.** `Anuncios.tsx:171` usa `text-destructive` em "Sem anúncios na biblioteca ou coleta com erro", e a lista mistura "não anuncia" com "erro". *Correção:* cinza com ícone de aviso e separar as duas listas (o Panorama já separa no tooltip).
- **B12 · Pequenas inconsistências de barra.** Ideias usa busca sem ícone e selects sem ícone, fora do padrão `SearchBox`/`SelectField` com ícone (aceitável pelo "onde fizer sentido", mas destoa). Na Lista, o padrão da vista vem do `localStorage` (`Lista.tsx:37`): a mesma URL sem `vista=` abre diferente em cada máquina.

## Conferido e ok
- Medidas: `buildRows` (perfil e por seguidor, mesma base do `outlier`), `withMarketOutlier` (pools por rede e por rede + formato, concorrentes distintos pelo `compId`, `MERCADO_MIN_AMOSTRA = 10`, `MERCADO_MIN_CONCORRENTES = 3`, `porSeguidorMercado` no mesmo escopo). Teste: Corpora carrossel 15,2× perfil · 863,6× mercado (formato, n=12, 5 concorrentes) e TikTok 163,9× perfil · "—" (1 concorrente), iguais ao DASHBOARD.
- Ordenação: `sortRows` manda vazio para o fim nos dois sentidos; o cabeçalho e o "Ordenar" usam a mesma chave na URL (`ordem`/`asc`); números e datas começam do maior. Em Anúncios, "Dias no ar", "Início" e "Concorrente" ordenam certo (verificado no navegador).
- Estado na URL: `useUrlState` só grava o que difere do padrão e preserva os outros parâmetros; `?item=` abre a gaveta direto (link do Panorama ok); `?vista=painel` desliga o "Ordenar".
- `FillBox`/`useFillHeight`: a grade e a tabela terminam a 12 px do fim a 1280 e a 1920, sem rolar a página.
- Servidor: `handler` → `route` em try/catch (400 para `URIError`, 500 no resto, `destroy` se o corpo já começou); `pipeFile` trata o `error` do stream (404 para ENOENT/EISDIR). Nenhuma regressão de segurança nova (A1 é anterior).
- Consistência: `grep "<select"` só acha comentários no `kit.tsx`; todas as páginas usam `AppContent` ou `AreaPage`, exceto Contexto e Anotações (tela cheia com painel lateral, de propósito); nenhuma barra quebra linha a 1280 (todas com 32 px de altura e `scrollWidth == clientWidth`); StatStrip 6 → 1 linha a 1280 e a 1920.
- `APP.md#Princípio central`: "Ideia" na fila do Painel abre a gaveta já no "Virar ideia" com o título pronto (um clique até um diálogo). O "Virar tarefa" cria direto, sem diálogo; aceitável por não ser ação de IA, mas veja M2.
