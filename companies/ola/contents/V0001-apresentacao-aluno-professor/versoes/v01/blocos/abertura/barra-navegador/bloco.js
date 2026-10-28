BLOCO('abertura/barra-navegador', function ({ tl, root, $, $$, cena, cue, texto, params }) {
  if (cena.start <= 0.001) root.style.opacity = 1; else tl.set(root, { opacity: 1 }, cena.start)
  const url = texto('url')
  $('.fav').src = params.favicon
  $('.ttl').textContent = texto('aba')
  const tDig = cue('digita'), tEnter = cue('enter'), tDiv = cue('divide')
  // caret pisca até a digitação e depois do Enter some
  tl.to($('.caret'), { opacity: 0, duration: 0.12, repeat: Math.max(1, Math.floor((tDig - cena.start) / 0.24)), yoyo: true, ease: 'none' }, cena.start)
  // URL letra a letra no intervalo que sobra até o Enter
  const passo = Math.min(0.045, Math.max(0.012, (tEnter - tDig - 0.06) / url.length))
  for (let i = 1; i <= url.length; i++) tl.set($('.txt'), { textContent: url.slice(0, i) }, tDig + i * passo)
  // Enter: a barra afunda e solta; a linha de carregamento corre
  tl.to($('.nav'), { scale: 0.97, duration: 0.07, ease: 'power2.out' }, tEnter)
  tl.to($('.nav'), { scale: 1, ...M.FAST, duration: 0.35 }, tEnter + 0.07)
  tl.to($('.caret'), { opacity: 0, duration: 0.05 }, tEnter)
  tl.to($('.load'), { scaleX: 1, duration: Math.max(0.15, tDiv - tEnter - 0.02), ease: 'power2.inOut' }, tEnter + 0.02)
  // divide: controles saem em cascata, a barra vira duas metades que crescem nos dois cards da escolha
  const sai = [$$('.dots i'), $('.tab'), $$('.ctl'), $('.url')].flat()
  tl.to(sai, { opacity: 0, y: -14, duration: 0.14, stagger: 0.03, ease: 'power2.in' }, tDiv)
  const bar = { x: 90, y: 470, w: 900, h: 190 }
  const [c1, c2] = params.cards
  const halves = $$('.half')
  ;[c1, c2].forEach((c, i) => {
    const h = halves[i]
    Object.assign(h.style, { left: c[0] + 'px', top: c[1] + 'px', width: c[2] + 'px', height: c[3] + 'px' })
    const de = { x: bar.x + i * bar.w / 2 - c[0], y: bar.y - c[1], scaleX: (bar.w / 2) / c[2], scaleY: bar.h / c[3] }
    tl.set(h, { ...de, opacity: 1 }, tDiv + 0.1)
    tl.to(h, { x: 0, y: 0, scaleX: 1, scaleY: 1, ...M.SOFT, duration: Math.max(0.25, cena.end - tDiv - 0.1) }, tDiv + 0.1 + i * 0.04)
  })
  tl.set($('.bar'), { opacity: 0 }, tDiv + 0.1)
  tl.set(root, { opacity: 0 }, cena.end)
})
