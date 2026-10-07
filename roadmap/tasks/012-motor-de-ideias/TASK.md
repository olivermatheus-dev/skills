# 012 — Motor de ideias + framework de produção de conteúdo

Status: rascunho (prioridade alta, logo após o MVP de vídeo) · Depende de: 007 (Kanban/agentes, feito em parte) · Amplia: `roadmap/INTEL.md`
Pedido do Oliver em 2026-10-07: um fluxo integrado que **descobre referências → ranqueia → o Oliver marca → analisa só o marcado → vira ideia com briefing → pesquisa e roteiro → revisão → produção**, em escala e com modelos baratos.

## 1. O fluxo (com os portões do Oliver)
| # | etapa | quem | automático? | custo |
|---|---|---|---|---|
| 1 | **Descobrir fontes:** concorrentes **e** páginas/criadores que viralizam no tema (não só empresas) | agente `pesquisador`, skill `radar` | sob comando | busca na web |
| 2 | **Mapear perfis:** site, Instagram (@/ID), YouTube (canal), TikTok, página de anúncios | `radar` | sob comando | busca na web |
| 3 | **Coletar metadados** de todos os vídeos: título/legenda, data, views, curtidas, comentários, duração, thumbnail, link | coletores (`tools/intel/`) | sim (agenda ou botão) | APIs grátis / scraper pago por uso |
| 4 | **Painel ranqueado** por plataforma e por fonte (ver §3) | script, sem LLM | sim | zero |
| 5 | **Oliver marca** o que vale analisar ✓ / descarta ✗ | **Oliver** | — | — |
| 6 | **Analisar só o marcado:** transcrição + tema, gancho, estrutura, estilo editorial, formato | skill `referencias` | sim, após a marca | modelo barato (§4) |
| 7 | **Banco de ideias:** cada ideia com origem, análise, **observações e briefing do Oliver** | `pesquisador` + **Oliver** | — | — |
| 8 | **Ficha de pauta** (§5) → pesquisa de aprofundamento → roteiro | `estrategista` → `roteirista` | via Kanban | modelo médio |
| 9 | **Revisão do Oliver** (objetivo, proposta, roteiro) → produção (`video`/`carousel`) → `revisor` → entrega | Kanban | — | — |

Regra de ouro: **ninguém analisa tudo.** Coletar e ranquear é barato e automático; LLM só entra no que o Oliver marcou.

## 2. Agente e skills (mínimo)
- **Agente novo `pesquisador`** (modelo barato por padrão): descobre fontes, mapeia perfis, roda coletores, analisa referências marcadas, alimenta o banco de ideias.
- **Skill `radar`:** listar concorrentes e páginas de referência por várias técnicas (busca por palavra-chave e hashtag, "contas parecidas", quem anuncia o mesmo termo na Biblioteca de Anúncios, canais do YouTube por tema, menções de clientes) → `companies/<slug>/intel/fontes.md`.
- **Skill `referencias`:** coletar (via `tools/intel/`), ranquear, montar o painel e analisar os itens marcados.
- O que já existe e é reaproveitado: `content-ideas` (Modo 3, engenharia reversa), `ig-post` (`references/hooks.md`), `estrategista`, `roteirista`, `orquestrar`, Kanban.

## 3. Ranqueamento (barato, sem LLM)
- **Outlier score = views ÷ mediana de views dos últimos ~30 vídeos da mesma fonte.** Acha o vídeo que funcionou *para aquele perfil*, sem favorecer quem é grande. ≥ 3× = destaque.
- Também: engajamento ((curtidas + comentários) ÷ views), views por dia desde a publicação (normaliza idade), e views ÷ seguidores.
- Filtros: plataforma, fonte, período, duração, formato. Ordenação padrão: outlier score.
- O ranqueador **JEV** do Oliver entra aqui quando chegar o material (ordenar muitos itens sem LLM).

## 4. Extração barata de tema e estilo
| plataforma | metadados | fala/tema |
|---|---|---|
| **YouTube** | YouTube Data API v3 (grátis, cota diária) ou RSS | legenda automática via `yt-dlp --write-auto-subs --skip-download` (sem baixar vídeo); sem legenda → áudio + Whisper local |
| **Instagram** | Graph API Business Discovery (grátis, exige conta IG profissional própria; **não traz views de reels de terceiros**) ou scraper pago por uso (Apify) quando precisar de views e URL do vídeo | baixar só os **marcados** (`yt-dlp` ou URL do scraper) → `ffmpeg` extrai o áudio → **Whisper local** (faster-whisper, grátis, roda no PC) → texto |
| **TikTok** | scraper pago por uso / Creative Center | igual ao Instagram |

