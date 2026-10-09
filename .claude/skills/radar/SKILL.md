---
name: radar
description: "Descobre e cadastra fontes para monitorar: concorrentes diretos, referências, criadores e páginas que viralizam no tema do projeto, com os perfis de cada um (YouTube, Instagram, TikTok, site, anúncios). Use quando o usuário pedir 'listar concorrentes', 'achar concorrentes', 'quem fala desse tema', 'páginas de referência', 'mapear redes do concorrente', 'radar', ou ao iniciar o motor de ideias de um projeto."
---

# Radar de fontes

Descobre e cadastra fontes novas como **candidatos** e pede a triagem barata. Termina no portão: o Oliver aceita ou recusa no app; a análise do aceito é da skill `analise-concorrentes`, a coleta e a análise de conteúdo são da `referencias`.

## Especialista
Você é um analista de inteligência competitiva que mapeia o mercado e o ecossistema de conteúdo de um nicho (aqui, software para terapeutas autônomos no Brasil). Busca pelo problema do cliente, não pelo nome do produto, e só cadastra o que conseguiu confirmar.
- **Repertório:** busca pela dor e pelo termo do público (não pela categoria do produto); quem paga anúncio no termo tem verba e está ativo; "contas parecidas" e citações a partir de 1–2 fontes conhecidas; comparadores e listas de "alternativas a X"; internacional como referência de produto e marca; confirmação cruzada (o site linka a rede, a bio cita o produto, o domínio confere).
- **Bom é:** 10–20 fontes boas em vez de 100 fracas · cada fonte com `kind` certo, perfis confirmados e "como foi achada" · 3 ou mais técnicas usadas, não só uma busca · nenhuma duplicata do que já está em `competitors/` ou no `COMPETITORS.md`.
- **Não faz:** análise completa de candidato (só a triagem); perfil não verificado ou de homônimo; refazer a descoberta para achar perfis de quem já está cadastrado (é o módulo `perfis` da `analise-concorrentes`).

## Contexto
- `context/BUSINESS.md#O que é` · sempre — o que a empresa vende: separa `concorrente` de `referencia`
- `context/COMPETITORS.md` · sempre — concorrentes já listados: ponto de partida e para não recadastrar
- `context/AUDIENCE.md#Onde consome` · sempre — onde o cliente está, para a técnica 5
- `context/AUDIENCE.md#Dores` · quando: técnica 1 — problemas do público que viram palavra-chave de busca

## Entradas e saídas
- **Recebe:** o pedido (tema, quantas fontes, tipo); às vezes 1–2 fontes conhecidas para partir delas.
- **Entrega:** um `companies/<slug>/competitors/<id>/competitor.md` por fonte (schema `Competitor` em `schema/competitor.ts`), criado pelo app ("Adicionar") ou por você no mesmo formato, com `status: candidato` (aparece no app em Concorrentes → **Candidatos**); pedido de triagem de cada um.
- **Depois:** o Oliver aceita (`ativo` + análise completa na fila, feita 1x) ou recusa (`arquivado`) no app → `analise-concorrentes` e `referencias`.

## Ordem de trabalho
1. Liste as pastas de `companies/<slug>/competitors/` e leia o Contexto: o que já existe não entra de novo.
2. Pedido de perfis de um concorrente já cadastrado → módulo `perfis` da `analise-concorrentes` e pare aqui.
3. **Descobrir** com 3 ou mais técnicas (abaixo), anotando em cada fonte como foi achada.
4. **Cadastrar** cada fonte (ver "Para cada fonte") com `status: candidato` e rode `npm run validate`.
5. **Triagem barata** (só o que ajuda o Oliver a decidir): `npm run analise -- pedir <slug> <id> triagem` → perfis, site, resumo, onde atua. Rode pela skill `analise-concorrentes` (script + subagente Sonnet).
6. **Portão:** o Oliver aceita ou recusa no app.

## Regras duras
- Só links verificados: o site linka para a rede ou a bio cita o produto. Homônimos são comuns: confira o domínio.
- Comece com 10–20 fontes por projeto.
- Candidato só recebe a triagem, nunca a análise completa.

## Checklist antes de entregar
- Usei 3 ou mais técnicas e anotei em cada fonte como foi achada?
- Todo perfil cadastrado foi confirmado (site, bio ou domínio)?
- Nenhuma fonte duplica uma pasta de `competitors/` ou uma linha do `COMPETITORS.md`?
- Cada fonte tem `kind`, `profiles`, corpo de 2–4 linhas e `tags`?
- Todas entraram como `candidato` e só com a triagem pedida?
- `npm run validate` passou sem erro?

## Técnicas de descoberta (use 3+)
1. **Busca por palavra-chave do problema** (não do produto) + "Instagram", "YouTube", "TikTok" (ex.: "agenda terapeuta", "como organizar consultório").
2. **Hashtags e termos do nicho** no YouTube/TikTok: canais que aparecem repetidos nos primeiros resultados.
3. **Quem anuncia** o mesmo termo (Biblioteca de Anúncios da Meta, Central de Transparência do Google) → concorrentes com verba.
4. **"Contas parecidas"** a partir de 1–2 fontes já conhecidas (sugestões do Instagram/YouTube; quem elas citam ou marcam).
5. **Onde o cliente está**: comunidades, criadores que o público segue (`context/AUDIENCE.md#Onde consome`).
6. **Comparadores e listas** ("alternativas a X", "melhores apps para Y", Capterra/GetApp).
7. Concorrentes já listados em `context/COMPETITORS.md`.
8. **Internacionais**: os mesmos termos em inglês/espanhol, para referência de produto e marca (o módulo `atuacao` classifica Brasil × internacional).

## Para cada fonte
- `kind`: `concorrente` (vende algo parecido) · `referencia` (marca boa de conteúdo, outro nicho) · `criador` (pessoa) · `pagina` (página temática/viral).
- `profiles`: todos os links achados e confirmados (o app detecta plataforma e @ ao colar; formato canônico em `core/platform.ts`).
- Corpo: 2–4 linhas — por que seguir, o que observar, como foi achada.
- `tags`: tema e funil.
