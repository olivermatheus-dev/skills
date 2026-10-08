---
name: mockup
description: "Transforma um print (ou captura) do produto em mockups premium prontos: iPhone, iPad, MacBook, iMac, Studio Display e Pixel reais (molduras oficiais calibradas, todas as cores), janela macOS, vidro (glassmorphism), ângulos 3D, fundos da marca e premium, sombras em camadas, cantos, zoom no detalhe, cards, anotações, duo/trio/leque/pilha/perspectiva, recorte com fundo transparente, em alta (3×). Detecta onde cortar o print (barra do navegador/sistema, rolagem, elemento cortado). Gera alternativas com folha de contato. Use quando o usuário pedir mockup, 'coloca esse print num iPhone/MacBook/celular/notebook', 'deixa esse print bonito', 'mockup 3D', 'print com fundo transparente', 'zoom nessa parte da tela', 'mostra que a agenda é simples', 'imagem do produto para LP/anúncio/post', ou arrastar/colar um print do produto."
---

# Mockup

Motor: `tools/mockup/` + `library/mockups/` (README = comandos, catálogo e contrato; galeria visual em `library/mockups/galeria/index.html`). **O Claude escolhe, o script compõe**: nunca desenhe aparelho, fundo ou composição à mão; use os templates. Custo baixo = ler o catálogo (`render.mjs --listar`, texto), rodar 1 comando e, no máximo, olhar **1 folha de contato** e **1 analise.png**.

## Caminho padrão: editor em camadas (tarefa 030)
O Oliver quer **controle**, não lote de alternativas (avaliação de 2026-10-07: gradientes duros, sombra com marca, texto fora da área segura). Padrão agora:
1. Registrar o print (passo 1 abaixo) e cuidar de cortes e dados sensíveis (passos 2–3).
2. Criar a peça em camadas: `node tools/mockup/cena.mjs --novo --captura companies/<slug>/capturas/<pasta> --formatos 4:5,9:16 [--titulo "Texto com *ênfase*"]` → `contents/<data>-mockup-<tela>/mockup.json` (versão 2).
3. Ajustar editando o `mockup.json` (contrato no cabeçalho de `library/mockups/runtime/cena.js`: camadas aparelho/imagem/texto/forma, x/y = centro em fração do formato, w em u = menor lado; `formatos` da camada = ajuste fino por proporção; fundo = preset de `library/mockups/fundos.json` copiado inteiro) e exportar: `node tools/mockup/cena.mjs <pasta>` (PNG 3× por formato; o terminal avisa texto fora da área segura).
4. Entregar dizendo: "abra em app → Mockups para ajustar". O Oliver mexe no editor (mesmo runtime: o que ele vê é o que sai).
- Fundos: só os presets de `fundos.json` (pintados em ponto flutuante com pontilhado: sem banda) ou cor/gradiente feitos no editor. **Não use os fundos premium antigos** (`aurora`, `macos` etc. do `render.mjs`) em peça nova.
- Antes de mostrar: abra o PNG em 100% num recorte (texto, borda do aparelho, sombra). Defeito visível = não entrega.
- O caminho antigo (templates + `--alternativas`, abaixo) continua valendo só quando o Oliver pedir opções.

## Entradas
- O print: arquivo solto (no chat, `_inbox/visual/`, `brand/screenshots/`) ou captura já registrada em `companies/<slug>/capturas/`.
- `companies/<slug>/brand/BRAND.md` (proibições = regra dura) e `brand/mockups.json` (fundos permitidos). Os tokens vêm sozinhos do `brand.css`.
- Texto de título/rótulo: do pedido, do `peca.json` (`notes`) ou do `context/COPY.md`. **Nunca invente número, preço ou promessa.**
- Molduras reais vêm com o repositório. Modelo novo: acrescente em `library/mockups/aparelhos/fontes.json` e rode `node tools/mockup/aparelhos.mjs baixar && node tools/mockup/aparelhos.mjs preparar`.

