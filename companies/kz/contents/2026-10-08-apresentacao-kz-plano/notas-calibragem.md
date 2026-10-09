# Notas de calibragem — skill plano-de-cenas (047 fase B, 1º uso real)

> O que atrapalhou, faltou ou deu aviso falso ao refazer o plano da apresentação kz (fases A–D, nível médio). Serve para calibrar skill, gramática, contrato e `plano.mjs check`.

## check (`tools/video/plano.mjs`)
1. **Ignora os tempos reais.** Com voz já gravada (`entrada.tempos: true`, `vo[].start/end`, words da Carla), o check estima tudo a 2,7 palavras/s: deu s2 terminando em 9,6 s (real 11,6) e o vídeo em 41,2 s (real ≈ 44). O suspiro de ~0,8 s da f2 some. Com tempos, deveria usar `words[].s` (liga com a fase C da 047).
2. **`vivo` cala o aviso de vão sem olhar o tamanho.** Qualquer texto em `vivo` some com o ⚠, mesmo com 4 s sem gesto (s7, cauda). Sugestão: com `vivo`, avisar acima de ~3 s; sem `vivo`, acima de 1,5 s.
3. **Não confere `params` contra o `bloco.json`.** Usei `estilo: janela` (s1) e `toast` (s5), que não existem nos blocos, e passou calado. Deveria avisar "param desconhecido → ajuste de bloco".
4. **Palavra repetida na fala:** o gesto pega sempre a 1ª ocorrência ("dia" 2× na f5, "tempo" 2× na f6, "de" 2× na f2). Falta sintaxe para a 2ª (ex.: `f5:dia#2`).
5. **Não confere nome de ícone Lucide** (conferi à mão com `tools/icon.mjs`), nem `icone` com vários ícones (campo livre).
6. **Não mede texto de tela** (≤ 6 palavras por momento): "Uma forma mais simples de cuidar da sua rotina." (9) passou.
7. **Aviso de style frame é inevitável quando o pedido para na fase D** (4 ⚠ "falsos" aqui): a skill manda fazer o style frame na D (item 7) e na F (passo 3). Decidir uma fase; se for F, o check só avisa com `--fase f`.
8. `pause` não tem semântica clara no contrato (pausa antes ou depois da fala?) e o check não usa.

## Contrato (`cenas-json.md`) e molde
9. **Falta campo para "usar o bloco com ajuste"** (param novo ou variação). Inventei `ajuste_bloco`. Hoje é `use` (sem mudança) ou `novo` (bloco inteiro); o meio-termo é o caso mais comum ao reaproveitar.
10. Falta `dados: "ilustrativos"` por cena, `tempo_real` (com voz gravada) e cor/fundo por cena (o molde tem a seção 6, o JSON não). Inventei os 2 primeiros.
11. `conceito.por_que_este` ajudaria a revisão (por que o recomendado vence as alternativas); inventei.
12. `vo[]` com `start/end/words` é descartado pelo `plano.mjs timeline` (só leva `id/text/say`): perde os tempos reais ao gerar a timeline.

## Blocos, repertório e marca
13. **CTA navegador não é bloco.** O repertório e os Padrões mandam usar `library/motion/cta/navegador/`, mas o `plano.mjs blocos` não lista (é componente de motion, não bloco) → virou `novo`. Promover a bloco (`cta/navegador`) resolve para todos os vídeos.
14. **`produto/painel-inicio` tem "lembrete enviado" fixo no HTML** (afirmação não confirmada no PRODUTO.md e texto fixo dentro do bloco, contra o contrato de cena isolada). Precisa virar param.
15. **`cena/caos-cards` usa `--danger` (vermelho) nos alertas** junto do coral: conflita com a proibição "coral, vermelho e amarelo juntos" do BRAND.md, mas está no repertório como aprovado. Revisar a entrada do repertório.
16. Os rótulos dos fragmentos de `abertura/pergunta-fragmentos` (Agenda, Mensagens, Planilha, Caderno) são fixos: não dá para alinhar com as janelas da s2 sem ajuste.
17. O repertório é todo de um vídeo só (v03): para "pergunta", "dor", "revelação" há só 1 solução cada. Puxa para repetir a v03; a skill deveria dizer explicitamente "repertório = ponto de partida, não default".

## Gramática e skill
18. Faltam tipos na gramática para "marca/revelação de nome" separado de "virada" (usei `revelação`), e o check aceita qualquer `tipo` (não confere com a tabela).
19. A relação `mostra` serve mal para a revelação da logo (não é "a coisa citada de verdade"); falta algo como `marca` ou aceitar `complementa` com motivo.
20. Faltou uma linha na fase C sobre **conceito que encaixa nas palavras espaciais da fala** ("de um lado", "de outro"): foi o que decidiu o conceito aqui e não está em nenhum teste rápido.
21. Com voz já gravada, a fase A manda "confira o tamanho" a 2,7 p/s; deveria mandar usar a duração real e marcar onde a voz respira (suspiro, pausa antes da revelação), porque esses buracos viram gestos ou `pause`.

## Depois da revisão rodada 1 (22/36)

