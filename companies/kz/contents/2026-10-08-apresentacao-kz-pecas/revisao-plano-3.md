# Revisão crítica do plano · rodada 3 (última antes do Oliver)

> Agente `revisor` (Opus), 2026-10-08. Revisei o `cenas.json` v3 ("As peças da rotina", com `elenco` no topo), o `check-3.txt`, a `revisao-plano-2.md` e o array `revisao`. Abri os storyboards 4:5 e 9:16, os style frames `style/png/slide-01..08` em 1080 px e a `comparacao/v03-4x5.png`. A escala de horas foi medida no `style/style-frames.html`: 60 px/h no 4:5 e 75,7 px/h no 9:16. Contrastes medidos com `node tools/contrast.mjs`. Área segura conforme `knowledge/video/frame.md` §2: 9:16 orgânico em x 65–930, y 270–1440; 4:5 com 80 px de margem.

## 1. Notas

| # | critério | nota | evidência | correção concreta |
|---|---|---|---|---|
| 1 | Teste do mudo | 3 | s3 agora lê como dia sufocado: 11 chips nos vãos e a faixa da noite cheia. A s6 lê como o mesmo dia devolvido: as sessões ficam no mesmo y (conferido no HTML, top 60/180/360/480 nos dois modos) e os vãos ficam brancos. A sequência s1→s7 se conta sem som | — |
| 2 | Acréscimo | 3 | s7 carrega o painel com logo, Helena 14:00 e o card Atalhos, como promete. A s2 tem a contradição legível ("Qui 14h" × "remarcou p/ sexta?"). Ressalva na s3: o `acrescenta` diz "nenhum branco" e "a última sai cortada pela borda". No frame, 18:30–20:00 está branco e "Cobrar" (21:30) termina dentro da coluna, no 22h | s3: um chip às 19:00 ("Confirmar Clara", teal) e "Cobrar" às 21:50, com a área da coluna terminando em 22h para ele sair cortado |
| 3 | Literal | 2 | s2 continua com card Agenda / Pacientes / Anotações nas palavras agenda / pacientes / anotações, e a headline repete a fala. s7 "Conheça a kz" é texto da fala. s3, s4 e s6 já não são literais | aceitável. A contradição da s2 é o que a tira da v03: ela precisa estar legível no ajuste do bloco (texto ≥ 22 px no 1080) |
| 4 | Teste do template | 3 | a s4 deixou de terminar no hero de landing page: termina no card Atalhos, que veio das peças. O callback s3/s6 e as peças que viram tarefas, atalhos e chip não saem de gerador de slides. O quadro final da s4 isolado (headline + card de UI) é genérico, mas a sequência que leva a ele não é | — |
| 5 | Fio condutor | 3 | Mensagens se desprende antes da grade (s4 `entra`) e reaparece como toast na s5: o coral não troca de dono na frente de quem assiste. As peças atravessam s1→s7 e se resolvem duas vezes (grade e chip) | — |
| 6 | Conexão | 2 | 2 tipos de ligação (match, que pela rubrica nova inclui a câmera contínua, e hard cut): ok. O problema é a s4→s5, que ainda não é contínua: o card Atalhos dos frames s4/s7 tem tiles largos (~1,7:1, 346×200 no 9:16) e "Sessão rápida" em 1 linha; no bloco `painel-inicio` o card é estreito, com tiles quase quadrados (~1,1:1), "Sessão rápida" em 2 linhas e um ícone sparkle no cabeçalho. O `ajuste_bloco` da s5 diz que o bloco é a referência, mas os frames novos não seguem essa referência. Menor: a s6 diz que entra "no mesmo enquadramento do fim da s3", mas o fim da s3 está a 1,3× e sem horas; a pose e o spec dizem "como no meio da s3, sem câmera" | correção 4. No `entra` da s6, trocar "fim" por "meio" para o spec não se contradizer |
| 7 | Gancho | 2 | o quadro 0 da s1 continua sem prova (recusa justificada: depende do bloco). Com as peças a 30% e pequenas, os detalhes "Qui 14h" e "3" não se leem no 1º quadro: quem se reconhece é pela pergunta, não pela situação | depois do ajuste, gerar o quadro 0 antes do render. Peças a ≥ 50% e detalhe em ≥ 26 px |
| 8 | Ritmo e curva | 2 | curva 3-2-2-4-2-3-1 ok, e s3/s4 ganharam `vivo` e o gesto em "terapeutas". Porém a s6 está com `tail: 0.35`, e o array `revisao` registra "cauda da s6 0,7 s" como aplicado: **a correção não está no arquivo**. A s6 continua com 4 mudanças em 3,9 s. Na s7, a frase "Uma forma *mais simples*" entra em "profissional", ~1 s depois de a voz dizer "simples" | s6 `tail` 0.7. Na s7, a frase entra no cue `carregando` ("simples"), e `carrega` fica só com a página |
| 9 | Clareza | 2 | a s3 tem ~30 palavras de UI, mas é textura intencional, com hierarquia clara (headline > sessões sage > chips). No `titulo` da s4, a headline "A gestão da sua rotina mais *simples*" tem 7 palavras e aparece junto com a logo e "Feita para terapeutas". Na s3, o chip "Cobrar" cobre o rótulo "noite" (aparece cortado em slide-01 e slide-05) | rótulo "noite" na calha das horas (à esquerda, abaixo de 22h) ou acima da faixa, nunca sob um chip |
| 10 | Verdade e marca | 2 | **integridade do dado: ok**. Escala fixa conferida (09:00 em top 60 = 1 h depois de 8h; 13:15 em 317; 21:30 em 812), elenco único nas cenas s3, s6 e s7 e "4 sessões" no cabeçalho, s5 coberta pelo `ajuste_bloco`. Fontes: todas presentes. **Contraste: 2 reprovações** em texto pequeno: rótulo "noite" #6e6155 sobre o fundo da faixa #d9c9b9 = **3,71:1** (22 px); badge "3" #fff sobre --accent #d66954 = **3,50:1** (20 px, s4, fora da tela do produto, então a exceção do BRAND.md não vale). Para o Oliver: digitar kz.app.br e cair num painel logado ("Boa tarde, Ana") promete algo que o visitante não vê | "noite" em #5a4d42 (5,05:1) ou --ink. Badge em --on-primary #2b2b2b sobre --primary (5,11:1). #fff sobre #bc5a47 dá 4,48:1 e também reprova |
| 11 | Construível | 2 | os 9:16 agora são próprios (1080×1920, escala recalculada): ok. Mas os style frames 9:16 põem texto e elementos-chave **fora da área segura** (lista na seção 2). Os gestos da s3 ficaram da v2: `muda` = "3 tarefas" e `transborda` = "a 4ª tarefa (Responder)", contra 11 tarefas em `params`, e `sai` = "as 4 tarefas" sem dizer quais. Na s6, o spec põe "coluna volta às 20h" no `apoio` e "noite clareia" no `transborda`; os gestos põem a noite no `muda` e a coluna no `transborda`. O fim da s3 (1,3× na sessão + "atender.") não tem frame | correção 3 |
| 12 | Beleza | 2 | s3 e s6 têm acabamento de estúdio. Mas na s3 4:5 o "d" de "atender." encosta na base da coluna e fica a 60 px da borda de baixo (pede 80). No 4:5 da s4, o card ocupa 57% da largura com 1/3 de baixo vazio, e o balão Mensagens fica colado no canto (66 px da direita, ~75 px do topo). No 9:16 da s7, há 160 px vazios entre a janela e a frase, e a frase fica fora da área segura | resolvidas pela correção 1 |

