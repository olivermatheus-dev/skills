BLOCO('escolha/dois-cards', function ({ tl, root, $, $$, cena, cue, texto, params, box, cursor }) {
  if (cena.start <= 0.001) root.style.opacity = 1; else tl.set(root, { opacity: 1 }, cena.start)
  const md = (s) => s.replace(/\*([^*]+)\*/g, '<b class="acc">$1</b>')
  $('.c-aluno .tx').innerHTML = md(texto('aluno'))
  $('.c-prof .tx').innerHTML = md(texto('professor'))
  const prof = params.escolha === 'professor'
  const cAl = $('.c-aluno'), cPr = $('.c-prof')
  const alvo = prof ? cPr : cAl, outro = prof ? cAl : cPr
  // medir antes de qualquer transform
  const pBtn = { al: box(cAl.querySelector('.btn'), 0.62, 0.68), pr: box(cPr.querySelector('.btn'), 0.62, 0.68) }
  const cAlvo = box(alvo, 0.5, 0.5), cAluno = box(cAl, 0.5, 0.5)
  const stage = document.getElementById('stage')
  const centro = { x: stage.offsetWidth / 2, y: (document.getElementById('root').offsetHeight / 2) - stage.offsetTop }
  const tE = cue('entra'), tH = cue('hesita'), tH2 = cue('hover2', tH + 1), tC = cue('clique'), tX = cue('expande')
  const mascs = $$('.masc'), ins = $$('.in')
  const mAl = cAl.querySelector('.masc'), mPr = cPr.querySelector('.masc')

  if (params.de === 'pagina') {
    // a página anterior encolhe para dentro do card do aluno; o do professor volta pela direita (sem pressa: menos rastro)
    const s = 2.9
    const d = Math.min(0.65, Math.max(0.35, tH - tE - 0.1))
    tl.fromTo(cAl, { x: centro.x - cAluno.x, y: centro.y - cAluno.y, scale: s }, { x: 0, y: 0, scale: 1, duration: d, ease: 'power2.inOut' }, tE - 0.02)
    tl.fromTo(cPr, { x: 620, opacity: 0 }, { x: 0, opacity: 1, ...M.SOFT, duration: 0.6 }, tE + d * 0.5)
    tl.fromTo(ins, { opacity: 0 }, { opacity: 1, duration: 0.25, stagger: 0.06 }, tE + d * 0.6)
  } else {
    // os cards já estão no lugar (nasceram da barra); o conteúdo entra
    tl.fromTo(mascs, { opacity: 0, scale: 0.7, y: 20 }, { opacity: 1, scale: 1, y: 0, ...M.SOFT, duration: 0.6, stagger: 0.12 }, tE)
    tl.fromTo($$('.tx'), { opacity: 0, y: 18 }, { opacity: 1, y: 0, ...M.FAST, duration: 0.4, stagger: 0.12 }, tE + 0.08)
    tl.fromTo($$('.btn'), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, ...M.SOFT, duration: 0.5, stagger: 0.12 }, tE + 0.15)
  }
  // vivo: mascotes piscam e respiram
  mascs.forEach((m, i) => {
    tl.to(m, { scaleY: 0.86, duration: 0.05, yoyo: true, repeat: 1, ease: 'power1.inOut' }, tE + 0.5 + i * 0.15)
    tl.to(m, { scaleY: 0.86, duration: 0.05, yoyo: true, repeat: 1, ease: 'power1.inOut' }, tH2 + 0.6 + i * 0.2)
  })
  tl.to(ins, { y: -4, duration: 0.9, yoyo: true, repeat: Math.max(1, Math.floor((tX - tE) / 0.9) - 1), ease: 'sine.inOut' }, tE + 0.6)

  // hover: o card sobe, o círculo cresce e pulsa, a seta desliza; os olhos (mascotes) olham para o cursor
  const hover = (card, t) => {
    const b = card.querySelector('.btn'), a = b.querySelector('.icon')
    tl.to(card, { y: -10, duration: 0.25, ease: 'power2.out' }, t)
    tl.to(b, { scale: 1.16, ...M.SOFT, duration: 0.45 }, t)
    if (a) tl.to(a, { x: 10, ...M.FAST, duration: 0.35 }, t + 0.05)
    tl.to(b, { scale: 1.08, duration: 0.3, yoyo: true, repeat: 1, ease: 'sine.inOut' }, t + 0.45)
  }
  const sai = (card, t) => {
    const b = card.querySelector('.btn'), a = b.querySelector('.icon')
    tl.to(card, { y: 0, duration: 0.25, ease: 'power2.inOut' }, t)
    tl.to(b, { scale: 1, duration: 0.25, ease: 'power2.inOut' }, t)
    if (a) tl.to(a, { x: 0, duration: 0.25, ease: 'power2.inOut' }, t)
  }
  const olha = (lado, t) => tl.to(mascs, { rotation: lado, duration: 0.3, ease: 'power2.out' }, t)
  const C = cursor()
  tl.set(C.el, { x: 1040, y: 1150 }, cena.start)
  tl.to(C.el, { opacity: 1, duration: 0.15 }, tH - 0.6)
  // 1º: passa pelo card do aluno
  C.move(pBtn.al, tH - 0.55, 0.55)
  hover(cAl, tH)
  olha(-6, tH - 0.2)
  // 2º: passa pelo card do professor
  C.move(pBtn.pr, tH2 - 0.5, 0.5)
  sai(cAl, tH2 - 0.35)
  hover(cPr, tH2)
  olha(7, tH2 - 0.2)
  if (!prof) {
    // volta e clica no aluno
    C.move(pBtn.al, tC - 0.55, 0.5)
    sai(cPr, tC - 0.45)
    hover(cAl, tC - 0.1)
    olha(-6, tC - 0.45)
  } else {
    tl.to(mPr, { scale: 1.12, duration: 0.14, yoyo: true, repeat: 1, ease: 'power2.out' }, tH2 + 0.2)
  }
  const pClique = prof ? pBtn.pr : pBtn.al
  C.click(pClique, tC)
  tl.to(alvo.querySelector('.btn'), { scale: 0.92, duration: 0.07, yoyo: true, repeat: 1, ease: 'power2.out' }, tC)
  tl.to(prof ? mPr : mAl, { scaleY: 0.86, duration: 0.05, yoyo: true, repeat: 1 }, tC + 0.15)
  // expande: o card escolhido cresce até virar a tela (cobre o quadro inteiro antes do corte; o creme vira o fundo da próxima cena)
  const dX = Math.max(0.3, cena.end - tX)
  tl.to(C.el, { opacity: 0, duration: 0.15 }, tX)
  tl.to(alvo.querySelector('.in'), { opacity: 0, duration: 0.18 }, tX)
  tl.to(alvo, { x: centro.x - cAlvo.x, y: centro.y - cAlvo.y, scale: 3.1, borderRadius: 0, duration: dX, ease: 'power2.inOut' }, tX)
  tl.to(outro, { x: prof ? -700 : 700, opacity: 0, duration: dX * 0.8, ease: 'power2.in' }, tX)
  tl.set([root, C.el], { opacity: 0 }, cena.end)
})
