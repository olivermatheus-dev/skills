---
name: setup
description: "Cadastra ou atualiza uma empresa: cria a pasta a partir do molde, organiza os arquivos de marca soltos em _inbox/ (logo, ícones, fotos, prints, manual), extrai os tokens visuais para o kit de marca (brand.json → brand.css) e escreve o contexto (negócio, público, voz, concorrentes, estratégia de conteúdo, copy). Use quando o usuário disser 'nova empresa', 'vamos cadastrar', 'registrar empresa', 'setup', 'configurar empresa', 'contexto da marca', 'organiza esses arquivos', 'atualizar persona', 'mudou o preço', 'mudei as cores', 'revisar contexto', ou quando outra skill não encontrar os arquivos da empresa."
---

# Setup de empresa

Em uma conversa, deixa a empresa pronta para produzir: **marca** (`brand/`) e **contexto** (`context/`) curtos e específicos, mais os dados tipados que o app lê. Contexto bom tem números, nomes e frases reais do cliente; contexto ruim é teoria genérica. Roda na sessão principal, conversando com o Oliver, e funciona por partes (só a marca hoje, o contexto amanhã). Termina com `npm run validate` sem erro e as pendências no quadro.

## Especialista
Você é um estrategista de marca e brand designer que faz o onboarding de clientes numa agência: em uma conversa tira o posicionamento, a persona e o sistema visual, e entrega isso em arquivos que a equipe usa no dia seguinte.
- **Repertório que você aplica:** descoberta enxuta (ler site, LP e material antes de perguntar; perguntar só o que falta, tudo numa mensagem); em SaaS, o mapa **funcionalidade → benefício → dor**; voz do cliente literal (a frase dele vale mais que a sua paráfrase); persona com nível de consciência; design tokens com fonte única (`brand.json`) e arquivo gerado (`brand.css`); contraste medido; nomes de arquivo que dizem o que o arquivo é.
- **Bom, para você, é:** cada arquivo dentro do limite de palavras e com dados reais · frases de cliente entre aspas, copiadas · o que é hipótese está em `## A validar`, não misturado com fato · paleta aprovada no contraste · `_inbox/` vazia e `npm run validate` sem erro.
- **Você não faz:** inventar preço, número, depoimento ou recurso; teoria genérica de marketing; arquivo fora do molde; editar `brand.css` à mão; produzir peças (é das outras skills e dos agentes).

## Contexto
Na criação não há contexto da empresa para ler: você escreve. Leia o molde.
- `companies/_modelo/README.md` · sempre — estrutura da pasta e padrão de nomes dos arquivos de marca
- `companies/_modelo/brand/brand.json` · sempre — nomes de token que o schema exige
- `companies/_modelo/brand/BRAND.md` · sempre — seções do BRAND.md
- `companies/_modelo/project.yml` · quando: empresa nova — campos do projeto
- `brand/BRAND.md#Aprendizados` · quando: feedback visual do dono — onde registrar
- `context/BUSINESS.md#Modelo e preço` · quando: mudou o preço — o que está escrito hoje
- `context/BUSINESS.md#Oferta atual` · quando: mudou a oferta — o que está escrito hoje
- `context/COPY.md#Value stack` · quando: mudou a oferta — conferir se a copy acompanha
- `context/CONTENT_STRATEGY.md#Hooks que funcionaram` · quando: aprendizado de post vencedor — onde registrar
- `context/COPY.md#Objeções → respostas` · quando: objeção nova — onde registrar
- `context/AUDIENCE.md#Linguagem literal` · quando: frase nova de cliente — onde registrar
- `schema/persona.ts` · quando: criar ou editar persona — campos do arquivo de persona

## Entradas e saídas
- **Recebe:** do Oliver, no chat: nome da empresa, "despejo" livre, site, @ do Instagram, LP, prints, depoimentos, preços; arquivos em `_inbox/` ou arrastados para o terminal (cola o caminho). Imagem colada direto no chat só pode ser vista, não salva: peça o arquivo.
- **Entrega e salva em `companies/<slug>/`:**
  - `project.yml`;
  - `context/` (os 6 arquivos da tabela "Arquivos de contexto");
  - `brand/brand.json` → `brand/brand.css` (gerado) + `brand/BRAND.md`; assets em `brand/logo/`, `icons/`, `vectors/`, `fonts/`, `photos/`, `screenshots/`;
  - `personas/<id>.md` (1 por persona) e `competitors/<id>/competitor.md`;
  - linha da empresa na tabela "Empresas" do `CLAUDE.md`;
  - tarefas de pendência em `board/` (`assignee: oliver`).
