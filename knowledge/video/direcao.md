# Direção: briefing, verdade, arco e estilo

> Fontes: briefing-e-direcao.md + estilos-editoriais.md (consolidado em 2026-10-07). Valores = ponto de partida.

## 1. Briefing: 4 variáveis
| variável | default |
|---|---|
| **Recorte** (o que vende, 1 frase) | obrigatório: perguntar |
| **Duração** | 15–20 s (anúncio/reels) · 30 s (lançamento) |
| **Formatos** | 4:5 (1080×1350) + 9:16 (1080×1920); 16:9 se pedido |
| **Áudio** | só trilha + efeitos (alternativa: locução) |

Pedido mínimo: *"vídeo da kz: lembrete no WhatsApp, 20 s"*.

## 2. O Claude dirige
- Claude escolhe conceito, história e o que mostrar; usuário aprova no plano (skill `video`).
- Antes do plano: 2–3 conceitos de 1 linha + recomendação.
- Régua: software premium feito por estúdio. Nunca template ou "PowerPoint animado".
- Persona (`AUDIENCE.md`) se reconhece nos primeiros segundos: situação concreta (horário, objeto, frase literal).

## 3. Verdade
- Só funcionalidade com fonte (LP, `BUSINESS.md`, print). Sem fonte, não entra.
- Nada inventado: número, métrica, depoimento, preço, benchmark.
- Dados de demo = elenco fictício fixo da marca (`BRAND.md`), valores marcados **ilustrativos** no roteiro.
- Nicho regulado: conselho em `BUSINESS.md`.
- Feito em código (HTML/CSS/SVG/canvas/GSAP, 3D se o formato pedir). Exceção: assets de `brand/` e prints/gravações reais do produto. Sem banco de imagem nem mídia gerada. Áudio próprio ou licenciado registrado.

## 4. Texto na tela
- Pouco e grande: ≤ 6 palavras por momento (máx. ~10), nunca parágrafo.
- Rótulo de botão = verbo ("Confirmar").
- Caixa alta/pesos/cores: `BRAND.md`. Default: frase sem caixa alta.
- Sem som (autoplay mudo): o texto conta a história sozinho; com locução, legenda. Detalhes: `texto-e-dados.md`.

## 5. Arco de lançamento/produto (default; desviar com motivo)
| bloco | quando (~20–30 s) | função |
|---|---|---|
| gancho | 0–2 s | tensão/situação reconhecível; **1º quadro já com conteúdo**, sem fade do preto |
| conceito | até 8–10 s | entende do que se trata |
| produto em uso | meio | UI com cursor, gestos reais, micro-interações |
| virada (drop) | 60–70% | música e imagem batem juntas |
| revelação | após a virada | logo/nome com impacto |
| cartão final | últimos ≥ 2 s (anúncio 2–3 s) | 1 CTA + marca, parado para ler |

Ritmo e curva: `ritmo.md`.

## 6. Sistema de estilo (vai no `plano.md`)
1. **Formato** (trailer, recorte, explicação, anúncio, diálogo…) + **intenção** (ensinar · persuadir · emocionar · divertir · informar · impressionar) + **personalidade** (premium · minimal · dinâmico · editorial · orgânico · cinematográfico · lúdico).
2. → **primário** (estrutura) + **secundário** opcional (personalidade). Não misture linguagens incompatíveis sem intenção (Luxury + Meme).
3. → calibrar os 8 controles (§7) antes de qualquer efeito.
4. Precedência: `BRAND.md` > estilo > defaults. Estilo não é preset; o conteúdo manda.

## 6b. Tom (decide junto com o estilo; vai no `plano.md`)
O tom sai do **objetivo** da peça e muda música, ritmo, molas, luz e som. A marca limita a faixa (kz = mais calma); uma **campanha temática** pode definir tom e abertura próprios para todas as suas peças (`campaigns/<campanha>/plano.md`), sem quebrar proibições do `BRAND.md`.
| tom | música | ritmo / intensidade | movimento | som e luz |
|---|---|---|---|---|
| dramático | 60–85 BPM, tensão | sobe devagar; holds longos | `GENTLE`, pouco overshoot | silêncio antes do impacto; contraste maior |
| épico | 80–100, build percussivo | escalada até 4 na revelação | escala crescente, câmera empurrando | riser → impacto grande com cauda |
| animado / divertido | 110–128 | trocas a cada 1–2 s | `FAST`/`SOFT`, overshoot até 8% | SFX lúdicos; cor de destaque mais presente |
| inspirador | 90–110, build gradual | sobe em ondas | `GENTLE`/`SOFT` | luz clara; final aberto |
| calmo / acolhedor | 70–90 | holds longos; intensidade ≤ 2 | `GENTLE` | poucos SFX, orgânicos |
| urgente / direto | 115–128 | CTA cedo; cortes rápidos | `SNAP`/`FAST` | batidas secas |
| curioso / misterioso | 80–100 | revelação parcial e tardia | lento, deslizes | silêncio e sons sutis |
Um tom por peça (pode virar no clímax, com motivo). Tom incoerente com o objetivo = refazer o plano.

