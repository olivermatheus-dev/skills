---
name: setup
description: "Cadastra ou atualiza uma empresa: cria a pasta a partir do molde, organiza os arquivos de marca soltos em _inbox/ (logo, ícones, fotos, prints, manual), extrai os tokens visuais para o kit de marca (brand.json → brand.css) e escreve o contexto (negócio, público, voz, concorrentes, estratégia de conteúdo, copy). Use quando o usuário disser 'nova empresa', 'vamos cadastrar', 'registrar empresa', 'setup', 'configurar empresa', 'contexto da marca', 'organiza esses arquivos', 'atualizar persona', 'mudou o preço', 'mudei as cores', 'revisar contexto', ou quando outra skill não encontrar os arquivos da empresa."
---

# Setup de empresa

Objetivo: em uma conversa, sair com a empresa pronta para produzir, com **marca** (`brand/`) e **contexto** (`context/`) curtos e específicos. Contexto bom tem números, nomes e frases reais do cliente. Contexto ruim é teoria genérica.

## Estrutura (molde em `companies/_modelo/`)
```
companies/<slug>/
  context/   BUSINESS · AUDIENCE · VOICE · COMPETITORS · CONTENT_STRATEGY · COPY
  brand/     BRAND.md (regras) · brand.json (tokens) → brand.css (gerado) · logo/ icons/ vectors/ fonts/ photos/ screenshots/
  video-templates/  contents/  campaigns/  board/ (Kanban)
```

## Contexto (`context/`, máximo de palavras)
| arquivo | conteúdo | máx. |
|---|---|---|
| `BUSINESS.md` | o que é, história/fundador, estágio, modelo e preço, oferta (plano, trial, garantia), **funcionalidade → benefício → dor**, diferenciais, links, regras legais do nicho | 800 |
| `AUDIENCE.md` | 1–2 personas: rotina, dores, desejos, objeções, gatilhos, **frases literais** entre aspas, nível de consciência | 900 |
| `VOICE.md` | 3–5 traços de tom, faz/não faz, palavras usar/evitar, 2–3 exemplos antes/depois | 450 |
| `COMPETITORS.md` | tabela concorrente / preço / posicionamento / fraqueza que exploramos + nosso ângulo | 700 |
| `CONTENT_STRATEGY.md` | pilares (objetivo, % do mix, temas), mix de funil, canais/formatos, frequência, hooks que funcionaram | 550 |
| `COPY.md` | big idea, mecanismo da falha, mecanismo único, objeções → respostas, value stack, provas, CTAs por funil | 1200 |

Cada arquivo termina com `## A validar`, só com hipóteses e dados faltantes. Nada de tags de confiança campo a campo.

## Marca (`brand/`)
- `brand.json`: **mesmos nomes de token do molde** (o schema exige os que as skills usam). Troque só os valores, depois `npm run brand -- <slug>` gera o `brand.css` e o bloco do kit no `BRAND.md`. Nunca edite o `brand.css` à mão. O Oliver ajusta o resto visualmente em app → Contexto e marca → Kit de marca (preset de estilo, fazer / não fazer, ícones Lucide).
- `BRAND.md`: seções do molde (cores com papel, texto, fundo, formas, logo, imagem, movimento, vídeo, **proibições**, aprendizados). Seção vazia = vale o default das skills.
- Depois de preencher, rode `node tools/contrast.mjs companies/<slug>/brand/brand.css`. Par reprovado → ajuste `--on-primary` ou `--accent`, ou registre em BRAND.md "não usar X como texto".

## Processo — empresa nova
1. **Criar a pasta:** `cp -r companies/_modelo companies/<slug>` (slug curto, minúsculo, sem acento) — ou "Novo projeto" no app — e preencher `project.yml` (nome, descrição, segmento, site, redes). Registrar na tabela de empresas do `CLAUDE.md`.
2. **Receber arquivos.** Peça para o usuário soltar tudo em `_inbox/` ou arrastar os arquivos para o terminal, o que cola o caminho e permite copiar.
   - Imagem colada direto no chat só pode ser vista, não salva. Peça o arquivo.
