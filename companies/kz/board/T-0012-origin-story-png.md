---
id: T-0012
title: PNG do carrossel da origin story
board: conteudo
status: review
assignee: oliver
priority: media
due:
depends: [T-0011]
parent: T-0009
links: []
context: [brand/BRAND.md, contents/2026-10-07-origin-story/roteiro.md, brand/logo/kz-logo.svg]
---

Diagramar e exportar o carrossel a partir de companies/kz/contents/2026-10-07-origin-story/roteiro.md.

## Estado
- Parou em: RASCUNHO exportado (10 PNG tipográficos, sem nome/foto) em contents/2026-10-07-origin-story/png/; não publicar
- Próximo: aval do Oliver no visual; depois da T-0011, pôr o nome na assinatura do slide 9 (+ foto, se houver) e reexportar
- Falta do Oliver: aval do rascunho, nome público e foto (T-0011)

## Checklist
- [x] Outline (RASCUNHO, tipográfico, sem nome/foto):
  | # | tipo | texto |
  |---|---|---|
  | 1 | capa | Eu também queria só **atender**. / Por que um terapeuta construiu a kz → |
  | 2 | texto (2ª capa) | Sou hipnoterapeuta. Atendo pacientes **até hoje**. / E por muito tempo meu consultório viveu espalhado em 5 apps. |
  | 3 | lista (cards + ícone Lucide) | Agenda num app · Conversa no WhatsApp · Sessão no Meet · Notas no caderno · Perfil num site |
  | 4 | frase grande | No fim do dia, eu não estava cansado de atender. / Estava cansado de **gerenciar**. |
  | 5 | texto | Achei que era **desorganização** minha. / Então fui perguntar a colegas terapeutas. |
  | 6 | lista de 3 | Ouvi a **mesma** dor, de novo e de novo: organizar a rotina; lembrar dos agendamentos; documentar as sessões. |
  | 7 | frase · inverse | Não era a gente que era desorganizado. / Era o jeito de trabalhar… uma tela só. |
  | 8 | texto + dado | Então decidi construir esse **lugar**. / Um sistema só… 2 anos… uma terapeuta no time… |
  | 9 | citação + assinatura | Uma regra desde o começo: se uma feature **complica**, não entra. / Hipnoterapeuta e fundador da kz (nome omitido) / Feito por *terapeuta*, pra terapeuta. |
  | 10 | CTA · inverse | E você: quantos apps abre pra fazer uma sessão? / [Comenta o número.] |
- [x] carrossel.html (template carousel + brand.css)
- [x] Render 10 PNG em contents/2026-10-07-origin-story/png/
- [x] Conferência de cada PNG (corte, área segura, 3:4 da capa, contraste, proibições)
- [ ] Versão final: nome público na assinatura do slide 9 (+ foto, se houver) após T-0011

## Comentários
### 2026-10-08 16:16 · agent:designer · revisar
RASCUNHO pronto (não publicar): 10 PNG 1080×1350 em contents/2026-10-07-origin-story/png/. Tipográfico, sem foto; texto do roteiro sem cortes. Slide 9: nome omitido, assinatura ficou 'Hipnoterapeuta e fundador da kz'. Slides 7 e 10 em fundo rosa (inverse) com a logo em grafite (coral no rosa reprovava contraste). Para revisar: tom visual geral, ícones Lucide no slide 3 (agenda, balão, câmera, caderno, globo) e a capa só tipográfica. Para a versão final: nome público (e foto, se houver) da T-0011.

## Log
- 2026-10-07 · orquestrador · criada a partir da T-0009
- 2026-10-08 · orquestrador · liberada como RASCUNHO antes do aval da T-0011 (decisão do Oliver): tipográfico, sem nome nem foto, não publicar; teste da 021 (só o context:)
- 2026-10-08 · agent:designer · RASCUNHO exportado: 10 PNG 1080×1350 em contents/2026-10-07-origin-story/png/ (NÃO PUBLICAR). Texto do roteiro sem cortes; slide 9: "[Nome público]," omitido, assinatura ficou "Hipnoterapeuta e fundador da kz". Contraste: texto #50505e/creme 7,3:1; ênfase #d66954 só em título ≥80px (3,2:1); ink/rosa 11,3:1; logo coral no rosa 2,57:1 → logo em ink nos slides inverse (7 e 10). Ícones Lucide (calendar, message-circle, video, notebook-pen, globe), sem logos de terceiros.
- 2026-10-08 · agent:designer · lido além do context: (021): template .claude/skills/carousel/references/template.html (base obrigatória do HTML), grep em brand/brand.css (nomes de tokens: --inverse-bg, fontes), brand/logo/kz-logo.svg (path do logo para o rodapé; somado ao context:), peca.json de 2026-10-07-apresentacao-kz (só o formato do JSON). Não lidos: protocolo.md, frame.md, VOICE.md (context: declarado bastou).
- 2026-10-08 · agent:designer · status → review · assignee → oliver
