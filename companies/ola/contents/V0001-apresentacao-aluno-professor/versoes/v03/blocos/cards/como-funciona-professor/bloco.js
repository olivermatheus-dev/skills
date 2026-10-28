BLOCO('cards/como-funciona-professor', function ({ tl, root, $, $$, cena, cue, texto, params, box, cursor }) {
  if (cena.start <= 0.001) root.style.opacity = 1; else tl.set(root, { opacity: 1 }, cena.start)
  const md = (s) => s.replace(/\*([^*]+)\*/g, '<b class="acc">$1</b>')
  $('.rot').textContent = texto('rotulo').replace(/\*/g, '')
  $('.hd').innerHTML = md(texto('headline'))
  const ks = [1, 2, 3, 4].map((i) => $('.k' + i))
  ks.forEach((k, i) => (k.querySelector('.ct').textContent = texto('c' + (i + 1)).replace(/\*/g, '')))
  params.horarios.forEach((h) => $('.hrs').insertAdjacentHTML('beforeend', `<div class="hr"><span>${h}</span><span class="tg"><span class="on"></span><i></i></span></div>`))
  $$('.r span').forEach((s, i) => (s.textContent = params.riscos[i]))
  $('.pp .t').textContent = params.pilula
  for (let i = 0; i < 10; i++) $('.cal').insertAdjacentHTML('beforeend', `<span${i === 6 ? ' class="dia"' : ''}></span>`)
  const tgs = $$('.tg')
  const pTg = [box(tgs[0], 0.6, 0.6), box(tgs[2], 0.6, 0.6)]
  const cal = $('.cal'), cCal = box(cal, 0.5, 0.5)
  const tE = cue('entra'), tTg = cue('toggle'), tS = cue('sai')

  // vivo: a cena respira devagar (sem tela parada entre as falas)
  tl.fromTo(root, { scale: 1 }, { scale: 1.015, duration: cena.dur, ease: 'sine.inOut', transformOrigin: '50% 50%' }, cena.start)
  // 1º quadro: rótulo, headline e o card 1 (era o bloco verde)
  tl.fromTo([$('.rot'), $('.hd')], { opacity: 0, y: 20 }, { opacity: 1, y: 0, ...M.FAST, duration: 0.35, stagger: 0.06 }, tE)
  tl.fromTo(ks[0].querySelector('.ci'), { opacity: 0 }, { opacity: 1, duration: 0.25 }, tE + 0.1)
  const ativa = (i, t) => {
    ks.forEach((k, j) => { if (j !== i) tl.to(k.querySelector('.ring'), { opacity: 0, duration: 0.15 }, t) })
    tl.to(ks[i].querySelector('.ring'), { opacity: 1, duration: 0.15 }, t + 0.05)
    tl.to(ks[i].querySelector('.cic'), { y: -8, rotation: 6, duration: 0.7, yoyo: true, repeat: 3, ease: 'sine.inOut' }, t + 0.4)
  }
  ativa(0, tE + 0.2)
  // card 1: o cursor liga dois horários
  const C = cursor()
  tl.set(C.el, { x: 620, y: 700 }, cena.start)
  tl.to(C.el, { opacity: 1, duration: 0.1 }, tE + 0.15)
  C.move(pTg[0], tE + 0.15, Math.max(0.2, tTg - tE - 0.2))
  ;[0, 2].forEach((idx, j) => {
    const t = tTg + j * 0.32
    if (j) C.move(pTg[1], tTg + 0.08, 0.22)
    C.click(pTg[j], t)
    tl.to(tgs[idx].querySelector('.on'), { opacity: 1, duration: 0.12 }, t + 0.02)
    tl.to(tgs[idx].querySelector('i'), { x: 38, ...M.SNAP, duration: 0.25 }, t + 0.02)
  })
  tl.to(C.el, { opacity: 0, duration: 0.15 }, tTg + 0.75)
  // card 2: entra; a pílula paga pousa
  tl.fromTo(ks[1], { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, ...M.SOFT, duration: 0.5 }, cue('c2'))
  ativa(1, cue('c2'))
  tl.fromTo($('.pp'), { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, ...M.SNAP, duration: 0.3 }, cue('carimbo'))
  // card 3: duas linhas riscadas
  tl.fromTo(ks[2], { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, ...M.SOFT, duration: 0.5 }, cue('c3'))
  ativa(2, cue('c3'))
  $$('.r i').forEach((r, i) => tl.to(r, { scaleX: 1, duration: 0.28, ease: 'power2.out' }, cue('risco' + (i + 1))))
  $$('.r span').forEach((s, i) => tl.to(s, { opacity: 0.5, duration: 0.2 }, cue('risco' + (i + 1)) + 0.2))
  // card 4: relógio e calendário; o dia do pagamento é marcado
  tl.fromTo(ks[3], { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, ...M.SOFT, duration: 0.5 }, cue('c4'))
  ativa(3, cue('c4'))
  tl.fromTo($('.cal .dia'), { '--m': 0, scale: 1 }, { '--m': 1, scale: 1.12, duration: 0.25, ease: 'power2.out' }, cue('marca'))
  tl.to($('.rel'), { rotation: 8, duration: 0.18, yoyo: true, repeat: 3, ease: 'sine.inOut' }, cue('c4') + 0.4)
  // saída: o calendário do card 4 cresce e vira a agenda da cena seguinte
  const D = params.destino
  const d = Math.max(0.2, cena.end - tS)
  tl.to([$('.rot'), $('.hd'), ks[0], ks[1], ks[2]], { opacity: 0, duration: d * 0.6, ease: 'power2.in' }, tS)
  tl.to([ks[3].querySelector('.ct'), ks[3].querySelector('.cic'), $('.rel'), ks[3].querySelector('.ring')], { opacity: 0, duration: d * 0.4 }, tS)
  tl.to(ks[3], { x: D[0] + D[2] / 2 - (550 + 225), y: D[1] + D[3] / 2 - (700 + 200), scaleX: D[2] / 450, scaleY: D[3] / 400, duration: d, ease: 'power3.inOut' }, tS)
  tl.to(cal, { opacity: 0, duration: d * 0.5 }, tS + d * 0.3)
  tl.set(root, { opacity: 0 }, cena.end)
})
