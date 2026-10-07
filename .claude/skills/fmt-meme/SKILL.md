---
name: fmt-meme
description: "Receita de meme do nicho: estrutura conhecida (escolha difícil, expectativa × realidade, eu explicando × eles, print de conversa, tier list) recriada em layout tipográfico na marca, com situação real da persona. Usa a skill carousel como motor e a ig-post para a legenda. Use quando o usuário pedir 'meme', 'post engraçado', 'humor', 'expectativa vs realidade', 'tier list', 'print de conversa' ou 'fmt-meme'."
---

# Meme do nicho

Humor de identificação sobre o caos administrativo da persona. Topo de funil: envio por DM ("sou eu") e comentário. Motor: `carousel` (1 slide; 2–4 se a estrutura pedir).

## Quando usar / quando não usar
- **Usar:** dor concreta e reconhecível, sexta à noite.
- **Não usar:** tema sensível (sofrimento, luto, crise, Setembro Amarelo), qualquer coisa sobre paciente, piada que precisa de explicação.

## Parâmetros
| parâmetro | default | opções |
|---|---|---|
| estrutura | `escolha` | `escolha` · `expectativa` · `eu-explicando` · `print` · `tier` |
| slides | 1 | 2–4 |
| formato | 1080×1350 | 1080×1080 |

## Estrutura (layout)
| estrutura | layout | texto |
|---|---|---|
| `escolha` (escolha difícil) | 2 cards lado a lado + rótulo "eu às 22h" | 2 opções igualmente ruins, ≤ 6 palavras |
| `expectativa` | 2 blocos empilhados ou 2 slides | ideal × realidade específica |
| `eu-explicando` | "eu:" fala longa em cima; "eles:" reação curta embaixo | o contraste de tamanho é a piada |
| `print` | bolhas de chat em HTML | 3–6 mensagens; a última vira |
| `tier` | linhas S–D com itens | 5–8 itens do cotidiano |

Classes em `references/layout.html`. **Nunca use a imagem original do meme** (direito autoral): recrie só a estrutura com tipografia, cards e tokens.

## Regras do formato
- **Ri COM a persona, nunca dela nem do paciente.** Alvo: a burocracia, o app, o "depois eu organizo".
- Nicho regulado: zero piada com condição, diagnóstico, sintoma, sigilo ou fala de paciente. Paciente só em logística (horário, link, pagamento).
- Específico ("link do Meet no e-mail de 2023") > genérico ("correria").
- Entendido em 3 s, ≤ 30 palavras por slide.
- Print: nomes fictícios marcados "(ilustrativo)"; nunca print real.
- Produto fora da imagem (só o rodapé). A conversão fica na legenda, suave.
- Pastéis da marca podem diferenciar cards/linhas; nunca cor de status como enfeite.

## Erros comuns
- Explicar a piada na imagem.
- Logo ou produto no centro (vira anúncio, ninguém envia).
- Humor que pinta a categoria como amadora.
- Legenda com venda dura.

## Exemplo (kz)
`tier`, 1 slide. Título: "Onde eu guardo as notas de sessão".
S: (vazio) · A: caderno de capa dura · B: Notion que eu nunca abro · C: áudio pra mim mesma no WhatsApp · D: "eu lembro"

Legenda: "O D é o mais usado, admite 😅 Se a sua tier list tem 4 lugares, a kz junta agenda, notas e videochamada num lugar só (link na bio). Manda pra colega que vive no D."

## Checklist do formato
- [ ] Estrutura conhecida, sem imagem de terceiros?
- [ ] Entendido em 3 s, sem explicação?
- [ ] Alvo é o caos administrativo, nunca paciente ou condição?
- [ ] Situação específica, na linguagem da persona?
- [ ] Produto só na legenda, com CTA suave + envio?
