BLOCO('cards/como-funciona-professor', function ({ tl, root, $, $$, cena, cue, texto, params, box, cursor }) {
  if (cena.start <= 0.001) root.style.opacity = 1; else tl.set(root, { opacity: 1 }, cena.start)
  const md = (s) => s.replace(/\*([^*]+)\*/g, '<b class="acc">$1</b>')
  $('.rot').textContent = texto('rotulo').replace(/\*/g, '')
  $('.hd').innerHTML = md(texto('headline'))
  const ks = [1, 2, 3, 4].map((i) => $('.k' + i))
  ks.forEach((k, i) => (k.querySelector('.ct').textContent = texto('c' + (i + 1)).replace(/\*/g, '')))
  params.horarios.forEach((h) => $('.hrs').insertAdjacentHTML('beforeend', `<div class="hr"><span>${h}</span><span class="tg"><span class="on"></span><i></i></span></div>`))
  const tgs = $$('.tg')
  const pTg = [box(tgs[0], 0.6, 0.6), box(tgs[2], 0.6, 0.6)]
  const tE = cue('entra'), tS = cue('sai')
  const tc = [1, 2, 3, 4].map((i) => cue('c' + i)), tg = [1, 2, 3, 4].map((i) => cue('g' + i))

  tl.fromTo(root, { scale: 1 }, { scale: 1.015, duration: cena.dur, ease: 'sine.inOut', transformOrigin: '50% 50%' }, cena.start)
  // 1º quadro: rótulo e headline já subindo
  tl.fromTo([$('.rot'), $('.hd')], { opacity: 0.4, y: 20 }, { opacity: 1, y: 0, ...M.FAST, duration: 0.35, stagger: 0.06 }, tE)
  // cada card entra na sua fala; os anteriores ficam inteiros (a lista se acumula); o ativo ganha a borda
  ks.forEach((k, i) => {
    tl.fromTo(k, { opacity: 0, y: 40, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, ...M.SOFT, duration: 0.5 }, tc[i])
    ks.forEach((o, j) => { if (j !== i) tl.to(o.querySelector('.ring'), { opacity: 0, duration: 0.15 }, tc[i]) })
    tl.to(k.querySelector('.ring'), { opacity: 1, duration: 0.15 }, tc[i] + 0.05)
    tl.to(k.querySelector('.cic'), { y: -8, rotation: 6, duration: 0.6, yoyo: true, repeat: 1, ease: 'sine.inOut' }, tc[i] + 0.4)
  })
  // g1: o plano de aula complicado é riscado (X)
  tl.fromTo($('.doc .x1'), { rotation: 32, scaleX: 0 }, { rotation: 32, scaleX: 1, duration: 0.22, ease: 'power2.out' }, tg[0])
  tl.fromTo($('.doc .x2'), { rotation: -32, scaleX: 0 }, { rotation: -32, scaleX: 1, duration: 0.22, ease: 'power2.out' }, tg[0] + 0.16)
  tl.to($$('.doc i'), { opacity: 0.45, duration: 0.25 }, tg[0] + 0.2)
  tl.to($('.doc'), { rotation: -2, duration: 0.5, yoyo: true, repeat: 1, ease: 'sine.inOut' }, tg[0] + 0.4)
  // g2: os alunos chegam sozinhos; a negociação é riscada
  tl.fromTo($$('.alu span'), { opacity: 0, x: 120, scale: 0.6 }, { opacity: 1, x: 0, scale: 1, ...M.SOFT, duration: 0.45, stagger: 0.12 }, tc[1] + 0.35)
  tl.fromTo($('.neg em'), { rotation: -40, scaleX: 0 }, { rotation: -40, scaleX: 1, duration: 0.22, ease: 'power2.out' }, tg[1])
  tl.to($('.neg'), { opacity: 0.6, duration: 0.25 }, tg[1] + 0.2)
  tl.to($$('.alu span'), { y: -10, duration: 0.18, yoyo: true, repeat: 1, stagger: 0.1, ease: 'power2.out' }, tg[1] + 0.3)
  // g3: cobrança e cancelamento riscados; o selo de pago carimba
  $$('.lin i').forEach((l, i) => tl.fromTo(l, { '--s': 0 }, { '--s': 1, duration: 0.25, ease: 'power2.out' }, tg[2] - 0.35 + i * 0.25))
  tl.fromTo($('.selo'), { opacity: 0, scale: 1.6, rotation: -20 }, { opacity: 1, scale: 1, rotation: 0, ...M.SNAP, duration: 0.3 }, tg[2] + 0.2)
  // g4: o cursor liga dois horários
  const C = cursor()
  tl.set(C.el, { x: 980, y: 1140 }, cena.start)
  tl.to(C.el, { opacity: 1, duration: 0.1 }, tc[3] + 0.1)
  C.move(pTg[0], tc[3] + 0.1, Math.max(0.2, tg[3] - tc[3] - 0.15))
  ;[0, 2].forEach((idx, j) => {
    const t = tg[3] + j * 0.36
    if (j) C.move(pTg[1], tg[3] + 0.1, 0.24)
    C.click(pTg[j], t)
    tl.to(tgs[idx].querySelector('.on'), { opacity: 1, duration: 0.12 }, t + 0.02)
    tl.to(tgs[idx].querySelector('i'), { x: 38, ...M.SNAP, duration: 0.25 }, t + 0.02)
  })
  tl.to(C.el, { opacity: 0, duration: 0.15 }, tg[3] + 0.85)
  // vivo depois do último gesto: as bolinhas dos ícones respiram em sequência
  tl.to($$('.cic'), { scale: 1.08, duration: 0.3, yoyo: true, repeat: 1, stagger: 0.12, ease: 'sine.inOut' }, tg[3] + 0.9)
  // saída: os cards recuam de leve até o corte (nada some antes da hora)
  const d = Math.max(0.2, cena.end - tS)
  tl.to([$('.rot'), $('.hd'), ...ks], { y: -16, opacity: 0.6, duration: d, ease: 'power2.in', stagger: 0.03 }, tS)
  tl.set(root, { opacity: 0 }, cena.end)
})
