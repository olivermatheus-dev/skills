# Plano — V0001 · Apresentação: aluno e professor

> Empresa: ola · Nível: **alto** · Formato: livre (apresentação da marca, motion 100%) · Duração: **45,9 s medidos** (teto 45–46 s) · Formatos: **9:16** (principal) + 4:5 · Áudio: locução (1 narrador pt-BR, uma faixa por fala f01…f20) + trilha + efeitos
> Entrada: roteiro (`roteiro.md`, Oliver, 2026-10-26) · Status: **protótipo direto** (revisão crítica, style frames e storyboard cancelados pelo Oliver em 2026-10-26) · Data: 2026-10-26
> Máquina: `cenas.json` (fonte da verdade; este arquivo é a leitura humana dele) · `timeline.json` (voz de teste medida) · check do plano original: `check-1.txt`

## 0. Protótipo de até 45 s (decisões do Oliver, 2026-10-26)
- **Teto ~45 s, sem enrolação.** Falas f01…f20 intactas; o corte veio de silêncios e gestos longos. Os tempos das seções 4–5 abaixo eram do plano de 67 s; valem os desta seção.
- **§9 resolvido:** abertura sem voz ≤ 2 s (s01 1,0 s com a URL digitada rápido + s02 1,0 s; a f01 entra no clique do card, em 2,05 s) · s10 em creme · sem selo "Mais escolhido" · chat ("Ayer fui al…" / "Tranquilo, pode falar em português.") e textos de tela como propostos · s07 (volta aos botões) 0,8 s · virada s06 → s08 com 1,0 s sem narração · cartão final 2,3 s depois da f20.
- **Voz de teste:** `edge-thalita-rapida` (Thalita do edge com rate +30%; rascunho da ola em `brand/voices.json`), uma faixa por fala em `audio/vo/f01…f20.wav`. 127 palavras em 36,9 s = **3,45 palavras/s** (a regra do hub é ≤ 2,7; com 46 s e as 20 falas inteiras não cabe mais devagar). Eventos ancorados por palavra.
- **Tempos medidos:** s01 0 · s02 0,90 · s03 1,90 · s04 7,29 · s05 9,64 · s06 20,10 · s07 24,18 · s08 24,93 · s09 29,39 · s10 37,85 · s11 41,42 · fim 45,92. f01 entra no clique (1,95 s); f18 "Vira aula" 40,43–41,17.
- **Silêncios entre falas:** todos ≤ 0,5 s, menos a virada f10 → f11 (0,95 s, pedido do Oliver: ≤ 1 s).
- **Pendências do `timeline.mjs check`:** leitura curta em s02, s03, s04, s06 e s07 (o check soma todos os textos da cena, inclusive os que entram em etapas) e falta de trilha (com o `sound-designer`).

## 0b. v02 (feedback do Oliver sobre a v01, 2026-10-26)
- **Sem teto de duração:** 80,1 s medidos. Voz de teste `edge-thalita` no rate normal (2,72 palavras/s); rascunho da ola em `brand/voices.json` voltou para `edge-thalita`.
- **f10 nova (copy do Oliver):** "Você fala como consegue e eles entendem." O "?" da s06 entra em "como consegue"; a resposta do professor, em "entendem". O evento e33 (`trava`) fica **sem som** (pedido do Oliver; sfx removido da timeline e do bloco).
- **Respiro:** abertura de 4,0 s (≈2,25 s só digitando, Enter, carregamento) · cards de 4,6 s (s02) e 4,2 s (s07), com hover no card do aluno, depois no do professor, e clique (evento novo `hover2`: e69 na s02, e70 na s07) · leads, pausas entre falas (0,6–0,8 s) e caudas maiores em todas as cenas · cartão final com 2,8 s depois da f20.
- **Tempos:** s01 0 · s02 4,00 · s03 8,60 (f01 em 8,90) · s04 16,82 · s05 21,42 · s06 37,16 · s07 44,57 · s08 48,77 · s09 55,64 · s10 68,51 · s11 73,78 · fim 80,13. "Vira aula": f18 72,32–73,28, evento `vira` em 72,33.

## 0c. Voz final (Carla, ElevenLabs v4, 2026-10-26)
- Um áudio contínuo do Oliver (`audio/elevenlabs/v0001-voz-carla.mp3`, 53,5 s, f18 = "Vira aula!") cortado por `split-vo.mjs --voice el-carla` em f01…f20 e reencaixado por `fit-vo`, mantendo o respiro da v02. Pontas de todos os cortes abaixo de −39 dB (nenhuma fala cortada nem com cauda da vizinha). Timeline: 82,06 s; f01 em 8,90 s; "vira" (e60) em 74,26 s. A conferir de ouvido: a f18, que o Whisper transcreveu como "Vira a aula!".

