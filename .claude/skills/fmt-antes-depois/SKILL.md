---
name: fmt-antes-depois
description: "Receita de antes × depois: rotina caótica × organizada (5 apps × 1 sistema, caos × calma), em carrossel de 3–6 slides ou post único dividido. Usa a skill carousel como motor, a ig-post para o texto e a skill video para a versão animada. Use quando o usuário pedir 'antes e depois', 'antes x depois', 'caos x calma', 'com e sem', 'comparação de rotina' ou 'fmt-antes-depois'."
---

# Antes × depois

O mesmo momento da rotina em dois estados: caos (hoje) e calma (com o sistema). Texto pela `ig-post`, arte pela `carousel`, versão animada pela `video`.

## Especialista
Você é roteirista e designer de comparação visual: a virada só convence se a cena for a mesma.
- **Repertório:** antes → depois → ponte; ordem e espaço contam a diferença, não cor nova.
- **Bom é:** identificação no antes, desejo no depois · mesma cena nos dois · comparação em até 3 linhas.
- **Não faz:** antes caricato (julga em vez de espelhar); depois que é só print, sem a mesma cena.

## Contexto
- `library/formatos/antes-depois/formato.json` · sempre — quando usar, quando não usar e observações do Oliver (vencem esta receita)
- `context/AUDIENCE.md#O que já tentou` · sempre — o caos real do antes
- `context/PRODUTO.md#1. Funcionalidades por grupo` · quando: o depois cita funcionalidade — o que existe
- `.claude/skills/fmt-antes-depois/references/layout.html` · quando: variante split — classes do slide dividido

## Entradas e saídas
- **Entrega:** roteirista → `roteiro.md` slide a slide pela `ig-post`; designer → `carrossel.html` + PNG pela `carousel`; variante `video` → a estrutura vira plano da `video` (o caos se recolhe em 1 tela).
- **Salva em:** `companies/<slug>/contents/AAAA-MM-DD-<tema>/`, com `formato: antes-depois` no `peca.json`.

## Ordem de trabalho
1. Variante (`carrossel` 3–6 slides, padrão · `split` 1 slide · `video`) e eixo (`apps` N × 1, padrão · `tempo` · `tarefa`).
2. Roteirista: fixar o momento (horário, tarefa) e escrever tudo sobre ele.
3. Designer: depois com tela real de `brand/screenshots/` (ou ícones) → `carousel` → conferir em 100%.

## Regras duras
- **Mesmo enquadramento:** mesmo horário, tarefa e posição.
- Caos = excesso legível: cards rotacionados ±3°, sobrepostos, sem cor de alerta nem vermelho × verde decorativo. Calma = alinhamento e respiro.
- Fundo liso, trocado no máximo 1 vez; rótulos "Antes"/"Depois" sempre no mesmo lugar.
- Ferramenta de terceiros só em texto, sem logo.
- Sem resultado terapêutico ou de paciente; custo e número só do contexto.

## Checklist antes de entregar
- Mesmo momento nos dois, mudando só o estado?
- Antes empático e legível; depois com funcionalidade que existe?
- Sem número inventado nem promessa de resultado?
- Fundo troca no máximo 1 vez e rótulos no mesmo lugar?
- CTA único?

## Estrutura (carrossel)
| # | tipo | conteúdo |
|---|---|---|
| 1 | capa | hook ≤ 10 palavras ("De 5 apps para 1.") |
| 2 | antes | cena do caos + frase literal da persona |
| 3 | antes (opcional) | custo: tempo, retrabalho, sensação |
| 4 | depois | mesma cena organizada, 1 tela |
| 5 | comparação | `.compare`, até 3 linhas |
| 6 | CTA | salvar, enviar ou link na bio |

**`split`:** em cima "Antes" (chips tortos sobre `--surface-2`), embaixo "Depois" (1 card alinhado sobre `--bg`).

## Exemplo (kz)
Eixo `tempo`: 1. "Segunda, 8h. Dois jeitos de começar a semana." 2. Google Agenda, WhatsApp, Meet, caderno, planilha sobrepostos: "Tá tudo espalhado." 3. "Lembrete manual, link por mensagem, nota em 3 lugares." 4. Agenda da kz com a semana à vista: "Abro um app só." 5. Lembrete manual × confirmação no WhatsApp · link procurado × videochamada na agenda · notas espalhadas × nota anterior na mão. 6. "Qual segunda é a sua? Manda pra colega que vive no antes."
