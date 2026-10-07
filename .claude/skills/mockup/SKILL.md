---
name: mockup
description: "Transforma um print (ou captura) do produto em mockups profissionais prontos: aparelhos (navegador, notebook, celular, sem moldura), ângulos 3D, fundos da marca, zoom no detalhe, cards flutuando, anotações com seta, recorte com fundo transparente, em 1:1, 4:5, 9:16, 16:9 ou livre. Gera alternativas já aplicadas com folha de contato. Use quando o usuário pedir mockup, 'coloca esse print num celular/notebook', 'deixa esse print bonito', 'mockup 3D', 'print com fundo transparente', 'zoom nessa parte da tela', 'mostra que a agenda é simples', 'imagem do produto para LP/anúncio/post', ou arrastar/colar um print do produto."
---

# Mockup

Motor: `tools/mockup/` + `library/mockups/` (README = comandos e contrato). **O Claude escolhe, o script compõe**: nunca desenhe aparelho, fundo ou composição à mão; use os templates. Custo baixo = ler o catálogo (texto), rodar 1 comando e, no máximo, olhar **1 folha de contato**.

## Entradas
- O print: arquivo solto (no chat, `_inbox/visual/`, `brand/screenshots/`) ou captura já registrada em `companies/<slug>/capturas/`.
- `companies/<slug>/brand/BRAND.md` (proibições = regra dura) e `brand/mockups.json` (fundos permitidos). Os tokens vêm sozinhos do `brand.css`.
- Texto de título/rótulo: do pedido, do `peca.json` (`notes`) ou do `context/COPY.md`. **Nunca invente número, preço ou promessa.**

## Processo
1. **Registrar o print** (se ainda não é captura): `node tools/mockup/captura.mjs <arquivo> --empresa <slug> --nome <tela> [--dpr N] [--ficticios]`. O script mede tamanho, aparelho e cor; você não abre a imagem.
2. **Dados sensíveis (obrigatório):** tela com nome, e-mail ou telefone de pessoa real → marque `ocultar` no `captura.json` (px da imagem; borrado no render) ou peça um print de conta demo. Só com dados fictícios confirmados pelo Oliver ponha `dadosFicticios: true`; até lá a peça sai `nao-publicar`. Na kz: só conta demo com pacientes fictícios.
3. **Regiões** (só se o pedido precisa de zoom, cards ou anotações e o `captura.json` não tem): olhe a imagem **uma vez** (ou recortes com grade do ffmpeg) e grave `regioes` com `rotulo` curto e factual (o que a tela mostra, sem promessa).
4. **Escolher o caminho:**
   - **Pedido explícito** ("iPhone, fundo transparente, 4:5") → 1 comando com `--template … --aparelho … --fundo … --formato …`, zero imagem lida. Confira só o terminal (QA).
   - **Só objetivo** ("mostrar que a agenda é simples") → `--alternativas 6 --formato <f> [--titulo "…"] --objetivo "…"` → leia **só** `folha.png` → escolha 2–3 que servem ao objetivo, grave em `escolhidas` no `mockup.json` e explique em 1 linha cada.
   - **Ajuste** → edite o `mockup.json` (params, fundo, textos, regiões) e rode `node tools/mockup/render.mjs <pasta> --so <ids>`.
5. **QA** (o script avisa; você decide): print esticado → reduza `--ampliacao` ou peça captura em 2–3×; texto fora da área segura → encurte o rótulo/título; título no 9:16 respeita topo 10% e base 18%. Ênfase do título: `*palavra*` (cor de destaque) ou `_palavra_` (serifa itálica), 1 por título.
6. **Entregar**: a peça fica em `companies/<slug>/contents/<data>-mockup-<tela>/` (`mockup.json`, `peca.json` tipo `mockup`, `png/`). Grave `principal` no `peca.json` com a escolhida. Para LP/anúncio peça `--transparente` (+ `--formato livre` no `recorte`) e `--webp` se for web.

## Regras
- Formatos: post 4:5 (padrão), story/reels 9:16, LP 16:9 ou livre transparente, quadrado 1:1. Escala 2 padrão; 3 só para impressão/LP grande.
- Desktop no celular não: o template `duo` e o aparelho `celular` pedem print de celular (o script avisa).
- Fundo da peça: o primeiro de `brand/mockups.json` é o padrão da marca (kz: liso creme).
- Ficou bom e serve de novo → anote no `TASK.md` da 028 para virar template/parâmetro (fase E), não copie HTML para a peça.
- Templates novos, aparelhos novos e animações são fases C–E da tarefa 028: não improvise fora do contrato do `library/mockups/README.md`.
