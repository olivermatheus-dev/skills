# Roadmap do hub

Backlog de **construção do repositório**. Tarefas de marketing de cada empresa ficam em `companies/<slug>/tasks.md`.

## Meta do MVP
**12 posts da kz prontos para publicar** (carrosséis, posts estáticos e vídeos em motion graphics sobre o produto), produzidos por skills que funcionam de verdade, incluindo **mini skills por tipo e estilo de conteúdo** (3D, diálogos, memes etc.). A interface visual (Vite), a inteligência de mercado e o resto só vêm depois disso.

Princípios:
- **Só construir o que vai ser usado agora.** Ideia boa, mas não prioritária, vai para `IDEIAS.md` ou `DEPOIS.md`, sem pasta e sem código.
- **Repositório genérico e local.** A kz é a primeira empresa, não a única. Arquivos pesados ficam fora do git.
- **Qualidade profissional de fábrica.** Timing, easing e áreas seguras já vêm pré-configurados; a empresa só escolhe o estilo.

## Como trabalhar (1 tarefa por sessão)
1. Nova sessão (após `/clear`): leia este arquivo, depois `VIDEO.md`, e pegue a tarefa da vez.
2. Leia `tasks/<id>-<slug>/TASK.md`. Resolva as perguntas em aberto com o usuário antes de implementar.
3. Mude o status para `fazendo`, execute e valide os critérios de pronto.
4. Ao terminar: status `feita`, preencha o **Log** (o que foi feito, decisões, próximo passo), atualize esta tabela, faça commit + push.

Status: `rascunho` · `pronta` · `fazendo` · `feita` · `contínua`

