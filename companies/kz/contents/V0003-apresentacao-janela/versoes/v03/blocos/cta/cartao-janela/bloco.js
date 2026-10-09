BLOCO('cta/cartao-janela', function ({ tl, K, root, $, cena, cue, texto, params, box, cursor }) {
  const card = $('.card'), cta = $('.cta'), e = cue('entra')
  // medir com o texto já no botão e antes de qualquer transform
  cta.innerHTML = `${texto('botao')} <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`
  const pCta = box(cta, 0.88, 0.62), cC = box(card), r = card.getBoundingClientRect()
  const [dx, dy, dw, dh] = params.de
  // 1º quadro: o cartão tem o tamanho da janela anterior e encolhe até virar o cartão final
  tl.fromTo(card, { opacity: 1, x: dx + dw / 2 - cC.x, y: dy + dh / 2 - cC.y, scaleX: dw / r.width, scaleY: dh / r.height },
    { x: 0, y: 0, scaleX: 1, scaleY: 1, ...M.GENTLE, duration: 0.8, immediateRender: false }, cena.start)
  tl.set(card, { opacity: 1 }, cena.start)
  tl.fromTo($('.glow7'), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 1.0, ease: 'power2.out' }, e + 0.1)
  tl.fromTo($('.endlogo'), { clipPath: 'inset(0 100% 0 0)', scale: 0.92 }, { clipPath: 'inset(0 0% 0 0)', scale: 1, duration: 0.8, ease: 'power3.out' }, e + 0.15)
  K.flash($('.endtitle'), texto('titulo'), e + 0.2)
  // "descubra": a linha entra inteira e o botão aparece
  K.flash($('.endline'), texto('linha'), cue('cta') - 0.1, 26)
  tl.fromTo(cta, { opacity: 0, y: 30, scale: 0.85 }, { opacity: 1, y: 0, scale: 1, ...M.SOFT }, cue('cta') + 0.1)
  $('.endsub').textContent = texto('sub')
  tl.fromTo($('.endsub'), { opacity: 0, y: 16 }, { opacity: 1, y: 0, ...M.FAST }, cue('cta') + 0.5)
  tl.to(cta, { scale: 1.04, duration: 0.5, ease: 'sine.inOut', yoyo: true, repeat: 1 }, cue('cta') + 0.9)
  // o cursor chega e clica; o botão pulsa de novo na cauda
  const C = cursor()
  tl.set(C.el, { x: pCta.x + 280, y: pCta.y + 260 }, cena.start)
  tl.to(C.el, { opacity: 1, duration: 0.2 }, cue('clique') - 0.85)
  C.move(pCta, cue('clique') - 0.85, 0.75)
  C.click(pCta, cue('clique'))
  C.press(cta, cue('clique'))
  tl.to(cta, { scale: 1.035, duration: 0.6, ease: 'sine.inOut', yoyo: true, repeat: 1 }, cue('clique') + 0.6)
  tl.to($('.endlogo'), { scale: 1.03, duration: Math.max(0.5, cena.end - cue('clique') - 0.3), ease: 'sine.inOut' }, cue('clique') + 0.3)
})
