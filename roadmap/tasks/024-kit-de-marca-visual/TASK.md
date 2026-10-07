# 024 — Kit de marca visual e editável no app (tokens, fontes, ícones, estilo e anotações)

**Status:** feita (v1, 2026-10-07; faltam upload de logo pelo app e mais presets) · **Depende de:** 018 (app) · **Liga com:** 001 (pasta de marca), 019 (visual do app), skills `carousel`, `video` e `fmt-*`, `tools/contrast.mjs`, DEPOIS.md ("tokens.json como fonte única")

## Pedido do Oliver (2026-10-07)
- O kit de marca precisa ser **visual e fácil**: adicionar e ajustar tokens, fontes e o kit completo **pelo app**, sem editar CSS à mão.
- Escolher **instruções de estilo visual** (mais minimalista, mais ousado etc.) e deixar **anotações** para direcionar o estilo.
- O kit alimenta carrosséis, vídeos e tudo o mais: o objetivo é **sair sempre o mais padronizado possível**, com consistência visual.
- Itens citados: arredondamento, fontes, biblioteca de ícones, cor de fundo, cor principal "e por aí vai".

## O que já existe
- `companies/<slug>/brand/brand.css`: fonte única de tokens (cores por papel, fontes locais). Carrossel e vídeo linkam direto.
- `brand/BRAND.md`: regras de uso (essência, cores, texto, fundo, formas, logo, ícones, movimento, som, vídeo, **proibições**). Manda sobre os defaults das skills.
- Pastas `logo/ icons/ vectors/ fonts/ photos/ screenshots/`. App → Contexto e marca → **Marca**: mostra o `brand.css` **só leitura**.

## Escopo (proposta, a validar com o Oliver)
1. **Tela "Kit de marca"** no app, por seções, com prévia ao vivo:
   - **Cores por papel:** fundo, superfície, texto, principal, destaque, borda, estados; seletor de cor + checagem de contraste (`contrast.mjs`) na hora.
   - **Tipografia:** enviar fonte (.woff2/.ttf, com licença) ou escolher do Google Fonts; papéis título / texto / destaque; pesos e escala de tamanhos.
   - **Formas:** arredondamento (raio por nível), borda, sombra, espaçamento/densidade.
   - **Ícones:** biblioteca (ex.: Lucide, Phosphor, Tabler), traço/peso, preenchido ou linha; ícones próprios em `icons/`.
   - **Logo e assets:** enviar variações (cor, branca, símbolo) e área de respiro.
   - **Estilo:** presets (minimalista, editorial, ousado, divertido…) que ajustam vários tokens de uma vez + controles (densidade, contraste, quantidade de cor, uso de foto/ilustração).
   - **Anotações e regras:** "fazer / não fazer", proibições, referências de exemplo (imagens): vão para o `BRAND.md`.
2. **Grava no `brand.json`** (gera o `brand.css`) e nas seções do `BRAND.md`, validados por schema; as skills seguem lendo o `brand.css` como hoje.
3. **Prévia real:** um slide de carrossel e um quadro de vídeo de amostra renderizados com os tokens enquanto se edita.
4. Molde em `companies/_modelo/brand/` com todos os tokens, para empresa nova já nascer completa.

## Decisões (Oliver, 2026-10-07)
- **Fonte de verdade = `brand/brand.json`** (tokens tipados, schema em `schema/`, validado no `npm run validate`) **gera o `brand.css`**. O app edita o JSON; um gerador escreve o CSS (cabeçalho "gerado, não editar"). Carrossel e vídeo seguem linkando o `brand.css`. Migrar o `brand.css` atual da kz para o JSON sem perder nada (fontes locais, papéis, comentários de uso viram `note` no token).
- **Estilo inicial: 1 preset, "Minimalista (estilo Apple)"**: muito respiro, fundo claro e limpo, 1 cor de destaque usada com parcimônia, tipografia grande e hierarquia por tamanho/peso (não por cor), raio médio-suave, sombras quase nulas, sem gradiente/ornamento, ícones de linha finos. Outros presets só depois.
- **Ícones: Lucide** como biblioteca padrão (ISC, uso comercial ok; já está no projeto como `lucide-react`). Token `icons: { library: "lucide", stroke, style: "linha" }`; carrossel e vídeo usam os SVG do Lucide com esses tokens.

## Critérios de pronto
- [x] `brand.json` + schema + gerador do `brand.css`; kz migrada com o CSS gerado equivalente ao atual (carrossel e vídeo renderizam igual)
- [x] Mudar cor principal, raio e fonte no app e ver a prévia mudar na hora; arquivos gravados e válidos.
- [~] Um carrossel gerado depois da mudança sai com os novos tokens sem nenhum ajuste à mão.
- [~] Anotações de estilo feitas no app aparecem no `BRAND.md` e são seguidas pela skill `carousel`.

## Log
- 2026-10-07 — criada a partir do pedido do Oliver (registro; não iniciada).
- 2026-10-07 — decisões do Oliver: `brand.json` gera o `brand.css`; preset inicial Minimalista (estilo Apple); ícones Lucide. Status → pronta.
- 2026-10-07 — **v1 implementada.** `schema/brand.ts` (grupos de tokens com nota, fontes locais/Google, `icons` Lucide, `style` preset + fazer/não fazer/anotações; exige os 27 tokens do molde) · `core/brand.ts` (brand.json → brand.css; importa brand.css antigo; bloco `kit-de-marca` no BRAND.md) · `core/brand-presets.ts` (Minimalista estilo Apple: forma/tipografia/ícones + 7 regras) · `npm run brand -- <slug> [--check|--all]` · `npm run validate` acusa brand.css editado à mão · `tools/icon.mjs` (SVG do Lucide com traço/cor do kit; `--busca`, `--out`) · store/API (`/brand`, `/brand/font`, `/brand-file/…`) · app: Contexto e marca → **Kit de marca** (prévia ao vivo 4:5 + inverso; estilo; cores com contraste; tipografia e fontes; forma com sliders; ícones; outros tokens; salvar/descartar, aviso de não salvo). Migração: kz e _modelo viraram brand.json; CSS gerado com os **mesmos 53 tokens e @font-face** do original (+ `--icon-stroke/color/fill`); ícones da kz = Lucide 1,5 (o BRAND.md dizia Lucide ou Phosphor 1,5 → agora só Lucide). Testado no app: aplicar preset + trocar cor → prévia muda na hora; salvar grava JSON/CSS/BRAND.md e o validate passa; kz restaurada depois (o preset **não** foi aplicado na kz: decisão do Oliver no app). Docs: CLAUDE.md, skills setup/carousel/video, agente designer, molde. Não feito: render de um carrossel real depois de mudar o kit (o template linka o brand.css, então segue automático) e um teste de anotação → carrossel; upload de logo pelo app; outros presets.
