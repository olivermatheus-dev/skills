# Projeto Vídeo — visão

> Documento-mãe do projeto de vídeo. Cada tarefa 1xx detalha uma parte. Atualize aqui quando uma decisão mudar a visão.

## O que o usuário quer (palavras dele, resumidas)
- "Praticamente um **aplicativo de edição de vídeo integrado ao Claude Code**, com configurações, presets e skills muito bem definidas."
- Dois tipos de vídeo: com **base real** (filmagem) e **100% motion design**.
- Não é uma skill só — é um **conjunto**: começa por um **briefing** (plataforma, formato, duração: Instagram, TikTok, YouTube longo…).
- **Engenharia reversa:** passar um vídeo de referência e o Claude extrair o estilo — edição, legenda, fonte da legenda (e se varia), estilo dos cortes — para produzir mais vídeos iguais.
- **Padronização por empresa:** mesma comunicação visual em todos os vídeos; produzir muitos vídeos com a mesma estrutura e direção.
- **Vários templates por empresa:** cada tipo de conteúdo tem o seu. Vai de uma **moldura com texto estático** em volta do vídeo até uma **edição dinâmica** completa.
- Parâmetros técnicos de movimento vêm **pré-configurados com qualidade profissional** — não precisa customizar por empresa.

## Conceitos (rascunho — validar na 101/102)
| conceito | o que é | onde mora |
|---|---|---|
| **Preset global** | defaults técnicos profissionais: timing, easing, safe areas, tamanhos de legenda por formato, ritmo de corte | dentro do editor (`video/presets/`) |
| **Formato** | plataforma + proporção + duração (reels 9:16 ≤90 s, feed 4:5, YouTube 16:9 longo…) | preset global |
| **Template de vídeo** | receita de um tipo de conteúdo de uma empresa: layout/moldura, estilo de legenda, ritmo e estilo de corte, overlays, transições, intro/outro, música | `companies/<slug>/video-templates/<nome>/` |
| **Tokens da marca** | cores, fontes, logo, vetores — lidos pelo template | `companies/<slug>/brand/` |
| **Briefing** | pedido de um vídeo: template + formato + roteiro + material bruto | pasta do vídeo |
| **Projeto de vídeo** | briefing + material + render final | local, fora do git |

Fluxo alvo:
```
referência ──(engenharia reversa)──► template da empresa
roteiro (ig-post) + material bruto ──(briefing)──► projeto de vídeo ──(render)──► MP4
                                      template + tokens + preset ─┘
```

## Hipótese de stack (validar na 101)
- **Render/composição:** Remotion (vídeo como React; templates parametrizados por JSON; lê tokens em JS; render local em MP4).
- **Base real:** ffmpeg (cortes, reframe, áudio), Whisper (transcrição com tempo por palavra → legendas animadas), detecção de silêncio/cenas.
- **Engenharia reversa:** ffmpeg extrai frames por troca de cena + Whisper extrai fala/ritmo + o Claude analisa os frames (visão) → rascunho do template; o usuário ajusta.
- **Preview:** Remotion Studio no navegador local.

## Riscos e limites conhecidos
- Identificar a **fonte exata** de uma legenda por imagem é aproximado → o Claude sugere a fonte mais parecida do Google Fonts; o usuário confirma.
- Render de vídeo é pesado: depende da máquina do usuário (CPU/GPU, Windows/Mac).
- Arquivos pesados ficam fora do git.
