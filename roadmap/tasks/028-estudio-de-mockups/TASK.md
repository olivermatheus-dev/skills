# 028 — Estúdio de mockups: print ou link → peça vendável (skill + editor no app)

Status: rascunho (perguntas em aberto abaixo) · Depende de: 024 (kit de marca), 018 (app) · Liga com: 014 (galeria: frames e animações viram componentes), `fmt-3d-produto`, `fmt-recorte-funcionalidade`, 027 (formatos), 013 (variantes), central de peças

Pedido do Oliver em 2026-10-07: passar um **print** (ou um **link**, com ele fazendo o login) e receber de volta mockups **extremamente profissionais**: fundos, aparelhos, mockups 3D, animações prontas. Pelo Claude Code **e** pelo app (arrastar o print dentro do projeto, biblioteca de materiais brutos, editor próprio). Pode pedir o resultado ("estático, fundo transparente, 4:5") ou só o objetivo ("mostrar que a agenda é simples") e receber **alternativas já aplicadas**, salvas para abrir, ajustar e exportar. Frames, mockups e efeitos são **reaproveitados nos vídeos**.

## Princípio: o Claude escolhe, o script compõe
O custo baixo vem de **não gerar nada do zero**: templates parametrizados (HTML + tokens do `brand.css`) recebem o print num slot e o Playwright renderiza em alta. O Claude só decide **quais** templates e parâmetros (lê um catálogo de 1 linha por item, como na 014) e, no máximo, olha **1 folha de contato** em baixa resolução para escolher. Pedido explícito ("iPhone, fundo transparente, 4:5") = **zero imagem lida**, só um comando.

```
print/link → captura (bruto + captura.json) → composição (mockup.json: template + slots + params)
           → render (PNG/WebP 2–3×, transparente opcional · MP4 pelo video-kit) → peça na central
```

## 1. Onde fica cada coisa
| pasta | o que guarda |
|---|---|
| `companies/<slug>/capturas/<AAAA-MM-DD>-<tela>/` | material bruto: `original.png` (ou `.webm` da gravação, fora do git), `captura.json` (origem: arraste/print/link, URL, viewport, dpr, aparelho, tags, "dados fictícios? sim/não") |
| `library/mockups/frames/` | aparelhos e molduras **próprios** (CSS/SVG, sem marca registrada): celular, notebook, tablet, monitor, janela de navegador clara/escura, sem moldura com sombra; cada um em 2D e CSS 3D (ângulos prontos) |
| `library/mockups/fundos/` | fundos paramétricos por token: liso, gradiente suave, malha de gradiente, grade, pontos, ruído, brilho na cor da marca, desfoque da própria tela, foto |
| `library/mockups/templates/<id>/` | composições: herói 1 aparelho, celular + notebook, tela com zoom num detalhe (lupa/recorte ampliado), cards de UI flutuando à frente, anotações com seta e rótulo, antes × depois, grade de telas, só a tela recortada (para sobrepor) |
| `library/mockups/animacoes/` | presets GSAP: entrar inclinado, órbita curta, rolar a página dentro da tela, zoom num ponto, cards em paralaxe, reflexo de luz (mesmo contrato da 014 → o vídeo usa direto) |
| `companies/<slug>/contents/<AAAA-MM-DD>-<tema>/` | resultado: `mockup.json` (composição editável) + `exports/` + `peca.json` tipo `mockup` → aparece na central de peças |

Regra da 014: genérico (tokens e parâmetros) → `library/`; com identidade da marca → `companies/<slug>/`. `BRAND.md` manda (ex.: kz pede fundo liso: os outros fundos só se a marca permitir).

**Contrato de template** (`template.html` + `meta.json`): slots (`tela`, `tela2`, `titulo`, `subtitulo`, `destaques[]`, `zoom: {x,y,w,h}`), params com default/min/max, formatos suportados (1:1, 4:5, 9:16, 16:9, livre), `transparente: true|false`, `animavel: true|false`, `preview.png`. Cor sempre `var(--…)`.