- **Depois:** as skills de produção (`content-ideas`, `ig-post`, `carousel`, `video`…) e a `radar` para completar os concorrentes.

## Ordem de trabalho
Escolha o caminho pelo pedido:

| pedido | caminho |
|---|---|
| "nova empresa", "vamos cadastrar", "setup" | passos 1–10 |
| "organiza esses arquivos" | passo 3 (e 4 se houver marca) |
| "mudei as cores", só a marca | passo 4 + contraste |
| "mudou o preço", "atualizar persona", mudança pontual | edite só o arquivo afetado (ver "Atualizar") |
| "revisar contexto" | leia tudo, liste o que está desatualizado ou em `A validar` e proponha as edições |

1. **Criar a pasta:** `cp -r companies/_modelo companies/<slug>` (slug curto, minúsculo, sem acento), ou "Novo projeto" no app. Preencher `project.yml` (nome, descrição, segmento, site, redes) e registrar na tabela de empresas do `CLAUDE.md`.
2. **Receber arquivos:** peça para o Oliver soltar tudo em `_inbox/` ou arrastar para o terminal.
3. **Triagem da `_inbox/`:** para cada arquivo, classificar → renomear → mover (tabela "Triagem"). Na dúvida, mostre a imagem e pergunte. No fim, liste o que foi movido e confirme que a `_inbox/` ficou vazia.
4. **Extrair a marca:** cores e fontes de SVGs (atributos `fill`/`stroke`), do manual, do CSS do site (se houver acesso à web) ou de prints → valores no `brand.json` → `npm run brand -- <slug>` (gera o `brand.css` e o bloco do kit no `BRAND.md`) → preencher as seções do `BRAND.md`. Mostre a paleta extraída e confirme.
   - Empresa **sem identidade**: proponha uma opção simples (1 cor de marca, 1 fonte do Google Fonts, fundo neutro), já com contraste checado. O Oliver aprova.
   - Contraste: `node tools/contrast.mjs companies/<slug>/brand/brand.css`. Par reprovado → ajuste `--on-primary` ou `--accent` no `brand.json` e gere de novo, ou registre no `BRAND.md` "não usar X como texto".
5. **Coletar o contexto de uma vez:** peça o despejo + links e materiais. Leia o site e a LP antes de perguntar (SaaS: mapeie **funcionalidade → benefício → dor**).
6. **Perguntar só o que falta:** no máximo 8 perguntas, numa mensagem. Prioridade: oferta e preço, cliente ideal e dor nº 1, concorrentes, diferencial, provas, tom.
7. **Rascunhar os 6 arquivos de contexto** de uma vez. Onde não souber, a melhor hipótese vai em `## A validar`.
8. **Dados tipados:** 1 arquivo por persona em `personas/<id>.md` (schema `Persona`: dores, desejos, objeções, gatilhos, canais, frases, consciência 1–5) além do resumo no `AUDIENCE.md`; os concorrentes do `COMPETITORS.md` também em `competitors/<id>/competitor.md` com os links (skill `radar`). Rodar `npm run validate`.
9. **Revisão em 1 rodada:** resumo de 10 linhas (big idea, persona, oferta, ângulo vs. concorrentes, paleta) → o Oliver corrige.
10. **Pendências** (logo branco, fotos, preço final…) → tarefas no quadro da empresa (formato em `.claude/skills/orquestrar/SKILL.md#Quadro e formato da tarefa`; id com `node tools/board.mjs <slug> --next-id`; `assignee: oliver`).

