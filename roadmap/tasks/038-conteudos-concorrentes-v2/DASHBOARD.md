# 038 C1 — Painel da aba Conteúdos (desenho)

**Autor:** estrategista · 2026-10-08 · **Status:** aguardando aval do Oliver.
**Par:** `roadmap/tasks/039-panorama-dashboard/DASHBOARD.md`. O Panorama resume o mercado em 1 tela; este Painel aprofunda só os conteúdos. Os dois usam as mesmas definições (seção 0) e os mesmos limiares.
**Onde fica:** terceira vista da barra da aba Conteúdos: **Grade / Tabela / Painel** (`?vista=painel`). Todos os blocos respeitam os filtros da barra (período, rede, formato, concorrente, status, busca).

---

## 0. O que os dados têm de verdade (conferido em 2026-10-08)

Última coleta de cada perfil (`companies/kz/competitors/*/snapshots/`), 144 itens no total, **62 nos últimos 30 dias** (o período padrão), de 8 concorrentes.

| rede · formato | itens (todos / 30 d) | concorrentes | métrica-base | mediana do mercado | observação |
|---|---|---|---|---|---|
| Instagram · reel | 25 / 25 | 8 | views | 208 views | a melhor amostra do mercado |
| Instagram · carrossel | 16 / 16 | 6 | **curtidas** (sem views) | 13,5 curtidas | sem views → sem engajamento |
| Instagram · post | 13 / 5 | 5 | **curtidas** (sem views) | 4 curtidas | idem |
| TikTok · vídeo | 30 / 16 | **1 (Corpora)** | views | 770 views | × mercado = × perfil (não existe mercado) |
| YouTube · short | 60 / **0** | 2 (Corpora, Mais Terapias) | views | 187 views | nada nos últimos 30/90 dias; Mais Terapias é de 2023–24 |

| campo | tem? | uso |
|---|---|---|
| views | reels, TikTok, Shorts | sim |
| curtidas, comentários | quase todos | sim (curtidas como base onde não há views) |
| envios (`shares`) | **só TikTok da Corpora** | não entra |
| duração (`durationS`) | 115 de 144 (vídeos) | não entra agora (ver seção 5) |
| data (`publishedAt`) | todos | sim (ritmo, período) |
| seguidores | todos os perfis | sim, mas **Δ = 0**: todas as coletas são de 07 e 08/10 |
| histórico de views do item | 2 coletas com ~1 dia | não entra (sem curva ainda) |
| marcações (`status`, ★, ideia) | **nenhuma ainda** | entra (filtro e ação), começa vazio |

**Amostra fraca, onde e por quê**
1. **Instagram = 6 itens por perfil** (coleta sem token). O "× perfil" de cada post é contra a mediana de 6. Um post bom move a mediana; tratar ≥2× como sinal e ≥3× como forte.
2. **TikTok e YouTube não têm mercado.** TikTok só tem a Corpora; YouTube tem 2 perfis, um com vídeos de 2023. Regra proposta: **× mercado só aparece quando o grupo (rede + formato, ou rede) tem ≥ 3 concorrentes**; abaixo disso, mostra "—" com tooltip "só 1 concorrente nesta rede". Hoje isso deixa o × mercado valendo só para o Instagram.
3. **× mercado mede tamanho de perfil.** Com a conta de hoje (B2), 40 itens dão ≥3× mercado e 34 são da Corpora. Mesmo com a regra dos ≥ 3 concorrentes, sobram 11, todos da Corpora (6), da Sintropia (4) e da Allminds (1): os dois maiores perfis do Instagram (86 mil e 53 mil seguidores) dominam. Por isso o Painel mostra as duas medidas **juntas num mapa** (bloco 2): é o cruzamento que separa conteúdo bom de perfil grande.
4. **Carrossel e post do Instagram não têm views.** Ficam comparáveis só entre si, por curtidas. Nunca somar com reels numa mesma mediana.

