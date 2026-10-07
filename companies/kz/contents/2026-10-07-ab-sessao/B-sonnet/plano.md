# kz · apresentação (B-sonnet) · 9:16 · nível médio

**Status:** vídeo com voz renderizado (sem trilha, sem SFX). Sem aval intermediário (teste A/B): decisões abaixo.
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

## Para o sound-designer
- Vídeo com voz, **sem trilha/SFX**: `exports/` (ver abaixo). `audio/mix.wav` atual = só voz (provisório, feito à mão com loudnorm); refazer com `mix.mjs` depois da trilha.
- Eventos para SFX: `timeline.json > events` (42; `type`, `t`, `target`). Sugestões de baixa dose: reveal da logo (e28) = soft impact; clicks (e13, e17, e34); checks (e9); toggle (e12); deixar a pausa de s7 (46,4–46,9) e o início de s9 com silêncio seco. Trilha calma 70–95 BPM (timeline: 84).
- Demais eventos (reveal/swap/cut) não precisam de som.

## Em aberto / para o Oliver conferir
- Ouvir com fone e no celular; ver sem som e pequeno.
- Folga vazia de y>1440 por segurança de interface (rodapé do Reels).
- QC final (`qc.mjs --sheet`) e trilha ainda não rodados (a pedido).
