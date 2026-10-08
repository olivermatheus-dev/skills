---
name: ads-meta
description: Cria e analisa anúncios de Meta Ads (Facebook e Instagram) em pt-BR — ângulos, hooks, textos, briefing de criativo, estrutura de teste e UTMs — e diagnostica resultados para decidir o que manter, pausar e iterar. Use quando o usuário falar em "anúncio", "ads", "criativo", "Meta Ads", "Facebook Ads", "Instagram Ads", "campanha paga", "otimizar anúncio" ou "analisar resultados de anúncio".
---

# Ads Meta

Dois modos: **(A) Criar** ou **(B) Analisar**. Se não estiver claro, perguntar.

## Antes de começar

1. **Empresa:** pelo `CLAUDE.md`; na dúvida, perguntar.
2. **Ler** `companies/<slug>/context/`: `BUSINESS.md`, `AUDIENCE.md`, `VOICE.md`, `COPY.md`, `COMPETITORS.md`; `companies/<slug>/brand/BRAND.md` (proibições); `companies/<slug>/campaigns/LOG_ANGULOS.md` se existir (não repetir aposentados); o relatório mais recente em `companies/<slug>/intel/semanas/` (anúncios ativos dos concorrentes: os que estão no ar há 30+ dias são os que dão resultado).
3. **Confirmar** objetivo (venda, lead, conversa no WhatsApp), destino, oferta e verba diária. O que faltar: assumir o mais provável pelo contexto, marcar `[a confirmar]` e seguir. Destino inexistente (sem LP/link) → avisar que não dá para subir e sugerir `landing-page`.
4. **Nunca inventar** provas, números, depoimentos, prazos ou escassez.

---

## Modo A — Criar

### 1. Ângulos (3–5)

Cada ângulo = um motivo diferente para parar e clicar. Fonte sempre no contexto:

| Ângulo | Fonte |
|---|---|
| Dor (cena reconhecível) | dores e linguagem literal de `AUDIENCE.md` |
| Mecanismo / vilão ("não é você, é X") | mecanismo da falha em `COPY.md` |
| Mecanismo único | `COPY.md` |
| Objeção respondida | objeções em `COPY.md` |
| Identidade ("para quem atende sozinha") | persona |
| Comparação com o jeito atual | `COMPETITORS.md` (o vilão é a abordagem, não a marca) |
| Prova (caso, número, fundador) | provas que **existem** em `COPY.md` |
| Urgência | só se for real e datada |

### 2. Criativo é a segmentação

Público aberto; quem o anúncio atrai é decidido pelo **1º frame / 1ª linha**. Por isso:
- O 1º frame (vídeo) ou a arte (estático) **chama o público pelo nome do ofício ou pela cena** ("Terapeuta que confirma sessão às 23h").
- **Diversidade real:** cada anúncio é um conceito diferente (ângulo × formato × pessoa/cena), não 5 versões da mesma arte trocando a cor.
- Mínimo por teste: 3 ângulos × 2 formatos = 6 anúncios.

### 3. Para cada ângulo, entregar

- **3 hooks** (1ª linha do texto / 0–3 s do vídeo)
- **Textos principais:** 1 curto (≤ 125 caracteres) + 1 longo (dor → virada → prova → CTA; frases curtas, máx. 2 emojis). O Meta aceita até 5 textos e 5 títulos por anúncio: os hooks extras viram variações.
- **Título** (≤ 40) · **Descrição** (≤ 30) · **Botão** (Saiba mais, Cadastre-se, Enviar mensagem…)
- **Briefing do criativo** (1–2 formatos):
  - **Estático 4:5:** texto na arte ≤ 6 palavras, imagem, hierarquia, regras do `BRAND.md` → produzir com a skill `carousel` (1 slide)
  - **Carrossel:** 3–6 cards, um ponto por card, último com CTA → skill `carousel`
  - **Vídeo motion 9:16 (15–30 s):** tela do produto/tipografia → skill `video` (roteiro vira briefing do `plano.md`)
  - **Vídeo câmera/UGC 15–30 s:** `0–3s hook | 3–20s desenvolvimento | final CTA`, com fala, texto na tela e cena; legenda na tela sempre

### 4. Specs

| Item | Spec |
|---|---|
| Feed | 4:5 — 1080×1350 |
| Stories / Reels | 9:16 — 1080×1920 (livre ~14% em cima e ~20% embaixo) |
| Texto principal | ~125 caracteres antes do "ver mais" |
| Título / descrição | ~40 / ~30 caracteres |

Conferir os limites antes de entregar.

### 5. Estrutura de teste