## 2. Total
**28 / 36.** Eliminatórios em 0: nenhum. **A nota passa (≥ 27)**, mas há bloqueantes. Eles voltam ao autor antes do aval. São correções mecânicas, sem decisão criativa, e não pedem rodada 4: o autor aplica e confere com `contrast.mjs` e com os frames regenerados.

Bloqueantes:
1. **Área segura do 9:16 (x 65–930, y 270–1440).**
   - s3: "atender." em y ≈ 1680–1780; a faixa da noite e os 3 chips noturnos em y ≈ 1478–1648, ou seja, o `transborda` acontece embaixo da legenda do Reels; coração em x ≈ 870–985.
   - s6: coração em x ≈ 870–990.
   - s7: frase "Uma forma *mais simples*" em y ≈ 1560–1620; botão "Ir" em x ≈ 893–963.
   - s4: balão Mensagens em x ≈ 900–995, y ≈ 250–345, e o badge "3" em y ≈ 240–270.
   - No 4:5, abaixo dos 80 px de margem: "atender." da s3 (60 px) e o balão da s4 (66 px).
2. **Contraste de texto abaixo de 4,5:1:** rótulo "noite" (3,71:1) e badge "3" (3,50:1).

## 3. Correções mínimas (para liberar o aval)
1. **Área segura nos 2 formatos.**
   - s3 e s6 no 9:16 (mesma escala nas duas): ~62 px/h, para a coluna 8h–22h caber entre y ≈ 430 e 1330, e "atender." ficar em y ≈ 1340–1440.
   - Coração dentro da barra da sessão (x ≤ 900) nas duas cenas.
   - s7 no 9:16: "Conheça a kz" em y ≈ 290 e janela com 780 px de largura (x 150–930), para o "Ir" ficar dentro. Frase logo abaixo da janela, até y 1440.
   - s4: balão Mensagens em x ≤ 900 e y ≥ 300 (9:16), e a ≥ 80 px das bordas (4:5).
   - Regenerar os frames.
