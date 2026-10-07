# kz · sessão (A/B · A-opus v01)

**Status:** v01 entregue para comparação A/B (2026-10-07) · nível médio · 9:16 · 62,5 s
**Locução:** Carla (Eleven v4), arquivo único `input/voz-final.mp3` (60,1 s), sem gerar outra voz → `split-vo.mjs` (9 falas, tempos por palavra via faster-whisper). Sem aprovação intermediária (regra do teste): decisões registradas aqui.

## Conceito (escolhido)
1. **"A sessão preparada"** (escolhido): segue a sessão de uma paciente fictícia do começo ao fim: card da próxima sessão → ficha que se monta → sala online → antes/durante/depois → "menos" → virada → logo. O produto em uso conta a história, como pede a fala.
2. Texto cinético puro: descartado (a fala descreve telas reais, e temos os prints).
3. Antes × depois (caos → calma): descartado (o vídeo 01 já usou o caos; aqui a fala é positiva desde o início).

## Feedback do vídeo 01 aplicado (Oliver, 2026-10-07)
- Abertura sem tela vazia: "Se você é *terapeuta*," grande no 1º quadro, entra palavra a palavra e, em "imagine", encolhe e sobe para a frase entrar.
- Toda cena começa com algo na tela no 1º quadro (cena 8 ganhou "Essa é a" antes da logo; cena 6 entra com as abas; cena 4 já mostra o painel de anotações vazio).
- Headline animada na tela dos blocos ("Sua sessão, *preparada*"), com encaixes vazios tracejados que os blocos preenchem.
- Mais ícones e retorno visual: chips no card, ícones nos blocos (giram ao entrar), selos ✓ quando "organizado", ícone em cada linha do "menos", coração na virada.
- Mais SFX discretos: 33 efeitos (entradas de cards, chips, troca Online, saídas de cena, papéis voando).

## Folha de batidas
| cena | tempo | na tela | som | int. |
|---|---|---|---|---|
| s1 gancho | 0–6,5 | "Se você é *terapeuta*," grande → sobe; "Imagine começar cada sessão com *tudo* à sua frente." palavra a palavra; card Próxima sessão (Marina S.) + chips Histórico/Anotações/Planejamento em "tudo" | whoosh ×3 | 3 |
| s2 conceito | 6,5–13,5 | headline "Sua sessão, *preparada*"; ficha com 4 encaixes; blocos Histórico · Anotações · Última sessão · Planejamento entram nas palavras, soltos | whoosh · 4 pops | 2 |
| s3 conceito | 13,5–19,0 | em "organizado" os blocos se alinham (selos ✓), ficha encolhe e sobe; "Você entra sabendo de onde *continuar*."; cursor clica "Ir para a sessão" | pop · click | 2 |
| s4 produto | 19,0–27,0 | sala da sessão recriada (vertical): seletor passa a "Online", chip "Sem trocar de ferramenta", cursor clica "Entrar na chamada", chamada ao vivo (avatar com anel de fala, "Você"), anotação sendo digitada | whoosh · clicks · pop · ding | 2 |
| s5 produto | 27,0–38,4 | linha do tempo Antes / Durante / Depois, cada card com chip (Planejamento revisado · Buscar por tema ou data · Salvo) | 3 pops · clicks · ding | 1–2 |
| s6 build | 38,4–46,3 | abas abrem e fecham; "Menos abas abertas. / Menos informações espalhadas. / Menos tempo tentando lembrar."; papéis "onde foi?" aparecem e voam | whoosh · pops | 3 |
| s7 virada | 46,3–52,2 | brilho suave; "Mais espaço para o que importa:" palavra a palavra; coração; "o seu *paciente.*" grande | chime | 3 |
| s8 revelação | 52,2–59,0 | "Essa é a" → logo kz se desenha em "KZ"; "Mais simples de organizar"; pílulas seus atendimentos · sua rotina | piano F maior · pops | 4 |
| s9 cartão final | 59,0–62,5 | logo · "Conheça a kz" · "Plataforma para terapeutas" · botão kz.app.br; cursor clica | whoosh · pop · click | 1 |

Pausa ≤ 1 s só na virada (s7). Palco 1080×1170 no topo do 9:16 (área segura do Reels); o mesmo HTML gera 4:5.

## Cor e fundo
Creme `--bg` em tudo, com 2 brilhos suaves derivando (mesmo fundo do vídeo 01). UI recriada com os tokens "UI do app". Ênfase em Fraunces `--accent` (1 por título). Pares de tile coral/teal/lilás + pastel céu; **sem âmbar** (evita coral + amarelo juntos, proibição do BRAND.md).

## Afirmações e fontes
- Sala da sessão online dentro da kz (seletor Online/Presencial, "Entrar na chamada", abas Anotações · Histórico · Cliente): print `input/refs/sala-sessao-online.png`.
- Histórico de sessões com status "Concluída", Notas + Planejamento, busca "por data, tema ou conteúdo", "Salvo": print `input/refs/sessoes-do-cliente.png`.
- Card "Próxima sessão" com Iniciar sessão / Ver prontuário: print `input/refs/meu-consultorio.png`.
- "Plataforma para terapeutas" e kz.app.br: site (mesma fonte do vídeo 01).
- Nomes (Marina S.), datas e textos das anotações: fictícios, marcados "dados ilustrativos". Nada de conteúdo clínico real; nenhum menu de admin nem e-mail.

## Áudio
- Trilha: **própria, sintetizada no kit** (`music.synth`, 84 BPM, Fmaj7–Am–Dm–C–Bb–F–Gm–C, `light` → `resolve` no compasso 18, riser 17→18 antes da revelação). Motivo: a biblioteca não tem nenhuma música catalogada (`library/audio/INDEX.md`: music 0, bases 0), e sem licença não usa. Por isso não houve 2–3 candidatas.
- SFX: 33 (16 da biblioteca EditorPro licenciada + 17 sintetizados). Mix −14 LUFS.

## Entregue
- `exports/2026-10-07-ab-sessao-A-opus-9x16-v01.mp4` (fora do git) · QC em `qc/`.

## Para o Oliver conferir
1. Ouvir com fone e no celular: trilha sob a voz e a quantidade de pops (aumentei a pedido; ver se não ficou demais).
2. A sala de chamada usa um fundo pastel no lugar do preto do app (peças sempre no modo claro).
3. Ver pequeno e sem som: as linhas do "menos" (52 px) são o menor título do vídeo.
