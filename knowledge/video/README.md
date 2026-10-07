# Base de conhecimento de vídeo

Regras executáveis de motion, verificadas. **Leia conforme o nível da skill `video`:**
- **simples:** nada daqui (só `BRAND.md` + receita `fmt-*`);
- **médio (padrão):** só `REGRAS.md`;
- **alto:** `REGRAS.md` + o arquivo de cada tema que o vídeo usa. Dúvida pontual em qualquer nível → só o arquivo do tema.

| arquivo | tema | abrir quando |
|---|---|---|
| `REGRAS.md` | **núcleo**: direção, ritmo, frame, movimento, texto, efeitos, som, entrega | todo vídeo médio ou alto |
| `direcao.md` | briefing, verdade, arco, estilos (primário + secundário, 8 controles) | planejar no alto; escolher estilo fora do default |
| `ritmo.md` | leitura, sincronia com a fala, intensidade 0–4, BPM | montar a timeline |
| `frame.md` | formatos, áreas seguras, cor, composição, style frames | desenhar frames e style frames |
| `movimento.md` | easing (⚠️ AE × GSAP), molas, durações, stagger, cursor, polimento de curvas | animar e polir |
| `texto-e-dados.md` | tipografia animada, legendas, contadores, gráficos, mapas, integridade do dado | texto animado, número, gráfico |
| `montagem.md` | motivo do corte, escada de soluções, J/L-cut e match cut em motion; seção "Com filmagem" | trocas de cena; filmagem real |
| `efeitos.md` | transições, integração (UI no aparelho, sombra, BT.709), partículas determinísticas | transição marcada, mockup, partícula |
| `som.md` | função dos SFX, família, alinhamento, ducking, loudness | trilha e sound design (com a skill `audio`) |
| `qc-final.md` | passadas por nível, triagem, entrega, checklist do Oliver | conferir e entregar |
| `tecnico.md` | armadilhas de HyperFrames/GSAP, render, export | escrever o código das cenas |

## Regras desta pasta
- **Regra, não teoria:** "faça X quando Y, valor Z". Números são ponto de partida; quando um vídeo real mostrar melhor, atualize aqui (e no `REGRAS.md`, se for regra do núcleo).
- **Um tema, um arquivo.** Material novo complementa o arquivo do tema, sem duplicar.
- O bruto do usuário fica em `roadmap/tasks/002-conhecimento-motion/material/` (registro, não é lido em produção).
