# V0001 · texto de voz para o ElevenLabs (Eleven v4)

**Modelo:** Eleven v4 · **voz:** um narrador só, pt-BR, a mesma nas 20 falas · **stability:** `natural` (nas falas curtas f18 e f20, gere 2–3 versões e escolha) · similarity padrão.
**Tom geral:** caloroso, próximo, leve; conversa, não locução de rádio.

**Como enviar:** um arquivo por fala, com o nome exato `f01.mp3` … `f20.mp3`, numa pasta só. Copie o texto da coluna "texto para colar" (com as tags em colchetes). Eu encaixo com `fit-vo --dir` numa versão nova, sem refazer as cenas.

| arquivo | texto para colar | fala (referência) |
|---|---|---|
| f01.mp3 | [warm, confident] Fluência em espanhol se ganha falando. | Fluência em espanhol se ganha falando. |
| f02.mp3 | Com nativos. Na hora que der. De onde você estiver. | Com nativos. Na hora que der. De onde você estiver. |
| f03.mp3 | [curious] Quantas horas por semana você quer falar espanhol? | Quantas horas por semana você quer falar espanhol? |
| f04.mp3 | [warm] Sua hora, do seu jeito: | Sua hora, do seu jeito: |
| f05.mp3 | Quatro conversas de quinze minutos, | 4 conversas de 15 minutos, |
| f06.mp3 | duas conversas de trinta minutos. | 2 conversas de 30 minutos. |
| f07.mp3 | Ou uma hora inteira, de uma vez. | Ou uma hora inteira, de uma vez. |
| f08.mp3 | Você escolhe o que cabe na sua rotina. E com quem quer falar. | Você escolhe o que cabe na sua rotina. E com quem quer falar. |
| f09.mp3 | [warm] Professores nativos que também falam português. | Professores nativos que também falam português. |
| f10.mp3 | [reassuring] Você fala como consegue… e eles entendem. | Você fala como consegue e eles entendem. |
| f11.mp3 | [warm, friendly] Você fala espanhol desde que nasceu. | Você fala espanhol desde que nasceu. |
| f12.mp3 | Agora pode ganhar com isso sem correr atrás de aluno. | Agora pode ganhar com isso sem correr atrás de aluno. |
| f13.mp3 | [confident, matter-of-fact] Você define seus horários. | Você define seus horários. |
| f14.mp3 | O aluno chega com a aula já paga. | O aluno chega com a aula já paga. |
| f15.mp3 | [relieved] Sem negociar preço. Sem cobrar ninguém. | Sem negociar preço. Sem cobrar ninguém. |
| f16.mp3 | Cancelamento com regras claras e pagamento em dia. | Cancelamento com regras claras e pagamento em dia. |
| f17.mp3 | [curious] Sobrou meia hora entre um compromisso e outro? | Sobrou meia hora entre um compromisso e outro? |
| f18.mp3 | [excited] Vira aula! | Vira aula. |
| f19.mp3 | [warm, confident] Conversação é treino. | Conversação é treino. |
| f20.mp3 | [warm, inviting] Comece com um olá. | Comece com um olá. |

## Versão contínua (um áudio só)
Se preferir gerar tudo de uma vez: um arquivo único (`v0001-voz.mp3`); eu corto por fala com `split-vo`.

```
[warm, confident] Fluência em espanhol se ganha falando. Com nativos. Na hora que der. De onde você estiver.

[curious] Quantas horas por semana você quer falar espanhol?

[warm] Sua hora, do seu jeito: quatro conversas de quinze minutos, duas conversas de trinta minutos. Ou uma hora inteira, de uma vez. Você escolhe o que cabe na sua rotina. E com quem quer falar.

[warm] Professores nativos que também falam português. [reassuring] Você fala como consegue… e eles entendem.

[warm, friendly] Você fala espanhol desde que nasceu. Agora pode ganhar com isso sem correr atrás de aluno.

[confident, matter-of-fact] Você define seus horários. O aluno chega com a aula já paga. [relieved] Sem negociar preço. Sem cobrar ninguém. Cancelamento com regras claras e pagamento em dia.

[curious] Sobrou meia hora entre um compromisso e outro? [excited] Vira aula!

[warm, confident] Conversação é treino. [warm, inviting] Comece com um olá.
```

Notas:
- Números já por extenso (f05, f06): não troque por algarismo.
- f06 começa em minúscula de propósito (continua a f05), soa como lista.
- Se alguma fala sair com som estranho, estalo ou sotaque, gere de novo só ela.
