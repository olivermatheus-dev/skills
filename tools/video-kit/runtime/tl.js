/**
 * Leitura da timeline dentro da composição: as cenas pegam tempos daqui, nunca de número escrito à mão.
 * Assim, trocar a voz (rascunho → final), o texto ou a duração reencaixa a animação sem reescrever código.
 *
 *   window.__TL = __TIMELINE__          (o produce.mjs injeta o timeline.json + duration, format, W, H)
 *   T.scene('s2')      → { start, end, dur, on_screen, params }
 *   T.ev('e3')         → segundo do evento
 *   T.word('f2:WhatsApp') ou T.word('f2', 3) → { s, e } da palavra (início e fim, absolutos)
 *   T.vo('f2')         → { start, end, words }
 *   T.text('s2')       → on_screen da cena (troca com timeline.mjs text)
 *   T.is('9x16')       → formato atual
 *
 * Carregue depois de definir window.__TL (tag script própria, sem fecho de tag dentro deste arquivo).
 */
;(function () {
  // lida na hora do uso: o HyperFrames embute e reordena os scripts, então window.__TL pode ainda não existir aqui
  const TL = () => {
    if (!window.__TL) throw new Error('timeline: defina window.__TL = __TIMELINE__ antes de usar T')
    return window.__TL
  }
  const fold = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^\w]/g, '')
  const need = (x, what) => {
    if (x == null) throw new Error('timeline: ' + what + ' não existe')
    return x
  }
  const T = {
    get tl() { return TL() },
    get format() { return TL().format },
    get W() { return TL().W },
    get H() { return TL().H },
    get duration() { return TL().duration },
    is: (f) => TL().format === f,
    scene(id) {
      const s = need(TL().scenes.find((x) => x.id === id), 'cena ' + id)
      return { start: s.start, end: s.end, dur: s.end - s.start, on_screen: s.on_screen, params: s.params || {} }
    },
    ev(id) {
      return need((TL().events || []).find((x) => x.id === id), 'evento ' + id).t
    },
    vo(id) {
      return need((TL().vo || []).find((x) => x.id === id), 'fala ' + id)
    },
    word(spec, index) {
      let id = spec
      let key = index
      if (index == null && String(spec).includes(':')) [id, key] = String(spec).split(':')
      const words = T.vo(id).words || []
      const w = typeof key === 'number' || /^\d+$/.test(key) ? words[+key] : words.find((x) => fold(x.w) === fold(key))
      return need(w, 'palavra ' + spec + (index != null ? ':' + index : ''))
    },
    text(id) {
      return T.scene(id).on_screen || ''
    },
  }
  window.T = T
})()