- **Análise do texto:** o modelo **mais barato** (hoje Haiku 4.5) extrai: tema, gancho (texto + tipo), promessa, estrutura, CTA, estilo editorial (`knowledge/video/direcao.md`), formato `fmt-*` equivalente. Saída em JSON curto.
- **Visual (só se precisar):** 3–6 quadros por `ffmpeg` (troca de cena) + thumbnail → mesmo modelo barato com visão, para estilo de legenda, cores e ritmo de cortes.
- Bruto (vídeos, áudio, JSON, thumbnails) fica **local, fora do git** (`data/intel/` + SQLite). No git só o digerido.

## 5. Framework de conteúdo (ficha de pauta = contrato de cada peça)
Toda peça nasce com esta ficha (vira a seção 1 do `roteiro.md`/`plano.md`):
1. **Objetivo (1 só):** informar · trazer novidade · gerar curiosidade · engajar (comentário/envio) · converter · polêmica controlada (raro, com aval explícito, nunca contra pessoas ou contra as regras do nicho).
2. **Mensagem principal** em 1 frase (o que a pessoa leva).
3. **Público e nível de consciência.**
4. **Gancho** (tipo + texto). **Nunca engana:** a promessa do gancho é entregue no vídeo, e cedo (até ~60% da duração). Clickbait que não entrega é proibido.
5. **Estrutura de retenção:** gancho → contexto em 1 frase → loop aberto (o que vem) → entrega em passos → payoff → CTA coerente com o objetivo.
6. **Prova/fonte** de cada afirmação; formato (`fmt-*`) e estilo editorial; tom (`VOICE.md`).
7. **Métrica de sucesso** do objetivo (ex.: envios para curiosidade/engajamento; cliques para conversão) → volta para `CONTENT_STRATEGY.md` como aprendizado.

## 6. Dados (arquivos)
```
companies/<slug>/intel/
  fontes.md                 ← concorrentes e páginas de referência (links, IDs, por que segue)
  ideias/I-NNNN-<slug>.md   ← 1 ideia por arquivo: origem, métricas, análise, status, observações e briefing do Oliver
competitors/<id>/snapshots/  ← coletas imutáveis (JSON, no git); media/ (imagens, fora do git)
data/intel/ (fora do git)   ← vídeos/áudios baixados e transcrições dos itens marcados
```
Status do **item coletado** (`marks.json`): `nova → marcada → analisada | descartada`. Status da **ideia** (`ideas/`): `nova → analisada → aprovada → virou-tarefa (T-NNNN) | descartada`. Ideia aprovada vira tarefa no Kanban com a ficha (§5) preenchida.
Painel: no início, `node tools/intel/painel.mjs <slug>` gera um HTML local (thumbnails, métricas, filtros, marcar ✓/✗); depois vira tela do app Vite (`APP.md`).

## 7. Fases (80/20)
1. **v0 (sem scraper):** `radar` + YouTube (API grátis + legendas) + painel HTML + marcação + análise barata + banco de ideias + ficha de pauta. Valida o fluxo inteiro.
2. **v1:** Instagram (Business Discovery para métricas básicas; download só dos marcados + Whisper local).
3. **v2:** scraper pago por uso para views de reels/TikTok, anúncios da Meta, coleta agendada, ranqueador JEV, produção em lote.

## Perguntas em aberto
- [ ] Orçamento mensal para scraper pago por uso (Apify ou similar)?
- [ ] A kz tem conta IG profissional + app Meta para a Graph API?
- [ ] Haiku 4.5 como padrão da análise está ok (com Whisper local para transcrição)?
- [ ] Quantas fontes por empresa no começo (sugestão: 10–20)?
- [ ] Respeitar Termos de Uso: referências são **inspiração** (tema, estrutura, estilo), nunca cópia de texto, imagem ou áudio.

## Log
- 2026-10-07: pedido registrado e desenhado (fluxo, agente, skills, ranqueamento, extração barata, framework, dados, fases).
