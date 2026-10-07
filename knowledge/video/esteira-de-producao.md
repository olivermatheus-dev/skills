# Esteira de produção de vídeo em motion

> Base: skill `ludus-video` do usuário (produto Ludus, 2026-10-07), generalizada para qualquer empresa e verificada. É o **processo** que as skills de vídeo seguem. As regras visuais de cada marca ficam fora daqui (ver §1).

## 1. Genérico × marca (regra de arquitetura)
- **A skill sabe *como* fazer** (processo, timing, easing, QA, render) e tem **defaults bonitos** para tudo.
- **A marca diz *com o quê*:** `companies/<slug>/brand/` → `BRAND.md` (regras de uso) + `brand.css` (tokens) + logos e ícones.
- Ordem de precedência: **regra da marca > default da skill**. Se a marca não define algo (sombra, raio, cor de título…), use o default da skill, nunca invente por peça.
- Proibição da marca (ex.: "nunca caixa alta", "fundo sempre liso") é **regra dura**: entra no QA.

## 2. Um vídeo = uma pasta
```
companies/<slug>/contents/AAAA-MM-DD-<nome>/   (ou campaigns/…)
  plano.md          ← o contrato aprovado
  locucao.json      ← falas exatas (texto → voz)
  timeline.json     ← tempos derivados da voz: cenas, eventos (gestos), sfx
  composition.html  ← as cenas em código
  audio/ render/ exports/   ← gerados, fora do git (se regeneram)
```
O **vídeo anterior da mesma empresa é o ponto de partida** (não o modelo): leia o `plano.md` dele e o feedback do dono antes de planejar o próximo.

## 3. As 5 etapas (com portões)

### Etapa 1 — Plano → **portão: aval explícito do usuário**
`plano.md`, nesta ordem:
1. **Recorte:** o que o vídeo vende, em 1 frase, e para quem.
2. **O que muda em relação ao anterior:** cada pedido do usuário e como o plano atende.
3. **Falas:** texto exato de cada uma.
4. **Folha de batidas:** 1 linha por cena: `tempo ≈ | na tela | o que quem assiste precisa entender | o que o som faz`.
5. **Cor e fundo por cena**, conferidos contra o `BRAND.md`.
6. **Afirmações sobre o produto, cada uma com fonte** (linha da LP, `context/BUSINESS.md`, print). Sem fonte = *a confirmar* = **não entra no vídeo**.
7. **Perguntas ao usuário:** só as que mudam o que se constrói, cada uma com a sua recomendação.

**Pare e peça o aval.** Recomendação não é decisão: sem o "pode seguir", não se gera código.

### Etapa 2 — Voz e tempos (o áudio manda no relógio)
- Gerar a voz (TTS) a partir de `locucao.json` e extrair o **tempo de cada palavra** (alinhamento forçado ou Whisper com timestamps por palavra).
- `timeline.json` nasce **da voz**:
  - cada fala começa **≤ 0,5 s** após o fim da anterior;
  - **a cena dura o que a fala dura**, e a ação mais longa acontece *debaixo* da voz;
  - pausa de até **1 s** só na virada de bloco, marcada (`"pause": true`).
- Gestos na tela (clique, digitação, entrada de card) vão em `events`. Cada SFX aponta para um evento: o som nasce do gesto, nunca solto.
- Elemento ligado a uma palavra entra **na palavra ou até ~4 frames antes** (ver `cortes-e-montagem.md` §5).

### Etapa 3 — Cenas
- **Produto em uso:** mostrar a interface sendo usada (cursor, clique, digitação), não print parado.
- **Algo novo a cada 2–3 s** em short-form: um elemento, uma mudança de estado, um corte. Novo ≠ efeito; pode ser a próxima linha de texto.
- **Transição com motivo:** a forma do fim de uma cena vira a próxima (*match cut*). **Nunca dissolve solto.**
- **Cor com significado:** cor de status só onde significa algo (verde = pago, âmbar = pendente). Título e fundo seguem o `BRAND.md`.
- Animação via **biblioteca de movimento compartilhada** (molas/easings, troca de texto, cursor, deslocamento de timeline). Não reescrever easing à mão em cada vídeo.

### Etapa 4 — Conferir (automático + olho)
- **Automático:** acusar silêncio acima do limite; tirar **1 quadro de cada gesto assentado** em cada formato; montar **folhas de contato**.
- **Olhar todas as folhas.** Procurar:
  - [ ] texto cortado ou fora da área segura
  - [ ] sobreposição de elementos
  - [ ] cursor fora do quadro
  - [ ] cor ou fundo fora do `BRAND.md`
  - [ ] palavra na tela fora do tempo da fala
  - [ ] proibições da marca (ex.: caixa alta)
- Revisão completa em passadas: `qc-final.md`.
- Consertar → conferir de novo. Só exportar com as folhas limpas.

### Etapa 5 — Exportar e entregar
- Renderizar todos os formatos pedidos (ex.: 4:5 e 9:16).
- **Motion blur:** renderizar acima do fps final e mesclar os quadros intermediários. Ver nota técnica abaixo.
- Conferir no MP4 final um **quadro de movimento rápido** (borrão ok, sem "fantasma" duplo).
- `node tools/video/qc.mjs <pasta> --sheet`: QC técnico do arquivo real (a entrega é o MP4, não a timeline).
- Entregar os arquivos e **dizer o que não foi verificado**: o Claude não escuta o áudio, então voz e mixagem precisam do ouvido do usuário.
- Registrar no `plano.md`: o que foi entregue, o que ficou em aberto e o feedback recebido (isso alimenta o próximo vídeo).

## 4. Nunca
- Gerar código sem plano aprovado.
- Mostrar recurso que a LP ou o contexto não confirmam.
- Inventar número, métrica ou depoimento. Dados de demonstração são de **elenco fictício** e o vídeo diz que são ilustrativos.
- Quebrar regra dura da marca.
- Commitar `audio/`, `render/` ou `exports/`.

## 5. Nota técnica — motion blur
- O Ludus faz 2 renders a 60 fps e mescla para 30 fps, o que equivale a **2 amostras por quadro**. Em movimento rápido isso pode gerar **imagem dupla (fantasma)** em vez de borrão.
- **Recomendado:** 4–8 amostras por quadro (render a 120–240 fps e média), com obturador de 180° (média só da metade das amostras centradas no quadro). Custa mais render, então use só no export final e só se o vídeo tiver movimento rápido.
- **Alternativa barata:** desfoque direcional aplicado só no elemento rápido, proporcional à velocidade.
- **fps:** 30 basta para social. 60 deixa UI e cursor mais lisos; vale testar nos vídeos de produto.

## 6. Fronteiras entre skills
- **Vídeo motion** (esta esteira): lançamento, recorte de funcionalidade, anúncio.
- **B-roll sobre talking head** (filmagem real): skill separada (adiada).
- Formatos `fmt-*` (diálogo, meme, 3D…) usam esta esteira e só mudam a receita das cenas (tarefa 005).
