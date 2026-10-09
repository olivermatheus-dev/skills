# Revisão crítica do plano de cenas (fase E)

## Como delegar
Agente `revisor`, `model: opus`, com o prompt abaixo (troque `<pasta>`, `<slug>` e `N`). Ele não viu a conversa: tudo que precisa está nos arquivos.

```
Você é um diretor de arte de motion design cético, de estúdio premium de lançamento de software.
Seu trabalho é achar o que vai deixar este vídeo genérico, confuso ou feio ANTES de ele ser animado.
Leia só: <pasta>/cenas.json · a saída de `node tools/video/plano.mjs check <pasta>` · companies/<slug>/brand/BRAND.md (Proibições e Vídeo)
· .claude/skills/plano-de-cenas/references/rubrica.md (critérios abaixo) · .claude/skills/plano-de-cenas/references/gramatica.md
· knowledge/video/repertorio.md · o storyboard em <pasta>/storyboard-<fmt>.png, se existir (abra com Read).
Escreva <pasta>/revisao-plano-N.md com:
1. Tabela: critério · nota 0–3 · evidência (id da cena) · correção concreta.
2. Total (soma / máximo) e os eliminatórios em 0.
3. As 3 cenas mais fracas, cada uma com 2 alternativas concretas (o que entra na tela, relação, bloco existente ou novo, gesto na palavra X).
4. O que está bom e não deve mudar (no máximo 3 itens).
Seja específico: "s3 é literal: relógio quando a fala diz 'tempo'; troque por a agenda da semana que se fecha em 'menos'"; nunca "melhorar o dinamismo".
Não reescreva o cenas.json. Não elogie para equilibrar.
```

## Critérios (0 = falha · 1 = fraco · 2 = bom · 3 = excelente)
| # | critério | pergunta | eliminatório |
|---|---|---|---|
| 1 | **Teste do mudo** | sem som, o storyboard conta a história e o produto? | sim |
| 2 | **Acréscimo** | cada cena acrescenta algo à fala? `acrescenta` é verdade na imagem planejada? | sim |
| 3 | **Literal** | quantas cenas só repetem a palavra (ícone de agenda quando a fala diz "agenda")? | |
| 4 | **Teste do template** | um gerador de slides ou um template de Canva faria isto? | sim |
| 5 | **Fio condutor** | o motivo aparece, evolui e se resolve na virada/revelação? | |
| 6 | **Conexão** | cada corte tem motivo; o olhar continua na mesma região; ≤ 2 tipos de transição | |
| 7 | **Gancho** | 1º quadro com conteúdo; a persona se reconhece em 2 s (situação concreta, não genérica) | sim |
| 8 | **Ritmo e curva** | intensidade sobe e desce; nada parado > 1,5 s; setup antes do payoff; cauda no final | |
| 9 | **Clareza** | uma ideia por momento; ≤ 6 palavras na tela; hierarquia clara no quadro mais cheio | |
| 10 | **Verdade e marca** | toda funcionalidade com fonte; proibições do BRAND.md; nada de clichê da lista | sim |
| 11 | **Construível** | cada cena tem bloco existente ou `spec` claro; poses e gestos desenháveis; nos 2 formatos | |
| 12 | **Beleza** | no storyboard: composição, respiro, contraste e cor estão no nível de estúdio? | |

Total máximo: 36. **Passa** com ≥ 27 (75%) e nenhum eliminatório em 0. Senão, o autor aplica e roda outra rodada (máx. 3; na 3ª, leve o impasse ao Oliver com as duas opções).

## Erros que já aconteceram (cada um virou critério)
- Abertura com tela vazia; "sobra menos tempo" com a tela vazia esperando a palavra (v01 da apresentação kz, 2026-10-07) → 7 e 8.
- Tela de cards sem headline; ideias sem ícone ou elemento de apoio (idem) → 9 e 11.
- Cada cena com um recurso diferente, sem ligação entre elas → 5 e 6.
