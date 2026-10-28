BLOCO('agenda/hora-divide', function ({ tl, root, $, $$, cena, cue, texto, params, cursor }) {
  if (cena.start <= 0.001) root.style.opacity = 1; else tl.set(root, { opacity: 1 }, cena.start)
  const md = (s) => s.replace(/\*([^*]+)\*/g, '<b class="acc">$1</b>')
  $('.h1').innerHTML = md(texto('headline'))
  $('.h2').innerHTML = md(texto('headline2'))
  $('.n4').textContent = texto('n4'); $('.n2').textContent = texto('n2'); $('.n1').textContent = texto('n1')
  $('.rodape-ilustr').textContent = params.rodape
  const R = params.pilula
  const pil = $('.pil')
  Object.assign(pil.style, { left: R[0] + 'px', top: R[1] + 'px', width: R[2] + 'px', height: R[3] + 'px' })
  pil.querySelector('span').textContent = texto('pilula')
  params.dias.forEach((d) => $('.cols').insertAdjacentHTML('beforeend', `<div class="col"><b>${d}</b></div>`))

  // geometria da agenda (palco): coluna i tem centro cx(i); minutos viram altura
  const AG = { x: 80, y: 300, w: 920 }, colW = AG.w / params.dias.length
  const cx = (i) => AG.x + colW * (i + 0.5)
  const PX = 10 // px por minuto
  const topo = { 0: 420, 1: 470, 3: 400, 5: 440 }
  const chip = (dia, min, rot) => {
    const el = document.createElement('div')
    el.className = 'dch'
    Object.assign(el.style, { left: cx(dia) - 52 + 'px', top: topo[dia] + 'px', height: min * PX + 'px' })
    el.textContent = rot
    $('.chips').appendChild(el)
    return el
  }
  const rot = (s) => s.split('×').pop().trim()
  const c15 = [0, 1, 3, 5].map((d) => chip(d, 15, rot(texto('n4'))))
  const c30 = { 1: chip(1, 30, rot(texto('n2'))), 3: chip(3, 30, rot(texto('n2'))) }
  const c60 = chip(3, 60, rot(texto('n1')))
  // 4 pedaços da pílula (mesmo comprimento total)
  const pw = (R[2] - 3 * 12) / 4
  const pecas = [0, 1, 2, 3].map((i) => {
    const el = document.createElement('div')
    el.className = 'peca'
    Object.assign(el.style, { left: R[0] + i * (pw + 12) + 'px', top: R[1] + 'px', width: pw + 'px' })
    el.textContent = rot(texto('n4'))
    $('.pecas').appendChild(el)
    return el
  })
  const tE = cue('entra'), tD = cue('divide'), tJ2 = cue('junta2'), tJ1 = cue('junta1'), tEn = cue('encaixa')
  const tT = cue('troca'), tA = cue('arrasta'), tAs = cue('assenta'), tAv = cue('avatar'), tS = cue('sai')

  // vivo: a cena respira devagar (sem tela parada entre as falas)
  tl.fromTo(root, { scale: 1 }, { scale: 1.015, duration: cena.dur, ease: 'sine.inOut', transformOrigin: '50% 50%' }, cena.start)
  // 1º quadro: a pílula já está no lugar (hard cut do fundo); headline e agenda entram
  tl.set(pil, { opacity: 1 }, cena.start)
  tl.fromTo($('.h1'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, ...M.FAST, duration: 0.35 }, tE)
  tl.fromTo($('.agenda'), { opacity: 0, y: 60 }, { opacity: 1, y: 0, ...M.SOFT, duration: 0.6 }, tE + 0.05)
  tl.fromTo($$('.col b'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.25, stagger: 0.03 }, tE + 0.2)
  tl.to(pil, { scale: 1.04, duration: 0.5, yoyo: true, repeat: Math.max(1, Math.floor((tD - tE - 0.4) / 0.5) | 1), ease: 'sine.inOut' }, tE + 0.3)
  // vivo entre a divisão e a 1ª junção: as 4 aulas de 15' balançam de leve
  tl.to(c15, { scaleY: 1.06, duration: 0.45, yoyo: true, repeat: Math.max(1, Math.floor((tJ2 - tD - 1) / 0.45) | 1), stagger: 0.1, ease: 'sine.inOut' }, tD + 0.9)
  // divide: racha em 4 (sem partículas), cada pedaço cai no seu dia
  tl.set(pecas, { opacity: 1 }, tD - 0.02)
  tl.set(pil, { opacity: 0 }, tD - 0.02)
  tl.to(pecas, { x: (i) => (i - 1.5) * 16, duration: 0.12, ease: 'power2.out' }, tD)
  pecas.forEach((p, i) => {
    const dia = [0, 1, 3, 5][i]
    const dx = cx(dia) - (R[0] + i * (pw + 12) + pw / 2), dy = topo[dia] - R[1]
    tl.to(p, { x: dx, y: dy, rotation: (i - 1.5) * 6, duration: 0.42, ease: 'power2.in' }, tD + 0.14 + i * 0.06)
    tl.set(p, { opacity: 0 }, tD + 0.56 + i * 0.06)
    tl.fromTo(c15[i], { opacity: 0, scaleY: 0.5 }, { opacity: 1, scaleY: 1, ...M.SNAP, duration: 0.3 }, tD + 0.54 + i * 0.06)
  })
  tl.fromTo($('.n4'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, ...M.FAST, duration: 0.35 }, tD + 0.05)
  // junta de 2 em 2 → 2 × 30'
  const junta = (de, para, novo, t) => {
    de.forEach((el) => tl.to(el, { x: parseFloat(para.style.left) - parseFloat(el.style.left), y: parseFloat(para.style.top) - parseFloat(el.style.top), duration: 0.28, ease: 'power3.inOut' }, t))
    tl.set(de, { opacity: 0 }, t + 0.28)
    tl.fromTo(novo, { opacity: 0, scaleY: 0.5 }, { opacity: 1, scaleY: 1, ...M.SOFT, duration: 0.45 }, t + 0.24)
  }
  junta([c15[0], c15[1]], c30[1], c30[1], tJ2)
  junta([c15[2], c15[3]], c30[3], c30[3], tJ2 + 0.05)
  M.swap(tl, $('.n4'), $('.n2'), tJ2)
  // vivo entre as junções: as duas aulas de 30' e o número respiram (sem tela parada)
  const vivo = Math.max(0.4, tJ1 - tJ2 - 0.9)
  tl.to([c30[1], c30[3]], { scaleY: 1.04, duration: vivo / 2, yoyo: true, repeat: 1, ease: 'sine.inOut' }, tJ2 + 0.75)
  tl.to($('.n2'), { scale: 1.04, transformOrigin: '0 50%', duration: vivo / 2, yoyo: true, repeat: 1, ease: 'sine.inOut' }, tJ2 + 0.6)
  tl.to($('.agenda'), { y: -6, duration: vivo / 2, yoyo: true, repeat: 1, ease: 'sine.inOut' }, tJ2 + 0.5)
  // junta → 1 × 60'
  junta([c30[1], c30[3]], c60, c60, tJ1)
  M.swap(tl, $('.n2'), $('.n1'), tJ1)
  tl.to(c60, { scaleY: 0.94, duration: 0.08, yoyo: true, repeat: 1, ease: 'power2.out' }, tEn)
  // headline troca inteira
  M.swap(tl, $('.h1'), $('.h2'), tT)
  // o cursor pega a aula de qui e leva para sáb
  const C = cursor()
  const pega = { x: cx(3) + 10, y: topo[3] + 60 * PX * 0.45 }
  tl.set(C.el, { x: 1000, y: 1130 }, cena.start)
  tl.to(C.el, { opacity: 1, duration: 0.1 }, tT)
  C.move(pega, tT, Math.max(0.15, tA - tT))
  tl.to(c60, { scale: 1.06, duration: 0.12, ease: 'power2.out' }, tA)
  const dx = cx(5) - cx(3), dy = topo[5] - topo[3]
  const dArr = Math.max(0.3, tAs - tA - 0.05)
  tl.to(c60, { x: dx, y: dy, duration: dArr, ease: 'power2.inOut' }, tA + 0.05)
  tl.to(C.el, { x: pega.x + dx, y: pega.y + dy, duration: dArr, ease: 'power2.inOut' }, tA + 0.05)
  tl.to(c60, { scale: 1, ...M.SNAP, duration: 0.25 }, tAs)
  tl.to(C.el, { x: pega.x + dx + 120, y: pega.y + dy + 160, opacity: 0, duration: 0.35, ease: 'power2.in' }, tAs + 0.1)
  // avatar do professor na ponta da pílula
  const av = $('.avatar')
  $('.avatar .ini').textContent = params.professor.nome[0]
  $('.avatar .flag').src = params.professor.bandeira
  const avPos = { x: cx(5), y: topo[5] + 60 * PX }
  Object.assign(av.style, { left: avPos.x - 48 + 'px', top: avPos.y - 48 + 'px' })
  tl.fromTo(av, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, ...M.SOFT, duration: 0.5 }, tAv)
  tl.fromTo($('.rodape-ilustr'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, tAv)
  // vivo: número respira
  tl.to($('.num'), { scale: 1.03, duration: 0.6, yoyo: true, repeat: 1, ease: 'sine.inOut', transformOrigin: '0 50%' }, tEn + 0.2)
  // saída: o avatar vira o 1º card da cena seguinte
  const D = params.destino_avatar
  const dS = Math.max(0.25, cena.end - tS)
  tl.to([$('.hd'), $('.num'), $('.agenda'), $('.chips'), $('.rodape-ilustr')], { opacity: 0, duration: dS * 0.6, ease: 'power2.in' }, tS)
  tl.to(av, { x: D[0] - avPos.x, y: D[1] - avPos.y, scale: D[2] / 96, duration: dS, ease: 'power3.inOut' }, tS)
  tl.set(root, { opacity: 0 }, cena.end)
})
