BLOCO('escolha/dois-cards', function ({ tl, root, $, $$, cena, cue, texto, params, box, cursor }) {
  if (cena.start <= 0.001) root.style.opacity = 1; else tl.set(root, { opacity: 1 }, cena.start)
  const md = (s) => s.replace(/\*([^*]+)\*/g, '<b class="acc">$1</b>')
  $('.c-aluno .tx').innerHTML = md(texto('aluno'))
  $('.c-prof .tx').innerHTML = md(texto('professor'))
  const prof = params.escolha === 'professor'
  const alvo = prof ? $('.c-prof') : $('.c-aluno'), outro = prof ? $('.c-aluno') : $('.c-prof')
  // medir antes de qualquer transform
  const pBtnAlvo = box(alvo.querySelector('.btn'), 0.62, 0.68), pBtnOutro = box(outro.querySelector('.btn'), 0.62, 0.68)
  const cAlvo = box(alvo, 0.5, 0.5), cAluno = box($('.c-aluno'), 0.5, 0.5)
  const stage = document.getElementById('stage')
  const centro = { x: stage.offsetWidth / 2, y: (document.getElementById('root').offsetHeight / 2) - stage.offsetTop }
  const tE = cue('entra'), tH = cue('hesita'), tC = cue('clique'), tX = cue('expande')
  const mascs = $$('.masc'), ins = $$('.in')

  if (params.de === 'pagina') {
    // a página anterior encolhe para dentro do card do aluno; o do professor volta pela direita
    const s = 2.7
    tl.fromTo($('.c-aluno'), { x: centro.x - cAluno.x, y: centro.y - cAluno.y, scale: s }, { x: 0, y: 0, scale: 1, ...M.FAST, duration: Math.max(0.3, tH - tE + 0.18) }, tE - 0.02)
    tl.fromTo($('.c-prof'), { x: 620, opacity: 0 }, { x: 0, opacity: 1, ...M.FAST, duration: 0.3 }, tE)
    tl.fromTo(ins, { opacity: 0 }, { opacity: 1, duration: 0.14, stagger: 0.04 }, tE + 0.06)
  } else {
    // os cards já estão no lugar (nasceram da barra); o conteúdo entra
    tl.fromTo(mascs, { opacity: 0, scale: 0.7, y: 20 }, { opacity: 1, scale: 1, y: 0, ...M.SOFT, duration: 0.5, stagger: 0.08 }, tE)
    tl.fromTo($$('.tx'), { opacity: 0, y: 18 }, { opacity: 1, y: 0, ...M.FAST, duration: 0.35, stagger: 0.08 }, tE + 0.04)
    tl.fromTo($$('.btn'), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, ...M.SOFT, duration: 0.45, stagger: 0.08 }, tE + 0.08)
  }
  // mascotes vivos: piscam e olham para o cursor (inclinação)
  mascs.forEach((m, i) => tl.to(m, { scaleY: 0.86, duration: 0.05, yoyo: true, repeat: 1, ease: 'power1.inOut' }, tE + 0.3 + i * 0.12))
  const C = cursor()
  tl.set(C.el, { x: 1040, y: 1120 }, cena.start)
  tl.to(C.el, { opacity: 1, duration: 0.08 }, Math.max(cena.start, tH - 0.06))
  if (params.hesita && !prof) {
    C.move(pBtnOutro, tH, Math.max(0.15, (tC - tH) * 0.4))
    tl.to(mascs, { rotation: 7, duration: 0.18, ease: 'power2.out' }, tH + 0.05)
    tl.to(outro, { y: -6, duration: 0.15, ease: 'power2.out' }, tH + 0.12)
    tl.to(outro, { y: 0, duration: 0.15, ease: 'power2.in' }, tH + (tC - tH) * 0.55)
    C.move(pBtnAlvo, tH + (tC - tH) * 0.5, Math.max(0.12, (tC - tH) * 0.45))
    tl.to(mascs, { rotation: -7, duration: 0.18, ease: 'power2.out' }, tH + (tC - tH) * 0.55)
  } else {
    C.move(pBtnAlvo, tH, Math.max(0.12, tC - tH - 0.04))
    tl.to(mascs, { rotation: prof ? 7 : -7, duration: 0.18, ease: 'power2.out' }, tH + 0.05)
    if (prof) tl.to(alvo.querySelector('.masc'), { scale: 1.12, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' }, tH + 0.12)
  }
  C.click(pBtnAlvo, tC)
  tl.to(alvo, { scale: 0.97, duration: 0.06, yoyo: true, repeat: 1, ease: 'power2.out' }, tC)
  // expande: o card escolhido cresce até virar a tela (o creme do card vira o fundo da próxima cena)
  tl.to(C.el, { opacity: 0, duration: 0.1 }, tX)
  tl.to(alvo.querySelector('.in'), { opacity: 0, duration: 0.12 }, tX)
  tl.to(alvo, { x: centro.x - cAlvo.x, y: centro.y - cAlvo.y, scale: 2.9, borderRadius: 0, duration: Math.max(0.2, cena.end - tX), ease: 'power3.in' }, tX)
  tl.to(outro, { x: prof ? -700 : 700, opacity: 0, duration: Math.max(0.18, cena.end - tX), ease: 'power2.in' }, tX)
  tl.set([root, C.el], { opacity: 0 }, cena.end)
})