3. **Triagem da `_inbox/`:** para cada arquivo, classificar → renomear → mover:
   | tipo | destino | nome |
   |---|---|---|
   | logo | `brand/logo/` | `logo-<horizontal\|vertical\|simbolo>-<cor\|branco\|preto>.svg` |
   | ícone | `brand/icons/` | `icone-<nome>.svg` |
   | vetor/ilustração | `brand/vectors/` | `vetor-<nome>.svg` |
   | fonte | `brand/fonts/` | nome original |
   | foto | `brand/photos/` | `foto-<assunto>-NN.jpg` |
   | print/gravação do produto | `brand/screenshots/` | `tela-<funcionalidade>-NN.png` |
   | manual/PDF/briefing | ler e extrair para `BRAND.md`/`context/`; guardar em `brand/` só se for referência útil | — |
   Na dúvida, mostre a imagem e pergunte. No fim, liste o que foi movido e confirme que a `_inbox/` ficou vazia.
4. **Extrair a marca:** cores e fontes de SVGs (atributos `fill`/`stroke`), do manual, do CSS do site (se houver acesso à web) ou de prints → `brand.json` (+ `npm run brand -- <slug>`) + `BRAND.md`. Mostre a paleta extraída e confirme.
   - Empresa **sem identidade**: proponha uma opção simples (1 cor de marca, 1 fonte do Google Fonts, fundo neutro), já com contraste checado. O usuário aprova.
5. **Coletar o contexto de uma vez:** peça um "despejo" livre + site, @ do Instagram, LP, prints do produto, depoimentos, preços. Leia o site e a LP antes de perguntar (SaaS: mapeie **funcionalidade → benefício → dor**).
6. **Perguntar só o que falta:** no máximo 8 perguntas, numa mensagem. Prioridade: oferta e preço, cliente ideal e dor nº 1, concorrentes, diferencial, provas, tom.
7. **Rascunhar os 6 arquivos de contexto** de uma vez. Onde não souber, coloque a melhor hipótese em `## A validar`.
8. **Revisão em 1 rodada:** resumo de 10 linhas (big idea, persona, oferta, ângulo vs concorrentes, paleta) → o usuário corrige.
9. **Checklist do que falta** (logo branco, fotos, preço final…) → tarefas no quadro `board/` da empresa (formato em `.claude/skills/orquestrar/SKILL.md`; id com `node tools/board.mjs <slug> --next-id`; `assignee: oliver`).

Funciona por partes: dá para fazer só a marca hoje e o contexto amanhã.

## Dados tipados (o app lê estes arquivos)
- **Personas:** além do resumo no `AUDIENCE.md`, 1 arquivo por persona em `personas/<id>.md` (schema `Persona`: dores, desejos, objeções, gatilhos, canais, frases, consciência 1–5).
- **Concorrentes:** os de `COMPETITORS.md` também em `competitors/<id>/competitor.md` com os links (skill `radar`).
- Ao terminar: `npm run validate` sem erro.

## Atualizar
- Mudança pontual ("mudou o preço", "mudei as cores") → edite só o arquivo afetado. Cor mudou → rode o contraste. Oferta mudou → confira `COPY.md`.
- "Revisar contexto" → leia tudo, liste o que está desatualizado ou em `A validar` e proponha as edições.
- Aprendizado de resultado:
  - post vencedor → `CONTENT_STRATEGY.md` > hooks que funcionaram;
  - objeção nova → `COPY.md`;
  - frase de cliente → `AUDIENCE.md`;
  - feedback visual do dono → `BRAND.md` > aprendizados.

## Regras
- Frases do cliente valem ouro: copie literal.
- Nicho regulado (saúde, finanças, jurídico): regras de publicidade do conselho (ex.: CFP/CRP, CFM) e LGPD em `BUSINESS.md`, e as proibições visuais em `BRAND.md`.
- Não crie arquivos fora do molde. Se algo não cabe, provavelmente não é necessário.
