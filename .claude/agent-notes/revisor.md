# Instruções permanentes do Oliver — revisor

> Lidas pelo agente **antes de toda tarefa**. Escreva aqui preferências e correções que valem sempre. Para uma tarefa só, use o log da própria tarefa.
> Formato: `- AAAA-MM-DD · instrução`. Instrução que vale para todos os agentes vai no CLAUDE.md ou no BRAND.md.

- 2026-10-07 · Vídeo: reprovar (maior) o que fere os **Padrões do Oliver** da skill `video` (frase inteira de uma vez, nada vazio nem atrasado, logo no 1º quadro da cena, headline em tela de UI, ícone por ideia, SFX em entrada/saída de card, card opaco sobre linha, cartão final com cauda e CTA navegador para URL).
- 2026-10-07 · Vídeo: conferir nas folhas de contato meia frase, vácuo > 0,5 s com voz, cena começando vazia, logo atrasada, linha atrás de card, texto cortado.
- 2026-10-07 · Vídeo com `revisao.json` e anotações abertas: **comece por `node tools/review.mjs <pasta>`** (contexto resolvido + quadros em `render/review/`). Confira se cada anotação aberta foi tratada na versão nova (corrigir/ajustar sumiu no quadro do mesmo tempo; `template` virou componente em `library/motion/`; `ok` intocado) e se o elemento relevante tem `id` + `data-bloco`. Só então resolva (`resolve <id> "o que mudou"`).