### Tempos reais na timeline (conferido no código, sem editar `tools/`)
22. **`plano.mjs timeline` descarta os tempos reais.** Ele monta `vo` só com `{ id, text, say }` e joga fora `start`, `end` e `words`. Depois o fluxo da skill manda rodar o `tts.mjs`, que gera voz de rascunho por cima da Carla. O `check` estima tudo a 2,7 palavras/s: ele mostra s3 em 9,6–14,5 s, e o real é 11,6–17,3 s.
   - **O que mudar no `plano.mjs`:**
     - `timeline` copia `vo[].file/start/end/words` quando `entrada.tempos` é verdadeiro (ou lê `audio/vo/split/*.words.json`);
     - `check` usa `words[].s` para medir vão e duração quando houver tempos;
     - a skill (fase F, passo 2) diz "com voz gravada, pule o tts.mjs".
   - **Contorno até lá (sem TTS, sem editar `tools/`):**
     1. `node tools/video/plano.mjs timeline <pasta>`;
     2. `node tools/video-kit/scripts/fit-vo.mjs <pasta> --dir <pasta>/audio/vo/split`. Os wav e os `.words.json` da v03 já estão copiados aí. Ele corta, padroniza, grava `words` exatos e reencaixa cenas e eventos;
     3. seguir com `produce --build-only` e `storyboard`.
   - Conferir na folha se os gestos caem na palavra. O split veio do Whisper (`snapWords` corrigido na v03).
23. **O mesmo bloco novo em 2 cenas** (s2 e s3 = `cena/janelas-rotina`, fases diferentes) não está previsto no contrato. Repeti o `novo` nas duas com cues diferentes por cena. O check aceita, mas não confere se o `spec` é o mesmo. Sugestão: `novo` declarado uma vez no topo (`blocos_novos[]`) e as cenas com `use` + `params.fase`.
24. **Cue que o bloco não tem** (s5 `encaixa` no `painel-inicio`) passa calado. O check só olha cues do bloco sem gesto, não gestos sem cue no bloco. Isso deveria ser um aviso de "ajuste de bloco".
25. **Os 3 eliminatórios que a revisão pegou e o check não:**
    - nome repetido entre papéis (Ana terapeuta e paciente);
    - afirmação na ficha que não está nas fontes ("cobranças");
    - texto de tela > 6 palavras.

    Os dois primeiros são de leitura, ficam para o revisor. O terceiro dá para medir (`on_screen` por parte, contando palavras).
26. **A revisão sugeriu fundo pastel**, contra o BRAND.md (pastel "nunca fundo da peça inteira"). A rubrica deveria lembrar o revisor de que o BRAND.md vence a sugestão.
27. **O check mudou durante o trabalho** (outra sessão): o teto de vão com `vivo` subiu para 3 s, o que atende o ponto 2. Ele acusou s4 (~4,1 s) e s7 (~5,3 s), e resolvi com gesto (s4 `rodape` em "gestão"; s7 `aba` em "profissional" e `fecha` na cauda). Com os tempos reais, o vão da s4 seria 3,2 s, não 4,1: continua valendo o ponto 22.
28. **"Um bloco, duas fases" não fecha no check novo.** Ele avisa "um bloco, um contrato" quando cues e slots diferem entre cenas. Com cues unificados, avisa "cue sem gesto" para os cues da outra fase (e o compor recusa). Solução adotada: 2 blocos irmãos com o mesmo `params.posicoes`. Se quiserem fases, o contrato precisa de `cues_por_fase` (ou o compor aceitar cue opcional).
29. **Incidente 2026-10-08 22:37:** um script de outra sessão sobrescreveu este `cenas.json` e o `plano.md`, e deixou `style/`, `timeline.json`, `render/` e voz Thalita na pasta. Restaurei pelo meu rascunho (scratchpad). Sugestão: o `plano.mjs` (ou scripts de teste) recusar escrever num `cenas.json` com `status` diferente de "teste" sem `--force`.

## Rodada 2 e storyboard
30. **Prova dos tempos (feita):** `plano.mjs timeline` → `fit-vo.mjs <pasta> --dir audio/vo/split`. Todos os 23 gestos presos a palavra caem em `t = palavra real + offset` (diferença = o offset planejado, −0,06 a −0,12 s). O `fit-vo` leu os `.words.json` do Whisper. Ruídos:
    - o `fit-vo` imprime "rascunho ? s → final … ⚠ mudou bastante" porque não houve rascunho (aviso falso);
    - ele também acusa "sem trilha" (correto, é a etapa do sound-designer);
    - o `check` continua mostrando a estimativa a 2,7 p/s (ponto 22).
31. **O fit-vo pegou um vão que o check não viu:** s3 com 3,18 s sem nada novo entre "menos" e "atender", pelos tempos reais. Entrou o gesto `aperta` em "aquilo". O check só vai pegar isso quando usar `words`.
32. **Storyboard mente nas cenas `use` + `ajuste_bloco`:** o build monta o bloco **sem** o ajuste (params desconhecidos são ignorados). A 1ª folha mostrou na s1 os fragmentos antigos (Planilha, Caderno, sem Sessão) e na s5 "Marina S." e o toast "lembrete enviado". Fiz style frame também para s1 e s5. Regra sugerida: cena com `ajuste_bloco` exige `style_frame` (o check avisa como faz com `novo`).
33. `style_frame` por formato (`{ "4x5", "9x16" }`) funcionou bem. Faltou o `storyboard` aceitar uma ordem de quadros que não seja a do render, para quando todas as cenas têm style frame.
