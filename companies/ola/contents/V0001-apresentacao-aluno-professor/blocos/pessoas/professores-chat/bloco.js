BLOCO('pessoas/professores-chat', function ({ tl, root, $, $$, cena, cue, texto, params }) {
  if (cena.start <= 0.001) root.style.opacity = 1; else tl.set(root, { opacity: 1 }, cena.start)
  const md = (s) => s.replace(/\*([^*]+)\*/g, '<b class="acc">$1</b>')
  $('.hd .l1').innerHTML = md(texto('titulo1'))
  $('.hd .l2').innerHTML = md(texto('titulo2'))
  const pcs = $$('.pc')
  pcs.forEach((pc, i) => {
    const [nome, pais] = texto('p' + (i + 1)).split('·').map((x) => x.trim())
    pc.querySelector('.ini').textContent = nome[0]
    pc.querySelector('.nm').textContent = nome
    pc.querySelector('.pa').textContent = pais || ''
    pc.querySelector('.flag').src = params.bandeiras[i] || params.bandeiras[0]
  })
  $('.tag span').textContent = texto('p1').split('·')[0].trim()
  $('.aluno').textContent = texto('msg_aluno')
  $('.prof').textContent = texto('msg_prof')
  $('.rodape-ilustr').textContent = params.rodape
  const tE = cue('entra'), tC = cue('cards'), tV = cue('video'), tB1 = cue('bolha1'), tB2 = cue('bolha2'), tS = cue('sai')

  tl.fromTo(root, { scale: 1 }, { scale: 1.015, duration: cena.dur, ease: 'sine.inOut', transformOrigin: '50% 50%' }, cena.start)
  // 1º quadro: o card de Carlos já está no lugar (o avatar chegou da agenda); a headline sobe
  tl.fromTo($$('.hd > div'), { opacity: 0.4, y: 24 }, { opacity: 1, y: 0, ...M.FAST, duration: 0.35, stagger: 0.07 }, tE)
  tl.fromTo(pcs[0].querySelector('.cin'), { opacity: 0.5, y: 16 }, { opacity: 1, y: 0, ...M.FAST, duration: 0.35 }, tE + 0.05)
  tl.fromTo($('.rodape-ilustr'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, tE + 0.2)
  tl.to(pcs[0].querySelector('.av'), { scale: 1.05, duration: 0.45, yoyo: true, repeat: 1, ease: 'sine.inOut' }, tE + 0.3)
  // os outros três caem de cima, rápidos, em cascata
  tl.fromTo(pcs.slice(1), { opacity: 1, y: -1400 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', stagger: 0.09 }, tC)
  tl.to(pcs.slice(1), { y: -10, duration: 0.08, yoyo: true, repeat: 1, ease: 'power1.out', stagger: 0.09 }, tC + 0.42)
  // vivo: os avatares respiram em sequência até a videochamada
  tl.to($$('.pc .av'), { scale: 1.05, duration: 0.4, yoyo: true, repeat: 1, stagger: 0.18, ease: 'sine.inOut' }, tC + 0.8)
  // vídeo: três saem; o card de Carlos vira a videochamada
  const dV = 0.6
  tl.to(pcs.slice(1), { opacity: 0, y: 160, scale: 0.9, duration: 0.3, ease: 'power2.in', stagger: 0.05 }, tV)
  tl.to(pcs[0], { width: 920, height: 800, borderRadius: 36, duration: dV, ease: 'power3.inOut' }, tV + 0.1)
  tl.to(pcs[0].querySelector('.tela'), { opacity: 1, duration: dV * 0.8 }, tV + 0.1)
  tl.to(pcs[0].querySelector('.cin'), { opacity: 0, duration: 0.2 }, tV + 0.05)
  tl.to(pcs[0].querySelector('.av'), { left: 340, top: 110, width: 240, height: 240, fontSize: 110, duration: dV, ease: 'power3.inOut' }, tV + 0.1)
  tl.set($('.call'), { opacity: 1 }, tV + 0.1 + dV * 0.6)
  tl.fromTo($('.tag'), { opacity: 0, x: -30 }, { opacity: 1, x: 0, ...M.FAST, duration: 0.3 }, tV + dV * 0.7)
  tl.fromTo($('.pip'), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, ...M.SOFT, duration: 0.45 }, tV + dV * 0.8)
  tl.fromTo($$('.ctrl b'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, ...M.FAST, duration: 0.3, stagger: 0.05 }, tV + dV * 0.9)
  // vivo na chamada: a bolinha "ao vivo" pisca, o professor fala (anel), o aluno balança
  tl.to($('.vivo'), { opacity: 0.3, duration: 0.4, yoyo: true, repeat: Math.max(1, Math.floor((cena.end - tV - 0.8) / 0.4)), ease: 'sine.inOut' }, tV + 0.8)
  tl.to(pcs[0].querySelector('.av'), { scale: 1.04, duration: 0.5, yoyo: true, repeat: Math.max(1, Math.floor((tB1 - tV - 0.9) / 0.5)), ease: 'sine.inOut' }, tV + 0.9)
  tl.to($('.pip img'), { y: -8, duration: 0.55, yoyo: true, repeat: Math.max(1, Math.floor((cena.end - tV - 1) / 0.55)), ease: 'sine.inOut' }, tV + 1)
  // o aluno começa em espanhol e trava; o professor ajuda em português
  tl.fromTo($('.aluno'), { opacity: 0, y: 30, scale: 0.85, transformOrigin: '100% 100%' }, { opacity: 1, y: 0, scale: 1, ...M.SOFT, duration: 0.4 }, tB1)
  tl.to($('.pip'), { rotation: -3, duration: 0.12, yoyo: true, repeat: 3, ease: 'sine.inOut' }, tB1 + 0.45)
  tl.fromTo($('.prof'), { opacity: 0, y: 30, scale: 0.85, transformOrigin: '0% 100%' }, { opacity: 1, y: 0, scale: 1, ...M.SOFT, duration: 0.4 }, tB2)
  tl.to(pcs[0].querySelector('.av'), { scale: 1.08, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' }, tB2)
  // saída: a chamada recua de leve (corte seco para a página)
  tl.to(root, { scale: 0.97, duration: Math.max(0.15, cena.end - tS), ease: 'power2.in', transformOrigin: '50% 50%' }, tS)
  tl.set(root, { opacity: 0 }, cena.end)
})
