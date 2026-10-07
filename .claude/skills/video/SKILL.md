---
name: video
description: "Produz vídeos em motion graphics (lançamento, trailer, recorte de funcionalidade, anúncio, reels) para qualquer empresa do hub: briefing → plano aprovado → voz e tempos → cenas em HTML/CSS/GSAP → conferência por quadros → export MP4, usando a marca da empresa (brand.css + BRAND.md). Use quando o usuário pedir vídeo, reels animado, motion, trailer, teaser, vídeo de lançamento, vídeo do produto, animação, anúncio em vídeo, ou quiser refazer, polir ou revisar um vídeo. Os formatos específicos (fmt-*) usam esta skill como motor."
---

# Vídeo em motion graphics

Você é o **diretor e o editor**. Tudo na tela é feito em código (HTML, CSS, SVG, canvas, GSAP; 3D quando o formato pedir). A régua: **parecer o lançamento de um software premium feito por estúdio**, nunca template, slides ou "PowerPoint animado".

## Fontes de verdade (ler sob demanda, não tudo de uma vez)
| quando | ler |
|---|---|
| sempre, antes de planejar | `knowledge/video/esteira-de-producao.md` · `briefing-e-direcao.md` · `formatos-e-areas-seguras.md` |
| empresa | `companies/<slug>/brand/BRAND.md` (proibições = regra dura) · `context/AUDIENCE.md` · `context/BUSINESS.md` (o que é verdade) · `context/VOICE.md` |
| formato pedido | `.claude/skills/fmt-<formato>/SKILL.md`, se existir (receita de cenas) |
| vídeo anterior da empresa | `plano.md` dele + feedback registrado (ponto de partida, não modelo) |
| áudio (trilha e efeitos) | skill `audio` (o agente `sound-designer` faz) · `knowledge/video/sound-design.md` |
| montar a timeline | `knowledge/video/ritmo-e-leitura.md` · `pacing-e-atencao.md` (curva de intensidade 0–4) · `som.md` |
| escrever as cenas | `knowledge/video/visual-e-cor.md` · `movimento.md` · `cortes-e-montagem.md` · `cobertura-e-reacao.md` · `b-roll.md` · `transicoes-e-efeitos.md` · `tecnico-hyperframes.md` |
| voz | skill `locucao` (v1.0 gratuita → roteiro ElevenLabs → encaixe) |

Precedência: **BRAND.md > receita do fmt-* > knowledge/video (defaults)**.

## Briefing (4 variáveis)
Recorte (obrigatório) · duração (default 15–20 s; lançamento 30 s) · formatos (default 4:5 + 9:16) · áudio (default: trilha + efeitos, sem locução). **Nunca vídeo com fundo mudo:** sempre há trilha. Pergunte só o que faltar e não tiver default.

## Pasta do vídeo
`companies/<slug>/contents/AAAA-MM-DD-<nome>/` (ou `campaigns/…` se for anúncio):
```
plano.md · locucao.json · timeline.json · composition.html
audio/ render/ exports/      ← gerados, fora do git
```
Moldes: `references/plano.md`, `references/timeline.md`.

## Etapas

### 1. Conceito e plano → PARE e peça o aval
1. Proponha **2–3 conceitos** (1 linha cada) e recomende 1.
2. Escreva o `plano.md` (molde em `references/plano.md`): recorte, o que muda vs anterior, falas exatas, **folha de batidas**, cor/fundo por cena, **afirmações com fonte**, perguntas.
3. Confira antes de mostrar: roteiro cabe na duração (≤ ~2,7 palavras/s de locução), arco completo (gancho ≤ 2 s → conceito → produto em uso → virada → revelação → cartão final ≥ 2 s), nada sem fonte.
4. **Sem o "pode seguir" do usuário, não escreva código.**

