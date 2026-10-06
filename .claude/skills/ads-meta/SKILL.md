---
name: ads-meta
description: Cria e analisa anúncios de Meta Ads (Facebook e Instagram) em pt-BR — ângulos, hooks, textos, briefing de criativo, estrutura de teste e UTMs — e diagnostica resultados para decidir o que manter, pausar e iterar. Use quando o usuário falar em "anúncio", "ads", "criativo", "Meta Ads", "Facebook Ads", "Instagram Ads", "campanha paga", "otimizar anúncio" ou "analisar resultados de anúncio".
---

# Ads Meta

Dois modos: **(A) Criar** anúncios ou **(B) Analisar** resultados. Se o pedido não deixar claro, perguntar.

## Antes de começar

1. **Empresa:** se o slug não foi dado, inferir pela lista no `CLAUDE.md`; se houver dúvida, perguntar.
2. **Ler contexto** em `companies/<slug>/context/`: `BUSINESS.md`, `AUDIENCE.md`, `VOICE.md`, `COPY.md`, `COMPETITORS.md`, `VISUAL.md`.
3. **Ler** `companies/<slug>/campaigns/LOG_ANGULOS.md` (se existir) para não repetir ângulos aposentados.
4. Confirmar: objetivo (venda, lead, mensagem no WhatsApp, agendamento), destino (LP, WhatsApp, formulário instantâneo), oferta e verba diária.
5. **Nunca inventar** provas, números ou depoimentos.

---

## Modo A — Criar

### 1. Escolher 3–5 ângulos

Cada ângulo = um motivo diferente para clicar. Escolher pela persona e pelo nível de consciência.

| Ângulo | Ideia | Fonte |
|---|---|---|
| Dor | "Cansado de X?" | `AUDIENCE.md` |
| Desejo | "Tenha Y em Z dias" | `AUDIENCE.md` / big idea |
| Mecanismo | "O motivo de X não funcionar é..." | mecanismo da falha / único |
| Prova | "Como a Ana saiu de X para Y" | provas |
| Objeção | "Sem tempo? Leva 10 min por dia" | objeções |
| Comparação / inimigo comum | "Diferente de X, aqui..." | `COMPETITORS.md` |
| Identidade | "Para [perfil] que..." | persona |
| Contrário | "Pare de fazer X" | big idea |
| Urgência | "Última turma de 2026" | só se for real |

### 2. Para cada ângulo, entregar

- **3 hooks** (primeira frase do texto / primeiros 3s do vídeo)
- **Texto principal curto** (≤ 125 caracteres)
- **Texto principal longo** (problema → virada → prova → CTA; quebras de linha, 1–2 emojis no máximo)
- **Título** (≤ 40 caracteres)
- **Descrição** (≤ 30 caracteres)
- **CTA do botão** (Saiba mais, Comprar, Enviar mensagem, Cadastre-se...)
- **Briefing visual**, um formato por ângulo ou mais:
  - **Estático:** texto na arte (≤ 6 palavras), imagem, hierarquia, cores do `VISUAL.md`
  - **Carrossel:** 3–6 cards, um ponto por card, último card com CTA
  - **Vídeo UGC 15–30s:** roteiro curto `0–3s hook | 3–20s desenvolvimento | final CTA`, com falas, texto na tela e cena

### 3. Specs Meta

| Item | Spec |
|---|---|
| Feed | 4:5 — 1080×1350 |
| Stories / Reels | 9:16 — 1080×1920 (deixar ~14% livre em cima e ~20% embaixo) |
| Texto principal | ~125 caracteres visíveis antes do "ver mais" |
| Título | ~40 caracteres |
| Descrição | ~30 caracteres (pode não aparecer) |
| Texto sobreposto em Stories/Reels | ≤ 72 caracteres |

Conferir todos os limites antes de entregar; se passar, oferecer versão cortada.

### 4. Estrutura de teste recomendada

- **Simples:** 1 campanha por objetivo, otimizando para o evento que importa (compra, lead, conversa).
- **Advantage+** (campanha e posicionamentos) e **público aberto/amplo**; o criativo faz a segmentação. Interesses/lookalike só como teste pontual.
- **Poucos conjuntos** (1–2), com 3–6 anúncios cada, um ângulo por anúncio.
- **Testar criativo antes de público.** Ordem de impacto: ângulo → hook → formato/visual → texto → CTA.
- Verba que permita ~50 conversões/semana por conjunto; se não der, otimizar para um evento mais acima do funil.
- Não mexer por 3–5 dias (fase de aprendizado), salvo erro gritante.

