# 048 — Ficha de agente e de skill (formulário guiado: especialista + contexto exato) e revisão das skills

Status: registrada (não começou) · Depende de: 026 (Agentes e skills no app, entregue em 2026-10-08) · Liga com: 021 (`context:` das tarefas, `tools/contexto.mjs`), skill `orquestrar` (protocolo), todos os agentes de `.claude/agents/`

## Pedido do Oliver (2026-10-08, palavras dele resumidas)
- Dentro de um **agente** e de uma **skill**, a visualização padrão deve ser uma **estrutura pré-definida em campos (formulário)** que direciona quem escreve. Editar o arquivo direto continua possível, mas é a segunda opção.
- Campo mais importante: **o contexto de especialista**. É o que faz o agente ou a skill se portar como especialista no assunto, a peça central da estrutura do prompt.
- Uma **parte dedicada (select)** para os **arquivos de contexto** que o agente ou a skill precisa ler. Tem que ser fácil de ver ao entrar numa skill: "o roteirista, dentro desta skill, lê isto, isto e isto".
- Objetivo: **nenhum agente fica pensando no que precisa ler nem procurando**. Cada um recebe a informação precisa e exata do contexto que deve trazer. Isso também evita erro nosso.
- Várias skills estão boas, mas **precisam de revisão** para melhorar instruções e estrutura.

## Situação hoje (ponto de partida)
- App → Agentes e skills: página do agente (aba Instruções e skills) e página da skill já mostram os arquivos e editam em rich text (`components/agentes/Arquivos.tsx`, API `core/skills.ts`). O frontmatter aparece como bloco "Propriedades" (chave: valor cru).
- O que cada agente lê hoje está **em texto livre**: seção "Ler antes" em `.claude/agents/<x>.md`, "Entradas" nos `SKILL.md`, mais o `context:` por tarefa (021). Não há lista estruturada nem conferência de que o arquivo existe.

## Desenho a decidir (propostas para a sessão limpa)
1. **Molde da ficha** (o mesmo para agente e skill, com campos próprios de cada um):
   - Papel de especialista (quem é, nível, repertório, critérios de qualidade e o que **não** faz);
   - Quando usar (gatilho/descrição do frontmatter);
   - **Contexto obrigatório**: lista de arquivos e seções (`arquivo#Seção`, mesmo formato do `context:` da 021) escolhidos num select com busca sobre `companies/<slug>/context/`, `brand/`, `knowledge/`, `references/` da skill; com marcação "sempre" × "só quando…";
   - Entradas e saídas (o que recebe, o que entrega e onde salva);
   - Ordem de trabalho (passos);
   - Regras duras / Nunca;
   - Checklist de qualidade antes de entregar;
   - Agente: modelo, cor, skills ativas, ferramentas.
2. **Onde gravar**: campos estruturados no frontmatter (ex.: `contexto:` em lista) + seções com títulos fixos no corpo, para o arquivo continuar legível pelo Claude Code e editável à mão. Formulário ↔ markdown nos dois sentidos, sem perda.
3. **Contexto por agente dentro da skill**: quando uma skill é usada por mais de um agente, permitir "o roteirista lê X; o designer lê Y" (ex.: bloco `contexto_por_agente:`).
4. **Conferência automática**: `npm run validate` (ou um `tools/agentes.mjs check`) acusa arquivo/seção de contexto que não existe e ficha sem campo obrigatório; o app mostra o aviso na ficha.
5. **Uso pelo agente**: `node tools/board.mjs pacote` passa a juntar o contexto declarado no agente + skill + tarefa, para o agente não procurar nada.
6. **Revisão das skills** (depois do molde): passar cada skill e agente pelo molde, com um subagente Opus revisando (papel de especialista, contexto exato, ordem, checklist) e o Oliver aprovando skill por skill.

## Perguntas para o Oliver (fazer no começo da sessão)
- O formulário substitui a aba de arquivo como visão padrão (com "Editar o arquivo" como alternativa) ou fica ao lado?
- Contexto por **projeto**: a ficha aponta para `companies/<slug>/context/…` genérico (vale para toda empresa) ou por empresa?
- Revisão das skills: todas de uma vez em ondas, ou começar pelas mais usadas (roteirista/`ig-post`, `video`, `plano-de-cenas`, `carousel`)?

## Critérios de pronto
- [ ] Molde da ficha definido e aprovado pelo Oliver
- [ ] App: agente e skill abrem na ficha (campos) com o select de arquivos de contexto; arquivo cru continua acessível
- [ ] Contexto declarado conferido automaticamente (arquivo/seção existe)
- [ ] `board.mjs pacote` entrega o contexto exato (agente + skill + tarefa)
- [ ] Skills e agentes revisados no molde, com aval do Oliver

## Log
- 2026-10-08: registrada a pedido do Oliver (para tratar numa sessão limpa).
