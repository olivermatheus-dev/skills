# V0001 · Apresentação: aluno e professor

> Roteiro do Oliver (2026-10-26) com a **direção visual por tela**. É a entrada da skill `plano-de-cenas`. Falas = texto do Oliver, sem reescrever. O que é sugestão minha está marcado **(sugestão)**; o que muda o roteiro está em **Ajustes no roteiro** e precisa do aval do Oliver.

## Briefing
| | |
|---|---|
| recorte | o site da Olá Espanhol pelos dois lados: o aluno que quer falar e o professor nativo que quer ensinar |
| nível | **alto** (vídeo principal da marca) |
| formatos | **9:16** (principal, Reels/Stories) + **4:5** (feed) |
| duração | ~60–70 s (19 falas, ~135 palavras, + abertura e fechamento sem fala) |
| técnica | 100% motion graphics (HTML/CSS/SVG/GSAP no kit). Sem foto: pessoas = mascotes e avatares ilustrados |
| áudio | **faixas separadas**: uma por fala (`f01`…`f19`), trilha e efeitos à parte. v1 com voz de rascunho grátis; v2 com as faixas do ElevenLabs |
| CTA | ola-espanhol.com.br (fecha no logo) |

## Regras visuais que valem para todas as telas
Fonte da verdade: `companies/ola/brand/BRAND.md` (ler inteiro, principalmente **Referência obrigatória**, **Combinações** e **Proibições**). Resumo do que esta peça exige:
- **Só as 7 dobras do site.** Cada tela usa uma dobra inteira (`--dobra-<nome>-*`). Nada de `fundo-tom-*`, gradiente ou combinação nova.
- **Título no padrão do site:** abertura em Outfit ExtraLight (200) grafite + virada em **Outfit Bold vermelho** (`--dobra-creme-enfase`). Em dobra colorida, a ênfase é o peso (700 × 200), não a cor.
- **Frase inteira de uma vez** (cascata ≤ 0,5 s), nunca palavra a palavra. A palavra da fala só dispara gesto (clique, pop, encaixe).
- **Tudo redondo:** cards 24–32 px, botões e chips em pílula (`--radius-pill`), traço 2 px.
- **Elementos e ícones oficiais** de `brand/icons/` e `brand/vectors/` (lista no BRAND.md). Lucide só se faltar um, em `--text` com área `--accent`.
- **Mascote tem vida:** os olhos do "oló" piscam e **seguem o cursor** quando ele está na tela. É o fio condutor do vídeo.
- **Nada parado > 1,5 s:** elementos de apoio em drift lento, mascotes piscando, chips respirando.
- **Cursor:** seta grafite (`--text`) com contorno creme; vira **mão** (como no manual p. 20) ao passar sobre botão. A ponta mira a borda do botão, sem cobrir texto.
- **Elenco fictício** (nunca os professores reais do site): Carlos 🇨🇴, Lucía 🇦🇷, Mateo 🇲🇽. "Ilustrativo" pequeno no rodapé nas telas com nome.
- **Motivo do vídeo (sugestão):** *a pílula que vira caminho*. A barra do navegador é uma pílula; ela se divide nos dois botões, os botões viram páginas, os planos são pílulas, a hora vira blocos-pílula na agenda, e no fim tudo volta para a barra e para o logo. Toda transição é um **match cut** desse objeto, não um efeito.

## Ritmo de dobras
| tela | dobra | por quê (referência) |
|---|---|---|
| 0–1 · navegador e botões | **vermelho** | mockup do navegador no manual (p. 17); cards professor/aluno (p. 20) |
| 2 · página do aluno | creme | hero do site (print 01) |
| 3 · planos | creme | Pacotes do site (print 06) |
| 4 · a hora se divide | **azul** | Como funciona do site (print 04): cards creme, números teal |
| 5 · professores nativos | creme-suave | Conheça nossos professores |
| 5b · volta aos botões | **vermelho** | mesma composição da tela 1 (rima visual) |
| 6 · página do professor | creme + **bloco verde** | Para professores nativos (print 07) |
| 7 · como funciona (professor) | creme-claro | Método do site (print 02) |
| 8 · meia hora vira aula | **azul** | agenda do dia, como a tela 4 (rima) |
| 9 · fechamento e logo | **vermelho** | CTA final do site (print 08) |

Nunca duas dobras coloridas seguidas sem um creme no meio (5b → 6 passa pelo creme da página do professor). Grafite não entra.

---

