# Módulos: o que fazer e o JSON de cada um

Envelope (todo arquivo):
```json
{ "module": "<id>", "by": "claude-sonnet-5-5", "confidence": "alta|media|baixa",
  "sources": [{ "url": "https://…", "title": "opcional" }],
  "data": { … } }
```
`sources` aceita só URL http(s). Para citar o texto baixado, use a URL da página que está no topo do `site/<pagina>.md`.
Campos opcionais: omita (não use `null` em listas). Números são números (`59.9`, não `"R$ 59,90"`). Textos em pt-BR, curtos.

---

## perfis — achar os perfis oficiais
Busque `"<nome>" site oficial`, `"<nome>" instagram`, `"<nome>" youtube` etc. Ponto de partida: as redes linkadas em `site/extract.json > contacts.socials`, se já existir.
Só grave um link depois de confirmar que é a conta da empresa (bio cita o produto/site, ou o site linka para ela). Na dúvida, deixe de fora e cite em `notFound`.
```json
"data": {
  "found": [{ "platform": "site|instagram|youtube|tiktok|facebook|linkedin|x|outro", "url": "https://www.instagram.com/handle/", "handle": "handle", "note": "como confirmou" }],
  "notFound": ["tiktok"]
}
```
Formato de URL: site = só o domínio (`https://exemplo.com.br`); Instagram `https://www.instagram.com/<handle>/`; YouTube `https://www.youtube.com/@<handle>`; TikTok `https://www.tiktok.com/@<handle>`. Gravar soma os links novos ao concorrente.

## contato
Parta do `contato.json` do script (e-mails, telefones, WhatsApp, CNPJ, redes) e complete com `site/contato.md`, rodapé e, se faltar CNPJ/razão social, uma busca.
```json
"data": { "emails": [], "phones": [], "whatsapp": ["+5511999999999"], "cnpj": "00.000.000/0001-00", "companyName": "Razão Social Ltda",
  "address": "rua…", "city": "São Paulo/SP", "socials": [{ "platform": "instagram", "url": "https://…" }], "support": "chat no app, seg–sex 9h–18h" }
```

## atuacao — Brasil, internacional ou ambos
Evidências: idioma do site (`Idioma:` no .md), moeda dos preços, CNPJ/endereço, seletor de país/idioma, menção a países, domínio (.com.br).
`brasil` = só atende o Brasil · `internacional` = de fora e não atende o Brasil em pt-BR · `ambos` = atende o Brasil e outros países.
```json
"data": { "market": "brasil|internacional|ambos|desconhecido", "countries": ["Brasil"], "languages": ["pt-BR"], "currencies": ["BRL"], "evidence": "site só em pt-BR, preços em R$, CNPJ no rodapé" }
```

## resumo — poucas linhas
```json
"data": { "oneLiner": "≤ 110 caracteres: o que é e para quem",
  "text": "3–5 linhas: o que vende, para quem, como se posiciona, o que tem de diferente",
  "audience": "psicólogos clínicos solo e clínicas pequenas", "positioning": "frase de posicionamento deles (citação curta)", "size": "40 mil+ psicólogas (declarado no site)" }
```

## features — funcionalidades
Agrupe (Agenda, Prontuário, Financeiro, Comunicação/WhatsApp, Teleatendimento, Portal do paciente, IA, Marketing/Site, Gestão de equipe, Segurança/LGPD, Integrações, Outros). `highlight: true` = o que eles destacam na home. `missing` = o que é comum no setor e eles não mostram.
```json
"data": { "groups": [{ "name": "Agenda", "items": [{ "name": "Lembrete automático por WhatsApp", "detail": "confirma e remarca", "highlight": true }] }],
  "differentials": ["…"], "missing": ["videochamada nativa"] }
```

## forcas — pontos fortes e fracos
Do ponto de vista de quem escolhe o sistema (o cliente), não do nosso. `opportunities` = brechas que a nossa empresa pode explorar (leia `context/BUSINESS.md` e `context/COMPETITORS.md`). Cada ponto com evidência curta.
```json
"data": { "strengths": [{ "point": "…", "evidence": "…" }], "weaknesses": [{ "point": "…", "evidence": "…" }], "opportunities": ["…"] }
```

## precos — preços e planos
Fonte: `site/precos.md` e as linhas com preço em `site/extract.json > prices`. Se o preço não está público, `publicPrice: false`, `model: "sob-consulta"` e diga em `notes` onde procurou. Não deduza preço de anúncio antigo sem dizer a data.
- `monthly` = preço cobrando mês a mês · `yearlyMonthly` = preço mensal equivalente no plano anual · `yearlyTotal` = total do ano.
- `fromMonthly` = o menor `monthly` entre os planos pagos (ou o `yearlyMonthly` se só existir anual, e diga em `notes`).
```json
"data": { "publicPrice": true, "currency": "BRL", "model": "assinatura|freemium|por-uso|sob-consulta|comissao|gratis|outro", "fromMonthly": 59,
  "trial": "15 dias grátis, sem cartão", "guarantee": "7 dias",
  "plans": [{ "name": "Essencial", "monthly": 59, "yearlyMonthly": 49, "yearlyTotal": 588, "users": "1 profissional", "highlights": ["até 100 pacientes"], "recommended": false }],
  "extras": ["NFS-e: R$ 19/mês"], "notes": "…" }
```