## Tarefas (em ordem)
| id | tarefa | depende | status |
|---|---|---|---|
| 001 | [Estrutura de empresa + pasta de marca + `_inbox` (kz migrada)](tasks/001-estrutura-e-marca/TASK.md) | — | feita (faltam arquivos reais da kz) |
| 002 | [Base de conhecimento de motion (material do usuário → referências da skill)](tasks/002-conhecimento-motion/TASK.md) | — | feita (Etapas 1–15) |
| 003 | [Stack de render de motion + protótipo](tasks/003-stack-motion/TASK.md) | 001 | feita (kit em `tools/video-kit/`; falta teste 3D, aguarda prints) |
| 004 | [Motor de motion graphics v1 (skill base de vídeo)](tasks/004-skill-motion-v1/TASK.md) | 002, 003 | feita (skill + kit funcionando) |
| 005 | [Formatos: arquitetura e catálogo de mini skills por tipo/estilo de conteúdo](tasks/005-formatos-mini-skills/TASK.md) | 004 | 9 formatos escritos; imagem testada; vídeo depende do kit |
| 006 | [Meta: 12 posts da kz](tasks/006-meta-12-posts-kz/TASK.md) | 005 | rascunho |
| 008 | [Biblioteca de áudio inicial (famílias de SFX + 3–5 trilhas base)](tasks/008-biblioteca-audio/TASK.md) | 003 | SFX feitos (560, EditorPro); faltam trilhas e bases |
| 020 | [Skill de ElevenLabs + catálogo de vozes finais (por projeto)](tasks/020-skill-elevenlabs/TASK.md) | 003 | fazendo (skill, script e chaves por projeto feitos; falta voz da kz + teste real) |
| 022 | [Revisão com comentários ancorados (roteiro, vídeo em faixas, carrossel) + entrada de roteiros prontos](tasks/022-revisao-comentarios/TASK.md) | 018 | v1 de vídeo e **fase A (roteiro pronto + anotações no roteiro) feitas**; v1.1 (clicar no elemento) reaplicada; faltam as fases C e D |
| 021 | [Gestão de contexto pela própria IA (contexto declarado por tarefa, estado para retomar, log compacto)](tasks/021-gestao-de-contexto/TASK.md) | — | rascunho |
| 009 | [MCP de edição de vídeo (voz, trilha, duração, texto, prévia, render)](tasks/009-mcp-edicao-video/TASK.md) | 003 | rascunho |
| 010 | [Enxugar a base de vídeo + níveis de edição (simples · médio · alto)](tasks/010-enxugar-video/TASK.md) | 002 | feita |
| 011 | [Teste A/B de custo: Opus solo × Sonnet orquestrando subagentes](tasks/011-teste-custo-ab/TASK.md) | 003, 010 | feita (medida: `RESULTADO.md`; falta a nota cega do Oliver) |
| 012 | [Motor de ideias + framework de conteúdo (radar → painel ranqueado → marcação → análise barata → banco de ideias → ficha de pauta → roteiro)](tasks/012-motor-de-ideias/TASK.md) | 007 | rascunho (prioridade alta após o MVP) |
| 013 | [Cenas modulares + variantes de baixo custo (anúncios em série: tema, voz, duração, formato, gancho)](tasks/013-cenas-modulares-variantes/TASK.md) | 003 | rascunho (o contrato de cena já vale na skill `video`) |
| 014 | [Galeria reutilizável: componentes de motion, fx, looks, áudio + catálogo/índice + import do PC + promover](tasks/014-galeria-reutilizavel/TASK.md) | 003 | rascunho (prioridade alta, junto com o kit) |
| 015 | [Cortes e edits em escala (vídeos reais: Whisper + modelo barato + presets de edit)](tasks/015-cortes-e-edits/TASK.md) | 014, 003 | rascunho |
| 016 | [Publicidade criativa com IA (método de ideias de campanha)](tasks/016-publicidade-criativa/TASK.md) | 012, 013 | rascunho (em discussão) |
| 017 | [Geração com IA: Higgsfield, Suno, ElevenLabs](tasks/017-geracao-ia/TASK.md) | 016 | rascunho (futuro) |
| 018 | [App local + banco tipado em arquivos (quadro, concorrentes, ideias, personas, anotações, contexto) + coletores](tasks/018-app-mvp/TASK.md) | 007 | feita (v1) |
| 019 | [Interface rápida e otimista + visual shadcn/ui, Recharts, date-fns](tasks/019-ui-shadcn/TASK.md) | 018 | fazendo (pausada em ponto seguro) |
| 023 | [Análise de concorrentes por módulos (site, preços, features, LP, Reclame Aqui) + fila da IA](tasks/023-analise-concorrentes/TASK.md) | 018 | feita (v1; faltam APIFY_TOKEN, coletor de anúncios) |
| 024 | [Kit de marca visual e editável no app (tokens, fontes, ícones, estilo, anotações) + prévia ao vivo](tasks/024-kit-de-marca-visual/TASK.md) | 018 | feita (v1: brand.json → brand.css, editor + prévia no app, preset minimalista Apple, Lucide) |
| 025 | [Ficha de produção da peça: briefing (headline, tema, objetivo, formato), funil de status, custo em tokens, observações](tasks/025-ficha-de-producao/TASK.md) | central de peças (feita) | rascunho (prioridade alta) |
| 027 | [Galeria de tipos de conteúdo e formatos (framework global, "usar este estilo")](tasks/027-galeria-de-formatos/TASK.md) | 005 | fase A feita; B = 1 exemplo por formato |
| 028 | [Estúdio de mockups: print ou link → peça vendável (templates, fundos, aparelhos, 3D, animações; skill + editor no app)](tasks/028-estudio-de-mockups/TASK.md) | 024, 018 | fase A + galeria feitas; visual reprovado → refeito no editor (030 A feita) |
| 029 | [Motor de curadoria e séries automáticas (pesquisas, notícias, recomendações → séries fixas da kz; inventário do produto)](tasks/029-motor-de-curadoria/TASK.md) | 027, 028 | rascunho (análise feita, aval do Oliver) |
| 030 | [Editor de mockups no app (mini Canva: camadas, texto, fundo/gradiente/pattern, multi-formato, colar/arrastar) + refazer o visual com bom gosto](tasks/030-editor-de-mockups/TASK.md) | 028, 018 | **fase A feita (2026-10-07)**; aguarda aval do Oliver (fundos + teste) → fase B |
| 031 | [Concorrentes v2: estrutura de gestor de marketing (Panorama, Lista, Comparar, Conteúdos, Redes, Anúncios, Coletas), ficha por área, métricas das redes, Instagram sem token](tasks/031-concorrentes-v2/TASK.md) | 023, 019, 012 | **fases A–D feitas (2026-10-08)**: ficha, Instagram sem token, abas, anúncios da Meta, coleta semanal sob comando; aguarda uso/aval |
| 032 | [Kanban v2: criar na coluna (Trello), comentários da IA no card, botão Rodar IA (heartbeat/terminal), visual](tasks/032-kanban-v2/TASK.md) | 018, 019 | **fase A feita (2026-10-08)**; falta o `/login` do Claude no terminal para o 1º teste real |
| 033 | [Upgrade do HyperFrames 0.8.94 → 0.8.141 + motion blur nativo opcional](tasks/033-upgrade-hyperframes/TASK.md) | 003 | **feita (2026-10-08)**: 0.8.141 na main, blur nativo opcional (`--blur=nativo`) |
| 026 | [Skills e agentes no app (mini pastas, rich text, editar)](tasks/026-skills-e-agentes-no-app/TASK.md) | 018 | rascunho |
| 007 | [Formato tipado dos arquivos (projeto, personas, kanban, comentários, concorrentes)](tasks/007-formato-tipado/TASK.md) | — | Kanban + agentes feitos; faltam project.yml, personas, comentários, concorrentes |

Adiado (sem pasta): ver `DEPOIS.md`. Depois do MVP: app em Vite (`APP.md`: projetos, kanban, concorrentes, agentes) e `INTEL.md` (monitoramento de concorrentes e tendências). Caixa de entrada: `IDEIAS.md`.
