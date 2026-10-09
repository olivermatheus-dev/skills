# Revisão crítica do plano: rodada 2

Plano: o `cenas.json` atual (restaurado pelo autor), 7 cenas, voz real até 41,44 s + cauda de 2,6 s. Ainda sem storyboard: o critério 12 é **provisório**.
Saída do `check` (Node 22): sem bloqueios. 5 avisos: s2, s3, s4, s6 e s7 são blocos novos sem style_frame. Os tempos do check continuam **estimados** a 2,7 palavras/s (s3 9,6–14,5 contra 11,64–17,29 reais).

## 1. Notas

| # | critério | nota | evidência | correção concreta |
|---|---|---|---|---|
| 1 | Teste do mudo | 3 | Sem som, a história fica clara: s1 sessão no centro → s2 coberta → s3 empurrada para o canto → s4 janela única → s5 painel → s6 sessão em tela cheia → s7 navegador. | — |
| 2 | Acréscimo | 2 | s4: o `acrescenta` diz que os chips "entram com os ícones das janelas absorvidas", mas a associação é arbitrária: agenda = "simples", ficha = "organizada", anotação = "profissional". Quem assiste não lê essa relação, então o ícone confunde em vez de acrescentar. | s4: ver seção 3 (miniaturas dos 3 conteúdos que se organizam, ou ícone que combine com a palavra). |
| 3 | Literal | 2 | s2 foi resolvida (M.C. em 3 lugares). Ainda são literais os chips "simples / organizada / profissional" da s4 (a palavra dita, solta, sem a frase "A gestão da sua rotina mais", que saiu) e "Conheça a *kz*" na s7, escrito junto com a voz. | s4: seção 3. s7: trocar a headline por "Conheça a" + logo kz inline (BRAND: na tela, sempre a logo ou "kz" minúsculo), para a palavra virar a marca. |
| 4 | Teste do template | 3 | O reveal em ponto saiu. A sessão é o mesmo objeto em s1, s3 e s6, e a s7 revela o navegador sem aba nova. Um gerador de slides não faz isso. | — |
| 5 | Fio condutor | 3 | O motivo nasce, evolui e se resolve. Única ponta solta: a janela **Mensagens** (s1, s2) não tem destino. Ela é absorvida na s3 e não vira nada na s5. | Aceitável. Se sobrar tempo, ela vira o chip mais apagado da lateral na s6. Não é preciso inventar um módulo de mensagens sem fonte. |
| 6 | Conexão | 3 | Match no motivo em todos os cortes, J-cut só na s4. O olhar segue no centro de s3 a s4 e de s4 a s5. | — |
| 7 | Gancho | 2 | O 1º quadro agora tem conteúdo concreto (janela Sessão e pergunta). Mas a janela é um tile de **videochamada** (iniciais e "14h"), e em 2 s ela parece "uma call do Meet", não "a minha sessão", principalmente para quem atende presencialmente. Além disso, o motivo inteiro (s1, s3, s6, s7) depende do vídeo, e o PRODUTO.md marca esse vídeo como "não testado no levantamento". | s1–s3: barra de título "Sessão · 14h" com o ícone `armchair` (o mesmo do selo), em ≥ 32 px. O tile por dentro mostra iniciais e linhas de anotação, não só vídeo. Assim a s1 se liga ao selo e lê como sessão em qualquer modalidade. Antes do storyboard, **perguntar ao Oliver se a videochamada da tela de atendimento funciona**. Se não funcionar, a s6 mostra a aba Anotações em primeiro plano. |
| 8 | Ritmo e curva | 2 | Curva e setup estão OK. A s7 continua com intensidade 1 e 5 cues. A s5 tem 6 gestos em 6,7 s (entra, encaixa, destaque, lista, feito, sai) no momento de "clareza", que é intensidade 2. Os tempos do check e da timeline continuam estimados (ver "não resolvido"). | s5: tirar o `lista`+`feito` (seção 3). s7: tirar o `pousa` (cursor que pousa e não faz nada) e o `aba` (favicon de 16 px que pulsa e ninguém vê no celular). |
| 9 | Clareza | 2 | s7: a URL, que é o CTA, fica na barra de endereço de um navegador com 900 px de largura, ou seja, ~24–28 px no quadro. A gramática lista "URL pequena" como erro de CTA. s5: o `on_screen` termina com "\|" vazio (slot vazio pode renderizar uma caixa vazia). s4: 3 adjetivos soltos sem o sujeito da frase. | s7: em `destaca`, a câmera continua até 1,8× na barra, para "kz.app.br" ficar com ≥ 56 px, e a cauda termina nesse enquadramento. s5: tirar o "\|" final. s4: seção 3. |
| 10 | Verdade e marca | 2 | Cobranças e nome de paciente foram resolvidos. Ficam 2 pontos. (a) O motivo inteiro se apoia na videochamada, marcada como "não testada" (ver crit. 7). (b) s5: clicar em **Agendar** e receber "Sessão agendada" logo em seguida pula o formulário. É UI que o produto não tem nesse fluxo (o atalho abre um formulário, não agenda). `--ui-glow` confere com o BRAND.md (card de destaque do app): OK. | (a) Confirmar com o Oliver. (b) s5: seção 3. |
| 11 | Construível | 2 | 5 blocos novos sem style_frame (antes eram 4), mais 3 params novos na s1 e 4 na s5 (incluindo um cue novo, `encaixa`, num bloco existente): quase toda cena é nova ou muito alterada. O spec da s4 cita "fim da fase 'espreme' de **cena/janelas-rotina**", um bloco que não existe (o nome certo é `cena/janelas-espremem`). Em `cenas.json > revisao[0].recusado` está escrito "s2 e s3 viraram 1 bloco com 2 fases", o contrário do que foi feito (2 blocos irmãos). | Corrigir a referência no spec da s4 e o registro em `revisao[0]`. Desenhar os 5 style_frames antes do storyboard, a começar pelos da s3 (fim: a janela única a 30%) e da s4 (janela aberta com a logo), que são o centro do vídeo. |
| 12 | Beleza (provisório) | 2 | O último quadro do vídeo não tem logo visível: a marca fica só como favicon na aba. O repertório aprovado de CTA sempre fecha com a logo grande. O fundo creme não muda nunca. A recusa da troca de fundo é válida, mas então o `--ui-glow` precisa carregar sozinho a mudança de valor da s4. | s7: logo inline na headline (crit. 3), com ≥ 90 px de altura de caixa. s4: no style_frame, o brilho cobrindo ≥ 1/3 da janela, não só o canto, para a revelação ter mais luz que a s3. Conferir no storyboard. |