## 1. Recorte
O site da Olá Espanhol pelos dois lados: o brasileiro que quer ganhar fluência conversando com nativos no horário dele, e o nativo que quer dar aula sem correr atrás de aluno. Tudo começa e termina em ola-espanhol.com.br.

## 2. Conceito
**Escolhido: A hora que muda de lado** — o site é uma bifurcação (a barra do navegador do manual p. 17 se abre em duas portas, aluno e professor), e o tempo de conversa é um objeto: a **pílula vermelha**, que o aluno escolhe e divide do lado dele e que chega pronta e paga na agenda do professor do outro lado. No fim, as duas portas voltam a ser um endereço só.
- **Motivo:** a pílula do tempo. Identidade fixa: `--primary`, texto branco SemiBold, altura 84 px (em 1080), raio pill, avatar redondo na ponta direita. Do lado do aluno a soma é sempre 60' (a hora não encolhe ao se dividir).
- **Evolução:** s01 campo da URL vermelho na barra → s03 barra "2 / 3h esta semana" → s04 o card "1 hora" vira a pílula → s05 parte em 4 × 15', junta em 2 × 30', junta em 1 × 60', é arrastada e ganha o avatar de Carlos → s06 o avatar vira o card dele → s08 três pílulas "Aula paga" chegam sozinhas ao professor → s09 pousa no card "Aula já paga" → s10 **a mesma pílula de 30' preenche o vão do professor** ("Vira aula.") → s11 volta a ser o campo da URL embaixo do logo.
- **Forma das palavras de quantidade/espaço:** "4 de 15 / 2 de 30 / uma hora inteira" = a mesma pílula partida e reunida, comprimento proporcional · "sem correr atrás de aluno" = as pílulas andam até ele · "meia hora entre um compromisso e outro" = o vão tracejado que a pílula ocupa.
- **Fio vivo:** o oló pisca e os olhos seguem o cursor em toda cena em que aparece (pedido do roteiro).
- **Transição:** match cut no motivo e na forma em quase tudo (barra → 2 cards → card vira página → chips viram planos → pílula → avatar → card…); **hard cut na batida** só em s04 → s05 (fundo vira azul, pílula parada) e no "Vira aula." 2 tipos, nenhum fade.
- **Curva:** 2 · 2 · 3 · 2 · 3 · 2 · 1 · 3 · 2 · **4** · 1. Estilo Premium Educational + Organic; tom acolhedor e animado, ~104 BPM.
- **Não vamos fazer:** bandeira da Espanha, sombrero, mariachi, touro, paella; globo, avião, mapa-múndi; lâmpada, foguete, gráfico subindo, aperto de mão; foto ou rosto real; fade/dissolve, partícula, glitch; gradiente ou cor fora das 7 dobras; preço na tela; professores reais do site.

**Alternativas** (nível alto: 3 conceitos):
- B · **O oló que acompanha** — o mascote é o guia de cena em cena. Mais simpático, mas cansa e não dá forma às quantidades (4 de 15, 2 de 30). Ficou como fio vivo do A.
- C · **Duas agendas lado a lado** — tela dividida aluno | professor o vídeo todo. O mais claro no conceito, mas espreme tudo no 9:16 e briga com o roteiro, que conta um lado de cada vez.

Os style frames dos 3 conceitos saem na fase F (depois da revisão), junto com o storyboard.

### O que mudei em relação à direção do roteiro
| onde | roteiro | plano | por quê |
|---|---|---|---|
| motivo | "a pílula que vira caminho" (barra, botões, páginas, planos, blocos: tudo vira pílula) | **uma** pílula com identidade fixa (cor, altura, texto branco) = o tempo de conversa | um motivo que vira tudo não é motivo; e a pílula como "a hora" liga os dois lados (s05 ↔ s10), que é o recorte |
| s10 (tela 8) | dobra azul | **creme** | azul → vermelho (tela 8 → 9) = duas coloridas seguidas, proibido no BRAND.md; a rima com a s05 fica na forma (mesma agenda, mesma pílula) |
| s03 ícones | relógio = "na hora que der"; quebra-cabeça = "de onde você estiver" | quebra-cabeça (`icone-sem-horario-fixo`) = "na hora que der"; Lucide `map-pin` = "de onde você estiver" | no manual o quebra-cabeça é "Sem horário fixo"; não lê como lugar |
| s04 | selo "Mais escolhido" no de 2 horas | **sem selo** | o print 06 mostra o selo no plano "Ritmo", mas não diz que Ritmo = 2 h (o site não confirma) |
| s08 | 3 mini-mascotes ou chips "Novo aluno · aula paga" | 3 pílulas vermelhas "Aula paga" com mini-mascote aluno na ponta | é o motivo chegando do outro lado |
| s09 card 2 | selo verde "Aula paga ✓" | a pílula vermelha "Aula paga ✓" pousa no card | mesmo motivo; botão principal da dobra creme-claro é vermelho |
| s09 card 4 | relógio "24 h" | relógio sem número + calendário | "24 h" não tem fonte |
| s06 chat | aluno: "?" vermelho; professor: "Tranquilo! Em espanhol, dá pra dizer assim…" | aluno: "Ayer fui al…" travando, "?" grafite; professor: "Tranquilo, pode falar em português." | creme-suave não tem ênfase por cor; a resposta em português prova o "eles entendem" |
| telas 9 | duas cenas (volta à barra + cartão final) | uma cena s11 com f19 + f20 + cauda | um bloco só com a barra se juntando, "olá" → logo e o clique na URL |