- **1 campanha** por objetivo, otimizando para o evento que importa. **Advantage+** (público e posicionamentos), público **amplo**: só país/idade. Interesse/lookalike só como teste pontual.
- **1 conjunto** com os 6+ anúncios. Ordem de impacto: ângulo → hook → formato → texto → CTA.
- Evento de otimização com ~50 resultados/semana; se a verba não chega, otimizar um evento acima (ex.: lead em vez de compra).
- Não mexer por 3–5 dias (aprendizado), salvo erro gritante. Vencedor novo → entra no mesmo conjunto; não duplicar campanha.

### 6. UTMs

```
?utm_source=meta&utm_medium=paid-social&utm_campaign=<AAAA-MM>-<campanha>&utm_content=<angulo>-<formato>-v<n>&utm_term={{adset.name}}
```
Minúsculas, hífens. Nome do anúncio no Gerenciador = `utm_content` (ex.: `dor-estatico-v1`).

### 7. QA e salvar

- Rodar `../landing-page/references/qa-copy.md`. A promessa do anúncio = a headline da página de destino.
- Salvar `companies/<slug>/campaigns/AAAA-MM-DD-<campanha>/ads.md`: cabeçalho (objetivo | destino | oferta | verba), estrutura de teste, um bloco por ângulo com os itens do passo 3 + UTM, QA e pendências.
- Registrar os ângulos em `LOG_ANGULOS.md` com status `em teste`.

---

## Modo B — Analisar

### 1. Dados
Tabela colada ou CSV do Gerenciador: anúncio, gasto, impressões, frequência, CPM, CTR (link), CPC, resultados, custo por resultado, ROAS; vídeo: views de 3 s e ThruPlay. Meta de CPA/ROAS: `BUSINESS.md` ou perguntar. Gasto < 1× CPA alvo = dado insuficiente, não julgar.

### 2. Diagnóstico

| Sinal | Causa provável | Ação |
|---|---|---|
| Hook rate baixo (views 3 s ÷ impressões < ~25%) | 1º frame não para o dedo | Novo hook/1º frame, mesmo ângulo |
| Hook ok, retenção (ThruPlay ÷ views 3 s) baixa | Meio do vídeo arrasta | Encurtar, entregar antes |
| CTR link < ~1% | Ângulo não convence ou parece anúncio genérico | Novo ângulo; testar formato nativo/UGC |
| CPM alto | Criativo de baixa qualidade, público restrito, data cara | Abrir público, criativo novo |
| CTR ok, conversão baixa | Problema **depois do clique**: promessa diferente, página lenta, oferta, formulário | Revisar com `landing-page`; checar pixel/eventos |
| Frequência > ~3 em 7 dias + CTR caindo | Fadiga | Variações do vencedor |
| Cliques no WhatsApp sem resultado | Resposta lenta ou sem roteiro | Tempo de resposta + script |
| Zero conversões registradas | Pixel/API de conversões | Checar rastreio antes de julgar criativo |

### 3. Decidir por anúncio
- **Mantém:** custo por resultado ≤ meta, volume estável.
- **Pausa:** gastou ≥ 2× CPA alvo sem resultado, ou CPA > 1,5× meta pós-aprendizado.
- **Itera:** bom hook/CTR com CPA alto, ou vencedor com fadiga.

### 4. Novas variações
O que ganhou (ângulo, estrutura do hook, formato, tamanho do texto) → 3–5 variações: mesmo ângulo com hook novo, mesmo hook em outro formato, 1–2 ângulos não testados. Evitar padrões dos perdedores.

### 5. Saída
`analise-AAAA-MM-DD.md` na pasta da campanha: resumo (3 linhas), tabela mantém/pausa/itera com motivo, diagnóstico, novas variações (formato do passo 3). Depois, **adicionar ao fim** de `LOG_ANGULOS.md` (criar se não existir; nunca apagar linhas):

```markdown
| data | campanha | ângulo | hook/variação | métrica-chave | status |
|---|---|---|---|---|---|
```
Status: `em teste`, `vencedor`, `aposentado`.

## Nichos regulados
Saúde, finanças, emagrecimento, renda: check de compliance do QA. O Meta reprova atributos pessoais ("Você tem ansiedade?") e antes-e-depois. Produto vendido **para** profissional de saúde: depoimento de profissional-cliente sobre o produto pode (real, autorizado); caso ou fala de paciente, nunca. Pendência de regra do conselho em aberto no `BUSINESS.md`/quadro (`node tools/board.mjs <slug>`) → entregar os anúncios marcados "não subir até validar".
