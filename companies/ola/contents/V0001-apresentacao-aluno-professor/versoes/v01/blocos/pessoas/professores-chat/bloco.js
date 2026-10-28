BLOCO('pessoas/professores-chat', function ({ tl, root, $, $$, cena, cue, texto, params }) {
  if (cena.start <= 0.001) root.style.opacity = 1; else tl.set(root, { opacity: 1 }, cena.start)
  const limpa = (s) => s.replace(/\*/g, '')
  $('.hd .l1').textContent = limpa(texto('titulo1'))
  $('.hd .l2').textContent = limpa(texto('titulo2'))
  const pcs = $$('.pc')
  pcs.forEach((pc, i) => {
    const [nome, pais] = texto('p' + (i + 1)).split('·').map((x) => x.trim())
    pc.querySelector('.ini').textContent = nome[0]
    pc.querySelector('.nm').textContent = nome
    pc.querySelector('.pa').textContent = pais || ''
    pc.querySelector('.flag').src = params.bandeiras[i]
    pc.querySelector('.selo i').textContent = limpa(texto('selo')).replace(/\s*✓\s*$/, '')
  })
  $('.aluno .ma').textContent = texto('msg_aluno')
  $('.prof').textContent = texto('msg_prof')
  $('.rodape-ilustr').textContent = params.rodape
  const tE = cue('entra'), tC = cue('cards'), tSe = cue('selo'), tT = cue('trava'), tR = cue('responde'), tS = cue('sai')

  // 1º quadro: headline + card de Carlos (o avatar chegou da pílula)
  tl.fromTo($$('.hd > div'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, ...M.FAST, duration: 0.35, stagger: 0.07 }, tE)
  tl.fromTo(pcs[0].querySelector('.cin'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, ...M.FAST, duration: 0.35 }, tE + 0.08)
  tl.fromTo(pcs.slice(1), { opacity: 0, y: 40, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, ...M.SOFT, duration: 0.5, stagger: 0.08 }, tC)
  tl.fromTo($$('.selo'), { opacity: 0, scale: 1.4 }, { opacity: 1, scale: 1, ...M.SNAP, duration: 0.25, stagger: 0.06 }, tSe)
  tl.fromTo($('.rodape-ilustr'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, tE + 0.2)
  // vivo: avatares respiram
  tl.to($$('.pc .av'), { scale: 1.04, duration: 0.5, yoyo: true, repeat: 3, stagger: 0.15, ease: 'sine.inOut' }, tE + 0.3)
  // trava: os cards recuam um pouco, o aluno começa a frase em espanhol e os pontinhos param
  tl.to(pcs, { scale: 0.95, duration: 0.3, ease: 'power2.out' }, tT)
  tl.to($$('.pc .cin, .pc .av'), { opacity: 0.55, duration: 0.3 }, tT)
  tl.fromTo($('.fa'), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, ...M.SOFT, duration: 0.45 }, tT)
  tl.fromTo($('.aluno'), { opacity: 0, y: 30, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, ...M.SOFT, duration: 0.45 }, tT)
  tl.fromTo($$('.dots i'), { opacity: 0.25 }, { opacity: 1, duration: 0.12, stagger: 0.08, yoyo: true, repeat: 1 }, tT + 0.2)
  tl.to($$('.dots i'), { opacity: 0.25, duration: 0.1 }, tT + 0.6)
  tl.fromTo($('.interr'), { opacity: 0, scale: 0.4, rotation: -20 }, { opacity: 1, scale: 1, rotation: 0, ...M.SOFT, duration: 0.45 }, tT + 0.55)
  tl.to($('.interr'), { rotation: 10, duration: 0.25, yoyo: true, repeat: 3, ease: 'sine.inOut' }, tT + 1)
  // responde: o professor responde em português; o mascote pisca
  tl.fromTo($('.resp'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, ...M.SOFT, duration: 0.45 }, tR)
  tl.to($('.resp .mm'), { scaleY: 0.86, duration: 0.05, yoyo: true, repeat: 1 }, tR + 0.4)
  // saída: a página encolhe (a cena seguinte nasce do card do aluno)
  tl.to(root, { scale: 0.94, duration: Math.max(0.15, cena.end - tS), ease: 'power2.in', transformOrigin: '30% 50%' }, tS)
  tl.set(root, { opacity: 0 }, cena.end)
})
