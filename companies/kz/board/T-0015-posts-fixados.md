---
id: T-0015
title: Os 3 posts fixados do Instagram (estratégia separada)
board: conteudo
status: review
assignee: oliver
priority: alta
due:
depends: [T-0014]
parent:
links: [campaigns/2026-10-09-posts-fixados/plano.md, contents/C0002-fixado-dor/roteiro.md, contents/C0003-fixado-promessa/roteiro.md, contents/C0004-fixado-duvidas/roteiro.md, context/CONTENT_STRATEGY.md]
context: [campaigns/2026-10-09-posts-fixados/plano.md, campaigns/2026-10-07-carta-base/carta.md, context/COPY.md#Objeções → respostas, context/COPY.md#Limitações (dizer antes da compra), context/AUDIENCE.md#Dores, context/AUDIENCE.md#Linguagem literal, context/VOICE.md, context/PRODUTO.md]
skills: [ig-post]
---

Os 3 posts que ficam **sempre fixados** no topo do perfil: os mais importantes da vitrine. Estratégia planejada à parte, com as skills de marketing (`ig-post`, `landing-page`, `carousel`, `video`).

**Regras do Oliver:** carrossel 4:5, pode ou não ter vídeo, copy muito boa, cada um direto e com **um tema só**.

**Estratégia aprovada (2026-10-09):** os 3 fixados são a carta de vendas em três atos, da esquerda para a direita: **Dor** (C0002) → **Promessa: o dia com a kz** (C0003, com slide em vídeo da Sessão Inteira) → **Dúvidas: "e se eu pagar e não usar?"** (C0004). Sem o fundador por enquanto (origem virou a ideia I-0009). Garantia de 14 dias. Plano completo: `campaigns/2026-10-09-posts-fixados/plano.md`.

## Estado
- Parou em: 3 carrosséis com 3 rodadas de crítica cada; melhor versão de cada na raiz da pasta (as outras em v1/ v2/ v3/). Notas: Dor 2,20 → 2,20 → 2,40 · Promessa 2,05 → 2,30 → 2,50 · Dúvidas 2,00 → 2,20 → 2,30. Nenhuma chegou a 3,0 (rubrica: levar as melhores ao Oliver)
- Próximo: aval do Oliver nas peças → vídeo do s7 da Promessa (tela de atendimento em uso, começando em movimento) → publicar
- Falta do Oliver: aval final; link de "pedir acesso" (T-0003); garantia vale para trimestral e anual?
- Trava antes de publicar: conferir videochamada, formulário e mensagem real da agenda do dia (s3 da Promessa) pelo lado do paciente

## Checklist

- [x] Sessão de estratégia: 3 atos (Dor · Promessa · Dúvidas), papel, consciência e sinal-alvo de cada um
- [x] Roteiro + legenda de cada um (`ig-post`, base na carta de vendas da T-0014) — v1
- [x] Roteiros revisados pelo Oliver (reembolso integral pelo suporte, FAQ com 7 perguntas)
- [x] Plano de slides dos 3 + estudo do trio de capas (aguardando aval)
- [ ] Peças 4:5 (`carousel`): montadas, em crítica isolada · slide 7 do C0003 em vídeo
- [ ] Conferências do produto (videochamada, lado do paciente, formulário) e link na legenda
- [ ] Revisão (`revisor`) e aval final do Oliver

## Comentários
### 2026-10-09 14:03 · agent:designer · revisar
Plano dos 3 fixados pronto para aval: trio de capas em campaigns/2026-10-09-posts-fixados/capas/grade.png e plano.md + wireframes.png em C0002, C0003 e C0004.

## Log
- 2026-10-07 · criada a partir do pedido do Oliver; depende da revisão da base (T-0014).
- 2026-10-09 · sessão de estratégia com o Oliver. 1ª proposta (carta · Sessão Inteira · origin story) trocada: sem fundador, foco em dor, promessa e dúvidas. Garantia de 14 dias decidida (BUSINESS, COPY e carta atualizados). Plano de copy em `campaigns/2026-10-09-posts-fixados/plano.md`; roteiros v1 em C0002–C0004; origin story → ideia I-0009. Status → review.
- 2026-10-09 · Oliver: reembolso integral pelo suporte do app (BUSINESS, COPY, carta); FAQ até 7 slides (C0004 ganhou "levo os dados?"); capas pensadas como trio. Feito: estudo das capas (escuro → coral → creme, título na mesma base, uma linha atravessa a fileira, área segura do 3:4), slides.json + plano.md + wireframes dos 3 (0 ✗). Hub: `molde` no slides.json (FAQ repete a família variando fundo/campo) e `campo` no wireframe (plano.mjs, check.mjs, contrato).
- 2026-10-09 · agent:designer · status → review · assignee → oliver
- 2026-10-09 · Oliver reprovou a v1 (capa marrom, cortes, cores e fontes fora do app). Feito: cores medidas no print do app (#ef7960 confirmado; tons 50–400, --accent e --accent-soft refeitos no brand.json → brand.css); BRAND.md: sempre claro, nada cortado, ênfase em serifa coral; memória gravada. Capas v2 no visual do app e planos v2 sem escuro, com motivo por slide e destino (contrato novo da 049).
- 2026-10-09 · Oliver: grade do perfil é 1:1 (a v2 cortava em cima e embaixo) e o "14" no círculo ficou feio. Feito: capas v3 com tudo na zona x 96–984 · y 222–1140, arraste fora do quadrado, garantia = ícone do app + 14 casas de dia; folha da grade em 1:1 e 3:4 com guias (render-trio.mjs); regra registrada no BRAND.md e na memória.
- 2026-10-09 · Oliver aprovou as capas v3. Construção: fixados.css (capa do trio + componentes do app, compartilhado pelas 3 peças); C0002, C0003, C0004 montados e renderizados, 0 ✗. Hub: check.mjs aceita exceção declarada de contraste (data-contraste="marca" em texto grande, "ui" em tela recriada) e não acusa "Todo" como TODO. Crítica 1: Dor 2,20 → implementador na v2.
- 2026-10-09 · Ciclo de crítica fechado (3 rodadas por peça, crítico Opus isolado + implementador Sonnet em sessão limpa). Promovidas as v3 dos três. Correções de fato feitas direto: horários da agenda do s3 da Promessa (Ana L. às 15:00, como na capa) e botão do CTA devolvido; s8 da Dor com os módulos reais da kz nomeados (nada de Meet/planilha dentro da kz). Críticas em critica-1..3.md de cada pasta.