## 3. O que muda em relação ao anterior
Primeiro vídeo da Olá Espanhol. Do repertório (feito para a kz) vale só a regra: frase inteira, headline em tela de UI, ícone por ideia, CTA com URL clicada. Nenhum bloco da kz serve (outra marca); o `cta/navegador` da biblioteca foi descartado como bloco porque é janela + página, e o manual p. 17 é só aba + barra: o bloco novo `abertura/barra-navegador` reaproveita dele o código do caret e da digitação.

## 4. Falas
| id | texto exato | palavras | ≈ s |
|---|---|---|---|
| f01 | Fluência em espanhol se ganha falando. | 6 | 2,2 |
| f02 | Com nativos. Na hora que der. De onde você estiver. | 10 | 3,7 |
| f03 | Quantas horas por semana você quer falar espanhol? | 8 | 3,0 |
| f04 | Sua hora, do seu jeito: | 5 | 1,9 |
| f05 | 4 conversas de 15 minutos, *(falado: "Quatro… quinze…")* | 5 | 1,9 |
| f06 | 2 conversas de 30 minutos. *(falado: "Duas… trinta…")* | 5 | 1,9 |
| f07 | Ou uma hora inteira, de uma vez. | 7 | 2,6 |
| f08 | Você escolhe o que cabe na sua rotina. E com quem quer falar. | 13 | 4,8 |
| f09 | Professores nativos que também falam português. | 6 | 2,2 |
| f10 | Travou? Eles entendem. | 3 | 1,1 |
| f11 | Você fala espanhol desde que nasceu. | 6 | 2,2 |
| f12 | Agora pode ganhar com isso sem correr atrás de aluno. | 10 | 3,7 |
| f13 | Você define seus horários. | 4 | 1,5 |
| f14 | O aluno chega com a aula já paga. | 8 | 3,0 |
| f15 | Sem negociar preço. Sem cobrar ninguém. | 6 | 2,2 |
| f16 | Cancelamento com regras claras e pagamento em dia. | 8 | 3,0 |
| f17 | Sobrou meia hora entre um compromisso e outro? | 8 | 3,0 |
| f18 | Vira aula. | 2 | 0,7 |
| f19 | Conversação é treino. | 3 | 1,1 |
| f20 | Comece com um olá. | 4 | 1,5 |

Total: 127 palavras ≈ 47 s de locução + abertura sem fala (5,4 s), volta aos botões (2 s) e cauda final (~3 s) ≈ **67 s** (alvo 60–70). Cabe.

## 5. Storyboard
*(fase F, depois da revisão crítica: `storyboard-9x16.png` e `storyboard-4x5.png`, com os style frames dos blocos novos)*

| cena | tempo ≈ | int. | ideia | dobra | relação | o que a imagem acrescenta | bloco |
|---|---|---|---|---|---|---|---|
| s01 | 0–2,6 | 2 | marca (sem fala) | vermelho | mostra | o endereço digitado na barra do manual; o campo vermelho é a pílula que vai virar a hora | novo `abertura/barra-navegador` |
| s02 | 2,6–5,4 | 2 | identificação (sem fala) | vermelho | complementa | duas portas; o cursor hesita: "qual sou eu?"; os olhos dos mascotes seguem o cursor | novo `escolha/dois-cards` |
| s03 | 5,4–12 | 3 | promessa + lista (f01–f02) | creme | complementa | a promessa vira uma aula concreta (quarta 19:30, pergunta de vida real em espanhol) e a barra de horas enchendo | novo `pagina/hero-aluno` |
| s04 | 12–16,8 | 2 | pergunta (f03) | creme | mostra | os planos reais (1, 2, 3 h) e a escolha do menor: dá para começar pequeno | novo `escolha/planos` |
| s05 | 16,8–31 | 3 | número + benefício (f04–f08) | azul | complementa | a hora não encolhe ao se dividir e se espalha pela semana; a escolha é física (arrasta) e ganha um rosto | novo `agenda/hora-divide` |
| s06 | 31–36,6 | 2 | benefício + objeção (f09–f10) | creme-suave | complementa | nome, país e selo provam "nativo que fala português"; a frase do aluno trava e a resposta vem em português | novo `pessoas/professores-chat` |
| s07 | 36,6–38,6 | 1 | virada (sem fala) | vermelho | contrasta | as mesmas portas, e agora o cursor vai direto ao outro lado | `escolha/dois-cards` (o da s02) |
| s08 | 38,6–45,2 | 3 | identificação + promessa (f11–f12) | creme + bloco verde | contrasta | quem anda são as aulas pagas: chegam sozinhas ao professor | novo `pagina/bloco-professor` |
| s09 | 45,2–55,8 | 2 | processo (f13–f16) | creme-claro | mostra | cada frase vira um gesto-prova: liga horários, pílula paga pousa, riscos, dia do pagamento marcado | novo `cards/como-funciona-professor` |
| s10 | 55,8–60,5 | **4** | pergunta + revelação (f17–f18) | creme | complementa | a meia hora do professor é a meia hora que o aluno escolheu: os dois lados se encaixam | novo `agenda/vira-aula` |
| s11 | 60,5–67,1 | 1 | promessa + CTA (f19–f20) | vermelho | complementa | as duas portas voltam a ser uma barra; "olá" vira o logo; o cursor clica na URL | novo `cta/fecho-ola` |

