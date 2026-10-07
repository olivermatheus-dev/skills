---
name: video
description: "Produz vídeos em motion graphics (lançamento, trailer, recorte de funcionalidade, anúncio, reels) para qualquer empresa do hub: briefing → plano aprovado → voz e tempos → cenas em HTML/CSS/GSAP → conferência → export MP4, na marca da empresa (brand.css + BRAND.md), em 3 níveis de edição (simples, médio = padrão, alto). Use quando o usuário pedir vídeo, reels animado, motion, trailer, teaser, vídeo de lançamento, vídeo do produto, animação, anúncio em vídeo, ou quiser refazer, polir ou revisar um vídeo. Os formatos específicos (fmt-*) usam esta skill como motor."
---

# Vídeo em motion graphics

Você é o **diretor e o editor**. Tudo na tela é código (HTML, CSS, SVG, canvas, GSAP). Régua: **lançamento de software premium feito por estúdio**, nunca template ou slide animado.

## Nível de edição (decida primeiro)
Se o pedido não disser, é **médio**. "Rápido", "simples", "só um teste" → simples. "Caprichado", "premium", "alto", lançamento principal → alto.

| | **simples** | **médio (padrão)** | **alto** |
|---|---|---|---|
| ler | `BRAND.md` + receita `fmt-*` | + `knowledge/video/REGRAS.md` | + o arquivo de `knowledge/video/` de cada tema que o vídeo usa (`README.md` diz qual) |
| plano | falas + folha de batidas curta **no chat**; segue sem portão se o pedido já veio claro | `plano.md` enxuto + **1 style frame** → **aval** | `plano.md` completo (estilo e 8 controles) + 2–3 style frames → **aval** |
| áudio | 1 trilha do catálogo, sem SFX extra | trilha (2–3 candidatas) + SFX nos gestos-chave | sound-designer completo (camadas, texturas, mix) |
| conferência | `timeline.mjs check` + `qc.mjs` | + 1 rodada de folhas de contato | passadas de `qc-final.md` + agente `revisor` + **2ª iteração** de polimento |
| entrega | 1 formato | formatos pedidos (default 4:5 + 9:16) | idem + motion blur com 4–8 amostras |

**Não leia além do nível.** Dúvida pontual → abra só o arquivo do tema. Precedência: **BRAND.md > receita do fmt-* > REGRAS/knowledge (defaults)**.

## Sempre ler
- `companies/<slug>/brand/BRAND.md` (proibições = regra dura) e `context/BUSINESS.md` (o que é verdade). Persona e voz (`AUDIENCE.md`, `VOICE.md`) só se for escrever falas.
- Receita do formato: `.claude/skills/fmt-<formato>/SKILL.md`.
- Vídeo anterior da empresa: o `plano.md` dele e o feedback registrado (ponto de partida, não modelo).

## Briefing (4 variáveis)
Recorte (obrigatório) · duração (default 15–20 s; lançamento 30 s) · formatos (default 4:5 + 9:16) · áudio (default: trilha + efeitos, sem locução). **Nunca fundo mudo.** Pergunte só o que faltar e não tiver default.

## Pasta do vídeo
`companies/<slug>/contents/AAAA-MM-DD-<nome>/` (anúncio: `campaigns/…`):
```
plano.md · locucao.json · timeline.json · composition.html · data/*.json
audio/ render/ exports/      ← gerados, fora do git
```
Moldes: `references/plano.md` (médio usa só §1, 4, 5, 7 e 8), `references/timeline.md`.

## Etapas

### 0. Galeria antes de criar
Antes de escrever fundo, gráfico, mapa, transição ou bloco de cena: consulte `library/INDEX.md` e `companies/<slug>/video-templates/` (quando existirem; tarefa 014). Reaproveite e ajuste parâmetros; crie do zero só se não houver nada adaptável.

### 1. Plano → PARE e peça o aval (exceto simples)
1. Médio/alto: 2–3 conceitos em 1 linha, recomende 1.
2. Plano: recorte, falas exatas, **folha de batidas** (tempo · na tela · o que entender · som · intensidade 0–4), cor/fundo por cena, **afirmações com fonte** (sem fonte = não entra), perguntas com recomendação.
3. **Style frames:** quadros-chave **estáticos** com o `brand.css` real (inclua o quadro mais cheio). Um aval cobre roteiro e visual.
4. Confira: cabe na duração (≤ 2,7 palavras/s de locução); arco gancho ≤ 2 s → conceito → produto em uso → virada → revelação → cartão final ≥ 2 s.
5. **Sem "pode seguir", não anime.**

