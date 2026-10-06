---
name: launch-plan
description: Monta plano de lançamento em pt-BR por fases e semanas, usando canais próprios, alugados e emprestados (Instagram, WhatsApp, parcerias, influenciadores). Use quando o usuário falar em "lançamento", "plano de lançamento", "pré-lançamento", "lançar produto", "estratégia de lançamento" ou "plano de marketing".
---

# Launch Plan

Gera um plano de lançamento em semanas e registra as tarefas da empresa.

## Antes de começar

1. **Empresa:** se o slug não foi dado, inferir pela lista no `CLAUDE.md`; se houver dúvida, perguntar.
2. **Ler** `companies/<slug>/context/`: `BUSINESS.md`, `AUDIENCE.md`, `COPY.md`, `CONTENT_STRATEGY.md`.
3. **Confirmar:** o que está sendo lançado, data alvo, verba de anúncios, tamanho da audiência (seguidores, lista/WhatsApp), quem executa.

## Canais (ORB)

Todo canal deve levar a audiência para um canal **próprio**.

| Tipo | Exemplos BR | Uso |
|---|---|---|
| **Próprios** | Lista de WhatsApp/grupo/comunidade, e-mail, site/LP | Relacionamento e venda direta; é onde se converte |
| **Alugados** | Instagram (Reels, Stories, Lives), TikTok, YouTube, Meta Ads | Alcance; sempre com CTA para lista/WhatsApp |
| **Emprestados** | Parcerias, influenciadores do nicho, lives em conjunto, podcasts, grupos de terceiros, indicação/afiliados | Credibilidade e audiência nova; converter para lista própria |

Escolher 1–2 de cada tipo, conforme onde o público está (`AUDIENCE.md`).

## 5 fases

| Fase | Objetivo | O que fazer |
|---|---|---|
| **1. Interno** | Validar o essencial | Testar com 3–10 pessoas próximas, de graça; colher feedback e primeiros depoimentos |
| **2. Alfa** | Primeira validação externa | Página de captura / lista de espera; anunciar que existe; convidar pessoas uma a uma |
| **3. Beta** | Gerar burburinho | Conteúdo sobre o problema (sem vender); convites da lista; parceiros testam e comentam; coletar provas |
| **4. Early access** | Expandir com controle | Mostrar bastidores, prints, demos; oferta de fundador/primeiro lote para a lista; pesquisa com quem entrou |
| **5. Lançamento** | Máxima visibilidade e venda | Abrir carrinho; mensagens na lista/WhatsApp; Stories/Lives; anúncios; parceiros divulgam; fechar carrinho com prazo real |

Produto/serviço simples ou já validado: comprimir fases 1–3 em 1–2 semanas. Depois do lançamento: depoimentos, conteúdo de resultado, próximo "relançamento" (nova turma, novo recurso).

## Saída

### 1. Plano

Salvar em `companies/<slug>/campaigns/AAAA-MM-DD-lancamento/plano.md`:

```markdown
# Plano de lançamento — <produto>
**Data de abertura:** ... | **Meta:** ... (vendas/leads) | **Verba:** ...
**Canais:** próprios ... | alugados ... | emprestados ...

| Semana | Fase | Objetivo | Ações | Conteúdo | Métrica |
|---|---|---|---|---|---|
| S1 (dd/mm) | Interno | ... | ... | ... | nº de testes, depoimentos |
| S2 | Alfa | ... | LP de captura, convites | 3 Reels sobre o problema | inscritos na lista |
| ... | | | | | |
| S6 | Lançamento | ... | abrir carrinho, ads, parceiros | ... | vendas, CPA, conversão |

## Riscos e pendências
- ...
```

Métricas simples e contáveis (inscritos, taxa de abertura no WhatsApp, vendas, CPA). Peças de copy específicas (LP, anúncios) ficam para as skills `landing-page` e `ads-meta`; o plano só aponta quando cada uma é necessária.

### 2. Tarefas

Adicionar linhas em `companies/<slug>/tasks.md` (criar com o cabeçalho se não existir; nunca apagar linhas existentes; continuar a numeração de `id`):

```markdown
| id | tarefa | tipo | status | prazo | arquivo |
|---|---|---|---|---|---|
| 12 | Criar página de captura | lp | a fazer | 2026-10-20 | campaigns/2026-10-06-lancamento/plano.md |
```

`tipo`: lp, ads, conteudo, email-whatsapp, parceria, setup. `status`: a fazer, fazendo, feito.

## Nichos regulados

Saúde e afins: conteúdos, depoimentos e promessas seguem o check de compliance em `../landing-page/references/qa-copy.md`.