Literais: 0 de 11. Pílula visível em 9 de 11 cenas; s02 e s07 carregam a outra metade do conceito (as duas portas, em rima).

### Ficha por cena
**s01 · gancho (sem fala, 2,6 s)** — o endereço digitado na barra do manual; o campo vermelho da URL é a pílula.
- Poses: início barra creme inteira no vermelho, aba com favicon oló, caret piscando · meio URL digitada, Enter afunda a barra · fim controles saem em cascata, a barra estica e se parte.
- Gestos: entra 0,02 · digita 0,2 (teclado) · enter 1,4 (tic) · divide antes do fim (whoosh fino).
- Entra: 1º quadro já com a barra · Sai: as metades viram os dois cards (match) · Olhar: centro.
- Tela: "ola-espanhol.com.br" · aba "Olá Espanhol" · ícone favicon oló + cadeado.

**s02 · conceito (sem fala, 2,8 s)** — duas portas, cursor hesita.
- Poses: início os dois cards (aluno com círculo verde, professor com círculo vermelho; 9:16 empilhados, 4:5 lado a lado) · meio hover no professor, olhos seguem · fim clique no aluno, card afunda e cresce.
- Gestos: entra 0,02 (2 pops) · hesita 0,6 · clique 1,85 · expande antes do fim (whoosh).
- Entra: das metades da barra · Sai: o creme do card vira a página.
- Tela: "Quero *aprender* espanhol" · "Quero *ensinar* espanhol".

**s03 · conceito (f01–f02)** — a promessa vira uma aula concreta.
- Poses: início tag + "Fluência em espanhol / *se ganha falando.*" grande, inteira · meio título no topo, cartão em arco com mascote aluno, "Sua próxima aula: quarta, 19:30" e "¿Cómo te fue en la entrevista?" · fim 3 chips com ícone + barra 2/3h quase cheia.
- Gestos: "falando" → cartão de aula · "Com" → título encolhe · "nativos" / "hora" / "onde" → chips 1, 2, 3 · antes do fim → chips viram os cards de plano.
- Tela: chips "Com nativos" (nativos verificados) · "Na hora que der" (quebra-cabeça) · "De onde você estiver" (map-pin) · rodapé "ilustrativo".
- Alternativas: título sozinho com chips orbitando o mascote · resposta do aluno travando no balão (antecipa a s06).

**s04 · produto (f03, mín. 4,8 s)** — os planos reais e a escolha do menor.
- Poses: início headline inteira + 3 cards "1 hora / 2 horas / 3 horas por semana" · meio cursor passa pelos três · fim "1 hora" com borda vermelha, os outros recuam (conteúdo, nunca o card).
- Gestos: "semana" → hover · "falar" → clique + ding · antes do fim → o card vira a pílula "1 hora".
- Sai: hard cut na batida para o azul com a pílula parada no mesmo ponto.

**s05 · produto (f04–f08)** — a hora se divide e se espalha pela semana.
- Poses: início azul, "Sua hora, *do seu jeito:*", pílula "1 hora" sobre a agenda vazia · meio 4 × 15' em seg/ter/qui/sáb, depois 2 × 30' · fim 1 × 60' arrastada para sáb com o avatar de Carlos (CO); headline "Na sua rotina, *com quem quiser.*".
- Gestos: "Quatro" → racha em 4 e encaixa (crack + 4 clicks) · "Duas" → junta em 2 · "hora" (f07) → junta em 1 · "vez" → encaixa · "Você" → headline troca · "escolhe" → cursor arrasta · "rotina" → assenta · "quem" → avatar · antes do fim → zoom no avatar.
- Números em teal (`--dobra-azul-enfase`) com swap. Rodapé "ilustrativo".
- Alternativas: relógio que se fatia (quebra o motivo) · pílula sozinha no centro sem agenda (perde o "espalhar").

