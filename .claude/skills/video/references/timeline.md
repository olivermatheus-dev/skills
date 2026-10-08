# timeline.json — esquema

Fonte única de tempos do vídeo. Nasce do áudio (voz ou grade de BPM); `composition.html` só lê daqui.
Tempos em **segundos** (float). `fps` de trabalho 30 (render final pode ser maior para motion blur).

```json
{
  "fps": 30,
  "duration": 20.0,
  "formats": ["4x5", "9x16"],
  "music": { "bpm": 96, "file": "audio/music.wav", "gain_db": -18, "duck_under_vo_db": -10 },
  "vo": [
    { "id": "f1", "text": "Toda noite, a mesma mensagem.", "start": 0.4, "end": 2.1,
      "words": [ { "w": "Toda", "s": 0.40, "e": 0.62 } ] }
  ],
  "scenes": [
    { "id": "s1", "block": "gancho", "start": 0.0, "end": 2.2, "vo": ["f1"], "pause": false,
      "on_screen": "23h04. De novo.",
      "note": "celular vibra na mesa às 23h; balão 'posso remarcar?'" }
  ],
  "events": [
    { "id": "e1", "t": 0.62, "scene": "s1", "type": "notify", "target": "#msg1" },
    { "id": "e2", "t": 3.10, "scene": "s2", "type": "click",  "target": "#btn-confirm" }
  ],
  "sfx": [
    { "event": "e1", "asset": "ui-gentle-notify-02", "align": "start", "gain_db": -14, "pan": 0 },
    { "event": "e2", "asset": "ui-elegant-click-01", "align": "start", "gain_db": -18, "pan": 0 },
    { "event": "e3", "asset": "whoosh-air-soft-short-01", "align": "peak", "gain_db": -16, "pan": 0.2 }
  ]
}
```

`on_screen` = texto na tela da cena (a composição lê daqui, então trocar o texto é só `timeline.mjs text`). `music.id` = id em `library/audio/music.json`. `vo[].file` = arquivo da fala (`audio/vo/<id>.*`).
`asset` = id em `library/audio/sfx.json`. `align: "peak"` → o arquivo começa em `t_evento − peak_s` (o pico cai no quadro do evento; use em whoosh/impact). `align: "start"` → começa no evento (clicks, pops). `pan` de −1 a 1 (discreto: até ±0,3).

Regras de validação (`node tools/video/timeline.mjs check <pasta>` já acusa as marcadas ★):
- ★ Silêncio entre falas consecutivas > 0,5 s (exceto cena com `"pause": true`, até 1 s).
- ★ Cena sem nada novo por > 3 s (nenhum evento, fala ou corte).
- ★ Evento fora da cena a que pertence.
- ★ Último bloco (`cartão final`) com < 2 s.
- ★ Texto na tela (`on_screen`) visível por menos que `máx(1 s; 0,3 s × palavras)`.
- ★ `sfx` com `asset` fora do catálogo ou sem licença; o mesmo `asset` repetido mais de 3× (usar variantes da família).
- ★ Sem trilha (nunca fundo mudo).

Tipos de evento sugeridos: `click`, `press`, `type`, `hover`, `drag`, `notify`, `swap`, `count`, `reveal`, `cut`, `impact`.

## Campos do kit (tools/video-kit)
A timeline é **montada a partir do áudio** pelo `tts.mjs` / `fit-vo.mjs` (`layout()` em `scripts/lib.mjs`). Você escreve a intenção; os tempos são calculados.

```json
{
  "voice": { "draft": "edge-thalita", "final": "el-<nome>" },
  "music": { "bpm": 84, "gain_db": -11, "duck": 0.7, "synth": { "chords": ["F","C","Dm","Bb"], "sections": [{ "from": 0, "to": 4, "style": "light" }] } },
  "vo": [ { "id": "f1", "text": "Onze da noite.", "say": "Onze da noite." } ],
  "scenes": [
    { "id": "s1", "vo": ["f1"], "lead": 0.3, "gap": 0.2, "tail": 0.3, "min": 0, "on_screen": "23:04" },
    { "id": "s4", "len": 2.6, "on_screen": "Peça seu acesso" }
  ],
  "events": [
    { "id": "e1", "word": "f1:noite", "offset": -0.1 },
    { "id": "e2", "scene": "s4", "at": 0.1 },
    { "id": "e3", "scene": "s4", "before_end": 0.8 }
  ],
  "sfx": [ { "event": "e1", "synth": "pop", "gain_db": -3 }, { "event": "e2", "asset": "tonal-piano-f-maior-expansivo-01", "max": 2.6 } ]
}
```
- `vo[].say` = como se fala (números e siglas por extenso); `text` = como se lê. Gerados: `file`, `length`, `start`, `end`, `words` (`words_approx` quando estimado), `voice`.
- Cena com fala: `lead` (respiro antes; 0,3 na 1ª, 0,15 nas outras, 0,5 com `pause`), `gap` entre falas (0,2), `tail` depois (0,3), `min` (duração mínima). Cena sem fala: `len` (2,5).
- Evento: `word` (`"f2:WhatsApp"` ou `"f2:3"`, + `offset`), `at` (s após o início da cena) ou `before_end`; `t` é recalculado a cada encaixe.
- SFX: `asset` (catálogo, com licença) ou `synth` (`pop`, `click`, `swish`, `whoosh`, `typing` + `until`, `chime`, `ding`); `max` corta com fade; `delay` desloca.
- **Blocos (045):** `scenes[].use` = bloco da cena, `camadas[]` = blocos do vídeo inteiro (fundo), `events[].cue` = nome do momento que o bloco pede (`ctx.cue`). Com `use`, o `composition.html` é gerado. Ver `blocos.md`.
- `music.synth` → `music.mjs` compõe a trilha (própria); ou `timeline.mjs music <id>` (catálogo). `gain_db` = nível da trilha antes do ducking (a trilha é levada a −16 LUFS antes); `duck` 0–1.
