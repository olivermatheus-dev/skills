BLOCO('cena/caos-cards', function ({ tl, K, root, $, $$, cena, cue, texto, fala, params }) {
  const f = fala(0)
  const names = params.cards || []
  $$('.card .nm').forEach((n, i) => (n.textContent = names[i] || ''))
  K.flash($('.h2a'), texto('linha1'), cena.start + 0.15)
  K.out($('.h2a'), cue('card2') - 0.2, 0.2, -30)
  K.type($('.h2b'), texto('linha2'), f, cue('card2'), 34, true)
  K.out($('.h2b'), cue('card3') - 0.2, 0.2, -30)
  K.type($('.h2c'), texto('linha3'), f, cue('card3'), 34, true)
  const cards = [$('.c1'), $('.c2'), $('.c3')]
  const cardIn = (c, at, rot) => tl.fromTo(c, { opacity: 0, y: 90, rotation: 0, scale: 0.86 }, { opacity: 1, y: 0, rotation: rot, scale: 1, ...M.SOFT }, at)
  cardIn(cards[0], cue('card1'), -5); cardIn(cards[1], cue('card2'), 4); cardIn(cards[2], cue('card3'), -3)
  // vida enquanto falam: cada card flutua
  ;[-1, 1, -1].forEach((s, i) => tl.to(cards[i], { y: `+=${14 * s}`, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: 1 }, cue(['card1', 'card2', 'card3'][i]) + 0.6))
  // "espalhadas": alerta em cada card, tudo se afasta
  $$('.warn').forEach((w, i) => K.pop(w, cue('espalha') + i * 0.07, 0.2))
  tl.to(cards[0], { x: -40, rotation: -9, duration: 0.9, ease: M.SOFT.ease }, cue('espalha'))
  tl.to(cards[1], { x: 24, rotation: 8, duration: 0.9, ease: M.SOFT.ease }, cue('espalha'))
  tl.to(cards[2], { x: -34, rotation: -7, duration: 0.9, ease: M.SOFT.ease }, cue('espalha'))
  tl.fromTo(root, { scale: 1 }, { scale: 1.035, duration: cena.dur, ease: 'sine.inOut' }, cena.start)
  tl.to(cards[0], { x: -700, rotation: -20, opacity: 0, duration: 0.34, ease: 'power3.in' }, cue('sai'))
  tl.to(cards[1], { x: 700, rotation: 18, opacity: 0, duration: 0.34, ease: 'power3.in' }, cue('sai') + 0.03)
  tl.to(cards[2], { y: 500, rotation: -12, opacity: 0, duration: 0.34, ease: 'power3.in' }, cue('sai') + 0.05)
  K.out($('.h2c'), cue('sai'), 0.28)
})