**s06 · prova (f09–f10, mín. 5,6 s)** — nativos de verdade, e travar não é problema.
- Poses: início headline + card de Carlos (nasceu do avatar) · meio Lucía (AR) e Mateo (MX) + selos "Fala português ✓" · fim cards recuados; "Ayer fui al…" com os pontinhos parados e "?"; resposta "Tranquilo, pode falar em português." com mini-mascote piscando.
- Gestos: "nativos" → cards 2 e 3 · "português" → selos · "Travou" → chat trava · "entendem" → resposta · antes do fim → a página encolhe para o card do aluno.
- Tela com rodapé "ilustrativo"; ícone `icone-falsos-amigos` ao lado do chat.

**s07 · virada (sem fala, 2 s)** — as mesmas portas; agora o outro lado.
- Poses: início cards na posição exata da s02 · meio cursor vai direto ao professor, olhos arregalam · fim clique, card cresce.
- Respiro de ~3,7 s sem narração entre f10 e f11 (cauda da s06 + s07): trilha e SFX seguram; é a virada do vídeo.

**s08 · virada (f11–f12)** — as aulas pagas chegam sozinhas.
- Poses: início bloco verde, "PARA PROFESSORES NATIVOS", "Você fala espanhol / desde que nasceu." + mascote professor grande · meio duas pílulas "Aula paga" paradas, a terceira entrando · fim três paradas, mascote sorri.
- Gestos: "nasceu" → pisca · "ganhar" / "correr" / "aluno" → pílulas 1, 2, 3 · depois de "aluno" → sorri · antes do fim → bloco encolhe no card 1 da s09.
- Alternativas: mascote começa a correr e para (mais infantil) · notificações num telefone (UI sem print).

**s09 · produto (f13–f16)** — cada frase vira um gesto-prova.
- Poses: início "COMO FUNCIONA / Pra quem *ensina*" + card "Seus horários" · meio "Aula já paga" com a pílula pousada; "Sem negociar, sem cobrar" com riscos · fim 4 cards completos, o 4º com relógio e calendário marcado, borda vermelha (ativo).
- Gestos: "horários" → liga 2 toggles · "aluno" → card 2 · "paga" → pílula pousa · "Sem" → card 3 · "preço" / "ninguém" → riscos · "Cancelamento" → card 4 · "pagamento" → dia marcado · antes do fim → o calendário vira a agenda da s10.

**s10 · revelação (f17–f18, ponto alto)** — a meia hora do professor é a do aluno.
- Poses: início "Sobrou *meia hora*?" + agenda do dia com o vão tracejado · meio vão pulsa, "30'" grande, relógio no início do vão · fim **corte seco**: pílula "Aula · 30 min" com mini-mascote aluno no vão, brilho verde, "Vira *aula*.".
- Gestos: "meia" → pulsa + 30' · "outro" → relógio + tracejado acende · "Vira" → hard cut (único SNAP e único ding forte, 0,3 s de silêncio antes) · "aula" → brilho · antes do fim → a pílula vira o círculo vermelho do card professor.
- Pausa de 0,5 s entre f17 e f18 (setup do payoff).
- Alternativas: pílula desliza e encaixa (mais suave) · câmera mergulha no vão e acha o cartão da s03 do lado do professor.

**s11 · cartão final (f19–f20 + cauda, mín. 6,6 s)** — uma barra, um endereço.
- Poses: início vermelho, os dois cards na posição da s02 + "Conversação é treino." com brilho verde · meio cards se juntam na barra; "Comece com um *olá*." · fim "olá" virou o logo (laço se desenha), pílula creme "ola-espanhol.com.br" clicada, oló pisca, blob verde no canto.
- Gestos: "treino" → cards se juntam na barra · "Comece" → frase 2 · "olá" → vira o logo · 2,2 s antes do fim → clique na URL · 1 s antes → oló pisca. Cauda ~3 s com a trilha resolvendo.

