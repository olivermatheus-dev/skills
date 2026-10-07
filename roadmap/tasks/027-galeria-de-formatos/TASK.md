# 027 — Galeria de tipos de conteúdo e formatos (framework global)

Status: fase A feita (galeria + app + ligação com a IA); fase B = exemplos · Depende de: 005 (9 `fmt-*` escritos) · Liga com: 012 §5 (ficha de pauta), 014 (galeria de componentes), 025 (ficha da peça), 026 (skills no app)

## Objetivo
Uma **galeria do repositório** (todas as empresas usam) com os tipos de conteúdo e os formatos que funcionam. Toda ideia boa e **replicável no conceito** vira um verbete. O Oliver navega por ela, marca "quero um conteúdo no estilo X" e o Claude segue a essência e as instruções daquele formato.

## Modelo
- **Tipo de conteúdo** (o porquê: educativo, identificação, bastidor, prova, oferta, humor, lançamento…) × **formato** (o como: texto cinético, diálogo, antes × depois, recorte de funcionalidade, meme, 3D, carrossel educativo…).
- **Verbete de formato** = a skill `fmt-*` (instruções que a IA executa) + uma ficha visual: essência em 1 frase, quando usar e quando não usar, estrutura (blocos e tempos), exemplos (MP4/PNG nossos e referências externas só como inspiração), variações, observações do Oliver, nota e as peças já feitas com ele.
- **Referência solta** (ideia vista por aí, ainda não virou skill): entra como verbete "rascunho" com link/print e a observação. Quando a gente repetir 2–3 vezes, vira `fmt-*`.
- Fonte: `library/formatos/<id>/` (ficha `formato.json` + `exemplos/`), ligada à skill `.claude/skills/fmt-<id>/`.

## No app
- Aba **Formatos** (global): galeria com prévia em vídeo/imagem, filtro por tipo, canal e proporção, e busca.
- No verbete: ler e editar a essência e as observações. Botão **"Usar neste conteúdo"** escolhe o formato na ficha da peça (025) ou cria a peça/tarefa com `formato: fmt-x`. A IA então carrega aquela skill.
- Ao aprovar uma peça boa: **"Promover como exemplo"** do formato (alimenta a galeria sozinho).

## Critérios de pronto
- [~] Os 9 `fmt-*` atuais com ficha visual e pelo menos 1 exemplo nosso — **fichas feitas (9 ativas + 1 rascunho)**; exemplo nosso só no recorte de funcionalidade (`teste-kit`, marcado "teste"). Faltam 8 exemplos → fase B.
- [x] Cadastrar uma referência nova pelo app (link/print + observação) em menos de 1 min — "Nova referência": link + print colado (Ctrl+V) + observação, num formato existente ou como rascunho novo.
- [~] Marcar um formato numa peça e a produção seguir a skill certa — ligação feita (ficha da peça, tarefa criada pelo app cita a skill e o `formato.json`, `protocolo.md`, `review.mjs` mostra o formato); falta o teste real com 1 vídeo e 1 carrossel (sai junto com os exemplos da fase B).

## Fase A (feita, 2026-10-07)
- `schema/format.ts` (verbete) + `formato` no `schema/piece.ts`; `library/formatos/<id>/formato.json` (README na pasta; `refs/` fora do git).
- Tipos de conteúdo fixos: educativo, identificação, humor, bastidor, prova, produto, lançamento, oferta.
- Store/API: listar, editar (essência, observações, nota, tipos…), referência (link/print), rascunho novo, promover exemplo (aponta para a peça, não copia mídia, e marca o formato nela), peças feitas com ele (todas as empresas). `npm run validate` confere id e se a skill existe.
- App: aba **Formatos** (galeria com prévia, filtros por tipo/mídia/canal/proporção/status, busca; sem exemplo mostra o esqueleto da estrutura) + verbete (exemplos, estrutura, quando usar/não usar, variações, referências, peças; "Usar num conteúdo novo", "Marcar numa peça", "Promover como exemplo"; essência/observações com autosave, nota, tipos). **Novo conteúdo** escolhe o formato e aceita só o pedido (sem roteiro → `briefing.md`, a IA escreve o roteiro). **Ficha da peça**: campo Formato.
- IA: `protocolo.md` (observações do Oliver mandam sobre a skill), `content-ideas` usa os ids da galeria, `review.mjs` imprime o formato.
- Rascunho novo: **Apresentação com locução** (o que já fizemos 3 vezes: apresentação da kz + A/B). Na próxima vez vira `fmt-apresentacao-locucao`.

## Fase B (próxima)
1. Com o Oliver: escolher os formatos dos 12 posts (pergunta em aberto da 005) — a galeria já filtra por tipo/funil.
2. Produzir 1 exemplo de cada formato sem exemplo (de preferência já sendo posts da meta 006) e promover; isso fecha o teste "marcar formato → skill certa" (1 vídeo + 1 carrossel).
3. Opcional: miniatura animada dos formatos de vídeo sem exemplo; `fmt-apresentacao-locucao`.

## Log
- 2026-10-07: registrada a pedido do Oliver ("framework com tipos de conteúdo, galeria de formatos, marcar estilo X para o Claude seguir").
- 2026-10-07: fase A feita (ver acima). Testes do store numa cópia (HUB_ROOT): referência com print, rascunho, promover (e recusar duplicado), conteúdo novo só com formato → briefing + tarefa com a skill, apagar referência; app conferido no navegador sem erros no console.