## Tela 0 · Abertura: o navegador
**Fala:** nenhuma (só trilha e efeitos). **Dobra:** vermelho. **Ref.:** manual p. 17.

**Visual**
- 1º quadro já com a **barra do navegador** creme (pílula grande, sombra `--shadow-lg`) no centro do fundo vermelho: três pontinhos creme, setas, recarregar, campo de URL em `--primary` com cadeado (igual ao manual p. 17). Nada começa vazio.
- O cursor de texto pisca; digita **`ola-espanhol.com.br`** letra a letra (aqui pode, é digitação de UI, não legenda).
- Na aba: favicon = mascote "oló" (`logo-simbolo-cor.svg`) e o título "Olá Espanhol".
- **Enter:** a tecla "afunda" (micro scale 0,97 da barra) e a barra mostra um carregamento curto.
- Bloco de base: `library/blocos/cta/navegador/` (adaptar params ao vermelho; a página carregada aqui é a tela 1).

**Transição → Tela 1** (a primeira transição do roteiro): a barra **perde os controles** (setas, cadeado e URL saem em cascata), estica e **se parte em dois cards**. Surge o primeiro, depois o segundo (offset ~0,25 s), com mola `SOFT`.

**Som:** teclado (foley, máx. ~1 por tecla), "tic" no Enter, whoosh fino na divisão, 2 pops (um por card).

## Tela 1 · Os dois botões
**Fala:** nenhuma. **Dobra:** vermelho. **Ref.:** manual p. 20 (cards "Soy profesor / Sou aluno") e `vectors/vetor-cards-professor-aluno.svg`.

**Visual**
- Dois cards creme (`--dobra-vermelho-card`), raio 32, lado a lado (9:16: empilhados), sombra suave.
- Card 1: **mascote aluno** (`vetor-mascote-aluno.svg`, livros) + "Quero **aprender** espanhol" + botão-círculo verde com seta branca.
- Card 2: **mascote professor** (`vetor-mascote-professor.svg`, fone) + "Quero **ensinar** espanhol" + botão-círculo vermelho com seta branca.
- Texto do card: "Quero" em ExtraLight grafite, verbo e "espanhol" em Bold (como "Soy **profesor**" no manual).
- **O mouse hesita:** entra pela borda, vai até o card 2 (os olhos dos dois mascotes acompanham), para, volta ao card 1. No hover, o card sobe 6 px e a seta do círculo desliza.
- **Clique no card 1:** eco de clique só no instante, card pressiona (0,97) e solta.

**Transição → Tela 2:** o card 1 **cresce até virar a tela** (o creme do card vira o fundo creme da página); o card 2 sai pela borda. Match cut card → página.

**Som:** tique suave no hover, clique de mouse, whoosh de expansão.

## Tela 2 · Página do aluno
**Falas:**
- `f01` Fluência em espanhol se ganha falando.
- `f02` Com nativos. Na hora que der. De onde você estiver.

**Dobra:** creme. **Ref.:** hero do site (print 01) e manual p. 9.

**Visual**
- Composição do hero do site: à esquerda texto, à direita o "cartão de aula" (9:16: texto em cima, cartão embaixo).
- Tag pílula com contorno verde: "Conversa de verdade com **nativos**" (fixa, entra junto).
- `f01` em tela inteira e de uma vez: **"Fluência em espanhol"** em ExtraLight grafite / **"se ganha falando."** em Bold vermelho. Na abertura da tela a frase entra grande; depois encolhe e sobe para dar lugar ao resto.
- Cartão de aula (sem foto): arco (topo semicircular) com o **mascote aluno** sobre a `vetor-forma-blob-verde`; chip branco flutuante "Sua próxima aula · Quarta · 19:30" com mini-mascote professor e o balão "¿Cómo te fue en la entrevista?"; elementos `vetor-traco-asterisco` e `vetor-traco-balao` soltos.
- `f02`: três chips entram um por frase, cada um com ícone:
  - "Com nativos" → `icone-nativos-verificados.svg`
  - "Na hora que der" → `icone-constancia.svg` (relógio)
  - "De onde você estiver" → `icone-sem-horario-fixo.svg` (quebra-cabeça) **(sugestão; se não ler como "lugar", Lucide `map-pin` com área verde)**
- Barra "2 / 3h esta semana" em pílula (`--primary` no trilho creme) enchendo devagar: mantém a tela viva.

**Transição → Tela 3:** os três chips **se alinham e viram as três pílulas de plano** (match cut chip → botão).

