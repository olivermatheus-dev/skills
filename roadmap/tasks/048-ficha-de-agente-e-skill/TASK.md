# 048 — Ficha de agente e de skill (formulário guiado: especialista + contexto exato) e revisão das skills

Status: em andamento (molde, app, conferência e pacote feitos; roteirista + ig-post no molde como exemplo, aguardando aval) · Depende de: 026 (Agentes e skills no app, entregue em 2026-10-08) · Liga com: 021 (`context:` das tarefas, `tools/contexto.mjs`), skill `orquestrar` (protocolo), todos os agentes de `.claude/agents/`

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

## Decisões do Oliver (2026-10-08, começo da sessão)
- Ficha é a visão **padrão**; "Editar o arquivo" abre o markdown cru (o mesmo arquivo).
- Contexto **genérico**: `context/…`, `brand/…` valem para toda empresa (o agente lê a do projeto da tarefa).
- Revisão: **mais usadas primeiro** (onda 1: roteirista + ig-post · editor-de-video + video + plano-de-cenas · designer + carousel), aval por onda.

## Feito (2026-10-08)
- **Molde:** `.claude/skills/orquestrar/references/ficha.md`. Frontmatter do Claude Code (description = Quando usar; model, color, skills, tools) + seções fixas no corpo: `## Especialista`, `## Contexto` (lista ``- `ref` · sempre|quando: X · só: agente — para quê``), `## Entradas e saídas`, `## Ordem de trabalho`, `## Regras duras`, `## Checklist antes de entregar`; outras seções ficam intactas. No corpo (e não em chaves novas do frontmatter) para o Claude Code seguir lendo tudo e o agente ver o próprio contexto.
- **Leitor/gravador:** `tools/lib/ficha-agente.mjs` (+ `.d.mts`): parse ⇄ markdown sem perda (34 arquivos: gravar sem mudança = idêntico), conferência das refs em cada empresa, `contextoDoAgente`, candidatos do select.
- **CLI:** `node tools/agentes.mjs check | contexto <agente> [--skill] [--ler] | ficha <id>`; `npm run validate` acusa ficha no molde com ref quebrada ou campo obrigatório vazio (fora do molde não acusa).
- **Pacote:** `board.mjs pacote` junta tarefa + ficha do agente ("sempre", com o texto) + `skills:` da tarefa (campo novo em `schema/task.ts`); "quando:" e skills não citadas entram como índice. Protocolo e `orquestrar` atualizados.
- **App:** definição do agente e `SKILL.md` abrem na **Ficha** (`components/agentes/Ficha.tsx`): Quando usar (+ modelo, cor, ferramentas), Especialista em destaque, Contexto com select com busca (arquivo ou seção) e conferência ao vivo (✓/⚠/✗), Sempre × Só quando…, "para quê", "Quem lê" por agente na skill + quadro "o que cada agente lê", leitura total do agente; demais campos em Tiptap; outras seções recolhíveis; "Editar o arquivo" ⇄ "Ver a ficha" (`?modo=arquivo`). Rotas `/api/ficha/:tipo/:id`, `/api/ficha-candidatos`, `/api/ficha-refs`. Testado no app: abrir, buscar, adicionar, salvar (só a linha nova mudou no arquivo).
- **Exemplo no molde:** `roteirista` + `ig-post` (sem perder conteúdo; Especialista novo, Contexto exato).

## Critérios de pronto
- [ ] Molde da ficha definido e aprovado pelo Oliver (definido; falta o aval)
- [x] App: agente e skill abrem na ficha (campos) com o select de arquivos de contexto; arquivo cru continua acessível
- [x] Contexto declarado conferido automaticamente (arquivo/seção existe)
- [x] `board.mjs pacote` entrega o contexto exato (agente + skill + tarefa)
- [ ] Skills e agentes revisados no molde, com aval do Oliver

## Log
- 2026-10-08: registrada a pedido do Oliver (para tratar numa sessão limpa).
- 2026-10-08: decisões do Oliver; molde, leitor, CLI, validate, pacote e ficha no app feitos; roteirista + ig-post migrados como exemplo. Próximo: resto da onda 1 (editor-de-video + video + plano-de-cenas · designer + carousel) com revisão Opus → aval do Oliver.
- 2026-10-08: onda 1 no molde (revisão Opus): editor-de-video + video + plano-de-cenas, designer + carousel; check ✓ nos 7. Bug do leitor corrigido (parêntese no fim do "quando:"). Aguardando aval do Oliver.

## Para o Oliver decidir (achados da onda 1)
1. Tempo máximo sem nada novo na tela: `knowledge/video/REGRAS.md` diz 2–3 s, os Padrões do Oliver dizem ~1,5 s. As fichas seguem 1,5 s; alinhar o REGRAS.md?
2. Template do carrossel: `.compare .yes` pinta uma coluna inteira em coral, e o BRAND.md da kz diz "coral nunca em blocos grandes". Trocar no template?
3. `.inverse` usa `--primary` como padrão: numa empresa nova vira bloco coral cheio (na kz o brand.css já suaviza).
4. BRAND.md da kz: "Sem serifa" × Fraunces itálico como serifa de destaque. Qual vale?
5. `library/INDEX.md` citado na galeria do vídeo ainda não existe (tarefa 014).
