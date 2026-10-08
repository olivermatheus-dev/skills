# 019 — Interface rápida e otimista + visual shadcn/ui

Status: fazendo — passos 1–5 da "Ordem sugerida" feitos em 2026-10-07; segue a migração gradual (passo 6) · Depende de: 018

## Pedido do Oliver
- Nada pode demorar: navegar, salvar, criar → **atualização otimista**, pré-carregamento, código dividido.
- Visual com **shadcn/ui** (cards, botões, badges, select, dialog, sheet, tabs, tooltip…), gráficos com **Recharts**, datas com **date-fns** (pt-BR), **dnd-kit** no Kanban.

## Pedido do Oliver (2026-10-07, depois da 030) — direção do front-end
- **Tailwind + shadcn/ui como padrão** de componentes, o quanto antes. Migração **gradual**, não big bang: o visual atual não é feio; trocar componente por componente, sem quebrar telas. Pode ser executada por **Sonnet 5.5 (esforço baixo)**: passos mecânicos e bem descritos.
- **Cor principal = cor do projeto selecionado.** Na kz, o coral da marca; outro projeto, outra cor. Serve também para saber de relance em que projeto se está. Fonte: `project.yml → color` (campo já existe no `schema/project.ts`, sem uso); se vazio, cair no `--primary` do `brand.json` da empresa; sem nenhum, o índigo atual. Aplicar trocando os tokens do tema (`--primary`, `--ring`, `--accent`/`accent-soft` derivado) no `<html>` ao trocar de projeto. Conferir contraste do texto sobre a cor (`tools/contrast.mjs`). Editar a cor no app (Configurações ou Projetos).
- **Ícones: Lucide** (`lucide-react`, já instalado) em todo o app, a começar pela sidebar (hoje são caracteres ◎ ▦ ◉…). Ícone de cada tela no registro `pages/index.ts`.
- **Tokens visuais organizados** num lugar só (`app/src/index.css` / tema shadcn): cores, raio, sombras, tipografia; os nomes antigos (`bg-surface`, `text-muted`, `accent`…) viram aliases para nada quebrar.
- **Sidebar principal recolhível:** modo só-ícones (com tooltip). Recolhe sozinha em telas de trabalho (editor de **Mockups**, **Concorrentes**/análise, editor de vídeo), por configuração da tela no registro (`pages/index.ts → sidebar: 'recolhida'`); o Oliver pode expandir/recolher à mão (lembra a escolha).
- **Sidebar contextual = 1 componente padronizado** (`components/ContextSidebar.tsx` ou similar) que cada área usa do seu jeito:
  - Conteúdos, Anotações, Ideias → estilo **Notion** (árvore/lista de páginas, busca, novo item, favoritos);
  - Concorrentes → lista dos concorrentes cadastrados (clicar troca o detalhe sem voltar à lista);
  - Mockups → camadas + prints (o painel esquerdo do editor da 030 passa a usar o componente).
  Mesma largura, cabeçalho, busca, rolagem e estado vazio em todas; redimensionável e recolhível.
- **Editor de mockups (030):** o Oliver quer melhorias no editor como um todo (a detalhar com ele); a migração para shadcn e as sidebars acima já cobrem a parte de interface.

### Feito em 2026-10-07 (passos 1–5)
- **shadcn ligado:** `app/src/components/ui/` (24 componentes, new-york, Tailwind v4) + `app/src/lib/` (`cn`, datas pt-BR), alias `@` → `app/src` (vite + tsconfig), `app/components.json` (`npx shadcn add <comp>` funciona no PC). O antigo `components/ui.tsx` virou **`components/kit.tsx`** (Button, Card, Badge, Drawer… antigos: trocar aos poucos pelos de `@/components/ui`).
- **Tokens num lugar só:** `app/src/index.css` (tema shadcn com os mesmos valores visuais de antes). Classes antigas trocadas por script em todo o app: `text-muted`→`text-muted-foreground`, `bg-surface`→`bg-card`, `bg-surface-2`→`bg-muted`, `bg-accent`→`bg-primary`, `text-accent`→`text-primary-ink`, `bg-accent-soft`→`bg-primary-soft`, `ok/warn/danger`→`success/warning/destructive`, `text-text`→`text-foreground`. **Use só os nomes novos.**
- **Cor do projeto:** `app/src/lib/theme.ts` (`useCorDoProjeto`, chamado no Layout): `project.yml → color`, senão `--primary` do `brand.css`. Calcula `--primary-foreground` (preto ou branco pelo contraste) e `--primary-ink` (texto na cor, ≥ 4,5:1). Na kz: coral `#ef7960`, texto escuro sobre ele, `#ac5745` para texto. Editar: **Configurações → Cor do projeto** (prévia ao vivo; sair sem salvar volta). Regra: fundo na cor = `bg-primary text-primary-foreground`; texto/ícone na cor = `text-primary-ink`; fundo claro = `bg-primary-soft`.
- **Lucide** na sidebar (registro `pages/index.ts → icon`), no editor de mockups e na barra contextual.
- **Sidebar principal recolhível** (só ícones + dicas); recolhida por padrão em Mockups e Concorrentes (`sidebar: 'recolhida'` no registro); escolha manual lembrada por tela.
- **`components/ContextSidebar.tsx`**: barra contextual padrão (título, ação, busca, seções, itens, vazio, rodapé; redimensiona arrastando a borda, duplo clique volta; recolhe; largura lembrada por área). Em uso: **detalhe do concorrente** (lista todos, busca, troca sem voltar) e **editor de mockups** (adicionar, camadas, prints).
- Verificado: typecheck, validate, build, as 11 telas sem erro no console, contraste do coral, prévia/volta da cor.

