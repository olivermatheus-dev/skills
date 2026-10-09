BLOCO('cena/janelas-espremem', function ({ tl, K, root, $, $$, cena, cue, texto, params, box }) {
  const s = cena.start, ad = [$('.ag'), $('.pa'), $('.an')], ses = $('.ses'), cam = $('.cam'), uni = $('.unica')
  // centros medidos antes de qualquer transform (para a fusão no centro)
  const cU = box(uni), cs = [...ad, ses].map((el) => box(el))
  // começa no estado em que a s2 terminou
  tl.set(ses, { opacity: 1 }, s)
  ad.forEach((el, i) => tl.set(el, { opacity: 1, rotation: params.giro[i], x: params.dx[i], zIndex: 3 + i }, s))
  tl.set($('.illus'), { opacity: 1 }, s)
  K.flash($('.h3'), texto('headline'), cue('entra') + 0.04)
  // 1º empurrão: a gestão cresce, a Sessão vai para o canto e fica por cima (para ser vista)
  const [cx, cy] = params.canto
  tl.set(ses, { zIndex: 10 }, cue('espreme') - 0.02)
  tl.to(ses, { x: cx, y: cy, scale: 0.62, ...M.GENTLE, duration: 0.9 }, cue('espreme'))
  tl.to(ad, { scale: 1.1, y: 30, duration: 0.9, ease: M.GENTLE.ease }, cue('espreme'))
  // pressão contínua até o 2º empurrão
  tl.to(ses, { scale: 0.58, duration: Math.max(0.3, cue('aperta') - cue('espreme') - 0.9), ease: 'none' }, cue('espreme') + 0.9)
  tl.to(ses, { x: cx + 20, y: cy + 25, scale: 0.5, duration: 0.6, ease: 'power2.out' }, cue('aperta'))
  tl.to(ad, { scale: 1.16, y: 50, duration: 0.6, ease: 'power2.out' }, cue('aperta'))
  tl.to(ses, { scale: 0.47, duration: Math.max(0.3, cue('destaca') - cue('aperta') - 0.6), ease: 'none' }, cue('aperta') + 0.6)
  // "realmente importa" (anotação c1 do Oliver): a Sessão sai do canto, cresce e vai para o centro; a gestão inteira apaga
  const [px, py] = params.destaque
  tl.to(ses, { x: px - cs[3].x, y: py - cs[3].y, scale: params.escala_destaque, ...M.GENTLE, duration: 0.8 }, cue('destaca'))
  tl.to(ad, { opacity: params.apagado, duration: 0.5, ease: 'power2.out' }, cue('destaca'))
  // "atender": só a Sessão pulsa
  tl.to(ses, { scale: params.escala_destaque * 1.05, duration: 0.3, yoyo: true, repeat: 1, ease: 'sine.inOut' }, cue('importa'))
  tl.fromTo($('.sring'), { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, ...M.FAST }, cue('importa'))
  K.pop($('.sheart'), cue('importa') + 0.12, 0.3)
  tl.to($('.sring'), { scale: 1.05, duration: 0.3, yoyo: true, repeat: 1, ease: 'sine.inOut' }, cue('importa') + 0.45)
  // fim: tudo desliza para o centro e encaixa numa janela única (a revelação começa nela)
  const t = cue('sai')
  ;[...ad, ses].forEach((el, i) => tl.to(el, { x: cU.x - cs[i].x, y: cU.y - cs[i].y, scale: 0.25, rotation: 0, duration: 0.32, ease: 'power3.in' }, t + i * 0.02))
  tl.to([...ad, ses], { opacity: 0, duration: 0.12 }, t + 0.24)
  tl.fromTo($('.trio'), { scale: 0.6 }, { scale: 1, duration: 0.3, ease: 'power2.out' }, t + 0.22)
  tl.fromTo(uni, { opacity: 0, scale: 0.22 }, { opacity: 1, scale: 0.3, duration: 0.18, ease: 'power2.out' }, t + 0.22)
  tl.to([$('.h3'), $('.illus')], { opacity: 0, duration: 0.25 }, t)
  tl.set(root, { opacity: 0 }, cena.end)
})
