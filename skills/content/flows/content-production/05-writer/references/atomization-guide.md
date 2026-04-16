# Guia de Atomização de Conteúdo

> Atomização é o processo de marcar, durante a redação, os trechos de um conteúdo-pilar que
> podem ser extraídos e reutilizados em outros formatos.
> Este guia é usado pela Skill 4 (Writer) ao inserir tags e pela Skill 5B (Derivatives) ao identificar derivados viáveis.

---

## O que é atomização

Um conteúdo-pilar bem escrito contém múltiplas "unidades de valor" — dados, insights, listas, histórias, citações — que funcionam independentemente do conteúdo completo. Marcar essas unidades durante a redação evita que a Skill 5B precise relê-las manualmente para encontrá-las.

**Regra de ouro:** marcar durante a escrita, não depois. Inserir a tag imediatamente ANTES do trecho que ela descreve.

---

## Tags Disponíveis

| Tag | O que marca | Formatos deriváveis |
|---|---|---|
| `<!-- HOOK_PRINCIPAL: "..." -->` | O hook de abertura aprovado | Quote card, thumbnail de vídeo, primeiro slide de carrossel |
| `<!-- DADO_DESTAQUE: "..." -->` | Estatística ou número impactante com fonte | Slide Stat, quote card, tweet, infográfico, story de dado |
| `<!-- CITAÇÃO_AUTORIDADE: "..." -->` | Frase de especialista, livro ou estudo | Quote card, slide Quote, tweet, story inspiracional |
| `<!-- INSIGHT_CHAVE: "..." -->` | Conclusão ou observação que funciona sozinha | Post solo, tweet, story de texto, newsletter intro |
| `<!-- LISTA_DERIVÁVEL: "..." -->` | Lista de itens, etapas, erros ou categorias | Carrossel completo, checklist, infográfico, thread, Reels lista |
| `<!-- HISTÓRIA: "..." -->` | Narrativa, caso real, exemplo com desfecho | Reels narrativo, story em sequência, post narrativo solo |
| `<!-- CTA: "..." -->` | Call to action principal | Slide final de carrossel, bio, story de ação |

---

## Regras de Uso

### Posicionamento
- Sempre inserir a tag na linha IMEDIATAMENTE antes do trecho que ela descreve
- Não inserir tags dentro de listas ou tabelas — usar antes do bloco

### Densidade mínima por comprimento de conteúdo

| Comprimento | Tags obrigatórias | Tags recomendadas |
|---|---|---|
| Até 200 palavras | HOOK_PRINCIPAL + CTA | 1 INSIGHT_CHAVE ou DADO_DESTAQUE |
| 200–400 palavras | HOOK_PRINCIPAL + CTA | 2–3 tags adicionais |
| 400–800 palavras | HOOK_PRINCIPAL + CTA | 4–6 tags (pelo menos 1 de cada tipo relevante) |
| 800+ palavras | HOOK_PRINCIPAL + CTA | 6–10 tags; toda lista, dado e história deve ser tagueada |

### Critério por tipo de tag

- **DADO_DESTAQUE:** tagear sempre que um número ou estatística aparecer no conteúdo
- **CITAÇÃO_AUTORIDADE:** tagear toda citação de especialista, livro ou estudo com nome atribuído
- **LISTA_DERIVÁVEL:** tagear apenas listas com 3+ itens; listas de 2 itens raramente fazem carrossel viável
- **HISTÓRIA:** tagear apenas narrativas com personagem + situação + desfecho (micro-história completa)
- **INSIGHT_CHAVE:** tagear no máximo 2 por conteúdo; insights demais diluem o que é realmente central

---

## Exemplo de Conteúdo Atomizado

### Conteúdo original (400–600 palavras, MOFU):

