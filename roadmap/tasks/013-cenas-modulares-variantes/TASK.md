# 013 — Cenas modulares e variantes de baixo custo (anúncios em série)

Status: rascunho · Depende de: 003 (kit de render) · Liga com: 009 (MCP de edição), 011 (teste de custo), `ads-meta`
Pedido do Oliver em 2026-10-07: o mesmo conteúdo (copy, gatilho) precisa sair em **várias versões** — cor de fundo, estilo, voz, curta direta com CTA, longa explicativa, feed, YouTube ≤ 15 s — **sem gerar tudo do zero**. O caro (tokens escrevendo motion) é feito uma vez; as variações reaproveitam.

## Ideia central (analogia: Lego)
Cada cena é uma **peça isolada** com encaixe padrão. O vídeo é uma **lista de peças** (`timeline.json`). Variante = **outra lista, ou as mesmas peças com outra cor/voz/texto** — montada por script, não pelo LLM.

## 1. Contrato da cena (vale já para todo vídeo novo)
- **1 cena = 1 bloco isolado** em `composition.html` (ou `cenas/<id>.js`): função `cena(root, params, tl, inicio, duracao)`.
- **Sem valor fixo dentro:** cor e fonte só por tokens do `brand.css` (variáveis CSS); textos, números e dados vêm de `params`/`on_screen` do `timeline.json`.
- **Elástica:** a animação é escrita em **tempo relativo** (entrada · hold · saída), então a cena aceita outra duração sem reescrever (ex.: 4 s no longo, 2,2 s no corte de 15 s). Duração mínima declarada (`min_s`) = entrada + leitura + saída.
- **Responsiva aos formatos:** layout por áreas seguras do formato (4:5, 9:16, 16:9), não por pixel fixo.
- **Sem dependência da cena vizinha**, exceto a transição de encaixe declarada (`match_in`/`match_out`), para poder trocar a ordem ou tirar a cena.
- Cena boa vira **peça da biblioteca da empresa**: `companies/<slug>/video-templates/cenas/<id>/` (código + `cena.json` com params, `min_s`, formatos, preview PNG).

## 2. Arquivo de variantes
`variantes.json` na pasta do vídeo:
```json
{
  "base": "timeline.json",
  "variantes": [
    { "id": "curto-cta",  "formatos": ["9x16","4x5"], "max_s": 15, "cenas": ["gancho","demo","cta"], "cta": "Peça seu acesso" },
    { "id": "longo",      "formatos": ["4x5"], "cenas": ["gancho","contexto","demo","resultado","cta"] },
    { "id": "yt-15",      "formatos": ["16x9"], "max_s": 15, "cenas": ["gancho","demo","cta"] },
    { "id": "escuro",     "tema": { "--bg": "var(--inverse-bg)", "--text": "var(--on-inverse)" } },
    { "id": "voz-b",      "voz": "audio/vo-b/" },
    { "id": "gancho-2",   "trocar": { "gancho": { "use": "gancho-pergunta", "params": { "texto": "Ainda confirma sessão na mão?" } } } }
  ]
}
```
- Ferramenta `node tools/video/variantes.mjs <pasta> [--id X]`: gera `variantes/<id>/timeline.json` (cenas filtradas, durações reencaixadas até caber em `max_s` respeitando `min_s`, voz e trilha trocadas, tema aplicado como CSS extra) → render do kit → `qc.mjs`. **Zero token** para gerar a variante.
- Se a variante não cabe (`max_s` < soma dos `min_s`), a ferramenta avisa qual cena cortar; não comprime leitura abaixo do mínimo.
- Exports: `<AAAA-MM-DD>-<nome>-<variante>-<formato>-vNN.mp4`.

## 3. Custo por tipo de variação
| variação | como | custo em tokens |
|---|---|---|
| cor/tema, voz, trilha, CTA, texto curto, formato, duração/corte | `variantes.json` + script | **~zero** |
| gancho novo com cena da biblioteca | trocar `use` + `params` | **baixo** (só o texto) |
| cena nova (ideia visual nova) | LLM escreve 1 cena isolada | médio (só essa cena) |
| vídeo novo | fluxo normal da skill `video` | alto |

## 4. Anúncios em série (com `ads-meta`)
- **Matriz de teste:** 1 corpo (demo + prova + CTA) × 3–5 **ganchos** × 2 formatos = muitos criativos com 1 produção. Gancho é a variável que mais muda resultado; o resto se reaproveita.
- Cada variante herda a **ficha de pauta** (objetivo, mensagem, gatilho) da tarefa 012; o gatilho/copy vem do `COPY.md`.
- Nomes de variante viram o nome do anúncio (rastrear resultado por variante → aprendizado no `LOG_ANGULOS.md`).

## 5. Onde mexer quando for implementar
- Skill `video`: etapa 3 escreve cenas no contrato acima; nova seção "Variantes".
- `references/timeline.md`: `scenes[].use`, `params`, `min_s`, `match_in/out`.
- `tools/video/variantes.mjs` (novo) e `timeline.mjs` (reaproveitar o reencaixe).
- `fmt-*`: marcar quais cenas da receita são reaproveitáveis entre variantes.
- Kit (003): a composição precisa carregar cenas por id e aplicar CSS de tema por variante.

## Critérios de pronto
- Do mesmo vídeo base saem, sem LLM: 15 s 9:16 com CTA, versão longa 4:5, 16:9 ≤ 15 s, versão de fundo escuro e versão com outra voz — todas passando no `qc.mjs`.
- Trocar o gancho por outra cena da biblioteca custa só o texto do gancho.
- Teste 011 mede o custo de 1 base + 6 variantes × 6 vídeos do zero.

## Log
- 2026-10-07: pedido registrado e desenhado.