## 7. Os 8 controles (0 ausente · 1 baixo · 2 médio · 3 alto)
| controle | 0–1 | 2 | 3 |
|---|---|---|---|
| cortes | 1 a cada 4–6 s | 1/2–3 s | 1/1–2 s |
| b-roll | pontual | frequente | quase contínuo |
| motion | funcional | explicativo | protagonista |
| tipografia | discreta | ênfase por palavra | é a cena |
| transições | hard cut | 1 tipo com motivo | 2 tipos |
| SFX | quase nada | gestos-chave | eventos + texturas |
| música | baixa/ausente | presença | conduz a estrutura |
| VFX/partículas | nenhum | pontual com função | herói em 1–2 momentos |

## 8. Estilos de produto/SaaS
Ordem: cortes · b-roll · motion · tipo · trans. · SFX · música · VFX.

| estilo | controles | essência | evitar |
|---|---|---|---|
| Tech Product | 2·2·2·1·1·2·2·1 | UI e aparelho, callouts, precisão | glitch, neon, código "tech" |
| Premium Minimal | 1–2·1·2·2·1·1·2·0 | espaço negativo, timing | partícula gratuita, overshoot |
| Tutorial/Software | 2·3·1·1·0–1·1·1·0 | onde clicar, o que mudou; corta esperas | cursor frenético, zoom sem função |
| Premium Educational | 2·2·3·2·1·1·1·0–1 | revelação progressiva | infantil |
| Short Premium | 3·2·2·2·1·2·2·1 | densidade sem caos | zoom/meme só porque é curto |
| Short High Retention | 3·3·2–3·3·2·2·2·1–2 | cada momento avança algo | estímulo permanente |
| Commercial/Anúncio | 2–3·2·2·2·1–2·2·3·1 | cada plano: produto, benefício, emoção, CTA | efeito fora do posicionamento |
| Trailer | 2→3·2·2·2·2·3·3·1–2 | setup → escalada → revelação → clímax | entregar tudo |
| Teaser | 1–2·1·2·1·1·2·2·1 | curiosidade > compreensão | explicar |
| Editorial | 2·1·2·3·1–2·1·2·0 | tipo protagonista, grid, assimetria | slideshow de revista |
| Organic | 1–2·1·2·1·1·1·2·0–1 | movimento natural, formas irregulares | perfeição matemática |
| Emotional | 1·1·1·1·0·0–1·1·0 | holds longos, silêncio, voz | música manipuladora, slow motion |
| Comedy/Meme | 2–3·2·2·2·0·1–2·1·0 | timing; smash cut; silêncio | explicar a piada |

Fast-paced = progressão rápida, não só cortes. Lento não é vazio.

## 9. Defaults por formato
| formato | primário + secundário |
|---|---|
| `fmt-trailer-lancamento` | Trailer + Premium Minimal |
| `fmt-recorte-funcionalidade` | Tutorial/Software + Tech Product |
| `fmt-texto-cinetico` | Editorial + Short Premium |
| `fmt-dialogo` | Comedy ou Emotional (conforme roteiro) + Organic |
| `fmt-3d-produto` | Tech Product + Premium Minimal |
| carrossel animado / explicação | Premium Educational |
| anúncio | Commercial + estilo da peça |

## 10. Outros estilos (filmagem ou pedido explícito)
Essência → evitar.
- Talking head / podcast / UGC: edição invisível, câmera por informação ou reação, imperfeição controlada → zoom a cada frase, polir até parecer publicidade.
- Essay / documentário / jornalístico / true crime: evidência comanda o visual, fato ≠ representação, J/L-cut → imagem genérica, glitch, estética "hacker", VHS/sépia automático.
- Product film / luxury / fashion: forma, textura, macro, espaço, atitude → densidade, explicar demais.
- Cinematic / corporate: imagem carrega a narrativa → teal/orange, flare, banco de imagem.
- Científico / financeiro: magnitude, comparação, consequência (`texto-e-dados.md`) → dinheiro voando, gráfico genérico.
- Esportes / gaming / music video: cortar na ação ou na estrutura da música → cortar em toda batida.
- Maximalist / brutalist / retro / futuristic: hierarquia, cru deliberado, período definido → aleatoriedade, misturar épocas, neon automático.