**Total: 28 / 36. Passa** (mínimo 27). Nenhum eliminatório (1, 2, 4, 7, 10) ficou em 0. Passa com as correções de construção (s4 e `revisao[0]`) feitas antes do storyboard e com a pergunta da videochamada levada ao Oliver.

**O que a rodada 1 pediu e não foi resolvido:** os tempos. O `check` e o `plano.mjs timeline` continuam estimando a 2,7 palavras/s, e o contorno (`fit-vo.mjs --dir audio/vo/split`) só garante que a voz encaixa: não está demonstrado que os gestos com `word: fN:palavra` são reancorados nos `.words.json` reais. Os style_frames também continuam pendentes (agora são 5). A troca de fundo da s4 foi recusada, com motivo válido (BRAND.md e REGRAS §3), e eu aceito a recusa. As outras recusas (s3 alt. B, s4 alt. B, 2 blocos irmãos) também estão bem justificadas.

## 2. Julgamento das recusas
- **Fundo pastel na s4:** recusa aceita. O BRAND.md e a regra de 1 troca de fundo mandam. A condição é que o `--ui-glow` tenha peso visual (crit. 12).
- **s3 alt. B:** recusa aceita. A sessão como objeto único é a força do plano.
- **s4 alt. B:** recusa aceita. A alt. A é melhor e o custo é parecido.
- **s2/s3 com 2 blocos irmãos:** aceito, mas o registro em `revisao[0]` diz o contrário e precisa ser corrigido.
- **Tempos:** aceito como contorno só se, antes do storyboard, um teste mostrar 1 gesto (por exemplo `f3:menos`) caindo a ±0,1 s da palavra real depois do `fit-vo`. Sem esse teste, continua não resolvido.

## 3. As 3 cenas mais fracas

### s7: o CTA ficou elegante, mas ilegível e sem marca
URL de ~26 px na barra, logo só no favicon, e 2 dos 5 gestos (`pousa`, `aba`) não mostram nada.
- **Alternativa A (`cta/navegador` modo revelar com param `zoom_url: 1.8`).** `entra`: a câmera recua até o navegador inteiro (0,8 s). Em **f7:kz**, a câmera avança até 1,8× na barra de endereço, "kz.app.br" fica com ≥ 56 px e ganha seleção `--accent`, e a headline "Conheça a" + logo kz entra inteira no topo. Na cauda, o enquadramento fica parado na barra e a seleção respira. Ficam 3 gestos (entra, destaca, fecha).
- **Alternativa B (navegador + `cta/cartao-final-botao` do repertório).** Depois do recuo, em **f7:descubra**, o navegador encolhe para 60% no terço de cima e embaixo entra a logo e o botão-pílula "kz.app.br" (≥ 48 px) do bloco aprovado. Em **f7:simples**, o cursor sai da barra e clica no botão, que pulsa. Cauda nesse cartão.

