# Base de conhecimento de vídeo

Regras **executáveis** de edição e motion, já verificadas, para as skills de vídeo lerem. Cada arquivo trata de **um tema**. Leia só o tema de que precisa.

| arquivo | tema | serve para |
|---|---|---|
| `esteira-de-producao.md` | processo: genérico × marca, pasta do vídeo, 5 etapas com portões, QA, export, motion blur | **ler primeiro** em qualquer vídeo |
| `briefing-e-direcao.md` | as 4 variáveis do pedido, o Claude dirige, verdade, texto, arco de lançamento | planejar qualquer vídeo |
| `movimento.md` | easing, durações, overshoot, profundidade, transições, cursor e micro-interações | animar cenas |
| `ritmo-e-leitura.md` | tempo de leitura, densidade, sincronia com a fala, primeiros 2 s | montar a timeline |
| `formatos-e-areas-seguras.md` | tamanhos, recorte 3:4 da grade, áreas seguras em 9:16, durações | todo vídeo e imagem |
| `visual-e-cor.md` | defaults de fundo, cor, ênfase, efeitos e tipografia (anti-erros típicos de IA) | qualquer cena |
| `tecnico-hyperframes.md` | armadilhas medidas de HyperFrames/GSAP e de render HTML | escrever o código das cenas |
| `pacing-e-atencao.md` | escala de intensidade 0–4, curva de energia, densidade, pattern interrupt motivado, diagnóstico | desenhar a curva do vídeo e revisar o ritmo |
| `cobertura-e-reacao.md` | função do próximo plano; cutaway, insert, reação, eyeline, shot/reverse, match, smash (com tradução para motion) | escolher cada troca de cena |
| `b-roll.md` | tipos de B-roll por objetivo, sincronia semântica, fontes e integridade, clichês proibidos | escolher o visual que acompanha a fala |
| `transicoes-e-efeitos.md` | escada e sistema de decisão de transições, regras por tipo (dissolve, whip, zoom, máscara, morph, speed ramp, freeze…), sistema da marca, QC e teste de remoção | escolher e polir cada transição/efeito |
| `sound-design.md` | função de cada efeito, sistema de decisão, regras por tipo (whoosh, impact, riser…), motion, layering, anti-genérico, QC em 6 passadas | escolher e posicionar SFX |
| `som.md` | BPM e cortes, desenho de som de trailer, ducking, −14 LUFS | trilha, SFX, mix |
| `cortes-e-montagem.md` | motivação do corte, hard/jump/J/L-cut, cut on action, match cut em motion | toda edição e toda troca de cena em motion |

Ordem de leitura sugerida: esteira → briefing → formatos → visual → ritmo → pacing → movimento → som → cortes → cobertura → b-roll → transições → técnico.

Temas previstos (criar quando chegar material): tipografia cinética · composição e hierarquia · retenção e hooks · 3D. A estrutura por tipo de vídeo fica nas skills `fmt-*`.

## Regras desta pasta
- **Regra, não teoria:** "faça X quando Y, valor inicial Z".
- **Um tema, um arquivo.** Material novo complementa o arquivo do tema, sem duplicar.
- O bruto que o usuário envia fica em `roadmap/tasks/002-conhecimento-motion/material/` e é registrado no `INDICE.md` de lá.
- Números são pontos de partida. Quando um vídeo real mostrar algo melhor, atualize o número aqui.