### 2. Voz e tempos
- Com locução: **v1.0 com voz gratuita de modelo** (skill `locucao`); a voz final da ElevenLabs só entra depois do aval. Sem locução: escolher **BPM** e montar a grade de batidas.
- **Trilha:** o sound-designer testa **2–3 candidatas gratuitas** do catálogo, trocadas com `timeline.mjs music` (sem reescrever nada); o Oliver escolhe ouvindo.
- `timeline.json` nasce do áudio: falas ≤ 0,5 s de silêncio entre si; pausa ≤ 1 s só na virada (`"pause": true`); cena dura o que a fala dura; mudanças a cada 0,4–1,2 s de fala; cortes nos tempos fortes.
- Gestos (clique, digitação, entrada) em `events`; cada SFX aponta para um evento e para um asset do catálogo (`library/audio/sfx.json`). Trilha e efeitos: skill `audio` (Modos A e B).

### 3. Cenas (`composition.html`)
- **Tokens:** linkar `../../brand/brand.css` (mesmo contrato do carrossel). Nunca hardcodar cor da marca.
- **Uma timeline GSAP principal** registrada no formato exigido pelo kit (ver `tecnico-hyperframes.md`). Uma cena = um grupo com início/fim vindos do `timeline.json`.
- **Biblioteca de movimento do kit** (molas `SNAP/FAST/SOFT/GENTLE`, `swap`, `stretchTo`, `cursor`): não reescreva easing à mão.
- Regras que mais quebram: fundo liso · título nunca cinza · 1 ênfase por título · toda cor com significado · o cursor conduz (nada muda sozinho no app) · algo novo a cada 2–3 s · transição com motivo (no máximo 2 tipos) · nada some antes de ser lido · animar só transform/opacity.
- Dados de demonstração: **elenco fictício** do BRAND.md, marcados como ilustrativos.

### 4. Conferir (automático + olho)
- Rodar o build e o check do kit: silêncio acima do limite, 1 quadro por gesto assentado, folhas de contato por formato.
- **Olhar todas as folhas.** Procurar: texto cortado ou fora da área segura (`formatos-e-areas-seguras.md`), capa ilegível no recorte 3:4, sobreposição, cursor fora do quadro, cor/fundo fora do BRAND.md, palavra fora do tempo da fala, proibições, contraste (`node tools/contrast.mjs`).
- Consertar → conferir de novo. Só exporta com as folhas limpas.

### 5. Exportar e entregar
- Render final de cada formato com motion blur (ver `esteira-de-producao.md` §5). Conferir no MP4 um quadro de movimento rápido.
- Medir o áudio: −14 LUFS ±1, true peak ≤ −1 dBTP (`ffmpeg -af ebur128` ou `loudnorm=print_format=summary`).
- Entregar: caminhos dos MP4 + 1 linha por cena + **o que não foi verificado** (o Claude não escuta: voz e mixagem são do usuário).
- Registrar no `plano.md`: entregue, em aberto e feedback. Feedback visual que se repete → `BRAND.md` > Aprendizados.

## Edição rápida (quase zero token)
`node tools/video/timeline.mjs show|check|vo|dur|text|music <pasta> …`: troca voz, duração de cena, texto na tela e trilha, e reencaixa tudo o que vem depois. **Ajuste pedido pelo Oliver → primeiro tente resolver com esta ferramenta**, sem reescrever `composition.html` (que lê os tempos e textos da timeline). É a base do futuro MCP de edição (tarefa 009).

## Kit (motor de render)
Esperado em `tools/video-kit/`: HyperFrames fixado em versão local + GSAP + `motion.js` + scripts `tts`, `words`, `music`, `sfx`, `mix`, `produce` (`--build-only`), `check`.
**Estado:** a importar do kit do Ludus, de forma genérica, quando o usuário estiver na máquina local (tarefa 003). **Sem o kit:** faça as etapas 1–3 (plano, timeline e composition.html) e avise que o render fica pendente. Não improvise um render alternativo sem combinar.

## Nunca
- Código antes do plano aprovado.
- Recurso, número, métrica, depoimento ou preço sem fonte.
- Quebrar proibição do BRAND.md (nicho de saúde: nada de promessa de resultado terapêutico nem depoimento de paciente).
- Áudio de terceiros sem licença.
- Commitar `audio/`, `render/` ou `exports/`.
