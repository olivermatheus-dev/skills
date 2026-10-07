# Regras de vídeo (núcleo)

> **Leitura única do nível médio.** O 20% que dá 80% da qualidade, em valores prontos. Detalhe e exceções: o arquivo do tema (`README.md`). Precedência: **BRAND.md > receita do `fmt-*` > estas regras**. Valores = ponto de partida.

## 1. Direção e verdade
- Você dirige: escolha conceito e história; régua = lançamento de software premium, nunca slide animado.
- **Só o que é verdade:** afirmação sem fonte (`BUSINESS.md`, LP, print) não entra. Dados de demonstração = elenco fictício do BRAND.md, marcados como ilustrativos. Nunca número, métrica, depoimento ou preço inventado. Saúde: nada de promessa terapêutica nem depoimento de paciente.
- **Estilo:** use o default do `fmt-*` (primário + secundário). Ele decide a dose de cortes, motion, transições, SFX e efeitos (`direcao.md`).
- **Tom** (dramático, épico, animado, inspirador, calmo, urgente, curioso) sai do objetivo da peça e decide música, ritmo, molas e som (`direcao.md`). Campanha temática pode ter abertura e tom próprios; proibições da marca valem sempre.
- **Arco:** gancho ≤ 2 s → conceito entendido até 8–10 s → produto em uso → virada a 60–70% → revelação → cartão final ≥ 2 s com 1 CTA (anúncio 2–3 s).
- **Texto na tela:** ≤ 6 palavras por momento (máx. ~10), grande; botão = verbo. O vídeo conta a história sem som.

## 2. Ritmo e leitura
- **1º quadro já comunica.** Sem fade do preto, logo animado ou "olá" na abertura; com locução, a voz começa no 1º segundo.
- **1 ideia por tela.** Texto parado e legível por ≥ max(1 s; 0,3 s × palavras), +0,3 s se houver termo novo. O hold conta a partir de legível **e parado**; ≥ 60% da vida do texto.
- **Locução ≤ 2,7 palavras/s** (20 s ≈ 45–55 palavras). Silêncio entre falas ≤ 0,5 s; até 1 s só na virada, declarada no plano.
- **Visual na palavra-chave** ou até 4 quadros antes, nunca depois. SFX/voz da próxima cena entra 4–12 quadros antes do visual (J-cut).
- **Intensidade 0–4 por bloco**, nunca 4 contínuo. Curva típica: gancho 3 → conceito 2 → produto 1–2 → build 3 → revelação 4 → cartão 1.
- **No máximo 2–3 s sem algo novo** (teto, não metrônomo). Novo pode ser a próxima linha de texto. Não saturar texto + visual + gráfico + som ao mesmo tempo.
- **BPM antes de animar:** calmo 70–95 · médio 96–115 · energia 116–128 (1 batida = 60/BPM s). Troca de ideia em tempo forte a cada 2–4 batidas; sincronia exata só em revelação, título e impacto.

## 3. Frame
- **Formatos:** 4:5 = 1080×1350 · 9:16 = 1080×1920 · 16:9 = 1920×1080. Mesma largura → mesmo tamanho de título.
- **Área segura 9:16:** texto-chave em x 65–930, y 270–1250 (anúncio) ou 270–1440 (orgânico). 4:5: margem 80 px. **Capa de Reels** na grade 3:4 mostra só a faixa central 1080×1440.
- **Tipo mínimo (1080):** título ≥ 64–72 px · apoio ≥ 36–40 px · rótulo de UI ≥ 28 px (se ficar menor, aproxime a câmera). 1 elemento dominante por frame.
- **Fundo liso** (`--bg` ou branco), sem mancha, halo ou degradê; muda no máximo 1 vez, com motivo.
- **Toda cor tem significado:** destaque só em logo, CTA e 1 ênfase por título; cinza só em rótulo dentro da UI; cor de status só dentro da interface. **Título nunca cinza.** Contraste ≥ 4,5:1 (`node tools/contrast.mjs`).
- **Uma direção de luz** no vídeo; sombras pelos níveis `--shadow-sm/md/lg`; objeto pousado ganha sombra de contato curta.
- **O que a cena mostra:** produto em uso > dado com fonte > metáfora da história > ícone. Nada de clichê (lâmpada, foguete, gráfico subindo genérico).

## 4. Movimento
- ⚠️ **AE "ease in" = GSAP `.out`**; AE "ease out" = `.in`. No código, siga o GSAP.
- **Nada linear** (`none` só em loop/mecânico). Entrada `power3.out`/`expo.out` · saída `power2.in` · deslocamento `power2.inOut`.
- **Molas do kit:** `SNAP` 0% (encaixe, check) · `FAST` ~4% (UI, botão) · `SOFT` ~8% (card, selo, número) · `GENTLE` ~2% (câmera, grandes deslocamentos).
- **Overshoot:** premium 0–4% (escala 1,02–1,04), expressivo ≤ 8–10%. Nunca `scale 0 → 1`; opacidade nunca passa de 1.
- **Durações:** micro 0,15–0,3 s · elemento pequeno 0,3–0,5 s · médio 0,4–0,7 s · troca de cena 0,5–0,9 s · whip 6–10 quadros · saída = 70–80% da entrada. Mais distância/tamanho → mais duração.
- **Entrada padrão:** fade + y 16–40 px ou escala 0,96 → 1. Secundário 2–4 quadros depois do principal. Stagger 40–80 ms (> 8 itens: total ≤ 0,6 s). Ordem container → título → dado. **1 protagonista por vez.**
- `transform-origin` com causa (menu nasce do botão, barra cresce da base). Passagem A → B → C não para em B (`keyframes` + `easeEach` ou `motionPath`).
- **Cursor conduz:** nada muda na UI sem clique, toque ou digitação antes. Anda em curva, pausa ~0,2 s antes do clique; botão afunda a 0,96; eco do clique ~0,4 s. Zoom 1,3–2×, **antes** do gesto, máx. 2 níveis.
- **Nada parado:** drift de escala 1,00 → 1,03 ou 10–30 px/s; paralaxe com frente 1,5–2× o fundo, ≤ 3 camadas. Texto em leitura sem blur.
- Animar só `transform`/`opacity` (e filtros); detalhes de código em `tecnico.md`.

