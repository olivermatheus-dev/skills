# App de vídeo (ideia, não é para agora)

> Registrado em 2026-10-27. Só ideia: ninguém trabalha nisto até o Oliver chamar.

## Por quê
A parte de vídeo do app de marketing está ruim:
- a interface e a visualização são fracas;
- os componentes são ruins;
- marcar um ponto e pedir revisão é desajeitado;
- não dá para ver o antes e o depois.

O que tem muito valor e precisa sobreviver: **ver a timeline e marcar, em cada ponto e frame, o que ajustar em cada componente**.

## O que é
Um **repositório e um app próprios, só para vídeo**, separados do hub de marketing:
- **Projetos:** tela para ver e abrir todos os projetos de vídeo, ligada a uma pasta do computador.
- **Pasta de assets:** áudios e efeitos sonoros, componentes reutilizáveis, animações e estilos.
- **Editor com timeline nossa:** fade de áudio, cortes e ajustes, clicar no texto e editar direto, marcar frame ou componente para revisão, comparação antes × depois.
- **IA integrada:** pedir ajustes no próprio editor, no mesmo fluxo de hoje (roteiro → plano → cenas → revisão → MP4).
- **O que vem do hub:** skills de vídeo e de roteirista, agentes (editor de vídeo, sound designer, roteirista, revisor), kits de marca das empresas e a biblioteca de áudio.
- **Base:** a parte de vídeo que já temos (`tools/video-kit/`, skills `video`, `plano-de-cenas`, `locucao`, `audio`), só que bem feita.

## Remotion como referência
- **Repo de teste:** `Desktop/git/remotion`, criado em 2026-10-27 no modelo hello-world. Para rodar: `npm run dev`, que abre o Studio.
- **Uso:** só como **referência** do que queremos parecido (timeline, props editáveis, prévia, render). A princípio, **não reaproveitar código**.
- **Licença** (lida em `node_modules/remotion/LICENSE.md`):
  - grátis para pessoa física ou empresa com até 3 funcionários, e pode modificar para uso próprio;
  - **proibido** vender, licenciar ou sublicenciar um derivado do Remotion.
  - Se o app virar produto, nada de código copiado dele. Uma base MIT seria Motion Canvas ou Revideo.

## Fases
1. **Testar o Remotion (primeiro passo):**
   - como ele gera os vídeos e como funciona o editor;
   - a parte de IA: dá para conectar o Claude Code? como ele recebe pedidos?
   - montar um kit de marca de teste (empresa → tokens, imagens de referência).
2. **Decidir:**
   - o que copiar como ideia de interface e de mecanismo;
   - o que levar do hub (skills, ferramentas, áudios).
3. **Criar o repositório e o app dedicados.**

## Em aberto
- Construir sobre o Remotion (usando o pacote) ou do zero, inspirado nele?
- Como o app novo conversa com o hub: pasta compartilhada de empresas e marca, ou cópia?
- O que acontece com a aba de vídeo do app de marketing atual depois disso.