## 6. Cor e fundo por cena
| cena | dobra | fundo | título | ênfase | elementos |
|---|---|---|---|---|---|
| s01 | vermelho | #CF3F56 | — (barra creme, URL em campo `--primary`) | — | favicon oló |
| s02 | vermelho | #CF3F56 | cards creme: grafite ExtraLight + Bold | peso | círculos verde e vermelho (manual p. 20) |
| s03 | creme | #FFFFF0 | ExtraLight grafite | **Bold #CF3F56** | asterisco e balão em traço verde, tag contorno verde, barra `--primary` |
| s04 | creme | #FFFFF0 | ExtraLight grafite | Bold #CF3F56 | cards #F8F7E6; escolhido com borda 2 px #CF3F56 |
| s05 | azul | #A6D1CC | Bold grafite | números #4A6B66 Bold | agenda #FFFFF0; pílula `--primary`/branco |
| s06 | creme-suave | #F8F7E6 | Bold + ExtraLight grafite | peso | cards #FFFFFF + borda + sombra; selo #E4F1F0/#4A6B66 |
| s07 | vermelho | #CF3F56 | como s02 | peso | — |
| s08 | creme + verde | #FFFFF0 + bloco #DAE069 | Bold + ExtraLight grafite | peso | mascote professor; pílulas `--primary`/branco |
| s09 | creme-claro | #FFFEFA | Bold + ExtraLight grafite | peso | cards #FFFFF0 + borda; ativo borda 2 px #CF3F56; risco #AF2F48 |
| s10 | creme | #FFFFF0 | ExtraLight grafite | Bold #CF3F56 | compromissos #E9E7D3; pílula `--primary`; brilho verde |
| s11 | vermelho | #CF3F56 | Bold creme/branco | peso | blob verde, brilho verde, logo branco com laço verde, URL em pílula creme/grafite |

Sequência: vermelho → creme → azul → creme-suave → vermelho → creme/verde → creme-claro → creme → vermelho. Nenhuma colorida seguida de outra colorida (s07 → s08 passa pelo creme do card que vira a página). Grafite não entra. Tudo por token `--dobra-<nome>-*`. Conferido contra `brand/BRAND.md`: sim.

## 7. Afirmações sobre o produto
| afirmação | fonte | status |
|---|---|---|
| conversa com professores nativos | site, hero + "Só nativos verificados" (prints 01, 02) | ok |
| planos de 1, 2 ou 3 horas por semana | site, Como funciona 01 (print 04) | ok |
| aulas de 15, 30 ou 60 min (o site também tem 45) | site, Como funciona 03 (print 04) | ok |
| escolher professor e horário | site, Como funciona 03 (print 04) | ok |
| nativos que falam português | site (print 02): "Falam português também" | ok |
| professor define a disponibilidade | site (print 07) | ok |
| aluno chega com o pacote já pago; sem cobrar nem negociar preço | site (print 07) | ok |
| cancelamento regulamentado; pagamentos regulares ("em dia") | site (print 07) | ok; "em dia" é a leitura aprovada no roteiro (pergunta abaixo) |
| Carlos (CO), Lucía (AR), Mateo (MX); "Sua próxima aula: quarta, 19:30"; "2 / 3h"; chat | elenco fictício / hero do site, rodapé "ilustrativo" | ilustrativo |
| selo "Mais escolhido" no plano de 2 h | site não confirma que Ritmo = 2 h | **fora do plano** |

## 8. Revisão crítica
Cancelada pelo Oliver (2026-10-26): protótipo direto com este plano. Não há `revisao-plano-N.md`.

## 9. Perguntas ao Oliver (respondidas em 2026-10-26: ver §0)
1. **Abertura sem voz por ~5,4 s** (barra + dois botões) num Reels: risco de perder quem rola. → Recomendo manter (o 1º quadro já mostra a marca e a URL, e a digitação + o cursor hesitando prendem), mas comprimido como está (2,6 + 2,8 s). Alternativa: a voz da f01 entra já no clique do card (J-cut), sem mudar o texto.
2. **s10 em creme em vez de azul** (BRAND.md: nunca duas coloridas seguidas). → Recomendo creme. Se preferir manter o azul, a s11 precisaria abrir no creme, o que enfraquece o fechamento vermelho do site.
3. **Selo "Mais escolhido"** nos planos: o plano "Ritmo" é o de 2 h por semana? → Sem confirmação fica fora.
4. **Resposta do professor no chat:** "Tranquilo, pode falar em português." → Recomendo esta (curta, prova o "eles entendem"). E o aluno travando em "Ayer fui al…".
5. **Textos só de tela:** "Pra quem *ensina*" (s09), rótulos dos cards ("Seus horários", "Aula já paga", "Sem negociar, sem cobrar", "Regras claras, pagamento em dia"), "Na sua rotina, *com quem quiser.*" (s05). → Recomendo como estão.
6. **"Pagamento em dia"** como leitura de "pagamentos regulares" do site. → Ok se for verdade operacional; senão troco o rótulo para "Pagamento regular" (a fala f16 é sua e não muda).
7. **Respiro de ~3,7 s sem narração** na virada (fim da s06 + s07). → Recomendo manter: é a troca de lado; trilha e SFX seguram.

