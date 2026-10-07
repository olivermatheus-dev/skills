# 027 — Galeria de tipos de conteúdo e formatos (framework global)

Status: rascunho (prioridade alta: é o que padroniza a produção) · Depende de: 005 (9 `fmt-*` escritos) · Liga com: 012 §5 (ficha de pauta), 014 (galeria de componentes), 025 (ficha da peça), 026 (skills no app)

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
- [ ] Os 9 `fmt-*` atuais com ficha visual e pelo menos 1 exemplo nosso
- [ ] Cadastrar uma referência nova pelo app (link/print + observação) em menos de 1 min
- [ ] Marcar um formato numa peça e a produção seguir a skill certa (teste com 1 vídeo e 1 carrossel)

## Log
- 2026-10-07: registrada a pedido do Oliver ("framework com tipos de conteúdo, galeria de formatos, marcar estilo X para o Claude seguir").
