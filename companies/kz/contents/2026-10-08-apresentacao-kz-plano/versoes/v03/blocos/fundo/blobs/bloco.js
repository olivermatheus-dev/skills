BLOCO('fundo/blobs', function ({ tl, $, cena, params }) {
  const [x1, y1] = params.deriva1, [x2, y2] = params.deriva2
  tl.fromTo($('.b1'), { x: 0, y: 0 }, { x: x1, y: y1, duration: cena.dur, ease: 'sine.inOut' }, cena.start)
  tl.fromTo($('.b2'), { x: 0, y: 0 }, { x: x2, y: y2, duration: cena.dur, ease: 'sine.inOut' }, cena.start)
})
