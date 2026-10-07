# 023 — Análise de concorrentes por módulos (site, preços, features, LP, Reclame Aqui) + fila da IA

Status: feita (v1, com os 10 concorrentes da kz analisados) · Depende de: 018 · Liga com: 012 (motor de ideias), skill `radar`
Pedido do Oliver em 2026-10-07: rodar o radar nos 10 concorrentes; anotar features, pontos fortes e fracos, preços e planos, análise da landing page (seções e o que tem de interessante), contato, sitemap básico, Reclame Aqui e onde atuam (Brasil × internacional). Tudo preparado para rodar de novo, pontual (marca só o que quer) ou completo (1x, ao aceitar um concorrente), sem gastar token à toa. Script no que é mecânico; LLM (subagentes Sonnet) no que exige inteligência.

## Como funciona
- **Módulos** (`schema/analysis.ts > MODULES`): perfis · site (+sitemap) · contato · atuacao · resumo · features · forcas · precos · landing · reputacao · redes. Cada um grava `competitors/<id>/analysis/<modulo>.json` validado por schema.
- **Script** (`tools/intel/site.ts`, Playwright): baixa home + páginas-chave (preços, recursos, sobre, contato, FAQ), clica no alternador Mensal/Anual, monta o sitemap (sitemap.xml ou links), extrai contatos/CNPJ/redes e as seções da home em ordem → `site/*.md` + `extract.json` (fora do git). **Reclame Aqui** (`tools/intel/reclameaqui.ts`): pela busca do RA (a página da empresa tem Cloudflare), confirmando pelo domínio.
- **IA**: skill `analise-concorrentes` → 1 subagente Sonnet por concorrente lê só o texto extraído e grava com `npm run analise -- salvar`.
- **App**: aba **Análise** no concorrente (marcar módulos → script roda na hora, IA vai para `pedido.json`; cartões por módulo; anotação por módulo e geral em `notas.json`, que a IA nunca sobrescreve) · Concorrentes → **Comparar** (tabela) · filtro **onde atua** · **Candidatos** (radar → aceitar = análise completa na fila; recusar = arquivar).
- **Terminal**: `npm run analise -- fila|site|ra|pedir|salvar|feito|status kz`.

## Pendências
- **Instagram**: coleta com views precisa de `APIFY_TOKEN` (app → Configurações) ou cookies do navegador.
- **Coletor de anúncios** (Biblioteca de Anúncios da Meta): não existe; o módulo `perfis` só guarda links de Facebook/LinkedIn/X/lojas.
- **Reclame Aqui**: buscas seguidas demais → Cloudflare bloqueia por alguns minutos (o script avisa; tente de novo depois). As reclamações recorrentes (`topComplaints`) ainda não são lidas (página da empresa bloqueada).
- **Reanálise agendada** (ex.: preços a cada 30 dias) via `board/recorrentes.json`: não configurada.

## Log
- 2026-10-07: schema, store, API, script de site (Playwright), Reclame Aqui por busca, CLI `analise`, skill `analise-concorrentes`, radar com candidatos, aba Análise, tabela Comparar. Rodado nos 10 concorrentes: perfis + reputação (5 Sonnet), site (script), 7 módulos de leitura (5 Sonnet), coleta das redes. Achado no caminho: o alternador Mensal/Anual enganava a leitura de preço (PsicoManager: R$ 89 era o anual; mensal = R$ 109) → script passou a clicar no alternador e os preços foram refeitos.