## Processo
1. **Registrar o print** (se ainda não é captura): `node tools/mockup/captura.mjs <arquivo> --empresa <slug> --nome <tela> [--dpr N] [--ficticios]`. O script mede tamanho, aparelho e cor **e analisa onde cortar**; você não abre o print.
2. **Cortes:** leia o resumo do terminal. Cortes de confiança alta (fio, rolagem) já entram sozinhos. Se houver corte de confiança **média** (barra do navegador/sistema, sobra vazia), olhe **só** a `analise.png` (vermelho sai, verde fica) e decida: usar `--recorte auto`, ajustar `sugestoes.recorte` no `captura.json` ou ignorar. Aviso de "elemento cortado sem vão perto": dentro de aparelho é natural; em `recorte`/`sem-moldura` peça outro print ou corte manual.
3. **Dados sensíveis (obrigatório):** tela com nome, e-mail ou telefone de pessoa real → marque `ocultar` no `captura.json` (px da imagem; borrado no render) ou peça um print de conta demo. Só com dados fictícios confirmados pelo Oliver ponha `dadosFicticios: true`; até lá a peça sai `nao-publicar`. Na kz: só conta demo com pacientes fictícios.
4. **Regiões** (só se o pedido precisa de zoom, cards, vidro, anotações ou pilha e o `captura.json` não tem): olhe a imagem **uma vez** e grave `regioes` com `rotulo` curto e factual (o que a tela mostra, sem promessa).
5. **Escolher o caminho:**
   - **Pedido explícito** ("iPhone preto, fundo transparente, 4:5") → 1 comando com `--template … --aparelho … --cor … --fundo … --formato …`, zero imagem lida. Confira só o terminal (QA).
   - **Só objetivo** ("mostrar que a agenda é simples") → `--alternativas 8 --formato <f> [--titulo "…"] --objetivo "…"` → leia **só** `folha.png` → escolha 2–3 que servem ao objetivo, grave em `escolhidas` no `mockup.json` e explique em 1 linha cada.
   - **Ajuste** → edite o `mockup.json` (params, fundo, textos, regiões) e rode `node tools/mockup/render.mjs <pasta> --so <ids>`.
6. **QA** (o script avisa; você decide): print esticado → reduza `--ampliacao` ou peça captura em 2–3×; texto fora da área segura → encurte; título no 9:16 respeita topo 10% e base 18%; desktop dentro do celular → outro template. Ênfase do título: `*palavra*` (cor de destaque) ou `_palavra_` (serifa itálica), 1 por título.
7. **Entregar**: a peça fica em `companies/<slug>/contents/<data>-mockup-<tela>/` (`mockup.json`, `peca.json` tipo `mockup`, `png/` em 3×). Grave `principal` no `peca.json` com a escolhida. Para LP/anúncio peça `--transparente` (+ `--formato livre` no `recorte`) e `--webp` se for web.

## Escolhas que dão resultado premium
- **Aparelho real por padrão** (`celular`, `notebook`, `tablet` já viram iPhone/MacBook/iPad). Marca que não quer Apple/Google → `--generico`. Cor do aparelho combinando com a peça: `--cor` (iPhone 18 Pro: silver, black, glacier, burgundy…).
- **Desktop**: `notebook` (apoiado, sombra de chão) ou `navegador` (janela macOS sangrando no 4:5). Web app largo: o ajuste automático estende a base sem cortar a direita.
- **Impacto/capa**: `perspectiva` (ângulo keynote, sombra dramática). **Funciona em tudo**: `duo`/`trio`. **Vários fluxos do app**: `leque` (celular) ou `pilha`.
- **Vidro** só sobre fundo colorido (aurora, macos, gelo, malha); em fundo liso não aparece.
- Fundos premium (paleta própria) só se a marca liberar em `brand/mockups.json`; a kz liberou todos (padrão continua liso creme).

## Regras
- Formatos: post 4:5 (padrão), story/reels 9:16, LP 16:9 ou livre transparente, quadrado 1:1. Escala 3 padrão; 4 só para impressão/LP retina grande.
- Molduras Apple/Google: só para mostrar o produto (sem alterar o aparelho, sem sugerir parceria).
- Ficou bom e serve de novo → anote no `TASK.md` da 028 para virar template/parâmetro (fase E), não copie HTML para a peça.
- Templates novos, animações e 3D de verdade são fases C–E da tarefa 028: não improvise fora do contrato do `library/mockups/README.md`.
