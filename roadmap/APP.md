# App do hub — visão e modelo de dados

> Registrado em 2026-10-07. **A interface (Vite) só começa depois do MVP** (12 posts da kz). O **formato dos arquivos** é decidido antes, para não ter que migrar tudo depois (tarefa 007).

## Princípio central
**Os arquivos do repo são a fonte da verdade.** A interface lê e escreve os mesmos arquivos que o Claude edita, via um servidor local leve. Nada de banco de dados por enquanto: markdown com cabeçalho YAML (*frontmatter*) para o que é texto, e YAML/JSON para dado estruturado ou coletado. Assim o git versiona tudo, o Claude entende tudo e a interface só dá forma.

## Módulos (o que o usuário pediu)
| módulo | o que faz |
|---|---|
| **Projetos** | trocar entre empresas (cada empresa = um projeto) |
| **Contexto e personas** | ver e editar os arquivos de contexto e as personas; **anotações e comentários** em trechos |
| **Concorrentes** | cadastrar concorrente (site, redes, IDs); monitorar posts do Instagram, anúncios (Meta, Google, TikTok) e canais do YouTube; ranking do que engaja mais; **favoritar**; atualizar sob comando |
| **Kanban** | backlog + quadros por projeto; tarefas com descrição e checklist; **responsável = eu ou um agente** |
| **Agentes** | agentes gerais (valem para todos os projetos), cada um com instruções, skills e ferramentas próprias; um pode pedir revisão a outro |
| **Peças** | galeria de carrosséis, vídeos e anúncios exportados por projeto |
| **Configurações** | chaves de API (`.env`), por exemplo ElevenLabs para o agente de vídeo |

## Modelo de dados (proposta — validar na tarefa 007)
```
companies/<slug>/
  project.yml                      ← nome, cor, ícone, status, links, @ das redes (metadados para a UI)
  context/*.md                     ← já existe (frontmatter mínimo: title, updated)
  context/personas/<persona>.md    ← 1 arquivo por persona (frontmatter: nome, papel, consciência, tags)
  brand/                           ← já existe
  competitors/<concorrente>/
    competitor.yml                 ← nome, site, instagram{handle,id}, youtube{channel_id}, tiktok, meta_page_id, google_advertiser_id, tags, prioridade
    snapshots/AAAA-MM-DD.json      ← coleta bruta (posts, métricas, anúncios) — grande → fora do git
    favorites.yml                  ← itens favoritados (link + por quê + ideia derivada)
    analises/AAAA-Wss.md           ← leitura semanal (o que funcionou, ângulos, ideias)
  board/T-0001-<slug>.md           ← 1 arquivo por tarefa (frontmatter abaixo)
  contents/ campaigns/ video-templates/   ← já existem
_comments/<caminho-do-arquivo>.json ← comentários/anotações da UI, ao lado do arquivo comentado
.claude/agents/<agente>.md         ← agentes gerais
.env  (fora do git) · .env.example ← chaves de API
```

**Tarefa do Kanban** (`board/T-0001-<slug>.md`):
```markdown
---
id: T-0001
title: Gravar 3 vídeos de funcionalidade
board: conteudo            # vários quadros por projeto
status: todo               # backlog | todo | doing | review | done
assignee: oliver           # oliver | agent:editor-de-video
priority: media            # baixa | media | alta
due: 2026-10-20
tags: [video, lancamento]
links: [contents/2026-10-15-lembrete/]
---
Descrição livre.

## Checklist
- [ ] Roteiro aprovado
- [ ] Render 4:5 e 9:16

## Log
- 2026-10-08 · agent:editor-de-video · plano enviado para aval
```
O `tasks.md` atual vira isso na tarefa 007 (migração simples).

**Comentário** (`_comments/companies/kz/context/AUDIENCE.md.json`):
`[{ "id": "c1", "anchor": {"heading": "Dores", "quote": "trecho comentado"}, "text": "…", "author": "oliver", "created": "…", "resolved": false }]`
A âncora é um trecho citado, não um número de linha: o comentário sobrevive a edições.

## Agentes (estilo Paperclip, mas nosso) — **implementado em 2026-10-07**
O Claude Code já tem isso nativamente: `.claude/agents/<nome>.md`, com frontmatter `name`, `description`, `tools`/`disallowedTools`, `model`, **`skills`** (pré-carregadas), `mcpServers`, `memory`, `permissionMode`. Um agente pode chamar outro (revisão) e roda pela linha de comando (`claude --agent <nome>`).

Agentes gerais (servem a qualquer projeto; a empresa é parâmetro). Implementados: estrategista, roteirista, designer, editor-de-video, revisor. Orquestrador = sessão principal + skill `orquestrar`. `trafego` foi absorvido pelo roteirista (copy de anúncio) e pelo estrategista (análise); `inteligencia` só quando o `INTEL.md` sair do papel.
| agente | skills | ferramentas extras |
|---|---|---|
| `estrategista` | setup, landing-page, launch-plan | web |
| `social` | content-ideas, ig-post, fmt-* de imagem, carousel | render PNG |
| `editor-de-video` | video, fmt-* de vídeo | kit de vídeo, **ElevenLabs**, ffmpeg |
| `trafego` | ads-meta (+ ads-google futuro) | — |
| `inteligencia` | monitoramento de concorrentes e tendências | coletores (`tools/intel/`), APIs |
| `revisor` | qa-copy, BRAND.md, compliance | só leitura + comentários; revisa o trabalho dos outros |

**Delegar:** tarefa com `assignee: agent:<nome>` → o pedido "rode as tarefas delegadas" faz o Claude principal abrir cada uma com o agente certo. O agente trabalha, escreve no `## Log` e move para `review`. Opcional: o `revisor` confere antes de `done`.

**Chaves (`.env`):** o Claude Code não isola variáveis por agente. A convenção é:
1. Todas as chaves ficam no `.env` local, fora do git.
2. Cada ferramenta (`tools/<x>/…`) lê **só a chave dela** (ex.: `ELEVENLABS_API_KEY`).
3. Cada agente só tem permissão para rodar as ferramentas dele (`tools` no frontmatter).

## Ordem sugerida
1. **007 — formato tipado** (antes de produzir muitos arquivos): project.yml, frontmatter, personas, board, comments, competitors.
2. Agentes gerais em `.claude/agents/` (barato; já funciona no terminal).
3. Coletores de concorrentes v0 (ver `INTEL.md`).
4. Interface Vite: Projetos → Kanban → Concorrentes → Contexto com comentários → Peças → Agentes.
