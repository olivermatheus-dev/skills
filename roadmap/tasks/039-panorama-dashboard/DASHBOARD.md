# 039 A — Panorama como dashboard + card resumido de Brechas (desenho)

**Autor:** estrategista · 2026-10-08 · **Status:** aguardando aval do Oliver.
**Par:** `roadmap/tasks/038-conteudos-concorrentes-v2/DASHBOARD.md` (Painel da aba Conteúdos). O Panorama responde "como está o mercado e o que eu faço primeiro" numa tela; cada bloco tem um link para a tela que aprofunda (Conteúdos → Painel, Anúncios, Brechas, ficha). As definições de **× perfil**, **× mercado**, os limiares (3× forte, 2× sinal) e a regra "× mercado só com ≥ 3 concorrentes no grupo" estão na seção 0 do par e valem aqui sem mudança.

---

## 0. O que os dados têm de verdade (conferido em 2026-10-08)

| fonte | o que tem | tamanho | onde é fraca |
|---|---|---|---|
| `competitors/*/analysis/precos.json` + `intel/referencia.json` | preço de entrada, planos, teste grátis | 10 de 11 com preço público (Clínica Ágil sem) | Kzloo: "R$ 100–129, a validar"; teste grátis da Kzloo não definido |
| `intel/matriz.json` | 43 funcionalidades × 11 concorrentes + Kzloo (`_nos`) | 13 a 26 células preenchidas por concorrente (de 43) | **cobertura subestimada**: célula vazia conta como "não tem". Kzloo 35% × mediana 37% |
| `intel/brechas.json` | 13 temas (público 2, mensagem 3, oferta 3, produto 5), cada um com ação e fontes por concorrente | 1 a 7 concorrentes por tema | gerado em 08/10 a partir das análises de 07/10; não se atualiza sozinho |
| `competitors/*/ads/` (Biblioteca da Meta) | anúncios **ativos**: início, formato, plataformas, variações | 50 ativos de 6 anunciantes (Sintropia 15, Corpora 10, Allminds 9, PsicoManager 7, Mais Terapias 6, PsicoPlanner 3) | 1–2 coletas, só ativos: **"saiu do ar" e "novos" ainda não existem**. 5 concorrentes sem anúncio encontrado por **erro de busca pelo nome** (pode ser falso negativo) |
| `competitors/*/snapshots/` (redes) | seguidores, itens com views/curtidas/comentários | 144 itens, 62 nos últimos 30 dias, 8 concorrentes com rede coletada | Instagram = 6 itens por perfil; TikTok só Corpora; YouTube sem nada em 90 dias; **seguidores com Δ = 0** (coletas de 07 e 08/10) |
| `intel/semanas/2026-W41.md` | resumo semanal (audiência, publicados em 7 dias, anúncios) | 1 semana | só serve de link "relatório da semana" |

GestorPsi e PsicoPlanner não têm rede coletada; aparecem em preço, matriz, brechas e anúncios, não nos blocos de conteúdo.

---

## 1. Perguntas que o gestor responde em 10 s

1. **Onde a Kzloo está?** Preço contra o mercado (hoje: R$ 129, acima do preço de entrada de todos os 10 com preço público; o maior é PsicoManager, R$ 109) e cobertura de funcionalidades.
2. **Quais são as 3–5 maiores brechas para nós agora?**
3. **Quem anuncia mais e há quanto tempo?** (anúncio há 30+ dias no ar = ângulo que paga a conta)
4. **O que rendeu acima do normal nos últimos 30 dias, × perfil e × mercado?**
5. **Quem publica com constância e quem tem audiência?** (quem cresce: só quando houver duas coletas com ≥ 7 dias)

---

## 2. Blocos, em ordem de prioridade