### precos — modo completo (checklist da re-coleta, tarefa 043 fase D)
O `site/precos.md` estático **não basta**: use o navegador embutido (aba nova) para clicar no seletor mensal/anual e abrir "comparar planos" / "ver todos os recursos". **Nunca invente**: sem evidência na página, o campo fica vazio e a lacuna vai em `notes` (e `confidence` baixa).
1. **Páginas:** `/planos`, `/precos`, `/pricing`, bloco de preços da home, página de clínica/equipe, comparativo de planos, FAQ, termos de uso, central de ajuda (busque "limite", "mensagens", "cancelar", "reembolso"), início do cadastro/checkout (pede cartão no teste?). Registre cada uma lida em `checkedPages` (`kind` + `url`) e em `sources`.
2. **Ciclos:** grave `pageDefaultCycle` (o que a página mostra ao abrir). Clique em cada opção (mensal, trimestral, anual, bienal) e grave os valores de cada plano; ciclos além de mensal/anual vão em `otherCycles`. Nunca calcule anual a partir do mensal; se o site só mostra o total, `yearlyMonthly = total / 12` e diga em `notes`.
3. **Cada plano:** `id` (slug), `audience` (`solo|equipe`), `seats` (`included`, `max`, `unlimited`, `extraPrice`, `staff` = secretárias), `includes` com a **lista completa e explícita** (se o site diz "tudo do anterior", copie a lista do anterior, acrescente o que muda e preencha `inherits`), `limits` com número (`metric` do enum: pacientes, sessoes, profissionais, whatsapp-msgs, video-min, video-sessoes, ia-creditos, nf, cobrancas, armazenamento-gb, relatorios, outro). "Ilimitado" escrito no site → `unlimited: true`; sem informação → não grave o limite.
4. **Matriz:** leia `companies/<slug>/intel/matriz.json > features` e, para cada plano, grave em `matrix` os ids que o plano tem (`sim`) ou tem em parte (`parcial` + `note` até 50 caracteres). Só com evidência na página; cumulativo (o plano de cima repete o que herda).
5. **Promoção:** preço riscado → `regularMonthly`; rótulo e prazo → `promo { label, until }`.
6. **Extras pagos:** cada add-on em `addOns` (`name`, `price`, `unit` = mes|unico|por-uso|percentual, `per`, `planIds`, `unlocks` = ids da matriz). Taxas de cobrança (Pix, cartão) entram aqui.
7. **Condições:** `trialDays`, `trialNeedsCard`, `trialPlanId`, `refundDays` + `refundScope`, `commitment` (procure "fidelidade", "multa", "cancele quando quiser" nos termos), `paymentMethods`.
8. **Plano sem preço** ("fale com consultor") vira plano com `onRequest: true`, não texto em `extras`.
9. Mantenha `highlights` (até 3 destaques como o site mostra), `fromMonthly`, `trial` e `guarantee` em texto (compatibilidade). `extras` fica como legado.
10. No fim, em até 8 linhas, diga o que mudou em relação ao arquivo anterior (preço novo, plano novo, promo) e o que não achou. Depois: `npm run validate`.

## landing — análise da landing page (home)
Fonte: `site/home.md` > "Seções em ordem". Uma entrada por bloco visível, na ordem. Tipos: hero, logos, problema, solucao, features, como-funciona, beneficios, prova-social, depoimentos, numeros, precos, comparativo, seguranca, integracoes, fundador, faq, blog, cta, rodape, outro.
`interesting` = o que vale observar ou copiar (gancho, oferta, objeção respondida, elemento visual, garantia, comparativo, calculadora…). `tone` = como soam em 1 linha.
```json
"data": { "url": "https://…", "hero": { "headline": "…", "subheadline": "…", "cta": "Teste grátis", "visual": "print do app no notebook" },
  "sections": [{ "type": "hero", "title": "…", "summary": "1 linha" }],
  "ctas": ["Teste grátis por 7 dias"], "socialProof": ["+40 mil psicólogas", "nota 4,8 na App Store"], "interesting": ["…"], "tone": "…" }
```

## reputacao — Reclame Aqui e lojas
1. Busque `"<nome>" reclame aqui` → abra a página da empresa (reclameaqui.com.br/empresa/<slug>/). Se a página bloquear, use o que aparece no resultado da busca e diga isso em `summary`. Sem página = `found: false`.
2. Notas na App Store e Google Play (se tiver app), Google (avaliações) ou Capterra.
3. `topComplaints`: até 5 temas recorrentes das reclamações (não copie texto de cliente).
```json
"data": { "reclameAqui": { "url": "https://www.reclameaqui.com.br/empresa/x/", "found": true, "score": 8.1, "status": "Ótimo|Bom|Regular|Ruim|Não recomendada|Sem índice", "complaints": 42, "responseRate": 98, "solvedRate": 85, "period": "últimos 6 meses", "topComplaints": ["cobrança após cancelamento"] },
  "stores": [{ "store": "google-play", "rating": 4.6, "reviews": 1200, "url": "https://…" }],
  "mentions": [{ "source": "Reddit", "url": "https://…", "summary": "…" }],
  "summary": "2 linhas" }
```
