---
name: fmt-antes-depois
description: "Receita de antes × depois: rotina caótica × organizada (5 apps × 1 sistema, caos × calma), em carrossel de 3–6 slides ou post único dividido. Usa a skill carousel como motor, a ig-post para o texto e a skill video para a versão animada. Use quando o usuário pedir 'antes e depois', 'antes x depois', 'caos x calma', 'com e sem', 'comparação de rotina' ou 'fmt-antes-depois'."
---

# Antes × depois

O mesmo momento da rotina em dois estados: caos (hoje) e calma (com o sistema). Meio de funil: identificação no antes, desejo no depois. Motor: `carousel`; animado: `video`.

## Quando usar / quando não usar
- **Usar:** dor operacional com virada visível (apps espalhados, lembrete manual, link perdido).
- **Não usar:** resultado terapêutico ou de paciente, número fora do contexto.

## Parâmetros
| parâmetro | default | opções |
|---|---|---|
| variante | `carrossel` | `carrossel` (3–6) · `split` (1 slide) · `video` |
| eixo | `apps` (N × 1) | `tempo` (mesmo horário) · `tarefa` (mesma tarefa) |
| depois | tela real (`brand/screenshots/`) | ilustração/ícones |
| formato | 1080×1350 | 1080×1080 |

## Estrutura (slide a slide)
| # | tipo | conteúdo |
|---|---|---|
| 1 | capa | hook ≤ 10 palavras ("De 5 apps para 1.") |
| 2 | antes | cena do caos: cards espalhados + frase literal da persona |
| 3 | antes (opcional) | custo: tempo, retrabalho, sensação (só dado do contexto) |
| 4 | depois | mesma cena organizada: 1 tela, mesmo horário |
| 5 | comparação | `.compare`, até 3 linhas |
| 6 | CTA | salvar, enviar ou link na bio |

**`split`:** metade de cima "Antes" (chips tortos sobre `--surface-2`), metade de baixo "Depois" (1 card alinhado sobre `--bg`). Ver `references/layout.html`.

## Regras do formato
- **Mesmo enquadramento:** mesmo horário, tarefa e posição; só muda o estado.
- Caos = excesso legível: cards rotacionados ±3°, sobrepostos, sem cor de alerta.
- Calma = alinhamento e respiro. A diferença vem de ordem e espaço, não de cor nova.
- Fundo liso; a virada troca o fundo no máximo 1 vez.
- Rótulos "Antes"/"Depois" sempre no mesmo lugar.
- Ferramenta de terceiros só em texto, sem logo.
- `video`: caos se recolhe e vira 1 tela; passe esta estrutura ao `video` como plano.

## Erros comuns
- Antes caricato (julga em vez de espelhar).
- Depois que é só print, sem a mesma cena.
- Promessa de resultado.
- Vermelho × verde como decoração.
- Comparação com 6+ linhas.

## Exemplo (kz)
Carrossel, eixo `tempo`:
1. "Segunda, 8h. Dois jeitos de começar a semana."
2. Antes: Google Agenda, WhatsApp, Meet, caderno, planilha sobrepostos. "Tá tudo espalhado."
3. Antes: "Lembrete manual, link por mensagem, nota em 3 lugares."
4. Depois: agenda da kz com a semana à vista. "Abro um app só."
5. Comparação: lembrete manual × confirmação no WhatsApp · link procurado × videochamada na agenda · notas espalhadas × nota anterior na mão.
6. "Qual segunda é a sua? Manda pra colega que vive no antes."

## Checklist do formato
- [ ] Mesmo momento, só o estado muda?
- [ ] Antes empático e legível?
- [ ] Depois mostra a mesma cena?
- [ ] Sem número inventado nem promessa?
- [ ] Fundo troca no máximo 1 vez?
- [ ] CTA único?
