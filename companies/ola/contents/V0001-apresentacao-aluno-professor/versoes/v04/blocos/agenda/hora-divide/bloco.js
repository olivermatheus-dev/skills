BLOCO('agenda/hora-divide', function ({ tl, root, $, $$, cena, cue, texto, params, cursor }) {
  if (cena.start <= 0.001) root.style.opacity = 1; else tl.set(root, { opacity: 1 }, cena.start)
  const md = (s) => s.replace(/\*([^*]+)\*/g, '<b class="acc">$1</b>')
  // headline palavra a palavra (cada palavra no seu cue p1…pN); a ênfase *x* fica em Bold
  const h1 = texto('headline')
  const palavras = []
  h1.replace(/\*([^*]+)\*|(\S+)/g, (_, acc, w) => { (acc || w).split(/\s+/).forEach((p) => palavras.push({ p, acc: !!acc })); return '' })
  $('.h1').innerHTML = palavras.map(({ p, acc }) => `<span class="pw${acc ? ' acc' : ''}">${p}</span>`).join(' ')
  $('.h2').innerHTML = md(texto('headline2'))
  const N = { 60: $('.n60'), 30: $('.n30'), 15: $('.n15') }
  N[60].textContent = texto('n60'); N[30].textContent = texto('n30'); N[15].textContent = texto('n15')
  $('.rodape-ilustr').textContent = params.rodape
  const R = params.pilula
  const pil = $('.pil')
  Object.assign(pil.style, { left: R[0] + 'px', top: R[1] + 'px', width: R[2] + 'px', height: R[3] + 'px' })
  pil.querySelector('span').textContent = texto('pilula')
  params.dias.forEach((d) => $('.cols').insertAdjacentHTML('beforeend', `<div class="col"><b>${d}</b></div>`))

  // geometria (palco): coluna i tem centro cx(i); minutos viram altura
  const AG = { x: 80, w: 920 }, colW = AG.w / params.dias.length
  const cx = (i) => AG.x + colW * (i + 0.5)
  const PX = 10
  const rot = (s) => s.split('×').pop().trim()
  const LAY = {
    60: [{ d: 3, y: 400 }],
    30: [{ d: 1, y: 430 }, { d: 4, y: 470 }],
    15: [{ d: 0, y: 440 }, { d: 2, y: 410 }, { d: 4, y: 470 }, { d: 6, y: 430 }],
  }
  const nomes = {}
  const ini = (k) => { const lista = params.elenco[k] || ['?']; nomes[k] = (nomes[k] ?? -1) + 1; return { n: lista[nomes[k] % lista.length][0], i: nomes[k] % lista.length } }
  const flag = { CO: 'assets/flags/co.svg', AR: 'assets/flags/ar.svg', MX: 'assets/flags/mx.svg' }
  const aulas = {}
  for (const min of [60, 30, 15]) {
    aulas[min] = LAY[min].map((p, j) => {
      const el = document.createElement('div')
      el.className = 'dch'
      Object.assign(el.style, { left: cx(p.d) - 52 + 'px', top: p.y + 'px', height: min * PX + 'px' })
      el.textContent = rot(texto('n' + min))
      $('.chips').appendChild(el)
      const k = (params.avatares[min] || [])[j] || 'CO'
      const who = ini(k)
      const av = document.createElement('div')
      av.className = `av k-${k}${k === 'AR' ? who.i : ''}`
      av.innerHTML = `<span class="ini">${who.n}</span><img class="flag" src="${flag[k] || flag.CO}" alt="" />`
      Object.assign(av.style, { left: cx(p.d) - 39 + 'px', top: p.y + min * PX - 39 + 'px' })
      $('.avs').appendChild(av)
      return { el, av, x: cx(p.d), y: p.y, min }
    })
    // a numeração dos nomes reinicia a cada duração (60: Carlos · 30: Lucía, Martín · 15: Lucía, Martín, Carlos, Mateo)
    for (const k of Object.keys(nomes)) delete nomes[k]
  }
  const c = (n, d) => cue(n, d)
  const tE = c('entra'), tV60 = c('v60'), tA60 = c('av60'), tV30 = c('v30'), tA30 = c('av30'), tV15 = c('v15'), tA15 = c('av15')
  const tT = c('troca'), tAr = c('arrasta'), tAs = c('assenta'), tDe = c('destaca'), tS = c('sai')

  // vivo: a cena respira devagar
  tl.fromTo(root, { scale: 1 }, { scale: 1.012, duration: cena.dur, ease: 'sine.inOut', transformOrigin: '50% 50%' }, cena.start)
  // 1º quadro: a pílula já está no lugar (hard cut do fundo); a agenda entra
  tl.set(pil, { opacity: 1 }, cena.start)
  tl.fromTo($('.agenda'), { opacity: 0, y: 60 }, { opacity: 1, y: 0, ...M.SOFT, duration: 0.6 }, tE + 0.05)
  tl.fromTo($$('.col b'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.25, stagger: 0.03 }, tE + 0.2)
  tl.to(pil, { scale: 1.04, duration: 0.45, yoyo: true, repeat: 3, ease: 'sine.inOut' }, tE + 0.3)
  // headline: cada palavra surge de baixo, suave, quando é dita
  $$('.h1 .pw').forEach((w, i) => tl.fromTo(w, { opacity: 0, y: 34 }, { opacity: 1, y: 0, ...M.SOFT, duration: 0.5 }, c('p' + Math.min(i + 1, 5), tE + i * 0.25)))
  // 1 × 60': a pílula cai inteira na agenda
  const a60 = aulas[60][0]
  tl.to(pil, { x: a60.x - (R[0] + R[2] / 2), y: a60.y - R[1], scaleX: 104 / R[2], opacity: 0, duration: 0.3, ease: 'power2.in' }, tV60 - 0.15)
  tl.fromTo(a60.el, { opacity: 0, scaleY: 0.2 }, { opacity: 1, scaleY: 1, ...M.SNAP, duration: 0.35 }, tV60 + 0.1)
  tl.fromTo(N[60], { opacity: 0, y: 30 }, { opacity: 1, y: 0, ...M.FAST, duration: 0.35 }, tV60)
  tl.fromTo(a60.av, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, ...M.SOFT, duration: 0.45 }, tA60)
  // parte em pedaços que vão para os seus dias (o número troca, centralizado)
  const parte = (de, para, t) => {
    tl.to(de.flatMap((a) => [a.el, a.av]), { opacity: 0, duration: 0.15 }, t + 0.05)
    para.forEach((p, i) => {
      const o = de[Math.min(de.length - 1, Math.floor(i * de.length / para.length))]
      tl.fromTo(p.el, { opacity: 0, x: o.x - p.x, y: o.y - p.y, scaleY: 0.5 }, { opacity: 1, x: 0, y: 0, scaleY: 1, duration: 0.38, ease: 'power3.out' }, t + 0.05 + i * 0.05)
    })
  }
  parte(aulas[60], aulas[30], tV30)
  M.swap(tl, N[60], N[30], tV30)
  tl.fromTo(aulas[30].map((a) => a.av), { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, ...M.SOFT, duration: 0.45, stagger: 0.12 }, tA30)
  parte(aulas[30], aulas[15], tV15)
  M.swap(tl, N[30], N[15], tV15)
  tl.fromTo(aulas[15].map((a) => a.av), { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, ...M.SOFT, duration: 0.45, stagger: 0.1 }, tA15)
  // headline troca inteira
  tl.to($('.h1'), { opacity: 0, filter: 'blur(8px)', duration: 0.18, ease: 'power2.in' }, tT)
  tl.fromTo($('.h2'), { opacity: 0, filter: 'blur(8px)', scale: 1.02 }, { opacity: 1, filter: 'blur(0px)', scale: 1, duration: 0.32, ease: M.SNAP.ease }, tT + 0.08)
  // o cursor arrasta UMA das aulas de 15' (qua → qui), com o avatar junto
  const ar = aulas[15][1]
  const C = cursor()
  const pega = { x: ar.x + 10, y: ar.y + 15 * PX * 0.5 }
  const dx = cx(3) - cx(2), dy = 30
  tl.set(C.el, { x: 1000, y: 1130 }, cena.start)
  tl.to(C.el, { opacity: 1, duration: 0.1 }, tT)
  C.move(pega, tT, Math.max(0.15, tAr - tT))
  tl.to([ar.el, ar.av], { scale: 1.06, duration: 0.12, ease: 'power2.out' }, tAr)
  const dArr = Math.max(0.3, tAs - tAr - 0.05)
  tl.to([ar.el, ar.av], { x: dx, y: dy, duration: dArr, ease: 'power2.inOut' }, tAr + 0.05)
  tl.to(C.el, { x: pega.x + dx, y: pega.y + dy, duration: dArr, ease: 'power2.inOut' }, tAr + 0.05)
  tl.to([ar.el, ar.av], { scale: 1, ...M.SNAP, duration: 0.25 }, tAs)
  tl.to(C.el, { x: pega.x + dx + 120, y: pega.y + dy + 160, opacity: 0, duration: 0.35, ease: 'power2.in' }, tAs + 0.1)
  // com quem quiser: os avatares pulsam em sequência
  tl.to(aulas[15].map((a) => a.av), { scale: 1.18, duration: 0.16, yoyo: true, repeat: 1, stagger: 0.12, ease: 'power2.out' }, tDe)
  tl.fromTo($('.rodape-ilustr'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, tA60)
  // saída: o avatar da Colômbia vira o 1º card da cena seguinte
  const co = aulas[15].find((a) => a.av.className.includes('k-CO')) || aulas[15][0]
  const D = params.destino_avatar
  const dS = Math.max(0.25, cena.end - tS)
  const coPos = { x: co.x + (co === ar ? dx : 0), y: co.y + co.min * PX + (co === ar ? dy : 0) }
  tl.to([$('.hd'), $('.num'), $('.agenda'), $('.chips'), $('.rodape-ilustr'), ...aulas[15].filter((a) => a !== co).map((a) => a.av)], { opacity: 0, duration: dS * 0.6, ease: 'power2.in' }, tS)
  tl.to(co.av, { x: D[0] - coPos.x, y: D[1] - coPos.y, scale: D[2] / 78, duration: dS, ease: 'power3.inOut' }, tS)
  tl.set(root, { opacity: 0 }, cena.end)
})
