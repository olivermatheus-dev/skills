# Crítica e implementação do carrossel (049 D)

Duas vias isoladas: o **lint** (`node tools/carrossel/check.mjs <pasta>`, sem LLM, mede) e o **crítico** (agente `revisor`, Opus, olha). Quem fez não critica; quem critica não corrige; quem corrige começa do zero (sessão limpa), lê só a crítica e os arquivos.

## O ciclo (máx. 3 rodadas)
```
v1 (designer) ─► check.mjs ─► crítica-1 (revisor, Opus) ─► implementador (designer, sessão limpa) ─► v2 ─► check ─► crítica-2 ─► …
```
1. **Render inválido = nota 0** antes de qualquer estética: `check.mjs` com ✗ de texto cortado, fonte que não carregou ou contraste → volta ao autor sem crítica.
2. Crítico escreve `critica-N.md` (N = rodada) com a **nota ponderada** (abaixo).
3. Implementador gera `vN+1/` (ver prompt). **Aceita a versão nova só se a nota da próxima crítica subir**; se não subir, a versão anterior continua a melhor (guarde-a, nunca sobrescreva).
4. Para quando: passou (média ponderada ≥ 3,0 e nenhum critério < 2) · 3 rodadas · ou a nota estagnou 2 vezes (aí leve ao Oliver as 2 melhores com as notas, e diga se a saída é **pivotar** a direção, não refinar).
5. A melhor versão vira a entrega (`carrossel.html` + `png/` + `contato.png` na raiz da peça); as outras ficam em `vN/`. Registre no log da tarefa: notas por rodada e o que foi recusado.

## Critérios (0 = falha · 1 = fraco · 2 = bom · 3 = muito bom · 4 = nível de estúdio)
Peso maior em **originalidade** e **qualidade visual** do que em craft: craft o modelo já acerta; o que reprova carrossel é ser genérico.

| # | critério | peso | pergunta | teste objetivo | eliminatório |
|---|---|---|---|---|---|
| 1 | **Originalidade** | 3 | Um gerador de template (Canva, IA) faria isto? Há uma ideia visual própria deste conteúdo? | o motivo do `slides.json` aparece e evolui nos PNG; ≥ 1 slide que só este carrossel teria | sim |
| 2 | **Qualidade visual** | 3 | Composição, escala, cor e respiro estão no nível de um estúdio (Pentagram, Collins, Linear)? | folha de contato a 20%: dá vontade de parar o scroll? cada slide tem 1 ponto focal | sim |
| 3 | **Hierarquia** | 2 | O olho sabe onde entrar, para onde ir e onde parar? | aperto de olho / 33%: 1 entrada → 1 apoio; razão âncora:apoio ≥ 2:1; ≤ 4 níveis | sim |
| 4 | **Ritmo e variação** | 2 | Os vizinhos variam com sistema (não aleatório)? Há respiro? | `check`: nenhum vizinho com mesma família, ≥ 4 famílias em 8, leve a cada 3–4, fundos ≤ 2 iguais seguidos | |
| 5 | **Camadas e detalhe** | 2 | Há profundidade (fundo → campo → card → texto → microdetalhe) e cada detalhe tem função? | 100% de zoom em 3 pontos: hairline nítida, sombra tingida, cantos concêntricos; nenhum enfeite sem função | |
| 6 | **Espaço e equilíbrio** | 2 | O vazio é respiro (intenção) ou sobra (falta)? O peso está equilibrado? | `check`: ocupação e faixa vazia; nada flutuando sem âncora na grade | |
| 7 | **Tipografia** | 2 | Escala com contraste real, quebras por sentido, entrelinha certa, sem viúva/órfã | 100%: nenhuma palavra sozinha, hifenização, título ≤ 18 caracteres por linha | |
| 8 | **Marca e cor** | 2 | Tons da escala, creme/branco, coral só em pontos, ênfase rara e alternada, BRAND.md respeitado | `check`: cor fora do brand.css, gradiente ≤ 1 local, ênfase ≤ 1/3; Proibições | sim |
| 9 | **Capa e CTA** | 1 | A capa para o scroll em 1 s e sobrevive ao recorte 3:4? O CTA é um só? | `contato.png` > grade do perfil: o título lê na miniatura; CTA único, sem "arraste" | |
| 10 | **Craft e legibilidade** | 1 | Margem, tamanhos mínimos, contraste medido, alinhamento na grade | `check` sem ✗ | sim (se houver ✗) |

**Nota ponderada** = Σ(nota × peso) ÷ 20 (0–4). **Passa** com ≥ 3,0 e nenhum critério < 2. Eliminatório com nota 0 → reprova direto.

### Severidade dos problemas
- **P0** quebra a peça (cortado, ilegível, proibição do BRAND, dado inventado) — corrige já.
- **P1** deixa genérica ou confusa (mesmo layout, hierarquia rasa, vazio sem intenção, motivo ausente) — corrige nesta rodada.
- **P2** acabamento (quebra de linha, espaçamento, sombra) — corrige se não mexer no resto.
- **P3** gosto/opção — registra, não obriga.

