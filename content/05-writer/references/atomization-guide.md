# Guia de Atomização de Conteúdo

## O que é atomização

Atomização é o processo de marcar trechos de um conteúdo-pilar que podem ser extraídos e reutilizados em outros formatos. Um post longo pode virar 5-10 peças menores se os elementos forem identificados durante a redação.

## Tags de Marcação

Inserir como comentários HTML no conteúdo-pilar. A Skill 5B (Derivatives) usa essas tags para identificar derivados viáveis.

### Tags disponíveis:

| Tag | O que marca | Formatos deriváveis |
|---|---|---|
| `<!-- HOOK_PRINCIPAL: "..." -->` | O hook usado na abertura | Quote card, thumbnail de vídeo, primeiro slide |
| `<!-- DADO_DESTAQUE: "..." -->` | Estatística ou número impactante | Slide Stat, quote card, tweet, infográfico |
| `<!-- CITAÇÃO_AUTORIDADE: "..." -->` | Frase de especialista/livro | Quote card, slide Quote, tweet |
| `<!-- INSIGHT_CHAVE: "..." -->` | Insight que funciona sozinho | Post solo, tweet, story |
| `<!-- LISTA_DERIVÁVEL: "..." -->` | Lista de itens/etapas | Carrossel, checklist, infográfico, thread |
| `<!-- HISTÓRIA: "..." -->` | Narrativa/caso/exemplo | Reels, story, post narrativo |
| `<!-- CTA: "..." -->` | Call to action | Slide final, bio, story |

### Regras de uso:

- Inserir ANTES do trecho que a tag marca
- Um conteúdo de 500 palavras deve ter no mínimo 3-4 tags
- O hook e o CTA são obrigatórios em todo conteúdo
- Dados e citações devem ser tagueados sempre que aparecerem
- Uma LISTA_DERIVÁVEL precisa ter no mínimo 3 itens para ser viável como carrossel

### Exemplo de conteúdo atomizado:

```markdown
<!-- HOOK_PRINCIPAL: "78% dos leads são perdidos por falta de follow-up" -->
78% dos leads são perdidos por falta de follow-up.
Não por preço. Por esquecimento.

Isso acontece porque a maioria dos times opera sem processo claro.

<!-- DADO_DESTAQUE: "Times que padronizam etapas convertem 2.3x mais" -->
Times que padronizam etapas + scripts convertem em média 2.3x mais
que times que improvisam.

<!-- LISTA_DERIVÁVEL: "5 etapas de um funil básico para PMEs" -->
As 5 etapas que recomendo para times pequenos:
1. Entrada (lead novo)
2. Primeiro contato (até 24h)
3. Qualificação (vale investir tempo?)
4. Proposta (envio + follow-up)
5. Fechamento (decisão + contrato)

<!-- INSIGHT_CHAVE: "O problema nunca é falta de talento, é falta de processo replicável" -->
O problema nunca é falta de talento. É falta de processo replicável.

<!-- CTA: "Salva e compartilha com quem precisa organizar o comercial" -->
Salva esse post e compartilha com quem precisa organizar o comercial.
```

Desse conteúdo, a Skill 5B pode derivar: carrossel das 5 etapas, quote card com o dado, tweet com o insight, checklist, infográfico do funil.
