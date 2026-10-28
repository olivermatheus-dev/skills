BLOCO('cta/fecho-ola', function ({ tl, root, $, $$, cena, cue, texto, params, box, cursor }) {
  if (cena.start <= 0.001) root.style.opacity = 1; else tl.set(root, { opacity: 1 }, cena.start)
  const f1 = texto('frase1').replace(/\*/g, '')
  $('.fa').textContent = f1
  $('.fb').textContent = f1
  // frase2: cada palavra num span; a palavra "olá" ganha o sublinhado e vira o link
  const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^\w]/g, '')
  $('.f2').innerHTML = texto('frase2').split(' ').map((w) => {
    const limpo = w.replace(/\*/g, '')
    const m = limpo.match(/^(.*?)([.!?,]*)$/)
    const ola = fold(m[1]) === fold(params.palavra)
    return ola ? `<span class="w2"><span class="ola">${m[1]}</span>${m[2]}</span>` : `<span class="w2">${limpo}</span>`
  }).join(' ')
  $('.urlp .tx').textContent = texto('url')
  $('.logo').src = params.logo
  const ola = $('.f2 .ola') || $$('.f2 .w2').pop()
  // medir antes de transform
  const pOla = box(ola, 0.5, 0.5), pOlaC = box(ola, 0.55, 0.7), pUrl = box($('.urlp'), 0.5, 0.5)
  const wOla = ola.getBoundingClientRect().width
  const tE = cue('entra'), tT = cue('troca'), tF = cue('frase'), tC = cue('clique'), tL = cue('link'), tLo = cue('logo')
  const pa = $('.pa'), pb = $('.pb'), mA = pa.querySelector('.masc'), mB = pb.querySelector('.masc')

  tl.fromTo(root, { scale: 1 }, { scale: 1.012, duration: cena.dur, ease: 'sine.inOut', transformOrigin: '50% 50%' }, cena.start)
  // 1º quadro: o vermelho já cobre a tela (veio da aula); o card do aluno sobe com a frase
  tl.fromTo(pa.querySelector('.kc'), { y: 120, scale: 0.94, opacity: 0.6 }, { y: 0, scale: 1, opacity: 1, ...M.SOFT, duration: 0.45 }, tE)
  tl.fromTo($('.fa'), { opacity: 0.4, y: 24 }, { opacity: 1, y: 0, ...M.FAST, duration: 0.35 }, tE)
  // os personagens flutuam
  tl.to(mA, { y: -16, duration: 0.6, yoyo: true, repeat: 3, ease: 'sine.inOut' }, tE + 0.3)
  tl.to(mB, { y: -16, duration: 0.6, yoyo: true, repeat: 3, ease: 'sine.inOut' }, tT + 0.5)
  tl.to([pa.querySelector('.bt'), pb.querySelector('.bt')], { x: 10, duration: 0.35, yoyo: true, repeat: 3, ease: 'sine.inOut' }, tE + 0.4)
  // troca: o aluno sai pela direita e o professor entra pela esquerda (a frase continua inteira)
  const dT = 0.6
  tl.to(pa, { x: 1100, duration: dT, ease: 'power3.inOut' }, tT)
  tl.fromTo(pb, { x: -1100 }, { x: 0, duration: dT, ease: 'power3.inOut' }, tT)
  tl.fromTo(mB, { rotation: -6 }, { rotation: 0, ...M.SOFT, duration: 0.6 }, tT + dT * 0.7)
  // frase final: o botão do professor abre a dobra vermelha em círculo
  tl.to(pb.querySelector('.bt'), { scale: 0.92, duration: 0.07, yoyo: true, repeat: 1 }, tF - 0.1)
  tl.fromTo($('.fim'), { clipPath: 'circle(0px at 540px 1018px)' }, { clipPath: 'circle(1500px at 540px 1018px)', duration: 0.55, ease: 'power2.in' }, tF)
  tl.fromTo($$('.f2 .w2'), { opacity: 0, y: 50 }, { opacity: 1, y: 0, ...M.SOFT, duration: 0.45, stagger: 0.06 }, tF + 0.3)
  tl.fromTo($('.blob'), { x: 200, y: 160, rotation: -12 }, { x: 0, y: 0, rotation: 0, ...M.GENTLE, duration: 0.9 }, tF + 0.35)
  tl.to($('.blob'), { rotation: 6, y: -12, duration: Math.max(1, cena.end - tF - 1.3), ease: 'sine.inOut' }, tF + 1.25)
  tl.fromTo(ola, { '--u': 0 }, { '--u': 1, duration: 0.35, ease: 'power2.out' }, tF + 0.95)
  // o cursor clica no "olá" sublinhado
  const C = cursor()
  tl.set(C.el, { x: 1000, y: 1150 }, cena.start)
  tl.to(C.el, { opacity: 1, duration: 0.12 }, tC - 0.55)
  C.move(pOlaC, tC - 0.55, 0.5)
  C.click(pOlaC, tC)
  tl.to(ola, { scale: 0.94, duration: 0.07, yoyo: true, repeat: 1 }, tC)
  // o link nasce do "olá" num retângulo arredondado
  const u = $('.urlp')
  tl.fromTo(u, { opacity: 0, x: pOla.x - pUrl.x, y: pOla.y - pUrl.y, scaleX: wOla / 720, scaleY: 0.5 },
    { opacity: 1, x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.5, ease: 'power3.out' }, tL)
  tl.fromTo(u.querySelector('.tx'), { opacity: 0 }, { opacity: 1, duration: 0.25 }, tL + 0.2)
  tl.to(C.el, { x: pUrl.x + 230, y: pUrl.y + 160, opacity: 0, duration: 0.5, ease: 'power2.in' }, tL + 0.3)
  // o logo aparece por cima, discreto
  tl.fromTo($('.logo'), { opacity: 0, y: 20 }, { opacity: 0.95, y: 0, duration: 0.8, ease: 'power2.out' }, tLo)
  // cauda viva: a pílula do link respira
  tl.to(u, { scale: 1.03, duration: 0.5, yoyo: true, repeat: Math.max(1, Math.floor((cena.end - tLo - 0.6) / 0.5)), ease: 'sine.inOut' }, tLo + 0.4)
})
