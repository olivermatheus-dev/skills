# COPY_SESSION_STATE — [empresa]

> Template em branco. O orquestrador `/setup-copy-foundation` copia este arquivo para `[ACTIVE_COMPANY_PATH]/context/copy/COPY_SESSION_STATE.md` ao iniciar uma nova sessão e as sub-skills 8.1–8.7 atualizam os campos conforme avançam.
>
> Este arquivo tem dois papéis:
> 1. **Status tracker** — qual artefato está em que fase
> 2. **Depósito intermediário** — guarda outputs de cada sub-skill antes de persistir no MD final (permite retomada granular e leitura rápida entre sub-skills)

---

## Sessão Atual
- empresa: [slug]
- data_inicio: [YYYY-MM-DD]
- escopo_selecionado: core | completo | custom
- artefatos_solicitados: [BIG_IDEA, UNIQUE_MECHANISM, MECHANISM_OF_FAILURE, OBJECTIONS, VALUE_STACK, PROOF_HIERARCHY, CTA_LIBRARY]
- modo: unificado | bifurcado
- perfis: [unificado] OU [decisor, usuario]
- perfil_ativo: [qual sendo processado agora — unificado, decisor ou usuario]
- versao: 1

---

## Pré-requisitos verificados
| Arquivo | Status | Nota |
|---|---|---|
| PRODUCT_CONTEXT.md | ✅ / ❌ | |
| AUDIENCE_PROFILES.md | ✅ / ❌ | N personas; bifurcação B2B: sim/não |
| COMPETITOR_MAP.md | ✅ / ❌ | |
| BRAND_VOICE.md | ✅ / ❌ | |
| COMPANY_PROFILE.md | ✅ / 🟡 | opcional |
| CONTENT_PILLARS.md | ✅ / 🟡 | opcional |
| PLATFORM_SPECS.md | ✅ / 🟡 | opcional |

---

## Artefatos — status por perfil

| Artefato | Perfil | Status | Versão | Última atualização | Arquivo |
|---|---|---|---|---|---|
| BIG_IDEA | [perfil] | pendente/rascunho/aprovado | 1 | [data] | context/copy/[perfil/]BIG_IDEA.md |
| UNIQUE_MECHANISM | [perfil] | pendente | — | — | — |
| MECHANISM_OF_FAILURE | [perfil] | pendente | — | — | — |
| OBJECTIONS | [perfil] | pendente | — | — | — |
| VALUE_STACK | [perfil] | pendente | — | — | — |
| PROOF_HIERARCHY | [perfil] | pendente | — | — | — |
| CTA_LIBRARY | [perfil] | pendente | — | — | — |

Em bifurcação, repetir a tabela para cada perfil (decisor e usuario).

---

## Depósito de artefatos intermediários

> Cada sub-skill 8.X grava seus outputs aqui ANTES de persistir no MD final. Sub-skills downstream (ex: 8.3 precisa de 8.2) leem deste depósito, não do MD final — evita parsing e permite leitura rápida.

### Perfil: [unificado | decisor | usuario]

#### BIG_IDEA (8.1)
- promessa_central: "[frase]"
- variacao_resultado: "[frase]"
- variacao_dor: "[frase]"
- variacao_identidade: "[frase]"
- sujeito: "[persona]"
- transformacao: "[de/para]"
- diferencial_implicito: "[o que só a marca promete]"
- status: pendente | rascunho | aprovado
- atualizado_em: [data]

#### UNIQUE_MECHANISM (8.2)
- nome: "[nome proprietário]"
- narrativa: "[3-5 frases]"
- metafora: "[analogia curta]"
- provas_unicidade: ["...", "..."]
- candidatos_nome_rejeitados: ["...", "..."]
- status: pendente | rascunho | aprovado
- atualizado_em: [data]

#### MECHANISM_OF_FAILURE (8.3)
- vilao_uma_frase: "[frase]"
- falha_1_nome: "[nome]"
- falha_1_sintoma: "[citação da persona]"
- falha_1_raiz: "[razão técnica/de design]"
- falha_2_nome: "[nome]"
- falha_2_sintoma: "[citação]"
- falha_2_raiz: "[razão]"
- falha_3_nome: "[nome]"
- falha_3_sintoma: "[citação]"
- falha_3_raiz: "[razão]"
- status: pendente | rascunho | aprovado
- atualizado_em: [data]

#### OBJECTIONS (8.4)
- obj_1_verbalizacao: "[citação]"
- obj_1_resposta_curta: "[frase]"
- obj_1_resposta_longa: "[parágrafo]"
- obj_2_verbalizacao: "[citação]"
- obj_2_resposta_curta: "[frase]"
- obj_2_resposta_longa: "[parágrafo]"
- obj_3_verbalizacao: "[citação]"
- obj_3_resposta_curta: "[frase]"
- obj_3_resposta_longa: "[parágrafo]"
- obj_4_verbalizacao: "[citação]"
- obj_4_resposta_curta: "[frase]"
- obj_4_resposta_longa: "[parágrafo]"
- obj_5_verbalizacao: "[citação]"
- obj_5_resposta_curta: "[frase]"
- obj_5_resposta_longa: "[parágrafo]"
- objecoes_especificas: ["[citação + resposta]", "..."]
- ordem_peso_persona: [3, 1, 4, 5, 2]
- status: pendente | rascunho | aprovado
- atualizado_em: [data]

#### VALUE_STACK (8.5)
- custo_inacao_financeiro: "[R$ ... /mês]"
- custo_inacao_tempo: "[horas/semana]"
- custo_inacao_emocional: "[descrição]"
- custo_inacao_prazo: "[quando vira insustentável]"
- stack_itens: [{beneficio, entrega, valor_rs}, ...]
- stack_total_rs: "[soma]"
- preco_real_rs: "[preço]"
- economia_mensal_rs: "[diff]"
- ancora_1_inacao: "[parágrafo]"
- ancora_2_humana: "[parágrafo]"
- ancora_3_stack: "[parágrafo]"
- status: pendente | rascunho | aprovado
- atualizado_em: [data]

#### PROOF_HIERARCHY (8.6)
- tier_1_quantitativa: ["...", "..."]
- tier_2_cases: [{empresa, contexto, acao, resultado}, ...]
- tier_3_agregada: ["...", "..."]
- tier_4_autoridade: ["...", "..."]
- tier_5_experiencia: ["...", "..."]
- gaps_tier_1: ["..."]
- gaps_tier_2: ["..."]
- gaps_tier_3: ["..."]
- status: pendente | rascunho | aprovado
- atualizado_em: [data]

#### CTA_LIBRARY (8.7)
- nivel_1_ctas: ["...", "...", "..."]
- nivel_2_ctas: ["...", "...", "..."]
- nivel_3_ctas: ["...", "...", "..."]
- nivel_4_ctas: ["...", "...", "..."]
- nivel_5_ctas: ["...", "...", "..."]
- cta_linkedin: "[adaptado]"
- cta_twitter: "[adaptado]"
- cta_youtube: "[adaptado]"
- cta_blog: "[adaptado]"
- cta_email: "[adaptado]"
- cta_sales_page: "[adaptado]"
- distribuicao_niveis: "[% por nível]"
- status: pendente | rascunho | aprovado
- atualizado_em: [data]

---

## Próxima ação
- proxima_acao: "[ex: Skill 8.2 — Unique Mechanism Mapper (perfil: decisor)]"

---

## Histórico de sessões

| Data | Sub-skill | Perfil | Ação | Resultado |
|---|---|---|---|---|
| [data] | [8.X] | [perfil] | generate / refine / approve / skip | [status] |
