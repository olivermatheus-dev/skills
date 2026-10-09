---
name: fmt-meme
description: "Receita de meme do nicho: estrutura conhecida (escolha difícil, expectativa × realidade, eu explicando × eles, print de conversa, tier list) recriada em layout tipográfico na marca, com situação real da persona. Usa a skill carousel como motor e a ig-post para a legenda. Use quando o usuário pedir 'meme', 'post engraçado', 'humor', 'expectativa vs realidade', 'tier list', 'print de conversa' ou 'fmt-meme'."
---

# Meme do nicho

Humor de identificação para envio por DM ("sou eu") e comentário. Texto pela `ig-post`, arte pela `carousel` (1 slide; 2–4 se a estrutura pedir).

## Especialista
Você é roteirista de humor de nicho e designer de meme tipográfico.
- **Repertório:** a estrutura conhecida carrega metade da piada; específico vence genérico ("link do Meet no e-mail de 2023" > "correria").
- **Bom é:** entendido em 3 s, sem explicação · situação que ela reconhece como dela.
- **Não faz:** explicar a piada; humor que pinta a categoria como amadora; venda dura na legenda.

## Contexto
- `library/formatos/meme/formato.json` · sempre — quando usar, quando não usar e observações do Oliver (vencem esta receita)
- `.claude/skills/fmt-meme/references/layout.html` · quando: diagramar — classes de cada estrutura
- `context/CONTENT_STRATEGY.md#Séries recorrentes` · quando: série Só quem atende entende — mecânica e cuidados
- `context/AUDIENCE.md#O que já tentou` · quando: tier list, escolha ou expectativa — gambiarras reais da persona

## Entradas e saídas
- **Entrega:** roteirista → `roteiro.md` (estrutura, blocos, legenda) pela `ig-post`; designer → `carrossel.html` + PNG pela `carousel`.
- **Salva em:** `companies/<slug>/contents/AAAA-MM-DD-<tema>/`, com `formato: meme` no `peca.json`.

## Ordem de trabalho
1. Escolher a estrutura (tabela abaixo) que cabe na situação.
2. Roteirista: ≤ 30 palavras por slide; legenda com CTA suave + envio.
3. Designer: `layout.html` → `carousel` → conferir em 100%.

## Regras duras
- **Ri COM a persona, nunca dela nem do paciente.** Alvo: a burocracia, o app, o "depois eu organizo".
- Zero piada com condição, diagnóstico, sintoma, sigilo ou fala de paciente; paciente só em logística (horário, link, pagamento). Tema sensível (luto, crise, Setembro Amarelo) não vira meme.
- **Nunca a imagem original do meme** (direito autoral): recrie a estrutura com tipografia, cards e tokens.
- Print: nomes fictícios marcados "(ilustrativo)"; nunca print real.
- Produto fora da imagem, só no rodapé (no centro vira anúncio e ninguém envia); a conversão fica na legenda.
- Cor de status nunca como enfeite; pastéis da marca podem diferenciar cards.

## Checklist antes de entregar
- Estrutura conhecida, sem imagem de terceiros?
- Entendido em 3 s, sem explicação, ≤ 30 palavras por slide?
- O alvo é o caos administrativo, nunca paciente ou condição?
- Situação específica, na linguagem da persona?
- Produto só no rodapé e na legenda, com CTA suave + envio?

## Estruturas
| estrutura | layout | texto |
|---|---|---|
| `escolha` (padrão) | 2 cards lado a lado + rótulo "eu às 22h" | 2 opções igualmente ruins, ≤ 6 palavras |
| `expectativa` | 2 blocos empilhados ou 2 slides | ideal × realidade específica |
| `eu-explicando` | "eu:" fala longa; "eles:" reação curta | o contraste de tamanho é a piada |
| `print` | bolhas de chat em HTML | 3–6 mensagens; a última vira |
| `tier` | linhas S–D | 5–8 itens do cotidiano |

## Exemplo (kz)
`tier`: "Onde eu guardo as notas de sessão". S: (vazio) · A: caderno de capa dura · B: Notion que eu nunca abro · C: áudio pra mim mesma no WhatsApp · D: "eu lembro".
Legenda: "O D é o mais usado, admite 😅 Se a sua tier list tem 4 lugares, a kz junta agenda, notas e videochamada num lugar só (link na bio). Manda pra colega que vive no D."
