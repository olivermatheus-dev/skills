BLOCO('produto/painel-janela', function ({ tl, K, root, $, cena, cue, texto, box }) {
  const app = $('.app'), e = cue('entra')
  // alvos do encaixe (medidos antes de qualquer transform): agenda → Sessões de hoje, ficha → Próxima sessão, post-it → Nova anotação
  const alvo = [box($('.list .mc')), box($('.next .who')), box($('.tile.nota'))]
  const gh = [$('.g1'), $('.g2'), $('.g3')], de = gh.map((el) => box(el))
  $('.hello').innerHTML = `${texto('saudacao')} <span class="acc">${texto('nome')}</span>`
  K.flash($('.h5a'), texto('h1'), e + 0.05)
  // a janela da revelação vira a moldura do painel
  tl.fromTo(app, { opacity: 0, scale: 0.96, y: 20 }, { opacity: 1, scale: 1, y: 0, ...M.GENTLE, duration: 0.8 }, e - 0.05)
  tl.fromTo([$('.hello'), $('.sub')], { opacity: 0, y: 20 }, { opacity: 1, y: 0, ...M.FAST, stagger: 0.05 }, e + 0.05)
  tl.fromTo([$('.next'), $('.list'), $('.short')], { opacity: 0, y: 30 }, { opacity: 1, y: 0, ...M.FAST, stagger: 0.08 }, e + 0.35)
  // encaixe: os 3 pedaços da s2 chegam cada um do seu lado e entram no módulo
  gh.forEach((el, i) => {
    const at = e + 0.12 + i * 0.12
    tl.fromTo(el, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.2, ease: 'power2.out' }, at)
    tl.to(el, { x: alvo[i].x - de[i].x, y: alvo[i].y - de[i].y, scale: 0.6, duration: 0.55, ease: 'power3.inOut' }, at + 0.15)
    tl.to(el, { opacity: 0, duration: 0.15 }, at + 0.62)
  })
  // "atendimentos": câmera na próxima sessão
  tl.to(app, { scale: 1.05, y: 30, duration: 1.0, ease: M.GENTLE.ease }, cue('destaque') - 0.15)
  tl.fromTo($('.ring5'), { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, ...M.FAST }, cue('destaque'))
  // "organizar": headline troca, câmera desce, a paciente que estava em 3 lugares aparece 1 vez e acende
  K.out($('.h5a'), cue('lista') - 0.2, 0.2, -30)
  K.flash($('.h5b'), texto('h2'), cue('lista'))
  tl.to($('.ring5'), { opacity: 0, duration: 0.25 }, cue('lista') - 0.2)
  tl.to(app, { scale: 1.05, y: -15, duration: 1.0, ease: M.GENTLE.ease }, cue('lista') - 0.15)
  tl.fromTo($('.list .mc .aro'), { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, ...M.FAST }, cue('lista') + 0.2)
  // vivo: a câmera segue chegando devagar até o check
  tl.to(app, { scale: 1.075, y: -25, duration: Math.max(0.4, cue('sai') - cue('lista') - 1.1), ease: 'sine.inOut' }, cue('lista') + 0.85)
  tl.to($('.list .mc .aro'), { scale: 1.03, duration: 0.45, yoyo: true, repeat: 1, ease: 'sine.inOut' }, cue('lista') + 0.9)
  // "complicação": o check entra ao lado de M.C.
  tl.fromTo($('.list .mc .ok'), { opacity: 0, scale: 0.3, rotation: -60 }, { opacity: 1, scale: 1, rotation: 0, ...M.SOFT }, cue('feito'))
  // saída: a câmera volta; fica só o que a s6 usa (próxima sessão, sessões de hoje, atalhos)
  tl.to(app, { scale: 1, y: 0, duration: 0.45, ease: 'power2.inOut' }, cue('sai') - 0.2)
  tl.to([$('.hello'), $('.sub'), $('.illus')], { opacity: 0, duration: 0.2 }, cue('sai') - 0.2)
  tl.to(app, { borderColor: 'rgba(0,0,0,0)', boxShadow: '0 0 0 rgba(0,0,0,0)', duration: 0.3 }, cue('sai') - 0.1)
  K.out($('.h5b'), cue('sai'), 0.25)
  tl.set(root, { opacity: 0 }, cena.end)
})
