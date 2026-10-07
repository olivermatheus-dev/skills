# Briefing e direção criativa

> Base: prompt de vídeo do Ludus + prompt de trailer de lançamento (2026-10-07), generalizados. Complementa `esteira-de-producao.md` (o processo). Aqui fica **o que pedir** e **como dirigir**.

## 1. O briefing tem só 4 variáveis
Todo o resto vem da marca (`brand/`), do contexto (`context/`) e dos defaults das skills. O usuário não deveria precisar repetir regras a cada pedido.

| variável | exemplos | default se não disser |
|---|---|---|
| **Recorte** — o que o vídeo vende, em 1 frase | "o lançamento", "lembrete automático no WhatsApp", "saber quem pagou" | perguntar (é obrigatório) |
| **Duração** | 15 · 30 · 45 s | 15–20 s (anúncio/reels); 30 s (lançamento) |
| **Formatos** | 4:5 (1080×1350), 9:16 (1080×1920), 16:9 | 4:5 + 9:16 |
| **Áudio** | com locução (voz da marca) · só trilha + efeitos | só trilha + efeitos |

Pedido mínimo válido: *"vídeo da kz: lembrete automático no WhatsApp, 20 s"*.

## 2. O Claude dirige
- O Claude escolhe **conceito, história e o que mostrar**. O usuário aprova no plano (portão da esteira).
- **Régua de qualidade:** tem que parecer o lançamento de um software premium feito por um estúdio. **Nunca** um template, uma sequência de slides ou "PowerPoint animado".
- Antes do plano, proponha **2–3 conceitos em 1 linha cada** (ex.: "a madrugada da terapeuta: o celular não para até a kz assumir") e recomende 1.

## 3. Para quem (vem do `AUDIENCE.md`)
- A persona tem que **se reconhecer nos primeiros segundos** e entender o valor **sem esforço**.
- Use uma situação concreta da rotina dela (horário, objeto, frase literal), nunca uma categoria abstrata.

## 4. Regras de verdade
- **Só o que é verdade sobre o produto.** Cada funcionalidade mostrada precisa de fonte (LP, `BUSINESS.md`, print). Sem fonte, não entra.
- **Nada inventado:** número real, métrica, depoimento, preço, benchmark.
- **Dados de demonstração = elenco fictício** (nomes fixos por marca, registrados no `BRAND.md`), com valores **marcados como ilustrativos** no roteiro.
- Nicho regulado (saúde etc.): respeitar as regras do conselho registradas em `BUSINESS.md`.

## 5. Texto na tela
- **Pouco e grande:** poucas palavras por momento (ideal ≤ 6; máximo ~10), nunca um parágrafo.
- **Rótulo de botão é verbo** ("Confirmar", "Entrar na fila").
- Caixa alta, pesos e cores: regra da marca (`BRAND.md`). Default: sem caixa alta em frases.

## 6. Arco padrão de vídeo de lançamento / produto (default; o plano pode desviar com motivo)
| bloco | quando (vídeo de ~20–30 s) | função |
|---|---|---|
| **Gancho (cold open)** | 0–2 s | prender: tensão, pergunta, situação reconhecível. **O 1º quadro já tem conteúdo**, sem fade do preto |
| **Conceito** | até ~8–10 s | a pessoa entende do que se trata |
| **Produto em uso** | meio | a interface sendo usada, com cursor e gestos reais e micro-interações |
| **Virada (drop)** | ~60–70% do tempo | música e imagem batem juntas: o momento "ahá" |
| **Revelação** | após a virada | marca/produto (logo, nome) com impacto |
| **Cartão final** | últimos ≥ 2 s (anúncio: 2–3 s) | CTA único + marca, parado o suficiente para ler e agir |

- Para vídeo **sem som** (autoplay mudo é comum no feed), o texto na tela precisa contar a história sozinho. Com locução, use legenda.

## 7. Feito em código
- Tudo na tela em **HTML, CSS, SVG, canvas e GSAP** (+ 3D quando o formato pedir). Sem banco de imagens nem mídia gerada.
- **Exceção:** assets da marca (`brand/`) e prints e gravações reais do produto.
- Áudio próprio (sintetizado ou do kit) ou faixa licenciada registrada no `BRAND.md`. Nunca áudio de terceiros sem licença.

## 8. Molde do pedido (para o usuário copiar, se quiser)
```
Vídeo da <empresa> em motion graphic.
- Recorte: …
- Duração: …
- Formatos: …
- Áudio: locução / só trilha
(opcional) Referência, conceito ou o que evitar: …
```
