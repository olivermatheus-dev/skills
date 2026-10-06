# 002 — Cadastro de empresa via chat

**Status:** rascunho · **Fase:** 1 · **Depende de:** 001

## Objetivo
O usuário abre o Claude Code, diz **"vamos registrar a empresa X"**, envia os arquivos que tiver, e o Claude cria a estrutura, salva cada arquivo no lugar certo, extrai os tokens e diz o que falta, sem o usuário precisar saber a organização das pastas.

## Contexto
Usuário: "eu poder enviar os arquivos direto pelo chat do Claude Code e ele já vai saber exatamente aonde salvar, o que criar, o que precisa ser feito". Há dois cenários: empresas com **identidade pronta** (logo, SVGs, vetores, ícones, manual) e empresas que serão cadastradas **do zero**.

## Como receber arquivos (limitação técnica)
- Arrastar um arquivo para o terminal do Claude Code cola o **caminho** → o Claude copia o arquivo. ✅
- Imagem colada direto no chat: o Claude **vê**, mas não consegue salvar o arquivo original. ⚠️
- Caminho principal: usuário solta tudo em `_inbox/` (ou passa o caminho de uma pasta, por exemplo um export do Drive/Figma) → o Claude classifica e move.

## Proposta de fluxo (evolução da skill `setup`)
1. Criar `companies/<slug>/` a partir do molde e registrar no `CLAUDE.md`.
2. **Triagem dos arquivos** de `_inbox/` ou dos caminhos enviados: logo, vetor, ícone, fonte, foto, manual (PDF), outros → mover e renomear pela convenção. Listar o que foi feito.
3. **Extrair tokens**: de SVGs (cores), manual em PDF, CSS do site ou prints → `tokens.json` + `BRAND.md`. Confirmar com o usuário.
4. **Contexto estratégico**: os 7 arquivos de `context/` (fluxo atual do `setup`).
5. **Checklist do que falta** (ex.: "sem logo em versão branca", "sem fonte do título") → adicionado ao `tasks.md` da empresa.
- Funciona por partes: dá para cadastrar só a marca hoje e o contexto amanhã.

## Perguntas em aberto
- [ ] Empresa sem identidade: o Claude deve **propor** uma identidade (paleta, fontes) ou apenas registrar o que existir?
- [ ] Cadastrar "projeto" segue o mesmo fluxo? (depende da resposta da 001)

## Critérios de pronto
- [ ] Teste: cadastrar uma empresa fictícia com 5–10 arquivos misturados em `_inbox/` → tudo organizado + tokens + checklist, em 1 conversa
- [ ] `_inbox/` termina vazia

## Log
- 2026-10-06 — criada.
