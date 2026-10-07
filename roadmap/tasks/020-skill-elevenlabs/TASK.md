# 020 — Skill de ElevenLabs + catálogo de vozes finais

**Status:** fazendo (falta a voz da kz e o teste real) · **Depende de:** 003 (feita) · **Liga com:** skill `locucao`, `library/voices/`, `tools/video-kit/scripts/fit-vo.mjs`, 017 (geração com IA)

## Pedido do Oliver (2026-10-07)
- Cada projeto pode ter **suas vozes**, cada voz com características definidas para o que é adequado.
- No repositório, uma **lista geral** com as vozes escolhidas da ElevenLabs e as características de cada uma (`library/voices/voices.json`, entradas `el-*`).
- Uma **skill própria**: como usar a ElevenLabs, a API e como configurar cada voz para os melhores resultados.
- Fluxo padrão: rascunho com voz grátis do Windows → aprovar copy e estrutura → gerar na ElevenLabs → receber, tratar (cortar, editar) e encaixar → ajustes pontuais para a voz casar com legendas e cenas.

## Escopo
- Pesquisar a documentação atual da ElevenLabs: modelos (v3, Multilingual v2, Flash), parâmetros (stability, similarity, style, speed, speaker boost), tags de áudio do v3, `<break>`, normalização de texto, pronúncia (dicionários), endpoint **with-timestamps** (tempos por caractere → palavras para o `fit-vo.mjs --words`), limites e termos de uso comercial por plano.
- Skill `elevenlabs`: escolher voz (biblioteca de vozes, voice design, clonagem só com autorização), testar 2–3 vozes com o mesmo trecho, registrar a escolhida no catálogo, gerar por fala, receber e encaixar.
- Ferramenta `tools/voice/elevenlabs.mjs` (lê `ELEVENLABS_API_KEY` do `.env`): gera cada fala do `timeline.json` com a voz `final` da empresa e grava os tempos por palavra; nunca roda antes do aval da v1.0.
- Ficha da voz no catálogo: características, uso indicado/contraindicado, ajustes que funcionaram, pronúncias da marca.

## Decisões (2026-10-07)
- **Sempre Eleven v4** (`eleven_v4`). Sem style, speed e `<break>`; emoção por audio tags, reticências e MAIÚSCULAS.
- **Pela API**, com **uma chave por projeto**, salva no app → Configurações (`companies/<slug>/.env`). A `.env` da raiz é reserva.
- O Oliver pré-seleciona as vozes que soam bem em português e manda os nomes.

## Perguntas em aberto
- [ ] Nomes/voice_id das vozes pré-selecionadas → fichas `el-*` no catálogo.
- [ ] Plano da ElevenLabs (o "Testar" das Configurações mostra o plano e os créditos, se a chave tiver a permissão User: read).
- [ ] Pronúncia de "kz".

## Critérios de pronto
- [x] Skill `elevenlabs` escrita e ligada à `locucao` e à `video`
- [x] Chave por projeto na interface (Configurações) + `tools/lib/env.mjs`
- [x] `tools/video-kit/scripts/elevenlabs.mjs` (with-timestamps → tempos exatos → `fit-vo.mjs`; `--dry`, `--aprovado`, `--takes`, `--pick`)
- [ ] ≥ 1 voz final da kz no catálogo, com ficha completa
- [ ] Teste: vídeo da kz com voz final encaixada por `fit-vo.mjs --words` e QC limpo

## Log
- 2026-10-07 — criada a partir do pedido do Oliver na tarefa 003.
- 2026-10-07 — doc do Eleven v4 conferida (modelos, tags, with-timestamps). Feitos: tela Configurações (chaves por projeto, testar chave), `core/secrets.ts`, `tools/lib/env.mjs`, coletas lendo a chave do projeto, `elevenlabs.mjs`, `fit-vo.mjs` lendo `<fala>.words.json` no modo `--dir`, skill `elevenlabs`, `locucao`/`video`/editor apontando para ela. **Não testado com chave real** (a do Oliver ainda não foi salva; nenhuma voz `el-*` no catálogo). Próximo: Oliver salva a chave da kz e manda as vozes → cadastrar → `--dry` → `--aprovado --takes 2` no `teste-kit` → QC.
