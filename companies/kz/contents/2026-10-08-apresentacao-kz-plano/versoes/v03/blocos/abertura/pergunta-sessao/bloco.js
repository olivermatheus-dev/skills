BLOCO('abertura/pergunta-sessao', function ({ tl, K, root, $, $$, cena, cue, texto, params }) {
  const e = cue('entra'), ad = [$('.ag'), $('.pa'), $('.an')], ses = $('.ses')
  // 1º quadro: a Sessão calma no centro e a pergunta inteira por cima
  tl.fromTo(ses, { opacity: 0, y: 30, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, ...M.SOFT }, Math.max(cena.start, e - 0.02))
  K.pop($('.badge'), e, 0.4)
  K.flash($('.q1t'), texto('pergunta'), e + 0.04, 50)
  // a pergunta sobe e encolhe; o complemento entra inteiro
  tl.to($('.q1'), { y: -85, scale: 0.3, duration: 0.75, ease: M.GENTLE.ease }, cue('troca'))
  K.flash($('.q2'), texto('complemento'), cue('troca') + 0.12, 34)
  // as 3 janelas da rotina pipocam por cima da Sessão (a cena seguinte começa exatamente neste estado)
  ad.forEach((el, i) => tl.fromTo(el, { opacity: 0, scale: 0.3, rotation: 0, y: 50 }, { opacity: 1, scale: params.escala, rotation: params.giro[i], y: 0, ...M.SOFT }, cue('espalha') + i * 0.09))
  // vivo: a Sessão respira até ser coberta
  tl.fromTo(ses, { scale: 1 }, { scale: 1.025, duration: Math.max(0.4, cue('espalha') - e), ease: 'sine.inOut' }, e + 0.6)
  tl.to(ses, { scale: 1, duration: 0.4, ease: 'power2.out' }, cue('espalha'))
  // saída: o texto sai; as janelas ficam até o corte (a s2 parte delas)
  K.out([$('.q1'), $('.q2')], cena.end - 0.25, 0.25, -30)
  tl.set(root, { opacity: 0 }, cena.end)
})
