# kz · apresentação (B-sonnet) · 9:16 · nível médio

**Status final:** v05 (9:16, 65,7 s) com voz, trilha e SFX (mix do v04, sem mudança de tempos). Sem aval intermediário (teste A/B): decisões abaixo.
**Locução:** `input/voz-final.mp3` (Carla, Eleven v4) usada como está; transcrita com `split-vo.mjs` (faster-whisper) em 9 falas, tempos por palavra encaixados em `timeline.json`. Duração 62,7 s.

## Decisões
- Conceito (recomendado entre 3): **"a sessão inteira à frente"**. Um painel simplificado (recriado nos tokens do app) mostra, fala a fala, o que o texto diz: ficha da paciente → histórico/anotações/trabalhado antes/planejamento → tudo checado, "Iniciar sessão" → atendimento online com chamada dentro da mesma tela → antes/durante/depois → menos abas/informações/tempo procurando → espaço para o paciente → logo → cartão final. Alternativas descartadas: texto cinético puro (não mostra o produto); 3D do app (prints têm dados reais).
- Só 9:16 (4:5 não pedido/sobrou). Conteúdo em y 270–1440.
- Prints usados só como base visual: sem menus de admin, e-mails ou nomes reais. Elenco fictício "Marina S." e dados marcados "dados ilustrativos" em todas as telas de UI.
- Tom calmo (BRAND): molas FAST/SOFT/GENTLE, sem partículas, hard cuts por saída-entrada de camadas, sem dissolve solto. Fundo liso creme. Coral só em logo, CTA, ênfase de 1 palavra, botão do app.
- Pronúncia/escrita: sempre "kz" minúsculo na tela e logo SVG inline.
- Cursor conduz: clique em "Entrar na chamada", na aba "Histórico" e no CTA final.

## Folha de batidas
| cena | tempo | na tela | intensidade |
|---|---|---|---|
| s1 gancho | 0–6,5 | "Se você é terapeuta," → "Imagine começar cada sessão com tudo à frente"; card da paciente, 4 tiles se preenchem em "tudo" | 3 |
| s2 conceito | 6,5–13,6 | 4 linhas entram nas palavras: Histórico, Anotações, Trabalhado antes, Planejamento | 2 |
| s3 conceito | 13,6–19,0 | "Tudo organizado": checks nas linhas; "Entrar sabendo de onde continuar"; botão Iniciar sessão | 2 |
| s4 produto | 19,0–27,1 | "Atendimento online sem mudar de ferramenta"; toggle Presencial→Online; clique em Entrar na chamada; anotações escritas ao lado; moldura "dentro da rotina" | 2 |
| s5 produto | 27,1–38,5 | Antes (checklist) · Durante (anotações → aba Histórico, entrada destacada) · Depois (salvo, próximo encontro) com seletor que estica | 1–2 |
| s6 build | 38,5–46,4 | Menos abas (5 abas → 1) · Menos informações espalhadas (fragmentos se juntam) · Menos tempo tentando lembrar (busca riscada) | 3 |
| s7 virada | 46,4–52,6 | pausa de 0,5 s; "Mais espaço para o seu *paciente*"; anéis abrem espaço; avatar entra | 3 |
| s8 revelação | 52,6–59,4 | logo se desenha em "kz"; "Uma forma mais *simples* de cuidar da rotina"; pílulas Pacientes · Agenda · Anotações | 4 |
| s9 cartão final | 59,4–62,7 | logo, "Conheça a kz", botão kz.app.br; clique | 1 |

## Afirmações e fontes
- Módulos (pacientes, agenda, notas de sessão, videochamada com sala, histórico): `context/BUSINESS.md` e prints (abas Anotações/Histórico/Cliente, Online/Presencial, Entrar na chamada, Iniciar sessão).
- Texto: locução do briefing. Nenhuma promessa de resultado, número real ou depoimento. "6 sessões · a última há uma semana", datas e "Terça, 15:00" são ilustrativos.
- URL kz.app.br: BUSINESS.md.

## Áudio
- Trilha e SFX feitos pelo sound-designer; `audio/mix.wav` (v04) é o áudio final do v05 e não foi alterado. Eventos para SFX: `timeline.json > events` (45).
- Sugestões originais de baixa dose: reveal da logo (e28) = soft impact; clicks (e13, e17, e34); checks (e9); toggle (e12); deixar a pausa de s7 (46,4–46,9) e o início de s9 com silêncio seco. Trilha calma 70–95 BPM (timeline: 84).
- Demais eventos (reveal/swap/cut) não precisam de som.