| # | bloco | dado de origem | cálculo | forma | o que faz agir |
|---|---|---|---|---|---|
| 1 | **Faixa de números** (6, nunca mais) | preços, matriz, ads, snapshots | (a) **Kzloo × mercado**: preço Kzloo, "+X% vs mediana", "N/10 cobram menos"; (b) **Cobertura**: % Kzloo × mediana, com tooltip "células vazias contam como não tem"; (c) **Teste grátis**: 9/11 oferecem, sub "2 com plano grátis · Kzloo: a definir"; (d) **Anúncios ativos**: 50, sub "6 anunciantes · 40 há 30+ dias"; (e) **Fora da curva 30 d**: "3 × perfil · 11 × mercado" (≥3×); (f) **Maior audiência**: Corpora 85,8 mil (Instagram) | `StatStrip` novo (039 A2): grade de 6 colunas fixas a 1440 px, ícones `Tag`, `Grid3x3`, `Timer`, `Megaphone`, `Flame`, `Trophy` | (a) e (c) vão direto para as pendências de preço e de teste grátis (`BUSINESS.md#A validar`); clique em (d) → Anúncios ordenado por tempo no ar; clique em (e) → Conteúdos › Painel |
| 2 | **Brechas para nós (resumo)**, sempre visível | `intel/brechas.json` + matriz (`useMatrixStats`) | top 5 temas por nº de concorrentes distintos nas fontes (empate: tipo oferta > mensagem > público > produto, porque são os que viram peça sem esperar o produto); por linha: ícone do tipo, título, "7/11" com até 3 avatares, a `action` em 1 linha (tooltip com o texto inteiro), "você tem?" só nos temas de produto. Rodapé: **Produto × mercado** em 2 números ("4 faltam · 3 só você tem") e "ver todas as 13 →" | card na coluna da direita, **fixo ao rolar** (`sticky`) a partir de 1280 px; abaixo disso vira o 2º bloco da coluna única | botão **→ tarefa** em cada linha cria a tarefa no quadro (melhoria 5 da 034; se ainda não existir, abre a página Brechas no tema). Mensagem e oferta → `roteirista`/`landing-page`; produto → quadro `produto` |
| 3 | **Fora da curva (30 d)** | snapshots via `buildRows` + `withMarketOutlier` | 6 conteúdos; seletor **Perfil · Mercado · Os dois** (padrão **Perfil**: com a amostra de hoje o × mercado é dominado pelos maiores perfis); cada card com os dois selos (`15,2× perfil · 864× mercado`) e "—" no mercado quando o grupo tem < 3 concorrentes; alerta de uma linha quando > 50% dos ≥3× mercado são de um só concorrente (hoje: 55% Corpora) | 6 cards pequenos numa linha (miniatura 4:5, selo duplo, concorrente · rede · formato) | clique → Conteúdos com a gaveta aberta (`?item=`) → **Virar ideia**. Link "aprofundar no Painel →" (`?vista=painel&periodo=30`) |
| 4 | **Quem anuncia e há quanto tempo** | `competitors/*/ads/` (última coleta) | por anunciante: nº de ativos, dos quais há 30+ dias, anúncio mais antigo no ar (dias), formato dominante. Ordem: nº de ativos há 30+ dias | barras horizontais empilhadas (até 30 d / 30+ d), número no fim da barra, "mais antigo: 349 d" ao lado; linha final "sem anúncio encontrado: Clínica Ágil, GestorPsi, PersonCare, PsiNota AI, Terapee (busca por nome)" | anúncio 30+ dias = ângulo validado → abrir Anúncios filtrado no concorrente → registrar o ângulo em `campaigns/LOG_ANGULOS.md` / ideia para `ads-meta`. Falso negativo → corrigir o `pageId` na ficha |
| 5 | **Quem publica** | snapshots (perfil + itens) | por concorrente: seguidores da maior rede, posts por semana nos últimos 30 dias (todas as redes), dias desde o último post, nº ≥2× perfil em 30 d, Δ seguidores (mostra "—" e "1ª comparação em dd/mm" até haver coleta ≥ 7 dias antes) | tabela compacta, 9 linhas, avatar + nome | quem parou (PersonCare: último post 27/08) ou acelerou → nota na ficha; detalhe de formato está no Painel de Conteúdos (bloco 5 de lá) |
| 6 | **Preço × audiência** | preços + seguidores | o gráfico atual, sem mudança de conta | dispersão (já existe), altura menor | posicionamento: a linha da Kzloo à direita de todos mostra que o preço precisa de justificativa (`COPY.md#Value stack`) |

**Sai do Panorama e vai para a página Brechas (039 B):** a lista completa por tema (`GapThemes`), o `ProductVsMarket` inteiro e as "Brechas por concorrente" (frases originais).

---

## 3. Primeira dobra a 1440 × 900

Conta: shell ~56 px + header da área e abas ~96 px + faixa de números ~92 px + folgas ~40 px ≈ 284 px. Sobram ~615 px.