## 2. Captura (fase B)
- **Print colado/arrastado:** o script mede (tamanho, proporção → celular/notebook, cor dominante, se tem barra do navegador) e grava o `captura.json` sem o Claude olhar.
- **Link:** `node tools/mockup/capture.mjs <url> --aparelho celular|desktop --dpr 3 [--pagina-inteira] [--gravar 8s] [--passos roteiro.json]` com **perfil de navegador persistente por empresa** (`companies/<slug>/.navegador/`, fora do git): na 1ª vez abre a janela, **o Oliver faz o login**, e as próximas capturas reaproveitam a sessão. Prints em lote de várias telas, rolagem, hover e clique roteirizados; gravação vira matéria-prima de `fmt-recorte-funcionalidade`.
- **Dados sensíveis (obrigatório na kz):** só conta demo com pacientes fictícios. Opção `--mascarar` troca nomes/telefones por fictícios via CSS/JS antes do print. Captura sem confirmação de dados fictícios fica marcada e não exporta.

## 3. Composição e render (fase A — o núcleo)
- `node tools/mockup/render.mjs <captura> --template heroi-celular --fundo gradiente --formato 4:5 --transparente --escala 3` → PNG/WebP.
- `--alternativas 6` → combinações coerentes (template × fundo × ângulo) a partir do objetivo/formato, uma **folha de contato** e os arquivos. O Claude escolhe 2–3 olhando só a folha (ou deixa o Oliver escolher no app).
- **Zoom no detalhe:** região por coordenadas, por seletor (quando veio de link) ou marcada no app; o Claude só olha a imagem quando precisa achar a região sozinho.
- Saídas: PNG com/sem fundo, WebP, `@2x/@3x`, tamanhos por canal (feed, story, LP, anúncio); vídeo curto via `tools/video-kit/` usando as animações.
- Skill **`mockup`**: pedido → ler catálogo → montar `mockup.json` → render → QA (legibilidade, área segura, contraste, nitidez: print com resolução baixa demais avisa em vez de esticar) → salvar peça.

## 4. No app (fase C) — aba **Mockups** do projeto
- Arrastar prints (ou colar com Ctrl+V) → biblioteca de capturas com tags, origem e filtro.
- Editor: escolher template, aparelho, ângulo, fundo, formato, transparente; arrastar a região de zoom; editar títulos/destaques; prévia ao vivo (o próprio `template.html` num iframe); exportar.
- **"Gerar alternativas"** (roda o script direto, sem IA) e **"Pedir à IA"** (com objetivo em texto → tarefa no quadro).
- Salvar como peça (`mockup.json` reabre no editor) e **"Salvar como template"** quando um ajuste ficou bom.

## 5. Templates novos (fase E)
Skill `mockup` com modo **"criar template"**: a partir de uma referência (print de um mockup que o Oliver gostou) → novo `template.html` + `meta.json` + preview, cadastrado no catálogo. Mesmo para fundos e animações.

## Fases
| fase | entrega | pronto quando |
|---|---|---|
| A | motor: 4 frames, 6 fundos, 6 templates, `render.mjs`, folha de contato, skill `mockup` | do print do painel da kz saem 6 alternativas em < 1 min e 2 delas o Oliver usaria sem retocar |
| B | captura por link com login persistente, lote, gravação, máscara | 5 telas da kz capturadas num comando, sem refazer login |
| C | aba Mockups no app (arrastar, biblioteca, editor, exportar) | Oliver arrasta um print e exporta um PNG transparente sem ajuda |
| D | animações + 3D no vídeo (frames e presets dentro do video-kit/014) | `fmt-3d-produto` usa os frames da biblioteca, sem copiar código |
| E | criar templates/fundos/animações a partir de referência | 1 template novo cadastrado a partir de um print de referência |

## Perguntas em aberto (resolver antes da fase A)
1. **Estilo-alvo:** referências de mockup que você considera "o nível" (links ou prints)? Sem isso o padrão é o preset minimalista estilo Apple da 024.
2. **Saídas prioritárias:** quais formatos usa primeiro (post 4:5, story 9:16, hero de LP 16:9, PNG transparente para anúncio)?
3. **3D:** começar com CSS 3D (leve, já validado no kit) e deixar Three.js/modelo glTF para quando precisar de reflexo físico/ângulo grande — ok?
4. **Conta demo da kz:** existe uma conta com pacientes fictícios para capturar por link? (sem ela, a fase B fica só com prints colados)
5. **Aparelhos:** molduras genéricas próprias (seguro para uso comercial) ou quer molduras realistas de iPhone/MacBook (precisa de fonte com licença)?

## Log
- 2026-10-07: registrada a pedido do Oliver (print/link → mockups profissionais, editor no app, alternativas pela IA, reuso no vídeo). Desenho: templates parametrizados + Playwright; Claude decide, script compõe.