**Definições únicas (valem também no Panorama)**
- **× perfil** = métrica-base ÷ mediana do próprio perfil na última coleta (o `outlier` de hoje).
- **× mercado** = métrica-base ÷ mediana de todos os concorrentes na mesma rede **e** formato (≥ 10 itens; senão a rede inteira), conforme a 038 B2 (`withMarketOutlier`). Mais a regra nova dos ≥ 3 concorrentes acima.
- **Fora da curva** = ≥ 3× (forte). **Sinal** = ≥ 2×.
- **Quadrantes** (bloco 2), com 2× como corte por causa da amostra de 6:
  - **Viralizou de verdade:** × perfil ≥ 2 e × mercado ≥ 2.
  - **Achado de perfil pequeno:** × perfil ≥ 2 e × mercado < 1. O tema rendeu sem audiência grande, que é a situação da Kzloo (perfil novo).
  - **Efeito tamanho:** × perfil < 1,5 e × mercado ≥ 2. É o perfil, não o conteúdo: estudar a máquina (frequência, formato), não copiar o tema.
  - **Resto.**
  - **Sem mercado:** TikTok e YouTube (grupo com < 3 concorrentes).
  Hoje, com a regra dos ≥ 3 concorrentes: todos os itens = 3 viralizou · 0 achado · 11 efeito tamanho · 38 resto · 92 sem mercado; últimos 30 dias = 2 · 0 · 11 · 31 · 18. Sem a regra, o TikTok da Corpora entraria como "viralizou" só porque é o único perfil da rede.

---

## 1. Perguntas que o gestor responde em 10 s

1. **O que rendeu acima do normal no período, e foi o conteúdo ou o tamanho do perfil?**
2. **Quais desses ainda não viraram ideia (ou não foram descartados)?**
3. **Qual a régua do mercado por formato?** (quantas views um reel do nicho faz, quantas curtidas um carrossel faz: a meta inicial dos posts da Kzloo)
4. **Em que formato cada concorrente aposta e quanto publica?**
5. **A amostra é confiável para decidir?** (n de cada número sempre visível)

---

## 2. Blocos, em ordem de prioridade

| # | bloco | dado de origem | cálculo | forma | o que faz agir |
|---|---|---|---|---|---|
| 1 | **Faixa de números** (5) | linhas filtradas (`buildRows` + `withMarketOutlier`) | (a) nº de conteúdos no filtro + nº de concorrentes; (b) nº ≥3× perfil; (c) nº ≥3× mercado + **% do concorrente que mais aparece** (alerta se > 50%); (d) nº "viralizou de verdade"; (e) **régua**: mediana do formato principal no filtro (padrão: reel IG = views; carrossel = curtidas) com n | `StatStrip` novo (039 A2), 5 cards, ícone Lucide | (c) com alerta → olhar o mapa antes de copiar; (e) vira a meta dos primeiros posts da Kzloo (registrar em `CONTENT_STRATEGY.md#Hooks que funcionaram` quando houver os nossos) |
| 2 | **Mapa das duas medidas** | mesmas linhas | X = × mercado, Y = × perfil, ambos em **escala log** (0,1× a 1000×), linhas de corte em 1× e 2×, 4 quadrantes rotulados (seção 0); ponto = 1 conteúdo, cor = quadrante (não por concorrente), tamanho fixo; itens sem × mercado (TikTok, YouTube) ficam numa faixa "sem mercado" na borda esquerda | dispersão (Recharts `ScatterChart`) com rótulo direto nos 5 maiores pontos e tooltip (concorrente, formato, os dois números, base e n) | clique no ponto → abre a gaveta (`ItemDrawer`) → **Virar ideia** ou **Descartar**. Chips dos quadrantes filtram a lista do bloco 3 |
| 3 | **Para virar ideia** | linhas com `mark.status` = nova ou marcada | × perfil ≥ 2, ordenado por × perfil; selo duplo (`3,2× perfil · 0,8× mercado`); esconde o quadrante "efeito tamanho" por padrão (toggle para mostrar) | lista compacta: miniatura 48 px, título 1 linha, concorrente + rede + formato, os dois selos, botões **Virar ideia** e **Descartar** | ação direta: cada clique vira uma ideia (`useMakeIdea`, já cita as duas medianas depois da B2) ou tira o item da fila. Meta de uso: fila zerada toda semana |
| 4 | **Régua por formato** | linhas filtradas, agrupadas por rede + formato | por grupo: n, nº de concorrentes, mediana da métrica-base, engajamento mediano (só onde há views: (curtidas + comentários + envios) ÷ views), % de itens ≥2× perfil, quem mais publica | tabela pequena, 1 linha por rede · formato; selo "amostra fraca" quando n < 10 ou concorrentes < 3 | escolher formato e meta da Kzloo (responde ao "A validar: formato com melhor retorno" do `CONTENT_STRATEGY.md`) → ajuste em `CONTENT_STRATEGY.md#Canais e formatos` |
| 5 | **Aposta de cada concorrente** | linhas filtradas por concorrente | por concorrente: posts por semana no período (itens ÷ semanas do período; no Instagram, ÷ dias entre o 1º e o 6º item quando a janela de 6 for menor que o período, com aviso), mix de formatos (%), mediana de views do reel, maior × perfil, dias desde o último post | tabela com barra empilhada de mix (cores por formato, legenda única) | "parou de postar" (ex.: PersonCare, último post em 27/08) ou "acelerou" → nota na ficha; quem aposta em reel e rende → referência para engenharia reversa (`content-ideas` modo 3) |