**Som:** pop em cada chip (mesma família, 3 variantes), "air" no encolher do título.

## Tela 3 · Os planos
**Fala:** `f03` Quantas horas por semana você quer falar espanhol?

**Dobra:** creme. **Ref.:** Pacotes do site (print 06).

**Visual**
- Headline de uma vez: "Quantas horas por semana" (ExtraLight) / "você quer **falar espanhol?**" (Bold vermelho na virada).
- Três cards de plano como no site (fundo `--bg-alt`, borda `--border`, raio 24): **1 hora**, **2 horas**, **3 horas** por semana, número grande em Bold grafite. Selo do site "Mais escolhido" (verde/grafite) no de 2 horas. **Sem preço na tela** (o roteiro não fala de preço e ele muda).
- O cursor passa pelos três e **clica em "1 hora"**: o card ganha a borda 2 px vermelha (estado de destaque do site), os outros recuam (scale 0,96, opacidade do conteúdo, nunca do card).

**Transição → Tela 4:** o card "1 hora" **encolhe numa barra-pílula "1 hora"** e o fundo corta seco para o azul na batida.

**Som:** tique no hover, clique, ding gentil na seleção.

## Tela 4 · A hora se divide
**Falas:**
- `f04` Sua hora, do seu jeito:
- `f05` 4 conversas de 15 minutos,
- `f06` 2 conversas de 30 minutos.
- `f07` Ou uma hora inteira, de uma vez.
- `f08` Você escolhe o que cabe na sua rotina. E com quem quer falar.

**Dobra:** azul. **Ref.:** Como funciona do site (print 04): cards creme, números grandes teal.

**Visual** (o visual do roteiro: o bloco de 1 hora se quebra em pedaços que se encaixam numa agenda semanal)
- Headline fixa no topo, de uma vez: "Sua hora, **do seu jeito:**" (Bold grafite + ExtraLight).
- Embaixo, uma **agenda semanal** num card creme grande (colunas seg…dom em rótulo pequeno, linhas finas `--border`).
- A barra "1 hora" (pílula vermelha com texto branco) fica acima da agenda.
- `f05`: a barra **se parte em 4 pílulas de 15'** (mola `SNAP`, rachadura limpa, sem partículas) que caem e **encaixam** em 4 dias da agenda (click de encaixe em cada uma). Número grande "**4 × 15'**" em teal (`--dobra-azul-enfase`) ao lado.
- `f06`: as 4 se juntam de 2 em 2 → **2 pílulas de 30'** em 2 dias; número vira "**2 × 30'**".
- `f07`: as 2 se juntam → **1 pílula de 60'** num dia só; número vira "**1 × 60'**".
- `f08` 1ª frase: o cursor arrasta a pílula para outro dia (mostra a escolha); 2ª frase "E com quem quer falar": a pílula ganha o avatar redondo de um professor (Carlos 🇨🇴) na ponta.
- Cada troca de número é um `swap` (o número sai para cima, o novo entra de baixo).

**Transição → Tela 5:** zoom no avatar da pílula → ele vira o primeiro card de professor.

**Som:** "crack" suave na divisão, click de encaixe por pílula (variantes), swoosh curto na junção.

## Tela 5 · Professores nativos
**Falas:**
- `f09` Professores nativos que também falam português.
- `f10` Travou? Eles entendem.

**Dobra:** creme-suave. **Ref.:** Conheça nossos professores (site).

**Visual**
- Headline de uma vez: "Professores **nativos**" / "que também falam português." (Bold + ExtraLight).
- Três cards brancos (`--dobra-creme-suave-card`, borda + `--shadow-sm`): avatar redondo ilustrado (inicial sobre forma da paleta, sem foto), nome, bandeira + país, e um selo "Fala português ✓" (selo azul do site: `--support-soft` / `--support-deep`). Elenco fictício; "ilustrativo" no rodapé.
- `f10`: os cards recuam e entra um **mini-chat** no centro:
  - "Travou?": balão do aluno com o indicador de digitação que **trava** (os três pontinhos param, um "?" vermelho aparece) **(sugestão)**.
  - "Eles entendem.": o professor responde num balão creme, em português **(sugestão de texto, precisa de aval: "Tranquilo! Em espanhol, dá pra dizer assim…")**. O mascote professor dá uma piscada.
- Ícone de apoio: `icone-falsos-amigos.svg` pequeno ao lado do chat.

**Som:** pop por card, "tic" da digitação travando, pop suave no balão de resposta.

