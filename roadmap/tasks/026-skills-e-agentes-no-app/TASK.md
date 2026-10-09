# 026 — Skills e agentes no app (ler e editar em rich text, estilo Notion)

Status: entregue (2026-10-08); continua na 048 · Depende de: 018 (app) · Liga com: 019 (visual), 027 (galeria de formatos)

## Objetivo
Ver e gerenciar o "cérebro" do hub sem abrir arquivos: as **skills** (`.claude/skills/<nome>/`) e os **agentes** (`.claude/agents/*.md` + `.claude/agent-notes/*.md`) como mini pastas navegáveis, lidas como texto formatado e editáveis.

## Escopo
- **Aba Skills:** grade/lista de cartões (nome, descrição do frontmatter, grupo: produção · formatos `fmt-*` · vendas · pesquisa · sistema). Ao abrir: árvore da pasta (SKILL.md, `references/`, scripts), leitura em rich text e edição (o mesmo editor das Anotações), com o frontmatter em campos (nome, descrição = gatilho).
- **Aba Agentes:** cartão por agente (função, modelo, skills pré-carregadas, ferramentas). Ao abrir: as instruções (`agents/<x>.md`), as instruções permanentes (`agent-notes/<x>.md`, onde o Oliver mais escreve), as tarefas do quadro atribuídas a ele e o custo recente (025).
- **Segurança:** ao salvar, valida o frontmatter (nome, descrição, `model`, `tools`) e mostra o diff antes de gravar. Arquivos de script (`.mjs`/`.ts`) ficam só para leitura.
- São do repositório (globais): valem para todos os projetos, então ficam fora de "Projeto" no menu.

## Critérios de pronto
- [ ] Abas Skills e Agentes listando tudo, com busca
- [ ] Ler e editar SKILL.md / agente / agent-notes em rich text sem quebrar o frontmatter
- [ ] Editar pelo app e uma sessão nova do Claude já usar a versão nova (teste)

## Log
- 2026-10-07: registrada a pedido do Oliver.
- 2026-10-08: entregue no app (Agentes e skills: abas Em andamento · Equipe · Skills · Histórico, página do agente e da skill, editor Tiptap). Ficaram para a 048: frontmatter em campos de verdade (formulário), validação e diff antes de gravar.
