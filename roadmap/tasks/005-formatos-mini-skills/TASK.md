# 005 — Formatos: arquitetura e catálogo de mini skills por tipo/estilo de conteúdo

**Status:** rascunho · **Depende de:** 004

## Objetivo
Ter **uma mini skill por tipo/estilo de conteúdo**, curta e precisa, que sabe montar aquele formato muito bem (estrutura, ritmo, regras e exemplo) e usa os motores compartilhados para gerar a peça:
- `carousel` → imagens
- motor de motion (004) → vídeo
- post estático → imagem única (pode reaproveitar o `carousel` com 1 slide)

## Contexto
O usuário: "mini skills para cada tipo de conteúdo, estilo de conteúdo. Iremos utilizar animações 3D, recursos 3D, montaremos diálogos, criaremos memes e conteúdos diversos."

## Arquitetura proposta (validar)
- **Motores** (poucos, robustos): `carousel`, `motion` (004). Concentram o técnico: render, presets, marca.
- **Formatos** (muitos, pequenos, ~300–600 palavras cada): `.claude/skills/fmt-<nome>/SKILL.md`, com:
  - quando usar (objetivo e funil)
  - estrutura (cenas ou slides com tempo)
  - regras de estilo
  - 1 exemplo
  - motor a usar
  - parâmetros que o usuário pode mudar
- Prefixo `fmt-` para o Claude achar e listar os formatos com facilidade. O `ig-post` escolhe o formato ou o usuário pede direto ("faz um fmt-dialogo sobre…").
- Ativos de formato reutilizáveis (moldura de chat, modelos 3D, templates de meme) ficam em `.claude/skills/fmt-<nome>/assets/`. Os ativos da marca continuam em `companies/<slug>/brand/`.
- Regra contra inchaço: formato novo só entra quando houver uso real. Se dois formatos ficarem quase iguais, vira parâmetro de um só.

## Catálogo inicial (rascunho, priorizar com o usuário pela meta dos 12 posts)
| formato | motor | ideia |
|---|---|---|
| `fmt-post-frase` | estático | frase de impacto/insight na identidade da marca |
| `fmt-meme` | estático/motion | meme do nicho (formato conhecido + situação real da persona) |
| `fmt-dialogo` | motion | conversa animada (ex.: WhatsApp terapeuta × paciente, terapeuta × kz) |
| `fmt-demo-produto` | motion | prints/gravação do produto com zoom, destaques e legendas |
| `fmt-3d-produto` | motion (3D) | dispositivo 3D girando com a tela do produto, cenas 3D de impacto |
| `fmt-texto-cinetico` | motion | hook → dor → solução → CTA só com tipografia animada |
| `fmt-antes-depois` | carrossel/motion | rotina caótica (5 apps) × rotina com a kz |
| `fmt-carrossel-educativo` | carrossel | lista/passo a passo para salvar |

## Perguntas em aberto
- [ ] Quais formatos entram nos 12 posts da kz (prioridade)?
- [ ] Referências de cada estilo (memes, diálogos, 3D) que o usuário gosta

## Critérios de pronto
- [ ] Arquitetura documentada no `CLAUDE.md`
- [ ] Os formatos necessários para os 12 posts implementados e testados com 1 peça cada

## Log
- 2026-10-07 — criada a partir do pedido do usuário.
