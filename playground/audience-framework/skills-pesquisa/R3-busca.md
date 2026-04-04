# R3 — Pesquisa de Comportamento de Busca e Linguagem

**Responsabilidade:** Mapear a linguagem REAL que o público usa para descrever o problema — os termos exatos que digitam, as perguntas que fazem, as dúvidas que têm. Este é o dado mais subestimado no mapeamento de audiência e o mais valioso para copywriting.

**Quando aciona:** Durante a Skill 4.2 (Persona Builder), em paralelo com R2, após o usuário confirmar o nicho e o problema central (P0.x e P1.x). Roda junto com R2 porque ambas usam o mesmo momento de confirmação de público.

**Input necessário:**
- Nicho / problema principal (de `PRODUCT_CONTEXT.md` + P1.1)
- Termos do setor que o usuário usa para descrever o produto
- Faixa etária e região confirmados (para calibrar linguagem)

---

## O que a IA pesquisa

| Pesquisa | Fontes | O que extrai |
|---|---|---|
| Termos de busca reais do público | Google Trends, autocompletar do Google | O que o público digita — não o que a empresa acha que digita |
| Perguntas frequentes do público | Google "People Also Ask", fóruns, Quora | Dúvidas organizadas por tipo, linguagem coloquial real |
| Sazonalidade e tendências de busca | Google Trends | Quando o interesse cresce, quando cai, eventos que disparam |
| Variações regionais de linguagem | Google Trends por região | Se existe diferença de vocabulário por estado/região |

---

## O Gap de Linguagem (Por que Esta Pesquisa É Crítica)

Existe sempre uma diferença entre:
- **Linguagem da empresa:** "gestão de tráfego pago", "funil de conversão", "CAC e LTV"
- **Linguagem do público:** "como parar de perder dinheiro no Google Ads", "campanha que não converte", "como saber se meu anúncio está funcionando"

A empresa fala em **categoria/solução**. O público fala em **sintoma/problema**.

Headlines, hooks e copy que usam a linguagem do sintoma performam consistentemente melhor que os que usam linguagem de categoria. A R3 captura exatamente essa diferença.

---

## Como os dados alimentam o restante do fluxo

```
Dado coletado                    → Onde é usado depois
─────────────────────────────────────────────────────
Termos de busca reais            → Skill 4.2: P8.1 (linguagem literal da persona)
                                 → Skill 4.3: P4.1 (dor central na voz dela)
                                 → Skill 4.5: headlines por nível de consciência (P10.3)
Perguntas frequentes             → Skill 4.3: dores mapeadas (Dimensão 4)
                                 → Skill 4.4: conteúdo para tipos 1-3 dos 9 públicos
Sazonalidade                     → Editorial calendar (skill 09)
                                 → Timing de campanhas e conteúdo
Gap de linguagem identificado    → Síntese executiva (P11.8): mensagem-chave
                                 → Todos os conteúdos: hooks, subjects, CTAs
```

---

## Output — Seção R3 de RESEARCH_[publico].md

```markdown
## R3 — Comportamento de Busca e Mapa de Linguagem
*Pesquisa executada em: [data]*

### Termos de Busca Reais (o que digitam)
Top termos por volume/intenção:
1. "[termo exato]" — intenção: informacional / transacional / navegacional [D]
2. "[termo exato]" [D]
3. "[termo exato]" [D]

### Perguntas Frequentes do Público
(People Also Ask + fóruns — linguagem coloquial)
- "[pergunta literal]" [D]
- "[pergunta literal]" [D]
- "[pergunta literal]" [D]

### Sazonalidade
- Meses de maior interesse: [D]
- Eventos/datas que disparam busca: [D]
- Tendência: crescendo / estável / sazonalmente relevante [D]

### Gap de Linguagem Identificado
| O que a empresa diz | O que o público busca |
|---|---|
| [termo técnico/categoria] | [termo de sintoma/problema] [D] |
| [termo] | [termo] [D] |

### Banco de Linguagem (Copy-Ready)
Frases e termos do público que funcionam como headlines:
- "[frase literal do público]" — usar em: [hook / headline / subject] [D]
- "[frase]" [D]

### Variações Regionais (se relevante)
- [região 1]: prefere "[termo]" [D]
- [região 2]: prefere "[termo]" [D]
```

---

## Regra de Ouro desta Skill

> Não presuma que sabe como seu público descreve o problema. O autocompletar do Google é uma janela para a mente coletiva do seu público — use ela. Uma única hora minerando linguagem real economiza meses de copy que não converte.