---
## Entrega (a skill `video` preenche no fim)
### v01 · protótipo 4:5 (2026-10-26, T-0005)
- **Arquivo:** `exports/V0001-4x5-v01.mp4` (1080×1350, 45,9 s, motion blur padrão, BT.709) · fonte em `versoes/v01/`. Formato único 4:5 (decisão do Oliver); 9:16 cancelado.
- **Blocos novos** (todos em `blocos/` da peça): `fundo/dobras` (fundo chapado por cena nas 7 dobras) · `abertura/barra-navegador` · `escolha/dois-cards` (s02 e s07) · `pagina/hero-aluno` · `escolha/planos` · `agenda/hora-divide` · `pessoas/professores-chat` · `pagina/bloco-professor` · `cards/como-funciona-professor` · `agenda/vira-aula` · `cta/fecho-ola`. Classes de marca em `companies/ola/video-templates/base.css`. Bandeiras copiadas para `assets/flags/` (flag-icons, MIT, com LICENSE).
- **Medições (`qc.mjs --sheet`):** −14 LUFS · true peak −1,5 dBTP · BT.709 completo · sem crítico nem maior. Corrigidos antes: quadro quase vazio na saída da s06 (flash) e na saída da s04, tela parada de 1,8 s na s05, headline da s04 atravessada pela pílula, texto do card sobre o botão (s02), títulos largos demais (s03, s05).
- **Abaixo do ideal (protótipo):** os olhos dos mascotes não seguem o cursor (o SVG oficial tem a pupila fundida na letra; no vídeo eles piscam e inclinam para o lado do cursor) · cursor é sempre a seta (não vira mão no botão) · o laço do logo é revelado por máscara, não desenhado traço a traço · s07 (0,75 s) e a abertura (1,9 s) são rápidas, com rastro de motion blur nas transições card ↔ página · agenda da s05 com a metade de baixo vazia · voz de teste a 3,45 palavras/s.
- **O Oliver precisa conferir:** ouvir com fone e no celular (ritmo da voz de teste, trilha sob a voz, o golpe do "Vira aula" em 40,4 s); ver pequeno e sem som (as frases se leem sozinhas?); a transição s06 → s07 → s08 (volta aos botões) e a abertura.
- **Em aberto:** áudios finais do ElevenLabs (um por fala) depois do aval → `fit-vo.mjs` + `sfx.mjs` + `mix.mjs` + `produce.mjs` (sai v02).

### v02 · protótipo 4:5 sem teto (2026-10-26, feedback do Oliver)
- **Arquivo:** `exports/V0001-4x5-v02.mp4` (80,1 s) · fonte em `versoes/v02/` · v01 intacta.
- **Medições:** −13,9 LUFS · true peak −1,2 dBTP · BT.709 · sem crítico nem maior na v02 (o qc acusa a v01 só porque a timeline agora tem 80 s).
- **Mudou:** voz edge-thalita no rate normal · f10 nova · digitação natural de 0,35 a ~2,7 s · cards com hover no aluno, depois no professor (card sobe, círculo cresce e pulsa, seta desliza) e clique · agenda da s05 maior (aulas de 15/30/60 com 150/300/600 px) · entradas sem quadro vazio (s03, s06, s08) · passagem card ↔ página mais lenta (menos rastro) · "Vira aula" sem motion blur (corte limpo) · respiração em s04, s05 e s09 (sem tela parada).
- **Abaixo do ideal:** olhos dos mascotes não seguem o cursor (piscam e inclinam) · cursor não vira mão · laço do logo por máscara · ainda há rastro de blur nos voos (chips → planos, pílulas) · "s" forte da voz de teste (ex.: "Você" da f11 em 49,29 s): é sibilante do edge, não estalo.

### v03 · voz final Carla (2026-10-26)
- **Arquivo:** `exports/V0001-4x5-v03.mp4` (82,1 s) · fonte em `versoes/v03/`. Voz Carla (ElevenLabs v4) cortada por split-vo; trilha e mix novos (música mais alta só na abertura).
- **Medições:** −13,8 LUFS · true peak −1,4 dBTP · BT.709 · sem crítico nem maior na v03 (os críticos de duração são da v01/v02, feitas com a timeline antiga).
- **Conferido:** digitação na tela até ~2,7 s (teclado até 2,75 s) · gestos nas palavras novas (troca em "Você" 32,68 s, "como" 42,55 s, "entendem" 44,14 s, "Vira" 74,26 s) · headline "Vira aula." mantida.
- **Abaixo do ideal:** os mesmos da v02 + rastro de blur no avatar de Carlos quando entra na pílula (≈35 s) · f18 a conferir de ouvido ("Vira a aula!" na transcrição).