- **Coluna esquerda (8/12, ~930 px):** bloco 3 (Fora da curva: título 28 px + 6 cards de ~150 × 190 px + legenda ≈ 270 px) e bloco 4 (Anúncios: 6 barras de 28 px + rodapé ≈ 260 px). Total ≈ 560 px. **Cabem os dois.**
- **Coluna direita (4/12, ~460 px):** bloco 2 (Brechas: cabeçalho 40 + 5 linhas de ~76 + rodapé 56 ≈ 480 px). **Cabe inteiro**, e segue fixo ao rolar.
- **Abaixo da dobra:** bloco 5 (Quem publica) e bloco 6 (Preço × audiência) lado a lado na coluna esquerda; a direita continua com o card de Brechas fixo.
- A 1280 px: mesmos blocos; os cards do bloco 3 ficam com ~130 px. Abaixo de 1024 px: coluna única na ordem 1 → 2 → 3 → 4 → 5 → 6.

---

## 4. Wireframe (1440 px, `AppContent` 1440)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ ▣ Concorrentes  · 11 monitorados ·  relatório W41 →                            [+ Adicionar] │
│ [▦ Panorama][☰ Lista][▥ Comparar][🎬 Conteúdos][⇪ Redes][📣 Anúncios][◎ Brechas][↻ Coletas]  │
├──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬───────────────────┤
│ 🏷 KZLOO     │ ▦ COBERTURA  │ ⏱ TESTE GRÁT.│ 📣 ANÚNCIOS  │ 🔥 FORA DA   │ 🏆 MAIOR AUDIÊNC. │
│ R$ 129       │ 35% você     │ 9/11         │ 50 ativos    │ CURVA · 30 d │ Corpora           │
│ +X% vs med.  │ mediana 37%  │ 2 c/ grátis  │ 6 anunciant. │ 3 perfil     │ 85,8 mil (IG)     │
│ 10/10 menos  │ ⓘ matriz inc.│ Kzloo: ?     │ 40 há 30+ d  │ 11 mercado   │                   │
├──────────────┴──────────────┴──────────────┴──────────────┴─┬────────────┴───────────────────┤
│ Fora da curva · 30 dias      [Perfil|Mercado|Os dois] Painel→│ ◎ BRECHAS PARA NÓS        13   │
│ ┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐             │ 👥 Falar com terapeutas além   │
│ │ img  ││ img  ││ img  ││ img  ││ img  ││ img  │             │    do psicólogo     7/11 ●●●   │
│ │ 164×P││15,2×P││3,3×P ││2,5×P ││2,5×P ││2,0×P │             │    Nomear psicanalistas, hip…  │
│ │ —  M ││864×M ││ —  M ││ —  M ││ —  M ││2,0×M │             │                       [→ tarefa]│
│ └──────┘└──────┘└──────┘└──────┘└──────┘└──────┘             │ 💬 Voz humana, de terapeuta    │
│ Corpora  Corpora Corpora Corpora Corpora PsicoMan.           │    para terapeuta   6/11 ●●●   │
│ TikTok   IG car. TikTok  TikTok  TikTok  IG reel             │ 🏷 Preço único, público e com  │
│ ⚠ 55% dos ≥3× mercado são da Corpora (perfil maior)          │    tudo incluso     6/11 ●●●   │
├──────────────────────────────────────────────────────────────┤ 💬 Fundador terapeuta em       │
│ Quem anuncia e há quanto tempo         Anúncios (tempo no ar)→│    exercício        5/11 ●●●   │
│ Sintropia     ███████████████ 15   mais antigo  93 d · vídeo  │ 📦 Simples e completo para     │
│ Corpora       █████████▒       10              112 d · carros. │    quem atende sozinho 5/11  ✓? │
│ Mais Terapias ██████            6              132 d · vídeo  │ ─────────────────────────────  │
│ Allminds      ▒▒▒▒▒████         9              132 d · imagem │ Produto × mercado              │
│ PsicoPlanner  ███               3              349 d · imagem │ 4 faltam · 3 só você tem       │
│ PsicoManager  ▒▒▒▒███           7              347 d · carros.│              ver todas as 13 → │
│ █ há 30+ d ▒ até 30 d · sem anúncio achado: 5 (busca por nome)│  (card fixo ao rolar)          │
╞══════════════════════════════════════════════════════════════╧════════════ dobra 900 px ═════╡
│ Quem publica (30 d)                          │ Preço × audiência                │            │
│ concorrente  seguid.  posts/sem  último  ≥2× │  (dispersão atual, menor)        │  Brechas   │
│ Corpora       85,8k     …          1 d    5  │                                  │  (fixo)    │
│ Sintropia     53,4k     …          2 d    0  │                                  │            │
│ PersonCare     2,3k     0         42 d    0  │                                  │            │
│ Δ seguidores: 1ª comparação em 15/10         │                                  │            │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```
Números do esboço = dados reais de 08/10. "+X%" e as colunas "…" são calculados pelo app (o preço de entrada que o app usa por concorrente pode ser o plano grátis ou o pago; não reproduzi a conta aqui). "Mais antigo" = anúncio ativo com o `startedAt` mais antigo. Repare que, no padrão "Perfil", 4 dos 6 cards são TikTok da Corpora: ver pergunta 3 da resposta.

---

## 5. Card de Brechas (resumo): regras

- **Sempre visível:** coluna direita fixa (`sticky`, topo abaixo do header) a partir de 1280 px; nunca colapsado por padrão.
- **5 linhas, nunca mais.** Ordem: nº de concorrentes distintos nas fontes; empate pelo tipo (oferta > mensagem > público > produto).
- **Por linha:** ícone do tipo (`Users` público, `MessageSquare` mensagem, `Tag` oferta, `Package` produto), título (2 linhas no máximo), "N/11" + até 3 avatares, ação em 1 linha com tooltip, "você tem?" (✓ / parcial / ✗ / ?) só em produto, botão **→ tarefa** no hover.
- **Rodapé:** "Produto × mercado: 4 faltam · 3 só você tem" (clique → página Brechas, seção produto) e "ver todas as 13 →".
- **Data:** "atualizado em 08/10" (de `brechas.json#updatedAt`), em cinza, para o gestor saber que a lista não é ao vivo.

