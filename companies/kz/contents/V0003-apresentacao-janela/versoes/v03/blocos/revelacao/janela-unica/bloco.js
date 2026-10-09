BLOCO('revelacao/janela-unica', function ({ tl, K, root, $, cena, cue, texto, params }) {
  const s = cena.start, uni = $('.uni'), logo = $('.logo'), glow = $('.glow')
  // 1º quadro: a janela única pequena no centro (a fusão da cena anterior); respira no silêncio
  tl.set(uni, { opacity: 1, scale: params.escala_inicial }, s)
  tl.to(uni, { scale: params.escala_inicial * 1.08, duration: Math.max(0.2, cue('marca') - s - 0.1), ease: 'sine.inOut' }, s)
  // "kz": a janela abre, a logo se desenha dentro dela, o brilho acende
  tl.to(uni, { scale: 1, ...M.GENTLE, duration: 0.9 }, cue('marca') - 0.12)
  // os 3 ícones das janelas que se juntaram somem no centro enquanto a logo nasce
  tl.to($('.trio'), { scale: 0.2, opacity: 0, duration: 0.35, ease: 'power2.in' }, cue('marca') - 0.05)
  tl.fromTo(glow, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 1.0, ease: 'power2.out' }, cue('marca'))
  tl.fromTo(logo, { clipPath: 'inset(0 100% 0 0)', scale: 0.92 }, { clipPath: 'inset(0 0% 0 0)', scale: 1, duration: 0.8, ease: 'power3.out' }, cue('marca') + 0.05)
  tl.to(logo, { scale: 1.04, duration: 0.2, ease: 'power2.out', yoyo: true, repeat: 1 }, cue('marca') + 0.85)
  K.flash($('.ass'), texto('assinatura'), cue('assinatura'))
  // vivo: a logo respira e o brilho deriva até o rodapé abrir
  tl.to(logo, { scale: 1.03, duration: Math.max(0.3, cue('rodape') - cue('assinatura')), ease: 'sine.inOut' }, cue('assinatura') + 0.2)
  tl.to(glow, { x: -60, y: 40, duration: cena.end - cue('marca'), ease: 'sine.inOut' }, cue('marca') + 1)
  // rodapé: divisória se desenha e a frase entra inteira; as 3 pílulas uma a uma
  tl.to($('.div'), { scaleX: 1, duration: 0.6, ease: 'power3.out' }, cue('rodape'))
  K.flash($('.frase'), texto('frase'), cue('rodape') + 0.08, 26)
  ;['p1', 'p2', 'p3'].forEach((p, i) => {
    const el = $('.q' + (i + 1))
    el.querySelector('.tx').textContent = texto(p)
    tl.fromTo(el, { opacity: 0, y: 30, scale: 0.85 }, { opacity: 1, y: 0, scale: 1, ...M.SOFT }, cue(p))
    tl.fromTo(el.querySelector('.tile-ic'), { rotation: -90, scale: 0.3 }, { rotation: 0, scale: 1, ...M.SOFT }, cue(p) + 0.06)
  })
  tl.to($('.q3'), { scale: 1.05, duration: 0.22, ease: 'sine.inOut', yoyo: true, repeat: 1 }, cue('p3') + 0.5)
  // saída: o conteúdo sai e a janela cresce para virar a moldura do painel (s5)
  tl.to([logo, $('.ass'), $('.div'), $('.frase'), $('.pills'), glow], { opacity: 0, duration: 0.25, ease: 'power2.in' }, cena.end - 0.3)
  tl.to(uni, { scale: 1.12, y: 40, duration: 0.3, ease: 'power2.in' }, cena.end - 0.3)
  tl.set(root, { opacity: 0 }, cena.end)
})