```markdown
<!-- HOOK_PRINCIPAL: "[Dado sobre problema comum da persona]" -->
[Dado sobre problema comum da persona].
Não por [razão óbvia]. Por [razão não-óbvia que só quem vive isso entende].

Isso acontece porque a maioria dos [perfil de empresa ou time]
opera sem [elemento faltante]. Cada [papel] resolve do seu jeito,
e o resultado aparece nos números no trimestre seguinte.

<!-- DADO_DESTAQUE: "[Percentual ou número sobre o impacto do problema]" -->
[Perfis que padronizam a abordagem] conseguem [resultado mensurável]
em comparação com [perfis que improvisam].

A diferença não é [recurso que a persona imagina ser o problema].
É [causa raiz real].

<!-- LISTA_DERIVÁVEL: "[N] etapas para [resultado desejado]" -->
As [N] etapas que reconstruíram esse processo:
1. [Etapa 1 — ação concreta]
2. [Etapa 2 — ação concreta]
3. [Etapa 3 — ação concreta]
4. [Etapa 4 — ação concreta]
5. [Etapa 5 — ação concreta]

<!-- INSIGHT_CHAVE: "O problema nunca é falta de [recurso]. É falta de [causa real]." -->
O problema nunca é falta de [recurso].
É falta de [causa real] — e isso é resolvível.

<!-- CTA: "Salva e aplica no próximo [ciclo/sprint/reunião]" -->
Salva esse post e aplica na próxima [situação relevante para a persona].
```

### O que a Skill 5B deriva desse conteúdo:

| Tag | Derivado possível |
|---|---|
| HOOK_PRINCIPAL | Quote card para feed; thumbnail para vídeo |
| DADO_DESTAQUE | Slide de estatística; tweet solo; story de dado |
| LISTA_DERIVÁVEL | Carrossel de [N] slides; checklist para download; Reels em lista |
| INSIGHT_CHAVE | Post de texto solo no LinkedIn; tweet para thread |
| CTA | Slide final de carrossel; story de ação |

---

## Mapa de Derivação por Formato de Saída

Use este mapa quando a Skill 5B for identificar quais derivados são viáveis para cada plataforma:

| Derivado | Tags necessárias | Plataforma ideal |
|---|---|---|
| **Carrossel** | LISTA_DERIVÁVEL (3+ itens) + HOOK_PRINCIPAL + CTA | Instagram, LinkedIn |
| **Quote card** | INSIGHT_CHAVE ou CITAÇÃO_AUTORIDADE | Instagram, LinkedIn, Pinterest |
| **Thread** | LISTA_DERIVÁVEL ou 3+ INSIGHT_CHAVE | Twitter/X, LinkedIn |
| **Reels / TikTok narrativo** | HISTÓRIA + HOOK_PRINCIPAL | Instagram, TikTok |
| **Reels / TikTok em lista** | LISTA_DERIVÁVEL (mínimo 3 itens) | Instagram, TikTok |
| **Story sequência** | HISTÓRIA ou LISTA_DERIVÁVEL | Instagram, LinkedIn |
| **Infográfico** | DADO_DESTAQUE + LISTA_DERIVÁVEL | LinkedIn, Pinterest, blog |
| **Post solo de insight** | INSIGHT_CHAVE | LinkedIn, Twitter, newsletter |
| **Slide de dado** | DADO_DESTAQUE | Instagram carrossel, LinkedIn |
| **Checklist** | LISTA_DERIVÁVEL (5+ itens de ação) | LinkedIn, blog, newsletter |

---

## Erros Comuns

| Erro | Problema | Correção |
|---|---|---|
| Tag inserida depois do trecho | Skill 5B não encontra o contexto da tag | Sempre inserir ANTES |
| LISTA_DERIVÁVEL com 2 itens | Carrossel inviável; parece incompleto | Mínimo 3 itens ou não tagear como LISTA_DERIVÁVEL |
| 5+ INSIGHT_CHAVE no mesmo conteúdo | Nenhum insight parece central | Máximo 2 por conteúdo |
| CTA ausente | Conteúdo sem derivado de ação | CTA é obrigatório em todo conteúdo |
| Toda frase tagueada como INSIGHT_CHAVE | Devalua as tags; nada se destaca | Tagear apenas o que funciona completamente fora do contexto |