## 5. Texto, legenda e dados
- Anime a **maior unidade que resolve** (bloco > linha > palavra > caractere). Stagger: caractere 15–30 ms · palavra 60–120 ms · linha 100–200 ms. Frase inteira legível em ≤ 0,8 s.
- **Ênfase:** no máximo 1–2 meios por palavra (cor, peso, escala…); cor de destaque em 1 palavra por frase.
- **Legenda:** 48–64 px, peso 600–800, blocos de 2–5 palavras, ≤ 28–32 caracteres por linha; em 9:16, base fixa em y ≈ 1250–1400, nunca sobre rosto, produto ou UI; entrada ≤ 200 ms; 2–4 quadros antes da fala (nunca antecipar a punchline).
- **Contador:** `tabular-nums`, `power3.out`, valor final parado ≥ 1 s.
- **Gráfico pela relação:** 1 valor = número grande · categorias = barras (base zero) · tempo = linha · parte do todo = barra empilhada ou donut ≤ 5 fatias · lugar = mapa.
- **Bloqueante:** zero overshoot em propriedade que codifica valor; sem 3D em gráfico. Formato BR (`R$ 4,24 mi`, `1,5 mil`, `72%`). Nunca codificar só por cor nem vermelho × verde sozinhos.
- Dados em `data/<nome>.json` (`source`, `unit`, `period`, `illustrative`, `values`), desenhados por código.

## 6. Transições e efeitos
- **Default = hard cut na batida ou no fim da frase.** No máximo 1–2 tipos de transição por vídeo; match cut (mesma direção, velocidade e região) antes de qualquer efeito. **Nunca dissolve solto.**
- Valores: dissolve 0,3–0,8 s · dip 6–12 quadros para `--bg` · shake 2–4 quadros, 4–12 px, decaindo. Direção de push/slide não muda sem motivo. ≤ 3 flashes/s.
- **Teste de remoção:** troque por hard cut ou desligue; se ficar igual ou melhor, remova.
- **UI no aparelho:** recortada pela tela (raio real), filha do grupo 3D; reflexo por cima, branco ≤ 0,25, 1 passada; print ≥ 2× o tamanho exibido.
- **Partículas: default nenhuma** (a marca pode restringir mais). Só como resposta a um gesto: burst de 12–30, 0,4–0,9 s, 300–900 px/s, 2–3 cores da marca, nunca sobre texto, dado ou CTA. 1–2 efeitos-herói por vídeo, no máximo.
- **Render determinístico:** nada de `Math.random()` ou relógio do navegador no desenho; semente fixa e estado = função de `tl.time()` (`efeitos.md`).

## 7. Som
- **Nunca fundo mudo.** Trilha da biblioteca, com licença; médio: 2–3 candidatas trocadas com `timeline.mjs music`.
- **Todo SFX tem função; a maioria dos eventos não tem som.** 1–2 sons por animação, nos eventos percebidos (início, encaixe, revelação). Hard cut não leva som.
- SFX com `align: "peak"` (o pico cai no quadro do evento); `start` só para clique e pop. O som nunca chega antes da imagem.
- **1 família de SFX por vídeo** (`BRAND.md` > Som; vazio = premium minimal). Evento repetido: 3–5 variantes. Proibido: whoosh em todo zoom, pop em toda legenda, impacto em toda palavra.
- Todo riser resolve; 0,2–0,5 s de silêncio seco antes do impacto da revelação.
- **Mix:** música −8 a −12 dB sob a voz (ataque ~100 ms, release 300–500 ms); UI SFX 12–20 dB abaixo da voz. Entrega **−14 LUFS ±1, true peak ≤ −1 dBTP**, medido.

## 8. Entrega
- Export H.264 `yuv420p`, 30 fps constante, AAC 48 kHz estéreo, **BT.709 marcado** (senão a cor da marca muda no MP4).
- Nome `<AAAA-MM-DD>-<nome>-<formato>-vNN.mp4`; nunca sobrescrever versão aprovada.
- `node tools/video/qc.mjs <pasta> --sheet` sem crítico + olhar a folha de contato do MP4.
- **O Claude não escuta:** toda entrega lista o que o Oliver confere (ouvir com fone e no celular, ver pequeno e sem som, prévia na plataforma).
- Problema → corrija a causa: lento = estrutura; vazio = composição; fraco = hierarquia; sem impacto = timing; voz baixa = ducking; cor estranha = BT.709. Não "conserte" com efeito.