2. **Contraste.** "noite" em #5a4d42 (5,05:1), na calha das horas, sem chip por cima. Badge "3" em #2b2b2b sobre --primary (5,11:1).
3. **Spec igual ao frame e aos params.**
   - s3: `muda` = as 8 tarefas diurnas em cascata; `transborda` = as 3 noturnas e a faixa escurece; `sai` = 1 tarefa de cada tom (diga quais).
   - s3: chip às 19:00, "Cobrar" às 21:50 e saindo cortado pela base.
   - s6: um spec só: `muda` = tarefas vão para o chip e a noite clareia; `transborda` = a coluna volta a terminar às 20h.
   - s6: `tail` 0.7 de fato, e `entra` "como no meio da s3".
   - s7: frase no cue `carregando`.
4. **Uma geometria de card Atalhos.**
   - Medir o card do bloco `painel-inicio`: proporção, tile e quebra de "Sessão rápida".
   - Refazer o card da s4 (fim) e da s7 com essas medidas: mesmo cabeçalho, inclusive o ícone, e mesma proporção dos tiles.
   - Na s4, só a escala muda.
   - Sem isso, o zoom s4→s5 vai ter um pulo de layout no meio da câmera "contínua".

**No aval, o Oliver deve olhar:**
- A s7 carrega um painel logado em kz.app.br. Se o site abre na página de venda ou no login, é melhor carregar essa página com a logo (ou deixar claro que é o app).
- A s4 é o momento da marca (intensidade 4), e a logo some em "profissional". A logo grande só volta no favicon e no cabeçalho da s7. Ele precisa aceitar um fim sem logo grande.
- A densidade da s3 (11 chips, texto de 22 px no 1080): no celular, os chips viram textura e quase não se leem. É a intenção, mas é uma escolha dele.
- A s2 continua próxima da v03. É a cena mais fraca que sobra.

**Riscos de produção:**
- O zoom `de_atalhos` da s5 parte do painel a ~2,5×. Só fica nítido se o bloco for HTML vetorial (o plano diz que é) e se a correção 4 entrar antes de animar.
- A s6 tem 4 mudanças em 3,9 s com chip, noite, coluna e coração. É o payoff do vídeo inteiro: se ficar apertada no render, a primeira coisa a tirar é a coluna encolhendo.
- O quadro 0 da s1 e o fim da s3 (câmera a 1,3× com "atender.") só vão ser vistos no render. Exigir os dois na folha de contato do QC.

## 4. v03 × este plano (storyboards)
- **Ganhou o fio:** na v03, cada cena tinha um recurso próprio (relógio, pílulas, texto riscado, logo). Aqui, as 4 peças viram tarefas, atalhos e chip, e a s6 desfaz visivelmente a s3 no mesmo enquadramento.
- **Ganhou a prova:** os adjetivos viraram os Atalhos reais do produto, e o "Mais tempo cuidando" agora se vê nos vãos brancos de um dia com dados coerentes, não num coração solto.
- **Perdeu a marca e o respiro:** a v03 fechava com a logo enorme e a URL num botão. Aqui a logo fica no cabeçalho da página, e s3, s6 e s7 são UIs densas com texto pequeno no lugar de uma ideia grande.
- **Igual:** s1, s2 e s5 ainda são a v03 até os ajustes. Os ajustes valem o vídeo (a contradição da s2 e o zoom da s5), então o risco ficou concentrado neles.
