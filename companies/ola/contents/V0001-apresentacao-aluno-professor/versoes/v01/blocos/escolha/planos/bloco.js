BLOCO('escolha/planos', function ({ tl, root, $, $$, cena, cue, texto, params, box, cursor }) {
  if (cena.start <= 0.001) root.style.opacity = 1; else tl.set(root, { opacity: 1 }, cena.start)
  const md = (s) => s.replace(/\*([^*]+)\*/g, '<b class="acc">$1</b>')
  $('.hd .l1').innerHTML = md(texto('titulo1'))
  $('.hd .l2').innerHTML = md(texto('titulo2'))
  const pls = $$('.pl')
  pls.forEach((p, i) => {
    // "*1 hora* por semana" → número · unidade · resto
    const t = texto('plano' + (i + 1))
    const m = t.match(/\*([^*]+)\*\s*(.*)/) || [null, t, '']
    const [num, ...uni] = m[1].trim().split(/\s+/)
    p.querySelector('.n').textContent = num
    p.querySelector('.u').textContent = uni.join(' ')
    p.querySelector('.s').textContent = m[2]
  })
  const k = Math.max(1, Math.min(3, params.escolhido)) - 1
  const alvo = pls[k]
  const R = params.pilula
  const pil = $('.pil')
  Object.assign(pil.style, { left: R[0] + 'px', top: R[1] + 'px', width: R[2] + 'px', height: R[3] + 'px' })
  pil.querySelector('span').textContent = params.pilula_texto
  // medir antes de transform
  const pts = pls.map((p) => box(p, 0.62, 0.6))
  const ca = box(alvo, 0.5, 0.5)
  const vermelho = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()
  const tE = cue('entra'), tH = cue('hover'), tC = cue('clique'), tP = cue('comprime')

  // 1º quadro: headline inteira; os cards já estão no lugar (nasceram dos chips)
  tl.fromTo($$('.hd > div'), { opacity: 0, y: 28 }, { opacity: 1, y: 0, ...M.FAST, duration: 0.4, stagger: 0.07 }, tE)
  tl.fromTo(pls, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, ...M.SOFT, duration: 0.5, stagger: 0.05 }, tE)
  // cursor passa pelos três (da direita para a esquerda) e para no escolhido
  const C = cursor()
  tl.set(C.el, { x: 1020, y: 1100 }, cena.start)
  tl.to(C.el, { opacity: 1, duration: 0.1 }, tH - 0.1)
  const ordem = [2, 1, 0].filter((i) => i !== k).concat([k])
  const passo = Math.max(0.12, (tC - tH - 0.05) / ordem.length)
  ordem.forEach((i, j) => {
    C.move(pts[i], tH + j * passo, passo * 0.9)
    tl.to(pls[i], { y: -8, duration: 0.15, ease: 'power2.out' }, tH + j * passo + passo * 0.5)
    if (i !== k) tl.to(pls[i], { y: 0, duration: 0.15, ease: 'power2.in' }, tH + (j + 1) * passo + passo * 0.4)
  })
  C.click(pts[k], tC)
  tl.to(alvo, { scale: 0.97, duration: 0.06, yoyo: true, repeat: 1 }, tC)
  tl.to(alvo.querySelector('.ring'), { opacity: 1, duration: 0.15 }, tC + 0.05)
  pls.forEach((p, i) => { if (i !== k) { tl.to(p, { scale: 0.96, y: 0, duration: 0.3, ease: 'power2.out' }, tC + 0.05); tl.to(p.querySelector('.in'), { opacity: 0.45, duration: 0.3 }, tC + 0.05) } })
  // vivo: borda do escolhido respira até comprimir
  tl.to(alvo.querySelector('.ring'), { opacity: 0.6, duration: 0.35, yoyo: true, repeat: 1, ease: 'sine.inOut' }, tC + 0.3)
  // comprime: o card escolhido vira a pílula da cena seguinte
  const d = Math.max(0.25, cena.end - tP)
  tl.to(C.el, { opacity: 0, duration: 0.1 }, tP)
  tl.to([alvo.querySelector('.in'), alvo.querySelector('.ring')], { opacity: 0, duration: 0.1 }, tP)
  tl.to(alvo, { x: R[0] + R[2] / 2 - ca.x, y: R[1] + R[3] / 2 - ca.y, scaleX: R[2] / 290, scaleY: R[3] / 470, borderRadius: 160, backgroundColor: vermelho, duration: d, ease: 'power3.inOut' }, tP)
  pls.forEach((p, i) => { if (i !== k) tl.to(p, { opacity: 0.5, scale: 0.92, duration: d * 0.7, ease: 'power2.in' }, tP) })
  tl.to($('.hd'), { opacity: 0, y: -20, duration: Math.min(0.15, d * 0.5), ease: 'power2.in' }, tP)
  tl.set(pil, { opacity: 1 }, cena.end - 0.06)
  tl.set(alvo, { opacity: 0 }, cena.end - 0.06)
  tl.set(root, { opacity: 0 }, cena.end)
})
