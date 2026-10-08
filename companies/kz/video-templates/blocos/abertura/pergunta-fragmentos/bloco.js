BLOCO('abertura/pergunta-fragmentos', function ({ tl, K, $, $$, cena, cue, texto, fala, params }) {
  const f = fala(0)
  K.pop($('.badge'), cue('entra'), 0.3)
  tl.fromTo($('.badge'), { rotation: -12 }, { rotation: 0, ...M.SOFT, duration: 0.7 }, cue('entra'))
  K.type($('.q1t'), texto('pergunta'), f, cue('entra') + 0.06, 60)
  tl.to($('.q1'), { y: -190, scale: 0.42, duration: 0.75, ease: M.GENTLE.ease }, cue('troca'))
  K.type($('.q2'), texto('complemento'), f, cue('troca') + 0.12, 40, true)
  const some = cena.end + params.sobra
  $$('.frag').forEach((el, i) => {
    const [x, y, r] = params.posicoes[i]
    tl.fromTo(el, { opacity: 0, x: -110, y: -40, scale: 0.3, rotation: 0 }, { opacity: 1, x, y, scale: 1, rotation: r, ...M.SOFT }, cue('espalha') + i * 0.09)
    // o suspiro do começo da cena seguinte: os pedaços "caem" um pouco e somem
    tl.to(el, { y: y + 40 + i * 6, rotation: r * 1.6, duration: 1.0, ease: 'sine.inOut' }, cena.end)
    tl.to(el, { opacity: 0, scale: 0.6, filter: 'blur(6px)', duration: 0.25, ease: 'power2.in' }, some - 0.12 + i * 0.04)
  })
  tl.fromTo($('.main'), { scale: 1 }, { scale: 1.03, duration: cena.dur, ease: 'sine.inOut' }, cena.start)
  K.out($('.main'), cena.end - 0.26, 0.28, -50)
})
