# 019 — Interface rápida e otimista + visual shadcn/ui

Status: fazendo (pausada em ponto seguro em 2026-10-07) · Depende de: 018

## Pedido do Oliver
- Nada pode demorar: navegar, salvar, criar → **atualização otimista**, pré-carregamento, código dividido.
- Visual com **shadcn/ui** (cards, botões, badges, select, dialog, sheet, tabs, tooltip…), gráficos com **Recharts**, datas com **date-fns** (pt-BR), **dnd-kit** no Kanban.

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