### Próximos (passo 6, gradual — bom para Sonnet 5.5 baixo, uma tela por vez)
- Conteúdos, Anotações, Ideias com `ContextSidebar` estilo Notion (lista de páginas, busca, + novo, favoritos).
- Trocar `kit.tsx` → `@/components/ui` tela a tela (Button, Card, Badge, Select, Sheet no lugar do Drawer, Tabs, Tooltip, AlertDialog no lugar de `confirm`); símbolos soltos (◉ ▸ ✦ ↶…) → Lucide; datas com `@/lib/dates`.
- Painel direito do editor de mockups com Slider/Select/Toggle do shadcn.

### Ordem sugerida (cada passo fecha verde: typecheck, validate, build, telas sem erro no console)
1. Ligar o shadcn (passo 1 de "Próximos passos" abaixo) + tokens organizados com aliases.
2. Cor do projeto no tema + campo para editar a cor.
3. Lucide na sidebar e nos botões de ação mais vistos.
4. Sidebar principal recolhível + configuração por tela.
5. Componente de sidebar contextual; aplicar em Concorrentes e Mockups primeiro, depois Conteúdos/Anotações/Ideias.
6. Seguir com os passos 2–4 de "Próximos passos" (otimismo, migração tela a tela, teste com Playwright).

## Feito
- Servidor: cache de leitura por mtime (~1 ms por resposta), detalhe do concorrente com só as 2 últimas coletas completas + 10 leves, `npm run app` = build + preview (modo rápido).
- Interface (parcial, agente parado no meio para fechar a sessão): telas carregadas sob demanda (React.lazy), editor markdown carregado à parte (`MarkdownEditorImpl`), início das mutações otimistas (quadro). Estado verificado: typecheck, validate, test:intel, build e as 8 telas sem erro no console.
- Dependências instaladas: `radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `recharts`, `date-fns`, `sonner`, `tw-animate-css`.
- **`staging/`**: 24 componentes shadcn no padrão oficial (new-york, Tailwind v4, pacote `radix-ui`), wrapper `chart` para Recharts, `lib/utils.ts` (`cn`), `lib/dates.ts` (date-fns pt-BR: `fmtDate`, `fmtRelative`, `isLate`…), `theme.css` (tokens shadcn) e `components.json`. Não estão ligados ao app ainda (o registro do shadcn é bloqueado na nuvem; no PC, `npx shadcn add <comp>` funciona com esse `components.json`).

## Próximos passos (ordem)
1. Ligar o shadcn: alias `@` → `app/src` (vite + tsconfig), mover `staging/components/ui/*` → `app/src/components/ui/`, `staging/lib/*` → `app/src/lib/`, `components.json` → `app/`; renomear o antigo `components/ui.tsx` (helpers) para `components/kit.tsx` e mapear tokens antigos (`bg-surface`, `text-muted`, `accent`…) para os do tema no `index.css` (aliases) para nada quebrar.
2. Terminar o passe otimista em todas as mutações (tarefas, anotações, personas, ideias, concorrentes, marcações, projeto/tags/contexto) + prefetch ao passar o mouse + toasts (`sonner`) com "Desfazer".
3. Migrar tela por tela para os componentes shadcn (Card, Badge, Button, Select, Sheet no lugar do Drawer, Tabs, Tooltip, AlertDialog no lugar de `confirm`), datas com `lib/dates.ts`, gráficos com Recharts (`chart.tsx`): seguidores por coleta, ideias por status, tarefas por coluna.
4. Testar com Playwright (incluindo atraso artificial de 800 ms na API para provar o otimismo) e mandar prints ao Oliver.

## Log
- 2026-10-08: **piloto do Motion (ex-Framer Motion) no Quadro** (`motion@14.0.0` fixo; só `app/src/pages/Board.tsx`): cards com mola ao reordenar, trocar de coluna (`layoutId` = id da tarefa; ao soltar, o card sai de onde o card flutuante estava), card novo entra com mola, card flutuante "levanta" (escala 1,03 + 1,2°), fantasma parado na origem, `reducedMotion="user"`. Medido com Playwright numa cópia do quadro (`HUB_ROOT`): assenta em ~0,5 s, sem erros. Se o Oliver aprovar a sensação: estender a Drawer/Sheet, listas (ideias, anotações) e trocas de aba; regra = mola única `SPRING` (bounce 0,18 · 0,45 s). Vídeo continua em GSAP (teste em branch `motion-video-poc`).
- 2026-10-07: backend otimizado; passe otimista iniciado; componentes shadcn preparados em `staging/`; sessão encerrada em ponto seguro (tudo verde).
- 2026-10-07: correções após teste do Oliver: ícones da sidebar recolhida desalinhados (NavLink com className em função dentro do TooltipTrigger asChild: o Slot do Radix vira a função em texto → Link com classe calculada; regra: nunca className em função dentro de asChild), rolagem horizontal de 1 px na nav, e barra contextual recolhida que "sumia" (agora o trilho inteiro é botão, com ícone e nome na vertical).
- 2026-10-07: passos 1–5 feitos (shadcn ligado, tokens, cor do projeto, Lucide, sidebar recolhível, ContextSidebar em Concorrentes e Mockups).
- 2026-10-07: pedidos novos do Oliver registrados (cor do projeto no tema, Lucide, sidebar principal recolhível, sidebar contextual padronizada, migração gradual com Sonnet 5.5 baixo). Retomar pela "Ordem sugerida".
