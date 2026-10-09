# Molde da ficha de agente e de skill (048)

Todo agente (`.claude/agents/<id>.md`) e toda skill (`.claude/skills/<id>/SKILL.md`) seguem o mesmo molde. O app abre os dois como **ficha** (formulário em campos); "Editar o arquivo" mostra o markdown cru, que é o mesmo arquivo. Leitor e gravador: `tools/lib/ficha-agente.mjs`. Conferência: `node tools/agentes.mjs check` (também no `npm run validate`).

## Frontmatter (o que o Claude Code lê)
| campo | agente | skill | para quê |
|---|---|---|---|
| `name` | ✓ | ✓ | id; não muda pelo app |
| `description` | ✓ | ✓ | **Quando usar**: o orquestrador decide a quem delegar / o Claude decide carregar a skill. O que faz + frases que disparam |
| `model` | opcional | — | `haiku` pontual, `sonnet` específico, `opus` análise e revisão; vazio = herda |
| `color` | ✓ | — | cor no app |
| `skills` | ✓ | — | skills ativadas (o app liga/desliga) |
| `tools` | opcional | — | vazio = todas |

## Corpo
```
# <Título>
<abertura: 1–3 linhas, o que este agente/skill entrega e onde termina o papel dele>

## Especialista
## Contexto
## Entradas e saídas
## Ordem de trabalho
## Regras duras          (opcional)
## Checklist antes de entregar
<outras seções: referência própria da skill, ex.: Formatos, Handoff>
```
Títulos exatos (o leitor reconhece por eles). Seções fora do molde continuam valendo e ficam depois.

### Especialista (a peça central)
Escrito em 2ª pessoa, curto e concreto. Responde:
1. **Quem é e em que nível**: o ofício e a régua (ex.: "copywriter de resposta direta que escreve para saúde regulada").
2. **Repertório**: escolas, autores, padrões do ofício que ele aplica de verdade (só o que muda a decisão; nada de lista de nomes decorativa).
3. **O que considera bom**: 3–5 critérios que ele usa para julgar o próprio trabalho.
4. **O que não faz**: limites do papel (o que é de outro agente) e vícios do ofício que evita.

### Contexto
Os arquivos e seções **exatos** que precisa ler. Ninguém procura nada: se não está aqui (ou no `context:` da tarefa), não precisa.
```
- `context/COPY.md#Objeções` · sempre — objeções a responder no texto
- `knowledge/video/REGRAS.md#Arco` · quando: vídeo — limite de palavras por duração
- `context/AUDIENCE.md#Linguagem literal` · sempre · só: roteirista — frases da persona
```
- **Ref** = mesmo formato do `context:` das tarefas (021): `arquivo#Seção`. Relativa à empresa (`context/`, `brand/`, `contents/`…: vale para **toda** empresa; o agente lê a do projeto da tarefa) ou à raiz (`knowledge/…`, `.claude/skills/<id>/references/…`).
- **Prefira a seção** ao arquivo inteiro. Arquivo inteiro só quando é curto e tudo serve.
- **sempre** = entra no pacote da tarefa, já com o texto. **quando: <condição>** = vai para o índice do pacote; o agente lê só se a condição valer.
- **só: a, b** (apenas em skill usada por mais de um agente) = quem lê aquele item. Sem `só:` = todos que usam a skill.
- O `— para quê` diz o que tirar dali: é o que impede leitura à toa.
- Não precisa de nada? Escreva `Nenhum: <motivo>` no lugar da lista.

### Entradas e saídas
Recebe (de quem, em que arquivo) · Entrega (o quê, em que formato) · Salva em (caminho) · Próximo passo (quem pega depois).

### Ordem de trabalho
Passos numerados, na ordem. Decisões que dependem do pedido viram tabela "pedido → ordem".

### Regras duras
Só o que é específico deste agente/skill. As regras de todos (não inventar dado, proibições da marca, nicho) já estão no protocolo e não se repetem.

### Checklist antes de entregar
Perguntas de sim/não, verificáveis olhando a entrega. 4–8 itens.

## Como o contexto chega ao agente
`node tools/board.mjs pacote <slug> <T-NNNN>` junta, sem repetir: o `context:` da tarefa + o **Contexto "sempre" da ficha do agente** + o das **skills da tarefa** (`skills: [ig-post]` no frontmatter da tarefa; só os itens que valem para o agente). Itens "quando:" e as skills ativadas que a tarefa não citou entram como índice.
Ver o que um agente lê: `node tools/agentes.mjs contexto <agente> [--skill a,b] [--ler]`.

## Revisão no molde (ondas)
Onda 1 (mais usadas): roteirista + `ig-post` · editor-de-video + `video` + `plano-de-cenas` · designer + `carousel`. Depois as demais, em ondas. Cada ficha: subagente Opus revisa (papel de especialista, contexto exato, ordem, checklist) → `node tools/agentes.mjs check` → aval do Oliver.
