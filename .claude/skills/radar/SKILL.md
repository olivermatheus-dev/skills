---
name: radar
description: "Descobre e cadastra fontes para monitorar: concorrentes diretos, referências, criadores e páginas que viralizam no tema do projeto, com os perfis de cada um (YouTube, Instagram, TikTok, site, anúncios). Use quando o usuário pedir 'listar concorrentes', 'achar concorrentes', 'quem fala desse tema', 'páginas de referência', 'mapear redes do concorrente', 'radar', ou ao iniciar o motor de ideias de um projeto."
---

# Radar de fontes

Saída: um `competitors/<id>/competitor.md` por fonte (schema `Competitor` em `schema/competitor.ts`), criado pelo app ("Adicionar") ou por você seguindo o mesmo formato. Depois rode `npm run validate`.

## Fluxo: candidato → aceite → análise
1. **Descobrir** (técnicas abaixo). Cada fonte nova entra com `status: candidato` (aparece no app em Concorrentes → **Candidatos**).
2. **Triagem barata** (só o que ajuda o Oliver a decidir): `npm run analise -- pedir <slug> <id> triagem` → perfis, site, resumo, onde atua. Rode pela skill `analise-concorrentes` (script + subagente Sonnet).
3. **Portão:** o Oliver aceita ou recusa no app. Aceitar = `ativo` + análise completa na fila (feita 1x). Recusar = `arquivado`.
4. Achar os perfis de um concorrente já cadastrado = módulo `perfis` da `analise-concorrentes` (não refaça a descoberta).

## Técnicas de descoberta (use 3+; anote em cada fonte como foi achada)
1. **Busca por palavra-chave do problema** (não do produto) + "Instagram", "YouTube", "TikTok" (ex.: "agenda terapeuta", "como organizar consultório").
2. **Hashtags e termos do nicho** no YouTube/TikTok: canais que aparecem repetidos nos primeiros resultados.
3. **Quem anuncia** o mesmo termo (Biblioteca de Anúncios da Meta, Central de Transparência do Google) → concorrentes com verba.
4. **"Contas parecidas"** a partir de 1–2 fontes já conhecidas (sugestões do Instagram/YouTube; quem elas citam ou marcam).
5. **Onde o cliente está**: comunidades, criadores que o público segue (`context/AUDIENCE.md` > canais).
6. **Comparadores e listas** ("alternativas a X", "melhores apps para Y", Capterra/GetApp).
7. Concorrentes já listados em `context/COMPETITORS.md`.
8. **Internacionais**: os mesmos termos em inglês/espanhol, para referência de produto e marca (o módulo `atuacao` classifica Brasil × internacional).

## Para cada fonte
- `kind`: `concorrente` (vende algo parecido) · `referencia` (marca boa de conteúdo, outro nicho) · `criador` (pessoa) · `pagina` (página temática/viral).
- `profiles`: todos os links achados e confirmados (o app detecta plataforma e @ ao colar; formato canônico em `core/platform.ts`).
- Corpo: 2–4 linhas — por que seguir, o que observar, como foi achada.
- `tags`: tema e funil.

## Regras
- Qualidade > quantidade: comece com 10–20 fontes por projeto.
- Não inventar perfil: só links verificados (o site linka para a rede, ou a bio cita o produto). Homônimos são comuns: confira o domínio.
- Não rodar análise completa em candidato: só a triagem.
