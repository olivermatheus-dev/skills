# Índice do material de motion

Destino da versão destilada: `knowledge/video/<tema>.md` (ver `knowledge/video/README.md`).

| data | bruto | tema | destilado em | status |
|---|---|---|---|---|
| 2026-10-06 | material/ref-roteiros-video-antigo.md (plano antigo do repo) | roteiro, hooks, retenção | — | novo |
| 2026-10-07 | material/2026-10-07-etapa1-cortes-montagem.md | fundamentos de corte, hard/jump/J/L-cut, cut on action | knowledge/video/cortes-e-montagem.md | destilado |
| 2026-10-07 | material/2026-10-07-skill-ludus-video.md (skill do produto Ludus) | processo de produção, arquitetura de skill, QA, export | knowledge/video/esteira-de-producao.md + tarefas 001, 003, 004 | destilado |

## Notas de verificação
- **2026-10-07 · Etapa 1:** conteúdo correto e alinhado à prática profissional. Ajustes feitos:
  - Prioridade dos motivos alinhada à "Regra dos Seis" de Walter Murch, em que a **emoção vem antes da história**. O original punha emoção em 4º.
  - Adicionada a **direção do olhar** (*eye-trace*), que faltava e é crítica no 9:16.
  - Incluídos **valores iniciais**: margens de silêncio, duração de J/L-cut, escala de punch-in, ponto de corte no movimento.
  - Cada técnica ganhou uma tradução **"Em motion"**: o J-cut vira SFX/VO antes do visual, o L-cut vira VO sobre a cena e o cut on action vira *match cut*.
  - A tabela de função do trecho ganhou o tratamento recomendado para cada função.
- **2026-10-07 · skill ludus-video:** é uma referência de arquitetura e processo, não de técnica de edição. O que foi aproveitado:
  - as 5 etapas com portão de aval;
  - o "plano.md" com 7 seções;
  - os tempos derivados da voz;
  - os SFX ligados a eventos;
  - o QA por folhas de contato;
  - a regra "dizer o que não foi verificado";
  - as afirmações só com fonte.
  - O que ficou de fora, por ser específico do Ludus: as cores #F5F5F7 e #1D1D1F, a proibição de caixa alta, a persona Gaby e a voz Thalita. Isso vira exemplo do que vai no `BRAND.md` de cada marca.
  - Correção: o motion blur com 2 amostras (60→30 fps) pode gerar "fantasma" em movimento rápido. A recomendação passou a ser 4–8 amostras com obturador de 180°, ou desfoque direcional no elemento.
  - Impacto: HyperFrames + GSAP vira o candidato nº 1 na tarefa 003, com a sugestão de reaproveitar o `_kit` do Ludus.