---

## 6. O que não entra, e por quê

| fora | por quê | volta quando |
|---|---|---|
| Audiência somada | número de vaidade: soma perfis de tamanhos muito diferentes e não muda decisão | — |
| "Com plano grátis" como card próprio | vira sub-linha do card de teste grátis; libera espaço para Anúncios e Fora da curva sem passar de 6 cards | — |
| Crescimento de seguidores (barras com Δ) | todas as coletas são de 07–08/10: Δ = 0 para todos | coleta com ≥ 7 dias de distância; aí o Δ entra na tabela "Quem publica" e, se alguém crescer > 5%, vira alerta na faixa |
| Anúncios novos / que saíram do ar | a coleta só traz ativos e é a primeira de quase todos ("0 novos" no relatório W41) | 2ª coleta semanal + 037 A |
| Lista completa de brechas, `ProductVsMarket`, frases por concorrente | é o que tomava a parte nobre da tela; vai para a página Brechas (039 B), nada se perde | — |
| Reputação (Reclame Aqui) | existe em `site/reclameaqui.json`, mas não está entre as perguntas do Panorama; fica na ficha e no Comparar | se o Oliver quiser usar como argumento de venda |
| Envios, duração, horário, temas dos conteúdos | ver a seção 5 do `DASHBOARD.md` da 038 | idem |
| Kzloo nos blocos de conteúdo | sem perfil coletado (`referencia.json#followers` = null) | o Instagram da Kzloo for coletado como referência |

---

## 7. Conversa com o Painel de Conteúdos
| no Panorama | aprofunda em |
|---|---|
| card (e) "Fora da curva 30 d" e bloco 3 | Conteúdos › Painel, mesmo período, mesma medida escolhida |
| card de conteúdo | Conteúdos com a gaveta aberta (`?item=<compId>/<mk>`) |
| bloco 4 (anúncios) | Anúncios › Tabela, ordenado por tempo no ar, filtrado no concorrente |
| bloco 5 (quem publica) | Painel › "Aposta de cada concorrente" (mix de formatos) e ficha › Redes |
| card de Brechas | página Brechas, no tema |

## Decisões para construir (orquestrador, 2026-10-08; o Oliver pode mudar)
O Oliver mandou levar tudo até o fim; as perguntas de desenho seguem a recomendação do estrategista:
1. **× mercado** mostra "—" (tooltip: "menos de 3 concorrentes nesta comparação") quando o grupo rede+formato (ou rede, no recuo) tiver < 3 concorrentes distintos. Regra em `withMarketOutlier` (`lib.tsx`), com teste.
2. Quadrantes do mapa com corte em **2×**.
3. "Fora da curva" do Panorama: **no máximo 2 cards por concorrente**.
Em aberto com o Oliver (não bloqueiam a tela; a tela mostra o dado que existe): token do Instagram para > 6 posts, páginas do Facebook dos 5 sem anúncio, preço final e teste da Kzloo, Instagram da Kzloo como referência.