### v04 · fase 1: voz de rascunho + timeline (2026-10-28)
- Briefing: [ajustes-v04.md](ajustes-v04.md) (10 ajustes do Oliver; narração em espanhol a partir do professor).
- **Vozes:** Carla mantida em f03, f04, f08 · rascunho `win-maria` em f05, f06, f07, f09, f10 · rascunho `edge-salome` (es-CO, registrada em library/voices) em f11–f20. Falas antigas guardadas em `audio/vo/_v03/` (com timeline e cenas da v03).
- **Estrutura:** a s03 saiu; f03 começa 1,5 s depois do clique no card do aluno · s05 com a headline palavra a palavra (p1…p5) e ordem 60 → 30 → 15 com avatares (CO · AR AR · AR AR CO MX) · s06 com 4 cards e videochamada com bolhas · s07 direto no professor (0,72 s) · s08 em dois retângulos · s09 com 4 cards em ES · s11 em dois tempos (cards em tela cheia → olá → link → logo).
- **Duração:** 69,9 s. `plano.mjs check` sem ✗; `timeline.mjs check` com 1 ✗ assumido: leitura da s07 (os textos dos cards já foram lidos na s02; esticar a s07 contraria o "sem demora" do Oliver e passa do limite de silêncio entre f10 e f11).
- **Fase 2 (cenas e render):** abaixo.

### v04 · cenas dos 10 ajustes + render (2026-10-28)
- **Arquivo:** `exports/V0001-4x5-v04.mp4` · fonte em `versoes/v04/` · v01–v03 intactas. Áudio: `audio/mix.wav` novo do sound-designer (T-0004); sfx, music e mix da timeline não foram tocados; nenhum tempo de evento mudou.
- **Blocos refeitos:** `escolha/dois-cards` (hover mais rápido, card cresce e o mascote dá um pulinho, sem vaivém; aluno menor; `hover2` opcional; `de: corte` na s07 com zoom no card do professor) · `agenda/hora-divide` (headline palavra a palavra, 1 × 60' → 2 × 30' → 4 × 15' com número centralizado e avatar + bandeira em cada aula; o cursor arrasta só uma de 15'; o avatar de Carlos vira o 1º card da s06) · `pessoas/professores-chat` (4 cards 2 × 2 caem em cascata; 3 saem e o de Carlos vira a videochamada; bolhas do aluno e do professor; ícone de bigode removido) · `pagina/bloco-professor` (dois retângulos verdes, um por lado, com marca-texto em "tiempo libre", relógio e balão com coração) · `cards/como-funciona-professor` (ES, ícones Lucide book-open/users/wallet/calendar-clock, gestos riscar/alunos chegam/selo de pago/liga horários) · `agenda/vira-aula` (relógio no círculo verde sobre o bloco da aula; a aula cresce e vira o vermelho do fecho) · `cta/fecho-ola` (aluno em tela cheia sai pela direita, professor entra pela esquerda no bloco verde; o botão abre o vermelho em círculo; "olá" sublinhado, clicado, o link nasce dele; logo discreto por cima).
- **timeline.json:** só `scenes[s07].params.de` = `corte` (antes `pagina`).
- **Medições e conferência:** ver o comentário da T-0005 (saída do `qc.mjs --sheet`).

## Som (sound-designer, T-0004, 2026-10-28 · v04, 69,87 s)
- **Trilha:** `ola-violao-percussao-106-04` (violão de nylon + shaker, cajón e conga leves; D; própria, sintetizada no hub por `trilha-violao.mjs`). 106,1 BPM, grade presa a 7,57 s (1ª fala, f03) e 61,873 s ("Conviértela en clase"), 24 compassos.
  - Abertura com crescendo até o clique do card (6,05 s).
  - Respiro de 61,43 a 61,83 s (cama a −18 dB).
  - Drop no arranjo sem subir o nível (−2,5 dB) e Dmaj9 em 64,1 s.
  - Strum suave no "olá" (66,99 s) e fade que fecha em 69,86 s.
- **Nível (regra do Oliver):** a música fica mais alta só na abertura; da 1ª fala até o fim, baixa e constante, sem ducking. Na timeline: `gain_db −21`, `duck: false`, `levels [[0,12],[7.2,12],[7.6,0]]`.
- **Efeitos:** 50 sons, sem click sintético (soou como bug na v03). O e33 (videochamada) fica sem som.
  - Toques: pops suaves.
  - Cliques do cursor: `Clique_Mouse_01` (e8, e12, e39, e66).
  - Movimentos: swish e `Whoosh_Fino_01…08`; e64 com whoosh lateral (`Whoosh_Curto_Direita_para_Esquerda_01`).
  - Bolhas: e34/e35. Link: e67, swish. Logo: e68, `Impact_Soft_02` baixo.
  - O único ding + pop forte é o e60.
- **Medido (antes do ganho final):** voz −14,2 LUFS · música na abertura −27,7 LUFS · música sob a voz −36,8 LUFS (22,6 dB abaixo, constante; drop −37,9 e cartão final −36,8) · SFX 16–22 dB abaixo da voz, e60 a 11 dB.
- **Mix (`audio/mix.wav`):** −13,7 LUFS · true peak −1,5 dBTP · LRA 14,9 LU (alto por causa da abertura sem voz).
- **Não verificado:** escuta (ouvido final: Oliver) e sincronia nos quadros renderizados. A digitação sintetizada vai até o e3 (2,75 s).
