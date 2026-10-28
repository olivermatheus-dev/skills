# V0001 · ajustes da v04 (pedido do Oliver, 2026-10-28)

Base: v03 (`exports/V0001-4x5-v03.mp4`, 82,06 s, `versoes/v03/`). Só 4:5. Os tempos citados são da v03.
Respostas do Oliver (2026-10-28):
- Narração em espanhol a partir da cena do professor. Por ora, voz de rascunho grátis. Ele manda o áudio final do ElevenLabs depois.
- A fala de 1:11 é traduzida.
- "Empieza con un olá." é narrada.
- A voz lê os 4 cards.

## Falas da v04

**Mantidas (Carla, `audio/vo/`):**
- f03 "Quantas horas por semana você quer falar espanhol?"
- f04 "Sua hora, do seu jeito:"
- f08 "Você escolhe o que cabe na sua rotina. E com quem quer falar."

**Saem:**
- f01 e f02: a cena 9–17 s sai.
- f05, f06, f07, f09, f10, f11 a f20.

**Novas (rascunho):** voz Windows Maria (`win-maria`) para PT. Para ES, Windows não tem voz em espanhol instalada (só Maria pt-BR e Zira en-US), então o rascunho é edge-tts grátis `es-CO-SalomeNeural` (registre em `library/voices/voices.json` como `edge-salome`).

| id | texto |
|---|---|
| f05 | Uma hora inteira, de uma vez. |
| f06 | Duas conversas de trinta minutos. |
| f07 | Ou quatro conversas de quinze minutos. |
| f09 | Todos eles são professores nativos que também falam português. |
| f10 | Não precisa ter medo de travar, eles te ajudam! |
| f11 | ¡Ahora podrás dar clases de conversación en tu tiempo libre! |
| f12 | El español de tu día a día es valioso para quien está aprendiendo. |
| f13 | Sin preocuparte por elaborar clases complicadas. |
| f14 | No necesitas buscar alumnos ni negociar, |
| f15 | ni preocuparte por cobros o cancelaciones. |
| f16 | Tú escoges tus horarios disponibles. |
| f17 | ¿Te sobra media hora entre un compromiso y otro? |
| f18 | ¡Conviértela en clase! |
| f19 | ¡Puedes comenzar ahora! |
| f20 | Empieza con un olá. |

## Ajustes por cena (tempos da v03)

1. **s02 (≈5 s): personagens.** Diminuir o personagem do estudante.
2. **s02 (≈8 s): hover nos cards.**
   - O cursor passa mais rápido entre os cards.
   - No hover, nada de balançar para a esquerda e para a direita: o card cresce um pouco e o personagem dá um pulinho suave.
3. **s03 (8,6–16,7 s): sai inteira.** Logo depois que o cursor clica no card do aluno, já começa a explicação (f03, antiga s04).
4. **s05 (≈18–37 s): "Sua hora, do seu jeito".**
   - Cada palavra surge de baixo, suave, no momento em que é dita (âncora por palavra).
   - Divisões da hora mais rápidas: pausa menor entre elas.
   - Os números das divisões ficam centralizados.
   - **Ordem nova:** 1×60′ → 2×30′ → 4×15′.
   - Assim que cada aula se encaixa no calendário, aparece a foto de perfil com a bandeira do professor:
     - 60′: Colômbia;
     - 30′: os dois da Argentina;
     - 15′: Argentina, Argentina, Colômbia e México.
   - Objetivo: mostrar que dá para escolher mais de um professor. A f08 se mantém.
   - No fim, o cursor só arrasta **uma** das aulas de 15′ para outro dia.
5. **s06 (≈39 s): prova.**
   - Frase f09 nova.
   - **4 cards** (2 em cima, 2 embaixo), cada um surgindo de cima para baixo, um depois do outro, rápido.
   - Depois, 3 cards somem e o primeiro vira uma **videochamada**: o professor no retângulo grande, o aluno no pequeno.
   - Sem chat: surgem **bolhas de conversa em cada retângulo**. Primeiro a do aluno, "Ayer fui al…"; logo em seguida a do professor, "Pode falar em português que eu te ajudo!".
   - Narração f10 nova.
   - **Remover o personagem de bigode** desta cena.
6. **s07 (≈47 s): escolha do professor.** Tirar o vaivém do cursor entre os dois cards: ele vai direto clicar no card do professor, sem demora.
7. **s08 (≈52 s): intro do professor, tudo em espanhol.**
   - O card verde vira **dois retângulos**.
   - O 1º entra **pela esquerda**, com a f11 no topo e o personagem do professor.
   - O 2º entra **pela direita**, com a f12 e o personagem do aluno. Logo em seguida surge uma bolha de conversa sobre o aluno, com um coração.
   - Os dois retângulos saem na direção oposta à que entraram, e começa a s09.
8. **s09 (≈58 s): 4 cards em espanhol, f13–f16, nesta ordem.**
   - Cada card com o ícone Lucide correspondente ao tópico.
   - Mantém o jeito de ilustrar o que se fala.
9. **s10 (≈1:11): relógio.**
   - O relógio vai dentro de um **círculo verde em cima** do bloco "aula · 30 min", não ao lado.
   - Falas f17 e f18 em ES.
10. **s11 (≈1:16): cena final.**
    - **Cards do aluno e do professor:**
      - Os dois não aparecem ao mesmo tempo: cada um entra em **tela cheia**, como card único.
      - 1º, o **aluno**: fundo vermelho (coral da marca), card branco, personagem centralizado, setinha dentro de um **retângulo** (não um círculo).
      - O card sai para a **direita** enquanto o do **professor** entra pela **esquerda**. Os dois aparecem ao mesmo tempo na transição.
      - 2º, o professor: fundo verde, card branco, personagem centralizado, setinha em retângulo.
      - A f19 "¡Puedes comenzar ahora!" é dita **durante a troca**. Cena rápida, com a duração da fala.
      - Nesse momento os personagens **flutuam**: sobem e descem de leve.
      - "Conversação é treino" sai.
    - **Encerramento:**
      - "Empieza con un olá." (f20) entra com uma animação **diferente**, de encerramento.
      - Um cursor aparece e clica no **"olá" sublinhado**.
      - A partir desse olá **se expande** o link `ola-espanhol.com.br`, dentro de um retângulo de bordas arredondadas.
      - O logo surge em cima, sutil, fechando.

## Regras
- Dobras e Proibições do `brand/BRAND.md` (regra dura).
- Padrões de vídeo do Oliver: frase inteira, nada vazio, card opaco.
- Trilha:
  - Mantém o pedido da v03: um pouco mais alta só na abertura, depois baixa e constante até o fim, sem subir entre as falas.
  - Ajustar os níveis aos tempos novos.
- Saída: `exports/V0001-4x5-v04.mp4` + `versoes/v04/`, com `qc.mjs --sheet` limpo.
- Não commitar.
