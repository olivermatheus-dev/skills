---
name: locucao
description: "Prepara a locução de um vídeo: na versão 1.0, gera a voz com TTS gratuito de modelo; depois da aprovação, entrega o roteiro de voz no formato exato da ElevenLabs (pausas, entonação, números por extenso, ajustes de voz) para o Oliver gerar fora da API, e encaixa o áudio final no vídeo. Use quando o usuário pedir locução, narração, voz, 'texto pro ElevenLabs', 'roteiro de voz', 'gerei o áudio', 'troca a voz', ou quando a skill video chegar na etapa de voz."
---

# Locução

Política de custo:
- **v1.0:** voz **gratuita de modelo**, só para aprovar ritmo e cenas.
- **Depois do aval:** voz final na ElevenLabs. O Oliver gera fora da API, ou um agente no navegador gera, e devolve o arquivo.
- **Encaixe:** feito pela ferramenta `timeline.mjs`, quase sem gastar tokens.

## 1. v1.0: voz de modelo (rascunho)
- Use um TTS gratuito disponível na máquina (definido na tarefa 003; ex.: Piper local ou o TTS do kit). Salve em `audio/vo/<fala>.wav`.
- Encaixe cada fala: `node tools/video/timeline.mjs vo <pasta> <fala> <arquivo>`.
- Registre no `plano.md`: "voz de rascunho; trocar pela final após aval".

## 2. Voz final: roteiro no formato ElevenLabs
Entregue `<pasta>/locucao-elevenlabs.md` com **um bloco por fala**, pronto para copiar:

```
### f1 · arquivo: f1.mp3 · alvo ≈ 1,8 s · bloco: gancho
Modelo: Eleven Multilingual v2 · Voz: <nome/ID da voz da marca> · Stability 45 · Similarity 75 · Style 15 · Speed 1.0
Texto:
Toda noite… a mesma mensagem.
```

Regras do texto. Confira a documentação atual da ElevenLabs, porque os modelos mudam.
- **Pausas:**
  - vírgula = respiro curto; ponto = pausa;
  - reticências `…` = hesitação ou suspense;
  - travessão `—` = quebra curta;
  - pausa exata (modelos v2/Flash): `<break time="0.6s" />`, no máximo ~3 s e poucas por fala, porque em excesso deixa a voz instável;
  - **no v3**, use pontuação e *audio tags* em colchetes (`[pausa]`, `[sussurrando]`, `[animada]`, `[suspira]`) no lugar de `<break>`.
- **Ênfase:** reescreva a frase para a palavra importante cair no fim; no v3, MAIÚSCULAS dão ênfase (use 1 palavra por fala, no máximo).
- **Números, preços e datas por extenso:** "R$ 129" → "cento e vinte e nove reais"; "23h04" → "vinte e três e quatro" ou "onze da noite"; "2026" → "dois mil e vinte e seis".
- **Siglas e nomes:** escreva como se fala ("CRP" → "cê-erre-pê", "kz" → como a marca pronuncia, registrado no `BRAND.md` > Vídeo).
- **Uma fala = um arquivo.** É o que permite trocar só uma, sem regenerar tudo.
- **Ajustes da voz** (ponto de partida):
  - Stability 40–55 (menor = mais expressivo);
  - Similarity 70–80;
  - Style 0–20;
  - Speed 0,95–1,05.

  Registre os valores que funcionaram no `BRAND.md` > Vídeo.
- **Duração-alvo** por fala (da timeline atual), para quem gerar saber se precisa acelerar ou cortar.

## 3. Encaixe da voz final (quase zero token)
O Oliver solta os arquivos em `<pasta>/audio/vo/` (ou na `_inbox/`). Para cada fala:
```
node tools/video/timeline.mjs vo <pasta> f1 <arquivo>
node tools/video/timeline.mjs check <pasta>
```
A ferramenta mede a duração nova, reencaixa tudo o que vem depois e acusa silêncios acima do limite e textos sem tempo de leitura. Os tempos por palavra ficam **aproximados** (`words_approx`); para precisão, rode o script `words` do kit. Depois, só re-render.

## Nunca
- Gastar crédito de voz final antes do aval da v1.0.
- Número ou sigla sem estar por extenso no texto da voz.
- Locução que não cabe na duração (≤ ~2,7 palavras/s; ver `knowledge/video/ritmo-e-leitura.md`).
