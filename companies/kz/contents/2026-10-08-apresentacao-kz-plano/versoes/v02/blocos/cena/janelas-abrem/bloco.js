BLOCO('cena/janelas-abrem', function ({ tl, K, root, $, $$, cena, cue, texto, params }) {
  const s = cena.start, ad = [$('.ag'), $('.pa'), $('.an')], G = params.giro, GF = params.giro_final, DX = params.dx_final
  // começa no estado em que a abertura terminou: Sessão no centro, 3 janelas pequenas por cima
  tl.set($('.ses'), { opacity: 1 }, s)
  ad.forEach((el, i) => tl.set(el, { opacity: 1, scale: params.escala_inicial, rotation: G[i] }, s))
  tl.fromTo($('.illus'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, s + 0.2)
  K.flash($('.h2'), texto('headline'), cue('entra') + 0.04)
  // o suspiro: tudo assenta um pouco
  tl.to(ad, { y: 14, duration: 0.8, ease: 'sine.inOut' }, s + 0.05)
  // cada janela cresce na sua palavra e vem para a frente
  ;[['agenda', 0], ['pacientes', 1], ['notas', 2]].forEach(([c, i], k) => {
    tl.set(ad[i], { zIndex: 3 + k }, cue(c) - 0.01)
    tl.to(ad[i], { scale: 1, y: 0, ...M.SOFT }, cue(c))
  })
  // vivo: a câmera respira (volta a 1 no corte; a s3 começa sem escala) e a Sessão por trás também
  tl.to($('.cam'), { scale: 1.025, duration: cena.dur / 2, yoyo: true, repeat: 1, ease: 'sine.inOut' }, s)
  tl.to($('.ses'), { y: -10, duration: Math.max(0.4, cue('pacientes') - s), ease: 'sine.inOut' }, s)
  tl.to($('.ses'), { y: 0, duration: 0.6, ease: 'sine.inOut' }, cue('pacientes'))
  // "espalhadas": a mesma paciente nos 3 lugares acende junto; tudo entorta e se afasta
  tl.to($$('.rg'), { opacity: 1, duration: 0.22, stagger: 0.05 }, cue('espalha'))
  tl.fromTo($$('.mark'), { scale: 1 }, { scale: 1.12, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out', stagger: 0.05 }, cue('espalha'))
  ad.forEach((el, i) => tl.to(el, { rotation: GF[i], x: DX[i], duration: 0.6, ease: 'power2.out' }, cue('espalha')))
  // vivo até o corte, voltando ao mesmo lugar (a s3 começa nele)
  const resto = cena.end - cue('espalha') - 0.6
  if (resto > 0.4) tl.to(ad, { y: 8, duration: resto / 2, yoyo: true, repeat: 1, ease: 'sine.inOut' }, cue('espalha') + 0.6)
  K.out($('.h2'), cena.end - 0.22, 0.2, -24)
  tl.set(root, { opacity: 0 }, cena.end)
})
