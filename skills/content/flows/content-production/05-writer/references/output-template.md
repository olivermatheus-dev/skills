# Template — OUTPUT_WRITER.md

> Use este template para gerar o arquivo `OUTPUT_WRITER.md` ao final de cada sessão de redação.
> Preencha todos os campos com dados reais da sessão. Campos em `[colchetes]` são placeholders.
> Este arquivo é o input para a Skill 5A (Platform Adapter) e a Skill 5B (Derivatives Engine).

---

```markdown
# Conteúdo: [Título ou tema do conteúdo]

> Gerado pela Skill 4 — Content Writer.
> **Data:** [DD/MM/AAAA]
> **Última atualização:** [data e hora]

---

## Contexto da Sessão

| Campo | Valor |
|---|---|
| **Hook de abertura** | "[texto exato do hook aprovado]" |
| **Formato** | [Post longo LinkedIn / Script Reels / Script TikTok / Carrossel-base / Artigo / Newsletter] |
| **Framework de copy** | [AIDA / PAS / BAB / 4Ps / PASTOR / Híbrido] |
| **Estágio de funil** | [TOFU / MOFU / BOFU] |
| **Plataforma-alvo** | [LinkedIn / Instagram / TikTok / Blog / E-mail] |
| **Persona-alvo** | [nome da persona conforme AUDIENCE_PROFILES] |
| **Dados de pesquisa integrados** | [Sim — OUTPUT_RESEARCH.md / Não — conteúdo com [placeholders]] |
| **Tags de atomização inseridas** | [N] tags — [listar: HOOK_PRINCIPAL, DADO_DESTAQUE, etc.] |

---

## Conteúdo Completo

> O conteúdo abaixo está pronto para revisão final antes de publicação.
> Tags de atomização (<!-- TAG: "..." -->) estão inseridas para uso da Skill 5B.

---

[CONTEÚDO COMPLETO AQUI — com marcações de atomização integradas]

---

## Checklist de Qualidade

| Item | Status |
|---|---|
| Hook abre o conteúdo exatamente como aprovado? | ✅ / ❌ |
| Dados têm fonte citada ou sinalizada? | ✅ / ⚠️ [detalhar] |
| Framework de copy seguido corretamente? | ✅ / ❌ |
| Tom de voz alinhado com BRAND_VOICE? | ✅ / ⚠️ BRAND_VOICE não disponível |
| Pelo menos 1 elemento de storytelling? | ✅ / ❌ |
| CTA claro e alinhado ao funil? | ✅ / ❌ |
| Tags de atomização inseridas (mínimo HOOK_PRINCIPAL + CTA)? | ✅ / ❌ |
| Conteúdo entrega o que o hook prometeu? | ✅ / ❌ |

---

## Tags de Atomização — Resumo

> Mapa rápido para a Skill 5B identificar os derivados disponíveis.

| Tag | Conteúdo tagueado | Derivados possíveis |
|---|---|---|
| HOOK_PRINCIPAL | "[texto do hook]" | Quote card, thumbnail, capa de carrossel |
| DADO_DESTAQUE | "[dado]" | Slide de stat, tweet, story de dado |
| CITAÇÃO_AUTORIDADE | "[citação]" | Quote card, slide |
| INSIGHT_CHAVE | "[insight]" | Post solo, tweet |
| LISTA_DERIVÁVEL | "[título da lista]" | Carrossel, checklist, thread |
| HISTÓRIA | "[resumo da história]" | Reels narrativo, story |
| CTA | "[texto do CTA]" | Slide final, story de ação |

---

## Campos com [Placeholder]

> Se o conteúdo foi gerado sem OUTPUT_RESEARCH.md, listar aqui os campos que precisam
> ser preenchidos antes da publicação.

- [ ] `[inserir dado]` — linha [N] do conteúdo — requer estatística sobre [tema]
- [ ] `[inserir case]` — linha [N] — requer exemplo de empresa/profissional do setor
- [ ] `[inserir fonte]` — linha [N] — dado presente mas sem fonte verificada

> Se não há placeholders: "Todos os campos preenchidos — pronto para publicação."

---

## Próximos Passos

**Próximas skills recomendadas:**
- **Skill 5A — Platform Adapter:** adaptar o conteúdo para LinkedIn, Instagram, TikTok ou Twitter com ajustes de comprimento e tom
- **Skill 5B — Derivatives Engine:** identificar e produzir os formatos derivados a partir das tags de atomização

> Pergunta de transição:
> "Conteúdo entregue. Quer adaptar para outras plataformas (→ Skill 5A) ou identificar os formatos derivados que podem sair desse conteúdo (→ Skill 5B)?"
```

---

## Notas de uso

- **Mínimo viável:** OUTPUT_WRITER.md mínimo precisa ter: Contexto da Sessão + Conteúdo Completo com tags + Checklist preenchido.
- **Campos com placeholder:** se o conteúdo foi escrito sem pesquisa, a seção "Campos com Placeholder" é obrigatória para que o usuário saiba o que preencher antes de publicar. Nunca omiti-la — mesmo que seja "Todos os campos preenchidos."
- **Downstream compatibility:** o "Conteúdo Completo" com as tags de atomização é o campo mais crítico — Skill 5A e 5B o usam como fonte. As tags precisam estar no formato exato `<!-- TAG: "..." -->` para que o parsing automático funcione.
- **Formato de saída:** o OUTPUT_WRITER.md deve ser salvo no diretório raiz do projeto (junto com os outros OUTPUTs) ou em pasta de sessão específica, conforme organização do usuário.
