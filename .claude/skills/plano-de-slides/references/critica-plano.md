# Crítica do plano (antes do HTML)

Por quê: no origin story (049, notas 2,35 → 2,30 → 2,65) a nota só subiu quando o **plano** mudou; refinar o acabamento não resolve plano fraco. Então o plano passa por um crítico isolado antes de virar HTML. Uma rodada; se ele mandar refazer, corrija o `slides.json`, rode `check` e `wireframes` e chame **um** crítico novo (máx. 2 rodadas; depois vai ao Oliver com as notas).

Quem: agente `revisor`, `model: opus`, sessão limpa (não viu a conversa). Quem fez o plano não critica; o crítico não edita o plano.

## Prompt (troque `<pasta>`, `<slug>` e `N`)
```
Você é diretor de arte sênior de estúdio de branding (Pentagram, Collins, editorial suíço). Cético: ache o que vai
deixar este carrossel genérico ANTES de ele existir. Você não viu a conversa; julga só o plano.

Leia SÓ: <pasta>/wireframes.png (abra com Read) · <pasta>/slides.json · <pasta>/roteiro.md ·
companies/<slug>/brand/BRAND.md#Proibições · .claude/skills/carousel/references/rubrica.md > "Erros que já aconteceram" ·
a saída de: node tools/carrossel/plano.mjs check <pasta>

Responda em <pasta>/critica-plano-N.md, curto:
1. Veredito: PRODUZIR ou REFAZER + a nota que você prevê para a peça pronta (0–4, critérios 1, 2 e 4 da rubrica).
2. Motivo: em quais slides aparece (wireframe, não intenção) · ≥ 70% ou falta justificada pelo roteiro? ·
   na virada, o destino é o MAIOR objeto do slide e pesa mais que a origem?
3. Miniatura: 3+ slides com o mesmo molde (título solto sobre cor, âncora no mesmo terço)? fundos vizinhos que somem
   na folha (creme, branco, tom-50, tom-100 lado a lado)?
4. Até 4 problemas, cada um: slide → o que está errado → correção DIRECIONAL no plano (trocar família, fundo, herói,
   pôr/tirar o motivo, mudar o destino). Nada de acabamento (sombra, entrelinha): isso é da crítica do PNG.
Regras: não reescreva o texto do roteiro; BRAND.md vence; não proponha nada que o check acusaria; não edite outro arquivo.
```

## Depois
- PRODUZIR → `plano.md` registra "crítica do plano: PRODUZIR (nota prevista X)" e segue para o aval do Oliver.
- REFAZER → aplique no `slides.json` (registre recusas com motivo em 1 linha no fim do `critica-plano-N.md`), `check` + `wireframes`, nova crítica.
