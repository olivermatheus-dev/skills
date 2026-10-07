# 025 — Ficha de produção da peça (briefing, status, custo em tokens, observações)

Status: rascunho · Depende de: central de peças (feita em 2026-10-07: `peca.json`, aba **Ficha** em Conteúdos) · Liga com: 011 (A/B de custo), 012 §5 (ficha de pauta), 027 (galeria de formatos)

## Objetivo
Cada vídeo/carrossel/post tem **um arquivo** com tudo que a gente precisa para gerenciar a peça. O Oliver vê e edita no app, e a IA lê e preenche. Esse arquivo é o `peca.json`, que já existe: esta tarefa amplia ele em vez de criar outro.

## O que entra (amplia `schema/piece.ts`)
- **Briefing:** headline, tema, objetivo (atrair · educar · converter · reter…), formato (`fmt-*`, vindo da galeria 027), persona, plataforma(s), duração/proporção, CTA, nível de edição.
- **Status de produção** (um só funil, substitui o status solto do `revisao.json`): ideia → roteiro → produção → revisão → aprovado → publicado (+ arquivado).
- **Custo:** lista de rodadas `{ data, etapa, sessão, modelo, esforço, tokens entrada/saída/cache, US$, duração }` com total por peça. Mostra no card e na ficha.
- **Metadados:** versão principal, duração real, formatos exportados, voz, trilha (e licença), skills/agentes usados, commit.
- **Observações do Oliver:** já existe o campo "Notas". Falta o histórico com data (o que mudou de v1 para v2 e por quê).
- **Resultado depois de publicar:** views, salvamentos, compartilhamentos e comentários, à mão no começo e depois pelos coletores (023).

## Medir tokens automaticamente (a parte difícil)
- Fonte: os transcripts do Claude Code (`~/.claude/projects/<repo>/<sessão>.jsonl`). Cada mensagem traz `usage` e os subagentes ficam em arquivos próprios. Script `tools/usage.mjs <sessão|--since> --piece <pasta>`: soma por modelo, converte em US$ pela tabela de preços e grava a rodada no `peca.json`.
- Regra para os agentes: ao fechar uma etapa da peça, rodar o script (ou o orquestrador roda no fim).
- Validar com o A/B (011): os números do script têm que bater com o uso da sessão no app.

## Critérios de pronto
- [ ] Schema ampliado + `npm run validate` + migração das peças atuais
- [ ] Ficha no app com briefing, funil de status (filtro e coluna na lista), custo e histórico de observações
- [ ] `tools/usage.mjs` grava o custo real de uma sessão (com subagentes) numa peça
- [ ] Skills `video`/`carousel` e o protocolo preenchem o briefing ao criar e o custo ao fechar

## Log
- 2026-10-07: registrada a pedido do Oliver ("arquivo por vídeo com tokens, metadados, observações, status, headline, tema, objetivo").