## Tela 5b · Volta aos botões
**Fala:** nenhuma (ou o fim da `f10`). **Dobra:** vermelho.

**Visual**
- A página **encolhe de volta para dentro do card 1** (o inverso da transição 1→2) e os dois cards reaparecem **exatamente na posição da tela 1**.
- O cursor sai do card 1 e vai direto ao card 2: **clica em "Quero ensinar espanhol"**. Os olhos do mascote professor se arregalam (micro scale).

**Transição → Tela 6:** o card 2 cresce até virar a tela (mesma lógica da 1→2).

**Som:** whoosh reverso, clique.

## Tela 6 · Página do professor
**Falas:**
- `f11` Você fala espanhol desde que nasceu.
- `f12` Agora pode ganhar com isso sem correr atrás de aluno.

**Dobra:** creme com o **bloco verde** (raio 32) ocupando quase a tela toda. **Ref.:** Para professores nativos (print 07).

**Visual**
- Dentro do bloco verde: rótulo pequeno em caixa alta grafite "PARA PROFESSORES NATIVOS"; título de uma vez "Você fala espanhol" (Bold grafite) / "desde que nasceu." (ExtraLight).
- **Mascote professor grande** à direita (9:16: embaixo), com o fone; o fio do fone balança de leve (vida).
- `f12`: em vez de o professor correr, **os alunos chegam sozinhos**: 3 mini-mascotes aluno (ou chips "Novo aluno · aula paga") entram pela borda, um por vez, e param ao lado do professor. Na palavra "aluno" o último chega e o professor sorri (olhos fazem a curva).

**Transição → Tela 7:** o bloco verde encolhe e vira o primeiro card da tela 7.

**Som:** pop por aluno chegando, "air" na entrada do título.

## Tela 7 · Como funciona para o professor
**Falas:**
- `f13` Você define seus horários.
- `f14` O aluno chega com a aula já paga.
- `f15` Sem negociar preço. Sem cobrar ninguém.
- `f16` Cancelamento com regras claras e pagamento em dia.

**Dobra:** creme-claro. **Ref.:** Método do site (print 02) e cards do manual p. 11.

**Visual**
- Headline fixa (sugestão, sem fala): rótulo "COMO FUNCIONA" + "Pra quem **ensina**".
- Quatro cards em grade 2 × 2 (9:16: coluna), fundo `--dobra-creme-claro-card` com borda, título Bold grafite curto + ícone grafite/verde. Um card entra por fala, com um gesto que mostra a frase:
  - `f13` "Seus horários": mini-agenda com 3 horários; o cursor liga dois (toggle verde) → ícone `icone-sem-horario-fixo.svg`.
  - `f14` "Aula já paga": selo pílula "Aula paga ✓" carimba no card (verde/grafite, como "Mais escolhido") → ícone `icone-nativos-verificados.svg` ou Lucide `badge-check` com área verde.
  - `f15` "Sem negociar, sem cobrar": duas linhas ("Negociar preço", "Cobrar aluno") que são **riscadas** em vermelho, uma por frase → ícone `icone-sem-contrato.svg` (cadeado aberto).
  - `f16` "Regras claras": relógio "24 h" + calendário com o dia do pagamento marcado → `vetor-ilustracao-relogio.svg`.
- O card ativo fica em destaque (borda 2 px vermelha); os anteriores ficam completos, sem apagar.

**Transição → Tela 8:** o mini-calendário do card 4 cresce e vira a agenda do dia da tela 8.

**Som:** pop por card, risco (marcador) por linha riscada, carimbo suave no selo.

## Tela 8 · Meia hora vira aula
**Falas:**
- `f17` Sobrou meia hora entre um compromisso e outro?
- `f18` Vira aula.

**Dobra:** azul (rima com a tela 4). **Ref.:** Como funciona do site.

**Visual**
- Agenda **do dia** vertical num card creme: dois compromissos genéricos (pílulas grafite claras, "Compromisso") com um **vão tracejado de 30'** entre eles; relógio pequeno marcando a hora.
- `f17`: o vão pulsa devagar e o número "**30'**" grande em teal aparece ao lado.
- `f18` ("Vira aula."): **hard cut na batida** — o vão é preenchido por uma pílula vermelha "Aula · 30 min" com o mini-mascote professor e o traço `vetor-traco-brilho.svg` saindo dela. É o ponto alto do vídeo: o gesto mais rápido e o único "ding" forte.

**Transição → Tela 9:** a pílula "Aula" vira a pílula do card professor, e a tela corta para o vermelho com os dois cards.

