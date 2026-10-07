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

`asset` = id em `library/audio/sfx.json`. `align: "peak"` → o arquivo começa em `t_evento − peak_s` (o pico cai no quadro do evento; use em whoosh/impact). `align: "start"` → começa no evento (clicks, pops). `pan` de −1 a 1 (discreto: até ±0,3).

Regras de validação (o check do kit deve acusar):
- Silêncio entre falas consecutivas > 0,5 s (exceto cena com `"pause": true`, até 1 s).
- Cena sem nada novo por > 3 s (nenhum evento, fala ou corte).
- Evento fora da cena a que pertence.
- Último bloco (`cartão final`) com < 2 s.
- Texto na tela (no `composition.html`) visível por menos que `máx(1 s; 0,3 s × palavras)`.
- `sfx` com `asset` fora do catálogo ou sem licença; o mesmo `asset` repetido mais de 3× (usar variantes da família).

Tipos de evento sugeridos: `click`, `press`, `type`, `hover`, `drag`, `notify`, `swap`, `count`, `reveal`, `cut`, `impact`.