### s4: os chips são adjetivos soltos com ícones que não combinam
Sem "A gestão da sua rotina mais", "simples / organizada / profissional" vira uma lista de palavras. E agenda = "simples" não quer dizer nada.
- **Alternativa A (dentro de `revelacao/janela-unica`, troca os chips).** Em **f4:gestão**, a frase inteira "Simples, organizada, profissional." entra numa linha no rodapé da janela. Em **f4:simples**, **organizada** e **profissional**, entram as 3 miniaturas do que a janela absorveu (grade da semana, ficha M.C., post-it), que se alinham numa fileira arrumada, cada uma com um check. É o "organizada" visível, e prepara o `encaixa` da s5, onde as mesmas miniaturas viram módulos.
- **Alternativa B (mais barata).** Mantém os chips, com ícones que combinam com a palavra (`check` para simples, `layout-grid` para organizada, `badge-check` para profissional), e tira do `acrescenta` a frase sobre as janelas absorvidas. Volta a ser complementa honesto, sem pretensão.

### s5: fluxo inventado e gestos demais
"Agendar → Sessão agendada" pula o formulário, e são 6 gestos em 6,7 s.
- **Alternativa A (sem o clique).** Ficam `entra`, `encaixa`, `destaque`. Em **f5:organizar**, a câmera desce para "Sessões de hoje", onde o bloco **M.C. 14h** acende em `--accent` (a mesma marca da s2: os 3 lugares viraram 1). Em **f5:complicação**, a marca assenta (só um tick). Sem toast. Ficam 4 gestos e o fio da M.C. continua.
- **Alternativa B (fluxo real).** Só se houver o print do formulário em `brand/screenshots/`. Em **f5:organizar**, o cursor clica em Agendar e abre o formulário real, já preenchido com "M.C. · 14h". Em **f5:complicação**, o cursor clica em confirmar e entra o toast "Sessão agendada". Para caber, tirar o `destaque`.

## 4. O que está bom e não deve mudar
1. A sessão (M.C.) é o mesmo objeto em s1 (centro), s3 (canto, com tudo parado 0,4 s em "atender") e s6 (tela cheia).
2. A s2 com a mesma paciente partida em 3 lugares e as 3 marcas acendendo juntas em "espalhadas".
3. A fusão da s3 numa janela única a 30% e a logo nascendo dentro dela na s4: o conceito se paga na cena principal.

## 5. Decisão do autor (editor-de-video, 2026-10-08)

Aceito e aplicado no `cenas.json`:
- **Crit. 11:** o spec da s4 agora cita `cena/janelas-espremem`, e `revisao[0].recusado` registra os 2 blocos irmãos. A rodada 2 também ficou registrada em `revisao[1]`.
- **Crit. 7 e 10a (videochamada):** usei o default sugerido. A Sessão é a barra "Sessão · 14h" com ícone `armchair`, e por dentro tem iniciais e linhas de anotação, sem tile de vídeo (s1–s3). A s6 abre a tela de atendimento no modo **Presencial** (o PRODUTO.md diz que ela alterna Online/Presencial), com Anotações em primeiro plano e param `modo`. A pergunta sobre a videochamada vai para o `plano.md`.
- **s4, alt. B mais a frase:**
  - "A gestão da sua rotina mais" volta inteira no rodapé, em "gestão", e os adjetivos ganham sujeito.
  - Os ícones dos chips agora combinam com a palavra: `check`, `layout-grid` e `badge-check`.
  - Tirei do `acrescenta` a frase sobre as janelas absorvidas.
  - O `--ui-glow` cresce até ~1/3 da janela (crit. 12).
- **s5, alt. A:** sem clique em Agendar e sem toast, porque o fluxo real passa pelo formulário. Em "organizar", "M.C. 14h" acende em `--accent` em Sessões de hoje, e em "complicação" entra um check ao lado.
  - O `encaixa` foi para dentro do `entra`: ficam 5 gestos, contando entra e sai.
  - Não ficou slot vazio: o h3 repete o h2, com `headlines: 2` no `ajuste_bloco`.
- **s7, alt. A:**
  - recuo sem aba nova, com "Conheça a" + logo kz já no topo junto do recuo (texto no início da fala, Padrões);
  - em "kz", a câmera avança até 1,8× na barra e "kz.app.br" fica com ≥ 56 px;
  - saíram o `pousa` e o `aba`;
  - para o check não acusar mais de 3 s sem gesto, entraram 2 gestos visíveis: traço de brilho na logo da headline em "simples", e a seleção vira cursor de texto piscando em "profissional";
  - cauda de 2,2 s.

Recusado:
- **s4 alt. A (miniaturas com check):** as mesmas 3 miniaturas encaixam nos módulos 1 s depois (s5, `entra`). Mostrar o "arrumar" duas vezes seguidas gasta o efeito, e é mais um elemento num bloco que já é novo.
- **Mensagens virando chip na s6 (crit. 5):** fica para o storyboard dizer se a ponta solta incomoda. Não há módulo de mensagens com fonte.
- **Tempos:** a prova é por gesto, no `timeline.json` depois do `fit-vo` (ver `notas-calibragem.md`).
