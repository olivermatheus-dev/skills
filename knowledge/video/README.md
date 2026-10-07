# Base de conhecimento de vídeo

Regras **executáveis** de edição e motion, já verificadas, para as skills de vídeo lerem. Cada arquivo trata de **um tema**. Leia só o tema de que precisa.

| arquivo | tema | serve para |
|---|---|---|
| `qc-final.md` | revisão em 16 passadas (quem confere e como), editorial, **triagem crítico/maior/menor**, sintoma → causa, especificação de entrega social, `qc.mjs`, checklist do Oliver, aprovação | **antes de entregar** qualquer vídeo |
| `esteira-de-producao.md` | processo: genérico × marca, pasta do vídeo, 5 etapas com portões, QA, export, motion blur | **ler primeiro** em qualquer vídeo |
| `briefing-e-direcao.md` | as 4 variáveis do pedido, o Claude dirige, verdade, texto, arco de lançamento | planejar qualquer vídeo |
| `design-e-composicao.md` | o frame parado: hierarquia, composição, grid, spacing, tipografia, formas, densidade, style frames, design system, polimento de pixel, revisão | **antes de animar** qualquer cena |
| `animacao-comportamento.md` | timing × spacing, easing (⚠️ terminologia AE × GSAP), antecipação, overshoot, bounce, mola, follow-through, stagger, origem, entradas e saídas, personalidade e tokens, diagnósticos | animar |
| `curvas-e-polimento.md` | Graph Editor traduzido para GSAP (eases, CustomEase, keyframes de passagem, motionPath, offsets), percepção > matemática, famílias de curva, inspeção, checklist final | polir |
| `tipografia-animada.md` | unidade de animação, ênfase, sincronia com a fala, **legendas** (tamanhos, posição, quebra, karaokê), técnicas (máscara, typewriter, contador), sistema e QC | todo texto animado e legenda |
| `infograficos-e-dados.md` | quando usar gráfico, tipo por relação, **integridade (sem overshoot em dado)**, design do gráfico, formato numérico BR, revelação progressiva, mapas, assets, dados em JSON | número, gráfico, diagrama, mapa |
| `movimento.md` | easing, durações, overshoot, profundidade, transições, cursor e micro-interações | animar cenas |
| `ritmo-e-leitura.md` | tempo de leitura, densidade, sincronia com a fala, primeiros 2 s | montar a timeline |
| `formatos-e-areas-seguras.md` | tamanhos, recorte 3:4 da grade, áreas seguras em 9:16, durações | todo vídeo e imagem |
| `visual-e-cor.md` | defaults de fundo, cor, ênfase, efeitos e tipografia (anti-erros típicos de IA) | qualquer cena |
| `tecnico-hyperframes.md` | armadilhas medidas de HyperFrames/GSAP e de render HTML | escrever o código das cenas |
| `pacing-e-atencao.md` | escala de intensidade 0–4, curva de energia, densidade, pattern interrupt motivado, diagnóstico | desenhar a curva do vídeo e revisar o ritmo |
| `cobertura-e-reacao.md` | função do próximo plano; cutaway, insert, reação, eyeline, shot/reverse, match, smash (com tradução para motion) | escolher cada troca de cena |
| `b-roll.md` | tipos de B-roll por objetivo, sincronia semântica, fontes e integridade, clichês proibidos | escolher o visual que acompanha a fala |
| `transicoes-e-efeitos.md` | escada e sistema de decisão de transições, regras por tipo (dissolve, whip, zoom, máscara, morph, speed ramp, freeze…), sistema da marca, QC e teste de remoção | escolher e polir cada transição/efeito |
| `compositing.md` | screen × world space, **UI dentro de aparelho**, sombra de contato, matching de cor/nitidez/grão, **cor da marca no MP4 (BT.709)**, live action (tracking, roto, keying), ordem de trabalho, QC | mockup, print em cena, callout em objeto, qualquer elemento sobre filmagem |
| `particulas-e-atmosfera.md` | função de cada microefeito, asset × procedural, comportamento (emissor, forças, vida), valores iniciais, profundidade, glow/shine/trail, **partículas determinísticas no render**, curva de densidade, QC | qualquer partícula, glow, fumaça, poeira, grão ou micro-movimento |
| `sound-design.md` | função de cada efeito, sistema de decisão, regras por tipo (whoosh, impact, riser…), motion, layering, anti-genérico, QC em 6 passadas | escolher e posicionar SFX |
| `som.md` | BPM e cortes, desenho de som de trailer, ducking, −14 LUFS | trilha, SFX, mix |
| `cortes-e-montagem.md` | motivação do corte, hard/jump/J/L-cut, cut on action, match cut em motion | toda edição e toda troca de cena em motion |

Ordem de leitura sugerida: esteira → briefing → formatos → visual → **design** → ritmo → pacing → movimento → animação → curvas → som → cortes → cobertura → b-roll → transições → compositing → partículas → técnico → **qc-final**.

Temas previstos (criar quando chegar material): retenção e hooks · 3D. A estrutura por tipo de vídeo fica nas skills `fmt-*`.

## Regras desta pasta
- **Regra, não teoria:** "faça X quando Y, valor inicial Z".
- **Um tema, um arquivo.** Material novo complementa o arquivo do tema, sem duplicar.
- O bruto que o usuário envia fica em `roadmap/tasks/002-conhecimento-motion/material/` e é registrado no `INDICE.md` de lá.
- Números são pontos de partida. Quando um vídeo real mostrar algo melhor, atualize o número aqui.