**Som:** tique do relógio sutil na f17, ding + pop forte na f18.

## Tela 9 · Fechamento
**Falas:**
- `f19` Conversação é treino.
- `f20` Comece com um olá.

**Dobra:** vermelho. **Ref.:** CTA final do site (print 08) e manual p. 17.

**Visual**
- Os dois cards voltam **na posição da tela 1** e **somem** juntando-se de volta na **barra do navegador** (o inverso da abertura): fecha o motivo do vídeo.
- `f19` de uma vez, em Bold creme/branco, centrado: "Conversação é treino." com o `vetor-traco-brilho.svg` verde ao lado (como no CTA do site).
- `f20` "Comece com um **olá**.": a palavra "olá" **se transforma no logotipo** (match cut palavra → logo). Logo `logo-horizontal-branco-laco-verde.svg`; o laço do L se desenha (traço animado).
- **Cartão final (2–4 s além da fala):** logo centrado, abaixo a pílula creme com `ola-espanhol.com.br` (texto grafite), mascote "oló" pequeno piscando para a câmera, `vetor-forma-blob-verde` saindo da borda. Trilha resolve.

**Som:** whoosh reverso na volta à barra, "air" na frase, ding gentil no logo, cauda da trilha.

---

## Áudio em faixas separadas
- **Uma faixa por fala** (`f01`…`f20`, acima): é o que deixa trocar voz, texto e duração sem reescrever cena.
- **v1 (agora):** voz de rascunho grátis (`node tools/video-kit/scripts/tts.mjs <pasta>`) só para medir tempo e aprovar ritmo. Empresa ainda sem `brand/voices.json`: usar a voz de rascunho padrão do kit e criar o arquivo.
- **Junto com a v1:** entregar o texto de cada fala para o Eleven v4 (`vo[].el` com emoção, skill `elevenlabs`) num arquivo para o Oliver gerar no site, **um arquivo por fala**, nomeado `f01.mp3`…`f20.mp3`.
- **v2:** `node tools/video-kit/scripts/fit-vo.mjs <pasta> --dir <pasta-com-os-arquivos>` encaixa as faixas e reencaixa cenas e eventos; nova versão `vNN`, sem reescrever cena.
- **Trilha e efeitos** em faixas próprias (agente `sound-designer`). Direção **(sugestão)**: orgânica, quente, leve e playful-elegante; toque latino discreto (violão de nylon, percussão de mão leve), ~100–110 BPM; nada de clichê (mariachi, trompete). SFX 12–20 dB abaixo da voz. Na v1, sem voz final, a trilha já entra (nunca mudo).
- **Voz (decidido, 2026-10-26):** **um narrador só**, pt-BR. Até o vídeo ser aprovado, voz de teste (rascunho grátis); depois o Oliver envia os áudios finais.

## Ajustes no roteiro (aprovados pelo Oliver em 2026-10-26)
1. **Personagens trocados na Tela 1:** o rascunho põe o professor em "Quero aprender" e o aluno em "Quero ensinar". Aqui ficou o inverso (aluno = aprender, professor = ensinar), como no manual p. 20 e no site.
2. **Tela 2:** ficou a versão curta ("Fluência em espanhol se ganha falando. / Com nativos. Na hora que der. De onde você estiver."). A alternativa do Oliver não entra como fala.
3. **Tela 4:** "E com quem quer falar." entrou na mesma fala de "Você escolhe…" (`f08`), porque o gesto é o mesmo.
4. **Textos que não estão no roteiro** e entram só na tela (precisam de aval): a headline "Pra quem ensina" (tela 7), a resposta do professor no chat (tela 5) e os rótulos dos cards.
5. **Fatos conferidos no site** (2026-10-26): aulas de 15, 30, 45 ou 60 min; planos de 1, 2 ou 3 h por semana; professores nativos que falam português; professor define a disponibilidade e recebe alunos com pacote já pago; cancelamento regulamentado e pagamentos regulares. "Pagamento em dia" é a leitura de "pagamentos regulares": confirmar.

## A conferir antes de animar
- Bandeiras: `library/visual/flags/` está vazia. Baixar **flag-icons (MIT)** só das 3 do elenco e registrar a licença em `library/visual/README.md`, ou trocar a bandeira pelo nome do país.
- Logo vertical não existe: o vídeo usa só o horizontal.
- `context/` da Olá Espanhol ainda não foi escrito: valem os fatos do site listados acima. Não afirmar nada além deles.