## Em aberto / para o Oliver conferir
- Ouvir com fone e no celular; ver sem som e pequeno.
- Folga vazia de y>1440 por segurança de interface (rodapé do Reels).
- QC final (`qc.mjs --sheet`) ainda não rodado neste teste.

## v03 (feedback do Oliver sobre o v02)
- Textos de impacto entram completos (cascata < 0,4 s) no início da fala/cena; cena "mais espaço" refeita (frase inteira desde o início, anéis + avatar com clip-path, sem opacidade sobre linhas).
- Logo entra no início da s8 (e28/e29 agora por `at`); título final no início da s9.
- Linha riscada da busca passou para dentro do card; eco do clique só no clique (sem fantasma em 0,0); frags da s6 sem tweens conflitantes; digitação da busca termina antes de ~44 s.
- Espaçamento: "Iniciar sessão" e "Entrar na chamada" com respiro; "dados ilustrativos" no rodapé.
- Final: componente da galeria `library/motion/cta/navegador` (criado pela sessão A-opus, reaproveitado sem alterar): "kz.app.br" digitada, clique em Ir, página abre. Vídeo = 65,7 s (cauda de 5 s após a voz). Eventos novos: e43 (entrada), e44 (digitação), e34 (clique, 63,06 s), e45 (carregou, 63,51 s).
- (histórico v03) Áudio do v03 era SÓ VOZ (provisório). Mix do v02 salvo em `audio/mix.v02.wav`. Os `sfx` do `timeline.json` apontam para eventos que se moveram (e28 foi para 52,61 s): sound-designer deve refazer SFX/mix.
- Backups: `timeline.v02.bak.json`, `composition.v01.bak.html`.

## Som v04 (sound-designer)
- Trilha sintetizada do kit (própria, sem licença de terceiros): 84 BPM, F–C–Dm–Bb, 23 compassos = 65,7 s; seção "light" até 51,4 s e "resolve" (acorde F longo, apaga no fim) a partir do compasso 18, no logo. Pós-passo `audio/music-envelope.mjs`: silêncio seco na pausa da s7 (46,4–46,9 s) e respiro de −6 dB no início da s9. Ganho −10 dB, ducking 0,7.
- SFX (biblioteca EditorPro, uso comercial): e9 pop · e12 e17 toggle/clique · e13 clique · e28 piano F (logo) · e44 teclado notebook (cortado em 1,35 s, 1ª tecla em 61,69 s) · e34 clique "Ir" · e45 pop suave. Nenhum som em 59,4–60,8 s.
- Mix −14,0 LUFS, TP −1,5 dBFS (mix.wav) / −1,4 dBFS (MP4). Ouvido final: Oliver.
- Backups: `audio/mix.v03-voz.wav`, `audio/music.v02.wav`, `audio/sfx.v02.wav`, `timeline.v03.bak.json`.

## v05 (ajustes finais após revisão do v04)
- "dados ilustrativos": rodapé em y 1724, 28 px.
- Cursor da s4 para na borda inferior direita do botão "Entrar na chamada" (fora do rótulo); clique continua em 23,53 s; avatar entra só depois do botão sumir.
- Swap de #h3 antecipado (header sai em e8-0,25, título entra em e8) e #st1 antecipado 0,1 s (s4 sai antes, sem sobreposição de títulos); header da s2 entra antes do fim do fade do card da s1 (sem sobrepor texto).
- Cena 6 centralizada (+64 px, conteúdo em y 360–1350).
- Tempos, duração e áudio inalterados. Backup: `composition.v04.bak.html`.

## v06 (bloco final do navegador)
- Ajuste só no `composition.html` (componente `library/motion/cta/navegador` intocado): aba encaixada na barra de abas (fundo branco igual à barra de endereço, cantos superiores arredondados, bolinhas à esquerda, título sem estourar), título antigo da aba sai antes do novo entrar (sem texto sobreposto). Título "Conheça a kz" inteiro, em y ~590–690. Áudio (`mix.wav` do v04) e tempos inalterados. Backup: `composition.v05.bak.html`.
- Observação: o print enviado mostra "Plataforma para terapeutas" na página do navegador; no B-sonnet a página mostra logo + "Feito por terapeuta, pra terapeuta." (o print parece ser de outra versão/sessão).
