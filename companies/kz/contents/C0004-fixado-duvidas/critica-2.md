# Crítica 2 · C0004-fixado-duvidas · v2/

**Veredito:** o carrossel está limpo e correto, mas dentro do molde só a cor do campo muda. O único objeto que muda de verdade, o card de UI, é um adesivo pequeno no mesmo canto em todos os slides. **Nota ponderada 2,20 / 4 · não passa** (exige ≥ 3,0; nenhum critério ficou abaixo de 2).

Check: 0 ✗ · 27 ⚠. Os avisos de contraste em "exceção de ui/marca" são decisão aprovada. Os de âncora no terço médio em s3–s8 são consequência do molde pedido pelo Oliver e não foram contados contra a peça. O que conta é a variação dentro do molde.

## Notas

| # | critério | peso | nota | evidência (slide e região) |
|---|---|---|---|---|
| 1 | Originalidade | 3 | 2 | O motivo existe e evolui: a fila de chips no canto sup. esq. acende e vira check de s2 a s9, e a grade de 14 dias aparece em s1, s2 e s10. Mas o esqueleto (pergunta grande entre aspas em cima, resposta embaixo, divisa fixa em y 810) é um FAQ de qualquer SaaS. O que é só deste carrossel são os cards de UI no canto sup. dir. de s3–s8, e eles são pequenos demais para carregar a ideia. |
| 2 | Qualidade visual | 3 | 2 | Na folha de contato a 20%, os cards de UI de s3–s8 não se leem ("SALA DE ESPERA", "Link da sessão" viram ruído) e s3–s8 se resumem a "bloco rosa + texto cinza". Em s3–s8, a metade esq. do campo entre y 180 e 430 fica vazia sempre, do mesmo jeito. Ponto focal único em cada slide: sim (a pergunta). |
| 3 | Hierarquia | 2 | 2 | Entrada clara pela pergunta em 84 px, mas a resposta em 48 px dá razão de 1,75:1 (alvo ≥ 2:1). Em s5, s7 e s8 a resposta tem 4 linhas e ocupa quase a mesma área do título: lê como uma segunda manchete. Em s3–s8 o card de UI fica no alto, acima da pergunta, e o olho passa por ele antes da âncora sem receber nada legível. |
| 4 | Ritmo e variação | 2 | 2 | Combinações campo/resposta repetidas: s2 e s6 são idênticos (tom-200 em cima, creme embaixo); s6 e s7 diferem só 1 passo (tom-200 → tom-300 em cima) e na folha parecem o mesmo slide. Em s8 a divisa some: branco sobre tom-50 não se distingue na miniatura. s9 (trilho) e s10 quebram bem o molde. |
| 5 | Camadas e detalhe | 2 | 2 | Profundidade existe (fundo → campo → card branco com borda e sombra suave → texto). Mas o card de s6 (canto sup. dir.) é um wireframe: "Anotações" + 3 barras-esqueleto sem conteúdo, puro enfeite. Em s4, "dados ilustrativos" fica num card sem nenhum dado pessoal. |
| 6 | Espaço e equilíbrio | 2 | 2 | A diagonal card sup. dir. ↔ título inf. esq. funciona. Mas o vazio é sempre o mesmo e acontece por sobra: o quadrante sup. esq. do campo (s3–s8) e a faixa y 1080–1230 em s3, s4 e s6, onde as respostas de 3 linhas acabam em y ≈ 1070 (ocupação de 44–48%). Em s10 há um buraco de ~190 px entre o título (base y ≈ 595) e o card (topo y ≈ 787). |
| 7 | Tipografia | 2 | 2 | Escala boa e sem viúvas nas perguntas. Problemas: em s9 (terço sup.) a quebra "O que a kz não / faz, para você / saber antes:" separa "não" de "faz". O título é #2b2b2b em s4 e s7 e #50505e nos outros 5 slides do mesmo molde: na sequência, s4 e s7 parecem de outra peça, mais pesados. |
| 8 | Marca e cor | 2 | 3 | Sempre claro, coral só em pontos (chip ativo, ícones, botão do s10), sem pastel, sem gradiente. Ênfase em serifa só na capa (dentro de ≤ 1/3). O BRAND.md foi respeitado. |
| 9 | Capa e CTA | 1 | 3 | Capa no recorte 1:1 (y 135–1215): chips, card e título cabem; "não usar?" em serifa coral se lê na miniatura. CTA único em s10. |
| 10 | Craft e legibilidade | 1 | 3 | 0 ✗, 85 textos medidos. Único ⚠ não justificado: s1, apoio em 34 px (< 36). Margens de 96 px respeitadas em todos os slides. |

Σ = 6 + 6 + 4 + 4 + 4 + 4 + 4 + 6 + 3 + 3 = 44 → **44 ÷ 20 = 2,20**.

## Isto é específico deste produto?
**Só a kz teria:** a fila de chips que vira check, a sala de espera "Ana M. chegou agora" (s3), o seletor Online/Presencial (s5), "Exportar dados" na ficha (s8) e a grade de 14 dias. É a UI real respondendo à objeção.
**Qualquer marca teria:** o resto, ou seja, a pergunta grande entre aspas sobre um bloco de cor e o parágrafo embaixo. Como as provas de UI ocupam cerca de 8% do slide, o que fica na memória é o lado genérico.

