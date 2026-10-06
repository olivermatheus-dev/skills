# 001 — Estrutura genérica de empresa/projeto + pasta de marca + arquivos pesados

**Status:** rascunho · **Fase:** 1 · **Depende de:** —

## Objetivo
Definir **um molde único** de pasta de empresa que serve para qualquer marca nova, incluindo a pasta de marca (tokens + arquivos) e a regra do que não vai para o git.

## Contexto
O usuário quer um repo genérico, local, onde novas empresas e projetos entram a qualquer hora. Os tokens visuais precisam servir para HTML (carrossel, LP) **e** vídeo. Arquivos pesados não vão para o git por enquanto.

## Proposta inicial (validar)
```
companies/_modelo/            ← molde copiado no cadastro
companies/<slug>/
  context/                    ← os 7 .md de estratégia (já existe)
  brand/
    tokens.json               ← fonte única: cores, fontes, raio, espaçamento
    tokens.css                ← gerado do JSON (HTML/carrossel)
    BRAND.md                  ← regras de uso (substitui context/VISUAL.md)
    logo/  vectors/  icons/  fonts/  photos/  manual/
  video-templates/            ← templates de vídeo da empresa (preenchido no projeto vídeo)
  contents/  campaigns/  tasks.md
_inbox/                       ← onde o usuário solta arquivos para o Claude organizar (fora do git)
```
- `.gitignore`: `_inbox/`, `**/media/`, `**/renders/`, `*.mp4 *.mov *.wav *.psd *.ai *.fig` (manter SVG, PNG pequenos e fontes).
- Script `tokens.json → tokens.css` (Node, sem dependências).
- Convenção de nomes: `logo-<variação>-<cor>.svg` (ex.: `logo-horizontal-cor.svg`, `logo-simbolo-branco.svg`).

## Escopo
- Entra: molde, formato do `tokens.json`, script de geração, `.gitignore`, documentação no `CLAUDE.md`.
- Não entra: o fluxo de cadastro (002), migração da kz (003).

## Perguntas em aberto
- [ ] "Projetos": são subdivisões dentro de uma empresa (ex.: produto, lançamento, cliente) ou algo independente de empresa? Precisam de pasta própria (`companies/<slug>/projects/<projeto>/`)?
- [ ] Formato dos tokens: JSON simples próprio (recomendado: mais legível) ou padrão W3C Design Tokens?

## Critérios de pronto
- [ ] `companies/_modelo/` criado e documentado no `CLAUDE.md`
- [ ] `tokens.json` de exemplo + script gera `tokens.css` sem erro
- [ ] `.gitignore` cobre arquivos pesados e `_inbox/`

## Log
- 2026-10-06 — criada.
