BLOCO('virada/sessao-ocupa-tudo', function ({ tl, K, root, $, $$, cena, cue, texto, params, box, cursor }) {
  const s = cena.start, app = $('.app'), atd = $('.atd'), next = $('.next'), mods = [$('.list'), $('.short')]
  // medidas antes de qualquer transform
  const pBtn = box($('.next .btn.pri'), 0.5, 0.6), cN = box(next), rN = next.getBoundingClientRect(), rA = atd.getBoundingClientRect(), cA = box(atd)
  const chipC = [box($$('.chip')[0]), box($$('.chip')[1])], cM = mods.map((m) => box(m))
  $('.atd .cl').textContent = texto('cliente')
  // 1º quadro: o painel como a s5 terminou (próxima sessão, sessões de hoje, atalhos)
  tl.set(app, { opacity: 1 }, s)
  tl.set($('.illus'), { opacity: 1 }, s)
  K.flash($('.h6a'), texto('antes'), cue('entra') + 0.04)
  // "administrando": os módulos da gestão recolhem para chips na lateral
  mods.forEach((m, i) => tl.to(m, { x: chipC[i].x - cM[i].x, y: chipC[i].y - cM[i].y, scale: 0.12, opacity: 0, duration: 0.5, ease: 'power3.in' }, cue('recolhe') + i * 0.06))
  $$('.chip').forEach((c, i) => tl.fromTo(c, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, ...M.SOFT }, cue('recolhe') + 0.4 + i * 0.06))
  tl.to(next, { y: 60, duration: 0.6, ease: M.GENTLE.ease }, cue('recolhe') + 0.2)
  // o cursor vai até "Iniciar sessão" e clica (o botão desceu 60 px com o card)
  const alvo = { x: pBtn.x, y: pBtn.y + 60 }
  const C = cursor()
  tl.set(C.el, { x: alvo.x + 260, y: alvo.y + 300 }, s)
  tl.to(C.el, { opacity: 1, duration: 0.2 }, cue('recolhe') + 0.15)
  C.move(alvo, cue('recolhe') + 0.15, Math.max(0.4, cue('inicia') - cue('recolhe') - 0.35))
  C.click(alvo, cue('inicia') - 0.12)
  C.press($('.next .btn.pri'), cue('inicia') - 0.12)
  tl.to(C.el, { opacity: 0, duration: 0.2 }, cue('inicia') + 0.25)
  // "Mais": a headline troca e a sessão abre a partir do card e ocupa a janela inteira
  K.out($('.h6a'), cue('inicia') - 0.05, 0.2, -30)
  K.flash($('.h6b .tx'), texto('depois'), cue('inicia') + 0.1)
  const sx = rN.width / rA.width, sy = rN.height / rA.height
  tl.fromTo(atd, { opacity: 1, x: cN.x - cA.x, y: cN.y + 60 - cA.y, scaleX: sx, scaleY: sy }, { x: 0, y: 0, scaleX: 1, scaleY: 1, ...M.GENTLE, duration: 0.75, immediateRender: false }, cue('inicia'))
  tl.to(next, { opacity: 0, duration: 0.15 }, cue('inicia') + 0.05)
  tl.to($$('.atd > *'), { opacity: 1, duration: 0.3, stagger: 0.05 }, cue('inicia') + 0.35)
  // "cuidando": coração; a anotação vai sendo escrita (traços sem texto clínico) e o relógio corre
  K.pop($('.heart6'), cue('cuida'), 0.3)
  tl.to($('.heart6'), { scale: 1.1, duration: 0.25, yoyo: true, repeat: 1, ease: 'sine.inOut' }, cue('cuida') + 0.7)
  const esc = $$('.esc'), passo = Math.max(0.25, (cena.end - cue('cuida') - 0.4) / esc.length)
  esc.forEach((el, i) => tl.to(el, { scaleX: 1, duration: passo * 0.9, ease: 'power1.inOut' }, cue('cuida') - 0.2 + i * passo))
  tl.to($('.caret'), { opacity: 1, duration: 0.01, yoyo: true, repeat: 7, repeatDelay: 0.25 }, cue('cuida') - 0.2 + (esc.length - 1) * passo)
  const rel = { v: 0 }, [mm, ss] = String(params.relogio_inicio).split(':').map(Number), ini = mm * 60 + ss
  tl.to(rel, { v: cena.end - cue('inicia'), duration: cena.end - cue('inicia'), ease: 'none',
    onUpdate: () => { const t = ini + Math.floor(rel.v); $('.clock').textContent = `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}` } }, cue('inicia'))
  tl.to([$('.h6b'), $('.illus'), $('.chips')], { opacity: 0, duration: 0.25 }, cena.end - 0.28)
  tl.set(root, { opacity: 0 }, cena.end)
})
