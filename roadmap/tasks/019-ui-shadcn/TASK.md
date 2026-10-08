# 019 — Interface rápida e otimista + visual shadcn/ui

Status: fazendo (pausada em ponto seguro em 2026-10-07) · Depende de: 018

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
- 2026-10-07: backend otimizado; passe otimista iniciado; componentes shadcn preparados em `staging/`; sessão encerrada em ponto seguro (tudo verde).
- 2026-10-07: pedidos novos do Oliver registrados (cor do projeto no tema, Lucide, sidebar principal recolhível, sidebar contextual padronizada, migração gradual com Sonnet 5.5 baixo). Retomar pela "Ordem sugerida".
