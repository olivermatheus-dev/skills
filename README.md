# Hub de marketing com Claude Code

Central de estratégia, conteúdo, vídeo, anúncios e vendas das empresas do Oliver. Tudo vive em arquivos neste repositório: o **Claude Code** produz (skills e agentes) e a **interface local** organiza (quadro, concorrentes, ideias, personas, anotações).

## 1. Instalar (uma vez, no Windows)

| o quê | para quê | como |
|---|---|---|
| Git | baixar e versionar | https://git-scm.com |
| Node.js 22 LTS | interface e ferramentas | https://nodejs.org (ou `winget install OpenJS.NodeJS.LTS`) |
| Claude Code | trabalhar com as skills e agentes | https://claude.com/claude-code |
| Python 3 + yt-dlp | coletar YouTube/TikTok | `winget install Python.Python.3.12` → `pip install -U yt-dlp` |
| ffmpeg | vídeo, áudio, QC | `winget install Gyan.FFmpeg` |

```bash
git clone https://github.com/olivermatheus-dev/skills.git
cd skills
npm install                     # dependências da interface e das ferramentas
npx playwright install chromium # só para exportar carrossel em PNG
copy .env.example .env          # e preencha as chaves que for usar (ver abaixo)
npm run validate                # confere se todos os arquivos de dados estão no formato certo
```

**Chaves (`.env`, nunca vai para o git; cada ferramenta lê só a sua):**
| chave | precisa para | obrigatória? |
|---|---|---|
| `APIFY_TOKEN` | Instagram com views (coletor) | só para Instagram |
| `YOUTUBE_API_KEY` | YouTube mais rápido (senão usa yt-dlp) | não |
| `ELEVENLABS_API_KEY` | voz e efeitos gerados | só para áudio final |
| `META_ACCESS_TOKEN`, `META_IG_BUSINESS_ID` | Instagram oficial (futuro) | não |
| `YTDLP_COOKIES_FROM_BROWSER=chrome` | se o TikTok/Instagram bloquear | não |

## 2. Usar no dia a dia

**Interface (painel):**
```bash
npm run app        # compila e abre http://localhost:5173 (modo rápido)
npm run app:dev    # modo desenvolvimento (recarrega ao editar o código do app)
```
Telas: visão geral · quadro (Kanban) · concorrentes (colar links → Puxar) · ideias · personas · anotações · contexto e marca.

**Claude Code (produção):**
```bash
claude             # na pasta do repo; skills e agentes carregam sozinhos
```
Exemplos de pedido:
- `10 ideias de conteúdo para a kz` · `roteiro de reels sobre faltas de pacientes` · `transforma esse roteiro em carrossel`
- `faz um vídeo de recorte da funcionalidade de lembrete (nível médio)`
- `acha concorrentes e páginas de referência da kz` (agente `pesquisador`) · `analisa os vídeos que marquei`
- `delega: campanha de lançamento da kz` (orquestrador cria as tarefas e distribui aos agentes)

**Ferramentas de terminal:**
| comando | faz |
|---|---|
| `npm run collect -- kz <id\|--all>` | puxa os concorrentes (nova coleta, histórico preservado) |
| `node tools/board.mjs kz --me` | quadro no terminal (`--ai`, `--check`) |
| `node tools/heartbeat.mjs --run` | acorda os agentes com tarefa pronta e cria as recorrentes |
| `node tools/video/qc.mjs <pasta> --sheet` | QC do MP4 final |
| `node tools/video/timeline.mjs show <pasta>` | ajustar voz, duração, texto e trilha de um vídeo sem reescrever |
| `npm run validate` · `npm run typecheck` · `npm run test:intel` | conferências |

## 3. Etapas para começar (ordem recomendada)
1. **Instalar** (seção 1) e abrir a interface: `npm run app`.
2. **Projeto kz:** em *Contexto e marca*, revisar os 6 documentos (estão desatualizados: preço, trial, links, @ do Instagram) e os dados do projeto.
3. **Marca:** colocar logo, ícones e prints do produto em `_inbox/` e pedir ao Claude `organiza os arquivos da kz` (skill `setup`).
4. **Concorrentes:** em *Concorrentes*, abrir cada um e colar os links (Instagram, YouTube, TikTok, site) → **Puxar**. Marcar ★ e "marcada" no que vale analisar → pedir `analisa o que marquei` → as ideias aparecem em *Ideias*.
5. **Kit de vídeo** (tarefa `roadmap/tasks/003`): trazer o kit de render e fazer o 1º vídeo no nível simples.
6. **Áudio** (tarefa 008): baixar 3–5 trilhas e famílias de efeitos com licença para `library/audio/`.
7. **Meta do MVP:** 12 posts da kz pelo fluxo (ideia → roteiro → peça → revisão).

## 4. Onde fica cada coisa
| pasta | conteúdo |
|---|---|
| `companies/<slug>/` | tudo de uma empresa: `context/`, `brand/`, `board/`, `personas/`, `notes/`, `ideas/`, `competitors/`, `contents/`, `campaigns/` |
| `schema/` | formato de cada arquivo de dados (o "banco") — validado por `npm run validate` |
| `.claude/skills/` · `.claude/agents/` | skills e agentes do Claude Code |
| `knowledge/video/` | regras de vídeo (`REGRAS.md` é o núcleo) |
| `library/` | áudio e recursos visuais reutilizáveis (com licença) |
| `tools/` | ferramentas de terminal · `app/` interface local |
| `roadmap/` | evolução do hub: **comece por `roadmap/ESTADO.md`** |

Regras: arquivos pesados (vídeo, áudio, mídia baixada) não vão para o git; sem licença registrada, nenhum asset é usado; nunca inventar preço, número ou depoimento. Detalhes em `CLAUDE.md`.
