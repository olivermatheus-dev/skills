# Caixa de ideias

Tudo o que o usuário mencionar e ainda não virou tarefa. Formato: data · ideia · destino.

- 2026-10-06 · Tokens visuais e pasta de marca por empresa (logo, vetores, ícones, fontes) → 001
- 2026-10-06 · Repo genérico: cadastrar empresas e projetos pelo chat do Claude Code → 001 (básico) / DEPOIS (modo SaaS)
- 2026-10-06 · Arquivos pesados fora do git; destino definitivo depois → 001
- 2026-10-06 · Skills de vídeo em motion graphics com qualidade profissional → 002–004
- 2026-10-06 · Usuário vai mandar documentação e técnicas de editores profissionais → 002
- 2026-10-06 · Vídeos de lançamento da kz → 005
- 2026-10-06 · Editor com timeline, engenharia reversa, filmagem real, lote, Google Ads, interface, pesquisa → DEPOIS.md
- 2026-10-06 · Inteligência de mercado: anúncios dos concorrentes toda semana, redes próprias e de concorrentes, virais por hashtag/assunto, tendências do Google; tudo centralizado → INTEL.md
- 2026-10-06 · Tecnologia **JEV** para ordenar/ranquear de forma barata, sem LLM; o usuário tem vídeos de como construir → INTEL.md
- 2026-10-07 · Decisão: toda a gestão do negócio fica neste repo (cada empresa com seu projeto, documentos, ideias, pastas de carrosséis e vídeos exportados). O SaaS de marketing do usuário só puxa ideias daqui no futuro
- 2026-10-07 · Interface visual (Vite) para gerenciar tudo → só depois do MVP (DEPOIS.md)
- 2026-10-07 · Meta do MVP: 12 posts da kz (carrosséis, estáticos, motion sobre o produto) → 006
- 2026-10-07 · Mini skills por tipo/estilo de conteúdo: animações e recursos 3D, diálogos, memes, conteúdos diversos → 005
- 2026-10-07 · App: trocar entre projetos (empresas), personas, arquivos com **formato tipado** para a interface editar, anotar e comentar → APP.md, 007
- 2026-10-07 · Concorrentes: cadastrar (links, redes, IDs), monitorar posts do IG, anúncios Meta/Google e canais do YouTube, ranking de engajamento, favoritar, atualizar sob comando; listar ferramentas gratuitas → INTEL.md, APP.md
- 2026-10-07 · Kanban simples por projeto: backlog, vários quadros, tarefas com descrição e checklist, responsável = eu ou um agente (delegar) → APP.md, 007
- 2026-10-07 · Agentes estilo Paperclip AI, mas no nosso repo: agentes gerais com skills, instruções e ferramentas próprias; um revisa o outro → APP.md (nativo do Claude Code: `.claude/agents/`)
- 2026-10-07 · Chaves de API por `.env` (ex.: ElevenLabs para o agente de vídeo gerar áudio) → APP.md; `.env.example` criado
- 2026-10-07 · Agentes com instruções e skills próprias, orquestrador que delega, Kanban com visão do Oliver × visão da IA, planejamento em tarefas antes de executar → **implementado** (`.claude/agents/`, skill `orquestrar`, `tools/board.mjs`)
- 2026-10-07 · Falar com os agentes (instruções e trabalho junto), heartbeat que acorda o agente com tarefa pronta, tarefas recorrentes → **implementado** (`.claude/agent-notes/`, `claude --agent`, `tools/heartbeat.mjs`, `board/recorrentes.json`)
- 2026-10-07 · Áudio próprio: biblioteca de SFX e trilhas (baixar, gerar, compor), agente especializado em trilhas para objetivos e sensações diferentes → **implementado** (skill `audio`, agente `sound-designer`, `library/audio/`, `tools/audio/`); popular a biblioteca → tarefa 008
- 2026-10-07 · Voz: v1.0 com TTS gratuito; voz final ElevenLabs gerada fora da API a partir de um roteiro já formatado; encaixe automático do áudio → **implementado** (skill `locucao`, `tools/video/timeline.mjs vo`)
- 2026-10-07 · Trilha sempre presente (nunca fundo mudo), 2–3 candidatas gratuitas por vídeo, troca barata → skill `audio` + `timeline.mjs music`; MCP de edição → tarefa 009
- 2026-10-07 · Tom por vídeo (dramático, épico, animado…) ligado ao objetivo; campanha temática com abertura própria → `knowledge/video/direcao.md` (feito)
- 2026-10-07 · Publicidade criativa com IA: método para gerar e escolher boas ideias de campanha → 016
- 2026-10-07 · Integrações Higgsfield (vídeo IA), Suno (trilhas), ElevenLabs (voz) → 017
- 2026-10-07 · Vídeos com personagens caricatos (vetores com olhos e expressões) e modelos 3D → `fmt-personagem` no catálogo da 005
- 2026-10-07 · Kit de marca visual e fácil no app (tokens, fontes, raio, ícones, cores, presets de estilo, anotações) para padronizar carrossel/vídeo → 024