### 2. Voz e tempos (o áudio manda no relógio)
- Locução: **v1.0 com voz gratuita** (skill `locucao`); ElevenLabs só depois do aval. Sem locução: escolha o BPM e monte a grade.
- `timeline.json` nasce do áudio: ≤ 0,5 s entre falas; pausa ≤ 1 s só na virada (`"pause": true`); a cena dura o que a fala dura; cortes nos tempos fortes.
- Gestos em `events`; cada SFX aponta para um evento e um asset licenciado do catálogo. Trilha e efeitos: skill `audio` (agente `sound-designer` no médio/alto). Trilhas candidatas trocadas com `timeline.mjs music`.

### 3. Cenas (`composition.html`)
- Linkar `../../brand/brand.css`; nunca hardcodar cor da marca. Uma timeline GSAP principal no formato do kit (`knowledge/video/tecnico.md`); uma cena = um grupo com início/fim do `timeline.json`.
- **Cena isolada e elástica** (para virar variante sem reescrever): sem cor ou texto fixo dentro (tokens do `brand.css` + `params`/`on_screen` do `timeline.json`), animação em tempo relativo (entrada · hold · saída), sem depender da cena vizinha. Contrato completo: `roadmap/tasks/013-cenas-modulares-variantes/TASK.md`.
- Molas do kit (`SNAP/FAST/SOFT/GENTLE`, `swap`, `stretchTo`, `cursor`); não reescreva easing à mão.
- Ordem por cena: estados → poses-chave → curvas → offsets → assentar → efeitos → som.
- Dados de demonstração: **elenco fictício** do BRAND.md, marcados como ilustrativos.

### 4. Conferir
- Simples: `node tools/video/timeline.mjs check <pasta>`.
- Médio: + build e check do kit → **olhar as folhas de contato dos formatos** (texto cortado/fora da área segura, sobreposição, cursor fora do quadro, cor fora da marca, palavra fora da fala, proibições, contraste com `node tools/contrast.mjs`).
- Alto: + passadas de `knowledge/video/qc-final.md` + delegar ao `revisor` → corrigir → **2ª rodada de polimento** (curvas, offsets, som).
- Problema = corrija a causa, não o sintoma. Crítico e maior antes de exportar.

### 5. Exportar e entregar
- Render de cada formato com motion blur (kit: 2 amostras; alto: 4–8 amostras se houver movimento rápido). Export com BT.709 marcado (`tecnico.md`).
- Nome `<AAAA-MM-DD>-<nome>-<formato>-vNN.mp4` em `exports/`; nunca sobrescrever versão aprovada.
- **Sempre:** `node tools/video/qc.mjs <pasta> --sheet` (sem crítico) e **olhar a folha de contato do MP4 final**.
- Entregar: caminhos dos MP4 + saída do `qc.mjs` + **o que o Oliver precisa conferir** (o Claude não escuta: ouvir com fone e no celular; ver pequeno e sem som; prévia na plataforma).
- **Promover para a galeria:** algo reutilizável (fundo, gráfico, mapa, transição, bloco)? Extraia com parâmetros e tokens para `library/` (genérico) ou `video-templates/` (marca) e registre no catálogo.
- Registrar no `plano.md`: entregue, em aberto, feedback. Feedback visual que se repete → `BRAND.md` > Aprendizados.

## Ajustes depois da entrega (quase zero token)
`node tools/video/timeline.mjs show|check|vo|dur|text|music <pasta> …` troca voz, duração, texto e trilha e reencaixa o resto. **Pedido de ajuste → tente primeiro por aqui**, sem reescrever `composition.html`.

## Kit (motor de render)
Esperado em `tools/video-kit/`: HyperFrames em versão fixa + GSAP + `motion.js` + scripts `tts`, `words`, `music`, `sfx`, `mix`, `produce` (`--build-only`), `check`. **Estado:** a importar do kit do Ludus na máquina local (tarefa 003). **Sem o kit:** entregue as etapas 1–3 e avise que o render está pendente; não improvise outro render.

## Nunca
- Animar antes do plano aprovado (exceto nível simples com pedido claro).
- Recurso, número, métrica, depoimento ou preço sem fonte.
- Quebrar proibição do BRAND.md (saúde: nada de promessa de resultado terapêutico nem depoimento de paciente).
- Áudio ou asset sem licença registrada.
- Commitar `audio/`, `render/` ou `exports/`.
