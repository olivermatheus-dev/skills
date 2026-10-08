# Protocolo de tarefa (vale para todo agente)

Uma tarefa = um arquivo `companies/<slug>/board/T-NNNN-<slug>.md`. O arquivo é a fonte da verdade: status, checklist, comentários e log ficam **nele**.

**Ler só o necessário (021).** A tarefa declara no frontmatter `context: [context/BUSINESS.md#Modelo e preço, brand/BRAND.md#Proibições]` (arquivo#Seção, relativo à empresa ou à raiz; sem `#` = arquivo inteiro). **`node tools/board.mjs pacote <slug> <T-NNNN>`** imprime tudo o que você precisa ler: `## Estado`, descrição e checklist, comentários, as últimas linhas do log, o Estado da tarefa-mãe e **só os trechos** do `context:`. Não abra o contexto inteiro "para entender".
**Estado (≤ 5 linhas)** = onde parou · próximo passo · o que falta do Oliver. Fica logo depois da descrição e é o que quem retoma lê primeiro: `node tools/board.mjs estado <slug> <T-NNNN> "Parou em: …\nPróximo: …\nFalta do Oliver: …"` (`\n` = nova linha).

**Log × comentário.** Log (`## Log`) = trilha curta de marcos, uma linha cada. **Comentário** (`## Comentários`) = o que o Oliver precisa ler no card do app: o que você entregou, onde está, o que revisar, perguntas. Sempre pela CLI (não edite a seção à mão):
```
node tools/board.mjs comment <slug> <T-NNNN> "texto" --as agent:<nome> [--tipo revisar|pergunta] [--status review --para oliver]
```
`--tipo revisar` = peça pronta para ele conferir · `--tipo pergunta` = precisa de resposta · sem tipo = só registro. O card fica marcado "Revisar/Pergunta" até ele responder.

## Ao receber
0. Ler suas instruções permanentes: `.claude/agent-notes/<seu-nome>.md`.
1. Rodar `node tools/board.mjs pacote <slug> <T-NNNN>` (tarefa, Estado, comentários, mãe e contexto declarado). O comentário mais recente do Oliver manda. Abra o arquivo da tarefa só para editar.
2. **Contexto:** com `context:` declarado, leia **só** ele. Faltou algo essencial? Leia a seção que falta (`node tools/contexto.mjs ler <slug> <ref>`; seções: `node tools/contexto.mjs indice <slug>`) e **acrescente a ref ao `context:`** da tarefa, para quem vier depois. Sem `context:`: leia o que sua função exige (seu arquivo de agente diz) e, ao concluir, grave no `context:` as refs que de fato usou. Tarefa ligada a uma peça (`links: contents/<pasta>/…`) com `revisao.json`: rodar `node tools/review.mjs companies/<slug>/contents/<pasta>` e tratar as anotações abertas antes de produzir.
3. Mudar `status: doing`.
4. **Planejar antes de fazer:** escrever em `## Checklist` os passos da sua entrega (3–8 itens objetivos). Se faltar dado essencial que só o Oliver tem → ir direto para o **portão** (abaixo) com a pergunta.

## Durante
- Marcar `- [x]` a cada passo concluído.
- **A cada marco, atualizar o `## Estado`** (comando acima). Log passou de 15 linhas → `node tools/board.mjs compactar <slug> <T-NNNN> "resumo das antigas"` (mantém as 5 últimas).
- Uma linha de log por marco: `- AAAA-MM-DD · agent:<nome> · o que fez → caminho/do/arquivo`.
- Salvar entregas na pasta certa da empresa (`contents/…` ou `campaigns/…`) e listar o caminho em `links`.
- **Peça padrão (central Conteúdos do app):** 1 pasta por peça em `contents/AAAA-MM-DD-<tema>/` (variações em subpastas). Vídeo final em `exports/*.mp4` (versões velhas em `exports/anteriores/`), imagens finais em `png/` (1 imagem = post, várias = carrossel; ou `post.html`/`carrossel.html`; com `mockup.json` = mockup, skill `mockup`). Ficha `peca.json` (`schema/piece.ts`): ao criar a peça grave `title` legível; legenda, copy, CTA e hashtags vão em `notes` (não em arquivo solto). **Leia `notes` antes de escrever texto**: o Oliver pode ter escrito lá no app. Comentários de edição continuam em `revisao.json`.
- **Formato da peça (galeria, tarefa 027):** se `peca.json` tem `formato` (ou a tarefa cita `library/formatos/<id>`), carregue a skill do `formato.json` (`skill: fmt-*`) e leia as `observacoes` do Oliver: **elas mandam sobre a skill**. Verbete `rascunho` não tem skill: siga `essencia`, `estrutura` e as referências. Ao criar uma peça num formato, grave `formato` no `peca.json`. `node tools/review.mjs <pasta>` já mostra o formato no topo.
- **Só o orquestrador delega.** Se precisar de outro agente, registre no log `PRECISA: agent:<x> para <y>` e termine sua parte.

## Portão (precisa do Oliver)
Quando a próxima etapa depende de aval ou de dado dele:
- um comentário só, já movendo o card: `node tools/board.mjs comment <slug> <id> "<o que decidir, 1–3 linhas, com sua recomendação e os caminhos>" --as agent:<nome> --tipo pergunta --status review --para oliver` (use `--tipo revisar` quando for "confere a entrega").
- atualize o `## Estado` com a pergunta pendente e pare. O Oliver responde no card e clica **Aprovar e devolver à IA** (volta para `todo`, `assignee: ai`): quem retoma lê o último comentário dele.

## Ao concluir
- Checklist todo `[x]`, `links` e `context:` atualizados, `## Estado` final ("Entregue: … · Falta do Oliver: …"), log com o resumo de 1 linha e um **comentário** com a entrega (o que fez, caminhos, **o que não foi verificado**).
- Subtarefa: `status: done`. A tarefa-mãe quem fecha é o orquestrador (vai para `review` → `oliver`).

## Modo interativo (o Oliver está conversando com você)
Quando a sessão foi aberta com `claude --agent <seu-nome>`, o Oliver está presente. Pergunte direto em vez de usar o portão e registre no log as decisões dele. O restante do protocolo vale igual.

## Sempre
- Nunca inventar dado (preço, número, depoimento, recurso). Sem fonte = `[a confirmar]` e vira pergunta no portão.
- `brand/BRAND.md` (proibições) e regras do nicho (`context/BUSINESS.md`) são regra dura.
- Validar o quadro depois de editar: `node tools/board.mjs <slug> --check`.
