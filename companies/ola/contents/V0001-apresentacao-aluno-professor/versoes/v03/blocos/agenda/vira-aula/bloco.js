BLOCO('agenda/vira-aula', function ({ tl, root, $, $$, cena, cue, texto, params }) {
  if (cena.start <= 0.001) root.style.opacity = 1; else tl.set(root, { opacity: 1 }, cena.start)
  const md = (s) => s.replace(/\*([^*]+)\*/g, '<b class="acc">$1</b>')
  $('.h1').innerHTML = md(texto('headline'))
  $('.h2').innerHTML = md(texto('headline2'))
  $$('.comp').forEach((c) => (c.textContent = texto('compromisso')))
  $('.aula .t').textContent = texto('pilula')
  $('.vao span').textContent = params.vao
  ;[270, 500, 750].forEach((y, i) => $('.hs').insertAdjacentHTML('beforeend', `<span style="top:${y}px">${params.horas[i]}</span>`))
  const tE = cue('entra'), tP = cue('pulsa'), tR = cue('relogio'), tV = cue('vira'), tB = cue('brilho'), tS = cue('sai')

  tl.fromTo(root, { scale: 1 }, { scale: 1.02, duration: cena.dur, ease: 'sine.inOut', transformOrigin: '50% 45%' }, cena.start)
  // 1º quadro: a agenda (veio do calendário) e a pergunta inteira
  tl.fromTo($('.h1'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, ...M.FAST, duration: 0.35 }, tE)
  tl.fromTo([$('.c1'), $('.vao'), $('.c2')], { opacity: 0, y: 24 }, { opacity: (i) => (i === 1 ? 0.4 : 1), y: 0, ...M.FAST, duration: 0.35, stagger: 0.05 }, tE + 0.05)
  tl.fromTo($$('.hs span'), { opacity: 0 }, { opacity: 1, duration: 0.25, stagger: 0.04 }, tE + 0.1)
  tl.fromTo($('.relo'), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, ...M.SOFT, duration: 0.5 }, tE + 0.1)
  // o vão pulsa e mostra 30'
  tl.to($('.vao span'), { opacity: 1, duration: 0.2 }, tP)
  tl.fromTo($('.vao span'), { scale: 0.7 }, { scale: 1, ...M.SOFT, duration: 0.5 }, tP)
  tl.to($('.vao'), { opacity: 0.75, scale: 1.02, duration: 0.4, yoyo: true, repeat: 3, ease: 'sine.inOut' }, tP)
  // o relógio pula; o tracejado acende
  tl.to($('.relo'), { rotation: 18, duration: 0.12, ease: 'power2.out' }, tR)
  tl.to($('.relo'), { rotation: 0, duration: 0.3, ease: 'power2.inOut' }, tR + 0.12)
  tl.to($('.vao'), { opacity: 1, duration: 0.2 }, tR)
  // VIRA AULA: corte seco na batida. O vão já está cheio
  tl.set([$('.vao'), $('.h1')], { opacity: 0 }, tV)
  tl.set([$('.aula'), $('.h2')], { opacity: 1 }, tV)
  tl.fromTo($('.aula'), { scale: 1.08 }, { scale: 1, ...M.SNAP, duration: 0.25, immediateRender: false }, tV)
  tl.fromTo($('.h2'), { scale: 1.06 }, { scale: 1, ...M.SNAP, duration: 0.25, immediateRender: false }, tV)
  tl.fromTo($('.brilho'), { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1, ...M.SOFT, duration: 0.45, immediateRender: false }, tB)
  tl.to($('.aula .mini'), { scale: 1.1, duration: 0.12, yoyo: true, repeat: 1 }, tB + 0.1)
  // saída: a aula sobe e vira o círculo vermelho do card professor (cena seguinte)
  const D = params.destino
  const d = Math.max(0.2, cena.end - tS)
  tl.to([$('.h2'), $('.ag'), $('.hs'), $$('.comp'), $('.relo'), $('.brilho')].flat(), { opacity: 0, duration: d * 0.6, ease: 'power2.in' }, tS)
  tl.to($('.aula > *'), { opacity: 0, duration: d * 0.4 }, tS)
  tl.to($('.aula'), { x: D[0] - 600, y: D[1] - 600, scaleX: D[2] / 500, scaleY: D[2] / 220, borderRadius: 120, duration: d, ease: 'power3.inOut' }, tS)
  tl.set(root, { opacity: 0 }, cena.end)
})
