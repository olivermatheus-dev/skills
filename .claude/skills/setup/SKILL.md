---
name: setup
description: "Cria ou atualiza o contexto de uma empresa (negócio, público, voz, concorrentes, estratégia de conteúdo, visual e copy) em companies/<slug>/context/. Use quando o usuário disser 'nova empresa', 'setup', 'configurar empresa', 'contexto da marca', 'atualizar persona', 'mudou o preço', 'mudei as cores', 'revisar contexto', ou quando outra skill não encontrar os arquivos de contexto."
---

# Setup de empresa

Objetivo: ter **7 arquivos curtos** que qualquer skill lê antes de produzir. Contexto bom = específico (números, nomes, frases reais do cliente). Contexto ruim = teoria genérica.

## Arquivos (em `companies/<slug>/context/`)

| Arquivo | Conteúdo | Máx. |
|---|---|---|
| `BUSINESS.md` | o que é, história/fundador, estágio, modelo e preço, oferta (plano, trial, garantia), diferenciais, links, restrições legais do nicho | 700 palavras |
| `AUDIENCE.md` | 1–2 personas: rotina, dores, desejos, objeções, gatilhos de compra, **frases literais** entre aspas, nível de consciência | 900 |
| `VOICE.md` | 3–5 traços de tom, faz/não faz, palavras usar/evitar, 2–3 exemplos antes/depois | 450 |
| `COMPETITORS.md` | tabela concorrente / preço / posicionamento / fraqueza que exploramos + nosso ângulo | 700 |
| `CONTENT_STRATEGY.md` | pilares (objetivo, % do mix, temas), mix de funil, canais/formatos, frequência, hooks que funcionaram | 550 |
| `VISUAL.md` | cores (hex + uso), fontes, estilo de imagem, bloco `css :root{}` com `--bg --surface --text --muted --primary --accent --font-heading --font-body --radius` | 350 |
| `COPY.md` | big idea, mecanismo da falha, mecanismo único, objeções → respostas, value stack, provas, CTAs por funil | 1200 |

Cada arquivo termina com `## A validar` — só o que é hipótese ou dado faltante. Nada de tags de confiança campo a campo.

Também criar, se não existirem: `companies/<slug>/tasks.md` (formato abaixo), `contents/`, `campaigns/`, `assets/`.

## Processo

1. **Coletar de uma vez.** Peça ao usuário um "despejo" livre + o que tiver: site, @ do Instagram, materiais, prints, depoimentos, planilha de preço. Se houver site/IG e acesso à web, leia antes de perguntar.
2. **Perguntar só o que falta** — no máximo 8 perguntas, numa mensagem, priorizando: oferta e preço, cliente ideal e sua dor nº 1, concorrentes, diferencial, prova existente, tom desejado, cores/fontes.
3. **Rascunhar os 7 arquivos** de uma vez. Onde não souber, escreva a melhor hipótese e liste em `## A validar`.
4. **Revisão em 1 rodada:** mostre um resumo de 10 linhas (big idea, persona, oferta, ângulo vs concorrentes) e pergunte o que está errado. Ajuste.
5. **Registrar a empresa** na tabela de empresas do `CLAUDE.md` da raiz.

## Atualizar

- Mudança pontual ("mudou o preço") → edite só o arquivo afetado e verifique se `COPY.md` precisa refletir.
- "Revisar contexto" → leia os 7 arquivos, liste o que está desatualizado ou em `A validar`, proponha as edições.
- Aprendizados de resultado (post que bombou, anúncio vencedor, objeção nova de venda) → registre no arquivo certo (`CONTENT_STRATEGY` > hooks que funcionaram; `COPY` > objeções; `AUDIENCE` > frases literais).

## Regras

- Frases do cliente valem ouro: copie literal, não parafraseie.
- Nicho regulado (saúde, finanças, jurídico): registre em `BUSINESS.md` as regras de publicidade do conselho (ex.: CFP/CRP, CFM) e LGPD.
- Não crie arquivos extras. Se algo não cabe nos 7, provavelmente não é necessário.

## Formato de `tasks.md`

```
# Tarefas — <empresa>
<!-- status: todo | doing | done · tipo: conteudo | anuncio | lp | estrategia | vendas | setup -->

| id | tarefa | tipo | status | prazo | arquivo |
|---|---|---|---|---|---|
| 1 | Fechar oferta de lançamento | estrategia | todo | 2026-10-20 | context/BUSINESS.md |
```
