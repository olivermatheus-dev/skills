# 004 — Motor de motion graphics v1 (skill base de vídeo)

**Status:** rascunho · **Depende de:** 002, 003

## Objetivo
Skill (ou conjunto pequeno de skills) que leva um pedido de vídeo a um MP4 com qualidade profissional: **briefing → roteiro → plano de cenas → animação → render → revisão**.

É o **motor** compartilhado: os formatos/mini skills (005) só descrevem *o que* fazer e chamam este motor para *como* animar e renderizar.

## Escopo (refinar após 002 e 003)
- **Briefing**: objetivo, plataforma, formato, duração, template e CTA; lê o contexto da empresa.
- **Roteiro persuasivo** e **plano de cenas** (tabela: tempo | cena | texto na tela | movimento | áudio) para o usuário aprovar antes de animar.
- **Presets globais** (timing, easing, áreas seguras, tamanhos mínimos) e uma **biblioteca de cenas/animações** reutilizáveis (título cinético, lista, número/estatística, print do produto com zoom/destaque, comparação antes/depois, depoimento, logo reveal, CTA final).
- **Templates por empresa** em `companies/<slug>/video-templates/`.
- Render + checagem (assistir aos frames-chave e conferir áreas seguras e legibilidade).

## Critérios de pronto
- [ ] Um pedido em linguagem natural gera um MP4 aprovado pelo usuário
- [ ] Trocar um texto ou uma duração = editar 1 arquivo e renderizar de novo

## Log
- 2026-10-06 — criada.