**O que não muda:** os filtros da barra mandam em tudo; o "Ordenar" não se aplica ao Painel (fica desabilitado nessa vista).

---

## 3. Primeira dobra a 1440 × 900

Conta: shell do app ~56 px + header da área e abas ~96 px + barra de filtros 48 px + faixa de números ~92 px + folgas ~40 px ≈ 330 px. Sobram ~570 px.

**Cabem:** bloco 1 (faixa) inteiro · bloco 2 (mapa, 7 de 12 colunas, ~420 px de altura) · bloco 3 (lista, 5 de 12 colunas, 7 linhas de 56 px + cabeçalho).
**Abaixo da dobra:** bloco 4 (régua) e bloco 5 (aposta de cada concorrente), lado a lado a partir de 1440 px.
A 1280 px: mesmo arranjo, com a lista do bloco 3 mostrando 6 linhas.

---

## 4. Wireframe (1440 px, `AppContent` 1440)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ Concorrentes   [Panorama][Lista][Comparar][Conteúdos][Redes][Anúncios][Brechas][Coletas]     │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ [🔍 Buscar…            ] [📅 30 dias▾] [◎ Instagram▾] [Formato▾] [👤 Concorrente▾] [Status▾]  │
│                                              [☆] [⇅ Ordenar▾(off)]  [▦ Grade|☰ Tabela|◧ Painel]│
├──────────────┬──────────────┬──────────────┬──────────────┬─────────────────────────────────┤
│ CONTEÚDOS    │ ≥3× PERFIL   │ ≥3× MERCADO  │ VIRALIZOU    │ RÉGUA · REEL IG                 │
│ 62           │ 3            │ 11           │ 2            │ 208 views (mediana)             │
│ 8 concorr.   │ do perfil    │ ⚠ 55% Corpora│ ≥2× nos dois │ n = 25 · 8 concorrentes         │
├──────────────┴──────────────┴──────────────┴─┬────────────┴─────────────────────────────────┤
│ Mapa: conteúdo bom ou perfil grande?          │ Para virar ideia (6)    [mostrar efeito tam.] │
│ × perfil (log)                                │ ┌──┐ A psicologia está ligada à pol…          │
│ 100×┤ ACHADO DE PERFIL  │  VIRALIZOU          │ │▣ │ Corpora · IG · carrossel                 │
│     │ PEQUENO           │   ●Corpora carros.  │ └──┘ 15,2× perfil · 864× mercado [Ideia][✕] │
│  2× ┤···········•·······┼····●···•·······     │ ┌──┐ Hey psi, não seja seu maior inim…        │
│  1× ┤   •  ••  •• •     │  •• ••• ••• ●●●     │ │▣ │ PsicoManager · IG · reel                 │
│     │ RESTO             │  EFEITO TAMANHO     │ └──┘ 2,0× perfil · 2,0× mercado  [Ideia][✕] │
│ 0,1×┼──────┬──────────┬─┴─────────┬───────    │ ┌──┐ …                                        │
│ sem │ 0,1× │   1×     │    2×     │  100× →   │ │▣ │                                          │
│ merc│        × mercado (log)                  │ └──┘                                          │
│ [Viralizou 2][Achado 0][Efeito 11][Resto 31]  │
│ [Sem mercado 18: TikTok]                      │                               ver na tabela → │
╞═══════════════════════════════════════════════╧═══════════════════════════════ dobra 900 px ══╡
│ Régua por formato                              │ Aposta de cada concorrente                   │
│ rede·formato   n  conc  mediana   eng   ≥2×    │ concorrente  posts/sem  mix         reel  dias│
│ IG reel       25    8   208 v    9,2%   4%     │ Corpora        28* ▕███▒▒▏ carros. 25k    1  │
│ IG carrossel  16    6   13,5 ♥    —     6%     │ PsicoManager   6,5 ▕████▒▏ reel    209    2  │
│ IG post        5 ⚠  3   11 ♥      —     0%     │ Sintropia      3,1 ▕████▒▏ reel   2,4k    2  │
│ TikTok vídeo  16 ⚠  1   758 v    8,1%  25%     │ …                                            │
│ ⚠ amostra fraca: n<10 ou <3 concorrentes       │ PersonCare     0,5 ▕█████▏ post     —    42  │
│                                                │ * janela de 6 posts do Instagram < período   │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```
Números do esboço = dados reais de 08/10, filtro 30 dias, todas as redes.

---

## 5. O que não entra, e por quê

| fora | por quê | volta quando |
|---|---|---|
| Envios / compartilhamentos | só o TikTok da Corpora tem; o Instagram público não entrega | coleta do Instagram com token trouxer `shares` |
| Crescimento de seguidores e de views do item | todas as coletas são de 07–08/10: Δ = 0 em todos os perfis | houver 2 coletas com ≥ 7 dias entre elas (fica no Panorama, não aqui) |
| Duração × desempenho | testado: a mediana de × perfil por faixa (0–15, 15–30, 30–60, 60+ s) fica entre 0,9× e 1,1×, sem sinal; e o "× mercado" por duração mistura tamanho de perfil | ≥ 15 vídeos por faixa vindos de ≥ 3 concorrentes |
| Dia e hora de publicação | a amostra é pequena e os picos (15h, 20h) são agendamentos da Corpora; o horário dos concorrentes não diz qual é o melhor horário para a Kzloo | os posts da própria Kzloo tiverem dados (aí entra no painel de resultados, não aqui) |
| Tema, pilar, gancho, sentimento | não existe classificação nos dados; só legenda crua. Inventar categorias por palavra-chave daria número falso | a análise dos itens marcados (`referencias`) gravar tema/gancho por item; aí entra um bloco "temas que rendem" |
| Comentários ÷ curtidas | a mediana é 0 em todos os formatos (poucos comentários) | amostra maior |
| Hashtags | baixo valor de decisão; não está entre as perguntas | — |
| YouTube no período padrão | nenhum short nos últimos 90 dias | algum concorrente voltar a publicar |
| Comparativo com a Kzloo | a Kzloo ainda não tem perfil coletado (`referencia.json` sem seguidores) | o perfil da Kzloo for coletado como referência |

---

## 6. Conversa com o Panorama
- O bloco "Fora da curva" do Panorama mostra só 6 cards e um link **"aprofundar no Painel →"** que abre `?vista=painel&periodo=30`.
- O clique num card do Panorama abre esta aba já com a gaveta do item (`?item=<compId>/<mk>`).
- Os limiares (3× forte, 2× sinal, regra dos ≥ 3 concorrentes) e o alerta de concentração são os mesmos nas duas telas.
- A "Aposta de cada concorrente" é o detalhe do bloco "Quem publica e quem anuncia" do Panorama.

## 7. Decisões que dependem do Oliver
Listadas na resposta do agente e no Log da 038.

## Decisões para construir (orquestrador, 2026-10-08; o Oliver pode mudar)
O Oliver mandou levar tudo até o fim; as perguntas de desenho seguem a recomendação do estrategista:
1. **× mercado** mostra "—" (tooltip: "menos de 3 concorrentes nesta comparação") quando o grupo rede+formato (ou rede, no recuo) tiver < 3 concorrentes distintos. Regra em `withMarketOutlier` (`lib.tsx`), com teste.
2. Quadrantes do mapa com corte em **2×**.
3. "Fora da curva" do Panorama: **no máximo 2 cards por concorrente**.
Em aberto com o Oliver (não bloqueiam a tela; a tela mostra o dado que existe): token do Instagram para > 6 posts, páginas do Facebook dos 5 sem anúncio, preço final e teste da Kzloo, Instagram da Kzloo como referência.
