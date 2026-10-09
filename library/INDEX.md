# Índice da biblioteca (gerado: não editar à mão)

> `node tools/video/blocos.mjs indice` regera. Buscar: `node tools/video/blocos.mjs buscar "<termos>" [--empresa kz] [--tipo cta] [--formato 9x16]`. Atualizado em 2026-10-09.
> Leia este índice (ou a busca) antes de criar bloco, fundo ou transição. Só abra a `preview.png` dos finalistas; o `bloco.json` só do escolhido.
> Ordem em que o vídeo acha um bloco: projeto → marca → global (o mesmo `use` no projeto vence). Promover: `blocos.mjs promover <use> --de <pasta> --para empresa|global`.

## Blocos de vídeo (tarefa 045)

19 blocos · 18 com prévia · contrato: `.claude/skills/video/references/blocos.md`.

### Globais (`library/blocos/`, só tokens: servem a qualquer empresa)

| use | o que faz | slots | cues | min s | formatos | usos | licença | prévia |
|---|---|---|---|---|---|---|---|---|
| `cta/navegador` | CTA navegador: a aba abre vazia, a URL é digitada, o cursor clica em Ir, a barra carrega com esqueleto e a pá… | titulo, url, frase | entra, digita, clique, carregando, carrega, fecha | 6 | 4x5 9x16 | 1 | própria | sim |
| `rascunho/cena-nova` | Lugar de um bloco que ainda não existe (storyboard do plano de cenas): mostra os textos da cena e o nome do b… | — | — | 1 | 4x5 9x16 16x9 1x1 | 1 | própria | — |

### Da marca kz (`companies/kz/video-templates/blocos/`)

| use | o que faz | slots | cues | min s | formatos | usos | licença | prévia |
|---|---|---|---|---|---|---|---|---|
| `abertura/pergunta-fragmentos` | Pergunta grande com selo → sobe e encolhe → a pergunta completa; 4 fragmentos da rotina se espalham | pergunta, complemento | entra, troca, espalha | 3.5 | 4x5 9x16 | 2 | própria | sim |
| `cena/caos-cards` | Caos da rotina: 3 cards (agenda, pacientes, anotações) entram tortos na palavra, ganham alerta e são arremess… | linha1, linha2, linha3 | card1, card2, card3, espalha, sai | 4 | 4x5 9x16 | 2 | própria | sim |
| `cena/tempo-encolhe` | O tempo encolhe: anel de relógio esvazia na palavra, frase de apoio, e a palavra-chave chega grande com coraç… | titulo, apoio, palavra | entra, encolhe, apoio, palavra, sai | 4 | 4x5 9x16 | 2 | própria | sim |
| `cta/cartao-final-botao` | Cartão final: logo se desenha, convite, botão com o link e cursor que clica | titulo, botao, sub, linha | entra, cta, clique | 4 | 4x5 9x16 | 2 | própria | sim |
| `fundo/blobs` | Fundo vivo: duas manchas desfocadas que derivam devagar o vídeo inteiro | — | — | — | 4x5 9x16 | 4 | própria | sim |
| `produto/painel-inicio` | Painel inicial da kz recriado nos tokens do app: entra, destaca a próxima sessão, cursor clica na lista, conf… | saudacao, nome, h1, h2, h3 | entra, destaque, lista, feito, sai | 5 | 4x5 9x16 | 2 | própria | sim |
| `revelacao/logo-pilulas` | Revelação da marca: logo se desenha, pulsa no nome, assinatura; logo sobe e 3 pílulas de benefício entram uma… | assinatura, titulo, p1, p2, p3 | entra, marca, assinatura, titulo, p1, p2, p3 | 5 | 4x5 9x16 | 1 | própria | sim |
| `virada/riscar-e-cuidar` | Virada: ícones do administrativo + frase que é riscada e sobe; a frase nova entra com coração | antes, depois | entra, risca, troca, coracao | 3.5 | 4x5 9x16 | 1 | própria | sim |

### Do projeto kz/V0002-apresentacao-pecas-da-rotina (só esse vídeo usa; promova se servir de novo)

| use | o que faz | slots | cues | min s | formatos | usos | licença | prévia |
|---|---|---|---|---|---|---|---|---|
| `cena/dia-do-terapeuta` | O dia do terapeuta: coluna de 8h a 22h com escala fixa de px/hora; as tarefas enchem os vãos entre as sessões… | titulo, apoio, palavra | entra, muda, apoio, transborda, fecho, sai | 4 | 4x5 9x16 | 2 | própria | sim |
| `revelacao/grade-estados` | Revelação da marca: as 4 peças da rotina chegam, Mensagens sai para o canto, 3 encaixam em grade 2×2 frouxa;… | assinatura, titulo, p1, p2, p3 | entra, encaixe, marca, assinatura, aproxima, titulo, p1, p2, p3 | 7 | 4x5 9x16 | 1 | própria | sim |

### Do projeto kz/V0003-apresentacao-janela (só esse vídeo usa; promova se servir de novo)

| use | o que faz | slots | cues | min s | formatos | usos | licença | prévia |
|---|---|---|---|---|---|---|---|---|
| `abertura/pergunta-sessao` | abertura/pergunta-sessao (recuperado do render) | pergunta, complemento | entra, troca, espalha | — | 4x5 9x16 | 1 | própria | sim |
| `cena/janelas-abrem` | cena/janelas-abrem (recuperado do render) | headline | entra, agenda, pacientes, notas, espalha | — | 4x5 9x16 | 1 | própria | sim |
| `cena/janelas-espremem` | Gestão espreme a Sessão para o canto; em "realmente importa" a Sessão cresce no centro e o resto apaga; janel… | headline | entra, espreme, aperta, destaca, importa, sai | — | 4x5 9x16 | 1 | própria | sim |
| `cta/cartao-janela` | cta/cartao-janela (recuperado do render) | titulo, linha, botao, sub | entra, cta, clique | — | 4x5 9x16 | 1 | própria | sim |
| `produto/painel-janela` | produto/painel-janela (recuperado do render) | saudacao, nome, h1, h2 | entra, destaque, lista, feito, sai | — | 4x5 9x16 | 1 | própria | sim |
| `revelacao/janela-unica` | revelacao/janela-unica (recuperado do render) | assinatura, frase, p1, p2, p3 | entra, marca, assinatura, rodape, p1, p2, p3 | — | 4x5 9x16 | 1 | própria | sim |
| `virada/sessao-ocupa-tudo` | virada/sessao-ocupa-tudo (recuperado do render) | antes, depois, cliente | entra, recolhe, inicia, cuida | — | 4x5 9x16 | 1 | própria | sim |

## Outros catálogos

- Áudio (trilhas, bases, SFX): `library/audio/INDEX.md` (nunca o `sfx.json` inteiro).
- Formatos de conteúdo (`fmt-*`): `library/formatos/<id>/formato.json` (app → Formatos).
- Molduras e fundos de mockup: `library/mockups/README.md`.
- Visual (ícones Lucide, mapas, bandeiras): `library/visual/README.md`; ícone: `node tools/icon.mjs --busca <termo>`.
- Componentes CSS antigos de motion: `library/motion/README.md` (o `cta/navegador` já virou bloco global).
