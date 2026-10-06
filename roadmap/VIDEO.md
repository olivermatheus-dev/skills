# Projeto Vídeo — visão

> Documento-mãe do vídeo. Atualize quando uma decisão mudar a visão.

## Foco agora
**Motion graphics** (a maior parte dos vídeos): vídeos gerados pelo Claude com HTML/CSS/JS animado → MP4, usando a identidade da marca. Primeiro uso: **vídeos de lançamento da kz**.

## O que o usuário quer (resumo das palavras dele)
- Um **conjunto de skills de vídeo**, não uma só, muito bem pensadas e com qualidade de editor profissional.
- O usuário vai mandar **muita documentação, ideias e técnicas de editores profissionais**. O Claude decide a melhor forma de transformar isso em skills funcionais (tarefa 002, contínua).
- Começa por um **briefing**: plataforma, formato e duração (Instagram, TikTok, YouTube longo…).
- **Padronização por empresa**: mesma comunicação visual em todos os vídeos e vários **templates** por empresa (de uma moldura com texto estático até uma edição bem dinâmica).
- Parâmetros de movimento pré-configurados com qualidade profissional; não precisa personalizar por empresa.
- Depois (ver `DEPOIS.md`): engenharia reversa de estilo a partir de um vídeo de referência, edição de filmagem real, editor com timeline e produção em lote.

## Conceitos (validar na 003/004)
| conceito | o que é | onde mora |
|---|---|---|
| Presets globais | timing, easing, áreas seguras, tamanhos mínimos, ritmo por formato | dentro da skill |
| Formato | plataforma + proporção + duração (9:16, 4:5, 1:1, 16:9) | preset |
| Template | receita de um tipo de vídeo de uma empresa: layout, tipografia, animações, transições, ritmo, intro/outro | `companies/<slug>/video-templates/<nome>/` |
| Marca | cores, fontes, logo, vetores, ícones | `companies/<slug>/brand/` + `context/VISUAL.md` |
| Projeto de vídeo | briefing + roteiro + cenas + render | `contents/` ou `campaigns/` (MP4 fora do git) |

Fluxo alvo:
```
briefing → roteiro (persuasivo) → plano de cenas → HTML/CSS animado (template + marca + presets) → render MP4 → revisão
```