## Problemas (P0 → P3)

1. **P1 · s3–s8, canto sup. dir. + quadrante sup. esq. do campo**
   - **O que está errado:** o card de UI é o único elemento deste produto e o único que muda de verdade entre as perguntas, mas tem cerca de 465 × 160–240 px, é ilegível na folha e deixa a metade esquerda do campo vazia em todos os slides.
   - **Correção (mais ousado: reescalar o card de UI para ser o herói do campo):** largura total da coluna (x 96–984), altura de ~240–300 px, entre os chips e a pergunta, na mesma posição em todos os slides para o molde continuar fixo. O texto interno vai a ≥ 36 px para ler a 20%. Se faltar altura para as 4 linhas do s6, desça a divisa de y 810 só o necessário e de forma igual em s3–s8. Não pode virar âncora móvel.

2. **P1 · s2/s6/s7/s8, campo e faixa da resposta**
   - **O que está errado:** a rotação de cor não segue um sistema. s6 repete s2 e quase repete s7. Em s8, o branco sobre tom-50 apaga a divisa do molde.
   - **Correção (recolorir com um ciclo legível; "↑" = cor no campo de cima, "↓" = cor na faixa de baixo):**
     - s2 ↑ tom-200 / creme
     - s3 ↑ tom-100 / branco (leve)
     - s4 ↑ tom-300 / creme
     - s5 branco / ↓ tom-200
     - **s6 ↑ tom-100 / branco** (leve: faz par com o s3 e dá um respiro a cada 3)
     - s7 ↑ tom-300 / tom-50
     - **s8 branco / ↓ tom-200** (a faixa de baixo passa a se ler e prepara o tom-200 do s9)
   - Só s6 e s8 mudam. Depois, rodar o check e conferir que não aparece ⚠ de fundos vizinhos com ΔL* < 4.

3. **P1 · s3–s8, faixa da resposta (y 880–1140)**
   - **O que está errado:** a resposta em 48 px contra a pergunta em 84 px dá 1,75:1, e com 4 linhas (s5, s7, s8) ela disputa a entrada com a pergunta.
   - **Correção (reescalar a resposta para 40–42 px):** chega a ≥ 2:1 e fica acima dos 36 px mínimos. Manter a palavra de abertura em negrito ("Não.", "Serve.", "Leva."). O espaço que sobra embaixo deve ir para o card do item 1, não ficar vazio.

4. **P2 · s6 e s4, card de UI no canto sup. dir.**
   - **O que está errado:** no s6, "Anotações" + 3 barras-esqueleto é um placeholder de wireframe e não prova nada. No s4, "dados ilustrativos" fica num card que não tem dado de pessoa.
   - **Correção (destilar):**
     - s6: trocar as barras-esqueleto por um elemento real da tela de anotações do app. Conferir no `PRODUTO.md` ou nos screenshots e não inventar campo. Se não houver, tirar as barras e deixar só o cabeçalho "Anotações" com o ícone.
     - s4: remover a linha "dados ilustrativos". Ela continua obrigatória no s3, onde há "Ana M.".

5. **P2 · s9 terço sup. e s4/s7 título**
   - **O que está errado:** a quebra "não / faz" no s9. O título em #2b2b2b só no s4 e no s7 parece outra peça.
   - **Correção:**
     - **Reescalar o s9** (ajustar a medida ou o tamanho do título) para quebrar por sentido, com "não faz" na mesma linha. O texto não muda.
     - **Recolorir o título do s4 e do s7** para o mesmo tom dos outros 5 slides do molde, se o `contrast.mjs` sobre tom-300 aceitar (título ≥ 64 px pede 3:1). Se não aceitar, assumir #2b2b2b como regra fixa de "campo tom-300" e registrar isso no molde do `slides.json`, para que a diferença seja do sistema e não pareça acaso.

## Manter
- A fila de chips que acende e vira check de s2 a s9, sempre no mesmo lugar (canto sup. esq.).
- A grade de 14 dias como fio entre capa, s2 e CTA.
- A resposta que abre com o veredito em negrito ("Não." / "Serve." / "É." / "Leva.").

## Resposta do implementador (v3/)
- Aplicados P1 (card de UI em largura de coluna, 256 px, texto interno ≥ 36 px, mesma posição em s3–s8; divisa do molde em 66% em s3–s8; recolor s6 branco/tom-100 e s8 tom-200/branco; resposta 42 px) e P2 (s6 abas reais Anotações/Histórico/Cliente da tela de atendimento no lugar das barras; "dados ilustrativos" removido do s4; s9 quebra "O que a kz / não faz, para você / saber antes:"; título s4/s7 em --text, 4,86:1 sobre tom-300).
- Recusado: nada. Poda final: removido o rótulo "Atendimento" do card do s5 (sem informação). Capa e família do molde intactas.
- Check v3: 0 ✗ · 19 ⚠ (contraste ui/marca aprovados, âncora do molde, s2 45 palavras, s9 39 palavras: já existiam).