### Correções são DIRECIONAIS
Cada problema leva um verbo de direção + o alvo concreto: **mais quieto** (tirar camada, baixar contraste do secundário) · **mais ousado** (aumentar a escala do herói, cortar o apoio) · **destilar** (remover elemento) · **recompor** (trocar a família ou a âncora de lugar na grade) · **reescalar** (tipo) · **recolorir** (trocar o fundo por outro tom da escala) · **ligar** (fazer o motivo atravessar para o vizinho). Nunca "melhorar", "deixar mais bonito", "dar mais vida".

---

## Prompt do crítico (agente `revisor`, `model: opus`)
Troque `<pasta>`, `<slug>`, `<versão>` (ex.: `v2/` ou a raiz) e `N`.
```
Você é um diretor de arte sênior de estúdio de branding (repertório: Pentagram, Collins, editorial suíço,
Linear/Stripe/Apple marketing). Cético e ácido: seu trabalho é achar o que deixa este carrossel genérico, frouxo ou feio.
Você não viu a conversa que produziu a peça e não quer saber das intenções: julga o que está na tela.

Leia SÓ:
- os PNG em <pasta>/<versão>png/ (abra CADA um com Read, em 100%) e <pasta>/<versão>contato.png (ritmo e grade do perfil);
- <pasta>/slides.json (o plano: leitura, motivo, papel e família de cada slide);
- companies/<slug>/brand/BRAND.md (Essência, Cores, Texto, Fundo, Formas, Proibições);
- .claude/skills/carousel/references/rubrica.md (critérios, pesos, severidade);
- a saída de: node tools/carrossel/check.mjs <pasta> [--html <versão>carrossel.html]

Escreva <pasta>/critica-N.md com, nesta ordem:
1. Veredito em 1 linha + nota ponderada (0–4) + passa/não passa.
2. Tabela: critério · nota 0–4 · evidência (slide e REGIÃO: "s3, terço inferior esquerdo", "s7, canto sup. dir.").
3. "Isto é específico deste produto?" em 2 linhas (o que só a kz teria aqui; o que qualquer marca teria).
4. 3 a 5 problemas priorizados (P0→P3), cada um: slide + região → o que está errado → correção DIRECIONAL concreta
   (verbo da lista + alvo: "s4: mais quieto — tirar o card, deixar só a frase em display no terço inferior").
5. Manter (no máximo 3 itens que não podem se perder na próxima versão).

Regras: não elogie para equilibrar; não reescreva o texto do roteiro (só aponte corte de tamanho); o BRAND.md vence
a sua sugestão (nunca proponha cor fora da escala, coral em bloco grande, pastel como fundo geral, gradiente de fundo,
ênfase em mais de 1 a cada 3 slides); não proponha nada que o check acusaria. Não edite nenhum arquivo além do critica-N.md.
```

## Prompt do implementador (agente `designer`, sessão limpa, `model: sonnet`)
```
Você implementa a crítica de um carrossel. Não viu a conversa nem a crítica anterior: leia SÓ
<pasta>/critica-N.md, <pasta>/slides.json, <pasta>/<versão-atual>carrossel.html, companies/<slug>/brand/BRAND.md,
.claude/skills/carousel/references/layouts/INDEX.md e o que a crítica citar.

1. Copie a versão atual para <pasta>/v<N+1>/carrossel.html (ajuste os 2 <link> com mais um "../").
2. Aplique TODO P0 e P1. P2 só se não mexer no que a crítica mandou manter. P3: ignore.
   Discordou de algum? Recuse com o motivo em 1 linha (no fim do critica-N.md, seção "Resposta do implementador").
   Mudou família ou fundo de um slide → atualize o slides.json e rode node tools/carrossel/plano.mjs check <pasta>.
3. Renderize: node .claude/skills/carousel/scripts/render.mjs <pasta>/v<N+1>/carrossel.html
   e rode node tools/carrossel/check.mjs <pasta> --html v<N+1>/carrossel.html até zero ✗.
4. Abra cada PNG alterado com Read em 100% e compare com a versão anterior.
5. Passada final que SÓ REMOVE: tire 1 elemento que não carrega informação (um rótulo, um card, uma linha) em todo slide
   em que isso deixar a peça mais forte. Não adicione nada nesta passada.
6. Responda em 5 linhas: o que mudou por slide, o que recusou e por quê, saída do check.
Não mude o sentido do texto. Não toque em brand.css, sistema.css nem nos fragmentos de layouts/ (se o problema é do
sistema, escreva "sistema:" na resposta para o orquestrador decidir).
```

## Erros que já aconteceram (cada um virou critério)
- Origin story v1 (2026-10-07): 9 de 10 slides com o mesmo layout (texto à esquerda centralizado na vertical), ~50% vazio, zero camadas, hierarquia de 2 níveis, ritmo só pelo fundo rosa; quem fez conferiu → critérios 1, 2, 4, 5, 6 e o crítico isolado.
