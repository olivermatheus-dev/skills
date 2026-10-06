# 102 — Especificação de estilo/template de vídeo + presets profissionais

**Status:** rascunho · **Fase:** 3 · **Depende de:** 101

## Objetivo
Definir o **formato de um template de vídeo** (arquivo legível que descreve um estilo) e os **presets globais** com qualidade profissional. É o contrato central: a engenharia reversa **gera** templates, o briefing **escolhe** um, o render **executa**.

## O que um template descreve (rascunho)
- **Layout:** moldura/frame, posição do vídeo, áreas de texto fixo, fundo, logo
- **Legenda:** fonte, peso, tamanho, cor, contorno/sombra, caixa, posição, palavras por linha, destaque de palavra-chave (cor/escala), animação de entrada, variação de fonte
- **Corte:** ritmo (cortes/min), jump cuts, remoção de silêncio, zoom punch-in, b-roll
- **Overlays:** títulos, lower thirds, emojis/ícones, barras de progresso, CTA final
- **Transições, intro/outro, música/SFX** (volume, ducking)
- **Formatos suportados:** 9:16, 4:5, 16:9

## Presets globais (defaults de fábrica)
Timing e easing, safe areas por plataforma, tamanho mínimo de legenda por formato, limites de palavras por tela, loudness de áudio (ex.: -14 LUFS).

## Critérios de pronto
- [ ] Schema do template documentado + 3 templates de exemplo: **moldura estática**, **talking head dinâmico**, **motion puro**
- [ ] Presets globais definidos

## Log
- 2026-10-06 — criada.