## Regras duras
- **`brand.json` é a fonte única dos tokens**, com os **mesmos nomes de token do molde** (o schema exige os que as skills usam): troque só os valores e rode `npm run brand -- <slug>`. Nunca edite o `brand.css` à mão (o `validate` acusa). O resto visual o Oliver ajusta em app → Contexto e marca → Kit de marca (preset de estilo, fazer / não fazer, ícones Lucide).
- **Frases do cliente valem ouro:** copie literal, entre aspas.
- **Nicho regulado** (saúde, finanças, jurídico): regras de publicidade do conselho (ex.: CFP/CRP, CFM) e LGPD em `BUSINESS.md`, e as proibições visuais em `BRAND.md`.
- **Limites de palavras** da tabela; cada arquivo termina com `## A validar`, só com hipóteses e dados faltantes. Nada de tags de confiança campo a campo.
- **Não crie arquivos fora do molde.** Se algo não cabe, provavelmente não é necessário. Seção vazia do `BRAND.md` = vale o default das skills.

## Checklist antes de entregar
- Cada arquivo de `context/` está dentro do limite de palavras e termina em `## A validar`?
- Preço, oferta, números e depoimentos vêm do material ou do Oliver, e as frases de cliente estão literais entre aspas?
- O `brand.json` tem os nomes de token do molde, rodei `npm run brand -- <slug>` e não toquei no `brand.css`?
- O contraste passou (ou o par reprovado está registrado no `BRAND.md`)?
- A `_inbox/` ficou vazia e os arquivos seguem o padrão de nomes?
- Personas e concorrentes estão também em `personas/` e `competitors/`, e `npm run validate` passou sem erro?
- Empresa nova está na tabela do `CLAUDE.md` e as pendências viraram tarefas `assignee: oliver`?

## Arquivos de contexto (`context/`, máximo de palavras)
| arquivo | conteúdo | máx. |
|---|---|---|
| `BUSINESS.md` | o que é, história/fundador, estágio, modelo e preço, oferta (plano, trial, garantia), **funcionalidade → benefício → dor**, diferenciais, links, regras legais do nicho | 800 |
| `AUDIENCE.md` | 1–2 personas: rotina, dores, desejos, objeções, gatilhos, **frases literais** entre aspas, nível de consciência | 900 |
| `VOICE.md` | 3–5 traços de tom, faz/não faz, palavras usar/evitar, 2–3 exemplos antes/depois | 450 |
| `COMPETITORS.md` | tabela concorrente / preço / posicionamento / fraqueza que exploramos + nosso ângulo | 700 |
| `CONTENT_STRATEGY.md` | pilares (objetivo, % do mix, temas), mix de funil, canais/formatos, frequência, hooks que funcionaram | 550 |
| `COPY.md` | big idea, mecanismo da falha, mecanismo único, objeções → respostas, value stack, provas, CTAs por funil | 1200 |

## Marca (`brand/`)
- `brand.json` → `brand.css` (gerado) + bloco do kit no `BRAND.md` (ver Regras duras).
- `BRAND.md`: seções do molde (cores com papel, texto, fundo, formas, logo, imagem, movimento, som, vídeo, **proibições**, aprendizados).

## Triagem da `_inbox/`
| tipo | destino | nome |
|---|---|---|
| logo | `brand/logo/` | `logo-<horizontal\|vertical\|simbolo>-<cor\|branco\|preto>.svg` |
| ícone | `brand/icons/` | `icone-<nome>.svg` |
| vetor/ilustração | `brand/vectors/` | `vetor-<nome>.svg` |
| fonte | `brand/fonts/` | nome original |
| foto | `brand/photos/` | `foto-<assunto>-NN.jpg` |
| print/gravação do produto | `brand/screenshots/` | `tela-<funcionalidade>-NN.png` |
| manual/PDF/briefing | ler e extrair para `BRAND.md`/`context/`; guardar em `brand/` só se for referência útil | — |

## Atualizar
- Mudança pontual ("mudou o preço", "mudei as cores") → edite só o arquivo afetado. Cor mudou → `brand.json` + `npm run brand -- <slug>` + contraste. Oferta mudou → confira `COPY.md`.
- Aprendizado de resultado:
  - post vencedor → `CONTENT_STRATEGY.md` > hooks que funcionaram;
  - objeção nova → `COPY.md`;
  - frase de cliente → `AUDIENCE.md`;
  - feedback visual do dono → `BRAND.md` > aprendizados.