### 5. UTMs

Padrão (minúsculas, hífens):

```
?utm_source=meta&utm_medium=paid-social&utm_campaign=<AAAA-MM>-<slug-da-campanha>&utm_content=<angulo>-<formato>-v<n>&utm_term={{adset.name}}
```

Ex.: `utm_content=dor-ugc-v1`. Nome do anúncio no Gerenciador = `utm_content`.

### 6. QA e salvar

- Rodar `../landing-page/references/qa-copy.md` (Seven Sweeps + compliance). Conferir que a promessa do anúncio é a mesma da página de destino.
- Salvar em `companies/<slug>/campaigns/AAAA-MM-DD-<slug-da-campanha>/ads.md`.
- Registrar os ângulos novos em `LOG_ANGULOS.md` com status `em teste`.

### Formato do `ads.md`

```markdown
# Ads — <campanha>
**Objetivo:** ... | **Destino:** ... | **Oferta:** ... | **Verba/dia:** ...

## Estrutura de teste
...

## Ângulo 1 — <nome> (<tipo>)
**Hooks:** 1. ... 2. ... 3. ...
**Texto curto:** ...
**Texto longo:** ...
**Título:** ... | **Descrição:** ... | **CTA:** ...
**Visual:** formato + briefing / roteiro
**UTM:** ...

## Ângulo 2 — ...

## QA
...
```

---

## Modo B — Analisar

### 1. Receber os dados

Usuário cola a tabela ou exporta CSV do Gerenciador. Colunas úteis: anúncio, conjunto, valor gasto, impressões, alcance, frequência, CPM, CTR (link), CPC, resultados, custo por resultado, ROAS. Perguntar a meta de CPA/ROAS se não estiver no `BUSINESS.md`. Ignorar anúncios com gasto < 1× CPA alvo (dados insuficientes).

### 2. Diagnóstico por métrica

| Sinal | Provável causa | Ação |
|---|---|---|
| CPM alto | Público estreito demais, criativo de baixa qualidade, época cara (datas comerciais) | Abrir público, Advantage+ posicionamentos, criativo novo |
| CTR baixo (< ~1% link) | Hook/ângulo não prende, visual parece anúncio genérico | Novo hook/ângulo; testar UGC |
| CTR ok, CPC ok, conversão baixa | Problema **depois do clique**: LP lenta, promessa diferente do anúncio, oferta/preço, formulário | Revisar LP com `landing-page` + QA; checar pixel/eventos |
| Frequência alta (> ~3 em 7 dias) + CTR caindo | Fadiga de criativo | Novas variações do vencedor |
| Muitos cliques, poucos resultados no WhatsApp | Atendimento lento ou sem roteiro | Checar tempo de resposta e script |
| Sem conversões registradas | Pixel/API de conversões | Checar rastreio antes de julgar o criativo |

### 3. Decidir por anúncio

- **Mantém:** custo por resultado ≤ meta, volume estável.
- **Pausa:** gastou ≥ 2× CPA alvo sem resultado, ou CPA > 1,5× meta após aprendizado.
- **Itera:** bom CTR mas CPA alto, ou vencedor com fadiga.

### 4. Novas variações dos vencedores

- Identificar o que ganhou: tema, estrutura (pergunta/afirmação/número), tamanho do texto, formato.
- Gerar 3–5 variações: mesmo ângulo com hook novo, mesmo hook em outro formato, e 1–2 ângulos ainda não testados.
- Evitar padrões dos perdedores.

### 5. Saída

Salvar `analise-AAAA-MM-DD.md` na pasta da campanha: resumo (3 linhas), tabela mantém/pausa/itera com motivo, diagnóstico, novas variações (no formato do `ads.md`).

Depois, **adicionar ao fim** de `companies/<slug>/campaigns/LOG_ANGULOS.md` (criar se não existir):

```markdown
| data | campanha | ângulo | hook/variação | métrica-chave | status |
|---|---|---|---|---|---|
| 2026-10-06 | black-friday | dor | "Cansado de..." | CPA R$ 18 | vencedor |
```

Status: `em teste`, `vencedor`, `aposentado`. Nunca apagar linhas; só adicionar.

## Nichos regulados

Saúde, finanças, emagrecimento, renda: rodar o check de compliance do QA. A Meta também reprova atributos pessoais ("Você tem depressão?") e antes-e-depois. Na dúvida, sinalizar ao usuário antes de subir.
