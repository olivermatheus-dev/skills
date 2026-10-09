BLOCO('abertura/pergunta-fragmentos', function ({ tl, K, $, $$, cena, cue, texto, fala, params }) {
  const f = fala(0)
  // ícones que `fragmentos` pode pedir (os {{i:…}} são trocados pelo SVG na hora de montar; outro Lucide = acrescentar aqui)
  const ICONES = {
    calendar: `{{i:calendar}}`, contact: `{{i:contact}}`, 'notebook-pen': `{{i:notebook-pen}}`, 'message-circle': `{{i:message-circle}}`,
    'file-text': `{{i:file-text}}`, users: `{{i:users}}`, folder: `{{i:folder}}`, wallet: `{{i:wallet}}`, sheet: `{{i:sheet}}`, clock: `{{i:clock}}`,
  }
  // params novos, todos opcionais: sem eles o bloco é o original (Agenda · Mensagens · Planilha · Caderno, entrando do nada em `espalha`)
  if (params.fragmentos) {
    $('.frags').innerHTML = params.fragmentos.map(([ic, rot, tom]) => {
      if (!ICONES[ic]) throw new Error(`pergunta-fragmentos: ícone "${ic}" fora da lista do bloco.js`)
      return `<div class="frag"><div class="ic ${tom}">${ICONES[ic]}</div>${rot}</div>`
    }).join('')
  }
  // detalhes: 1 por peça. Número puro vira selo no canto (3 mensagens); texto vira linha curta sob o rótulo (Qui 14h)
  ;(params.detalhes || []).forEach((d, i) => {
    const el = $$('.frag')[i]
    if (!el || !d) return
    if (/^\d+$/.test(String(d))) return el.insertAdjacentHTML('beforeend', `<span class="bd">${d}</span>`)
    const tn = [...el.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim())
    const lb = document.createElement('div')
    lb.className = 'lb'
    lb.innerHTML = `${tn.textContent}<small class="dt">${d}</small>`
    tn.replaceWith(lb)
  })
  // apagadas: as peças já existem no 1º quadro (em arco, pequenas, a 30%, atrás da pergunta) e em `espalha` acendem e se espalham
  const apagadas = !!params.apagadas
  if (apagadas) {
    $('.frags').style.zIndex = 1
    $('.main').style.zIndex = 2
  }

  K.pop($('.badge'), cue('entra'), 0.3)
  tl.fromTo($('.badge'), { rotation: -12 }, { rotation: 0, ...M.SOFT, duration: 0.7 }, cue('entra'))
  if (params.inteira) K.flash($('.q1t'), texto('pergunta'), cue('entra') + 0.06, 50)
  else K.type($('.q1t'), texto('pergunta'), f, cue('entra') + 0.06, 60)
  tl.to($('.q1'), { y: -190, scale: 0.42, duration: 0.75, ease: M.GENTLE.ease }, cue('troca'))
  if (params.inteira) K.flash($('.q2'), texto('complemento'), cue('troca') + 0.12, 40)
  else K.type($('.q2'), texto('complemento'), f, cue('troca') + 0.12, 40, true)
  const some = cena.end + params.sobra
  $$('.frag').forEach((el, i) => {
    const [x, y, r] = params.posicoes[i]
    if (apagadas) {
      const [ax, ay, ar] = params.arco[i]
      tl.set(el, { opacity: params.opacidade_apagada, x: ax, y: ay, scale: params.escala_apagada, rotation: ar }, cena.start)
      // deriva lenta até acender (termina antes do `espalha`, que pega o ponto onde ela parou)
      tl.to(el, { y: ay + (i % 2 ? 9 : -9), rotation: ar + (i % 2 ? 1.5 : -1.5), duration: Math.max(0.1, cue('espalha') - cena.start - 0.02), ease: 'none' }, cena.start)
      tl.to(el, { opacity: 1, x, y, scale: 1, rotation: r, ...M.SOFT }, cue('espalha') + i * 0.09)
    } else {
      tl.fromTo(el, { opacity: 0, x: -110, y: -40, scale: 0.3, rotation: 0 }, { opacity: 1, x, y, scale: 1, rotation: r, ...M.SOFT }, cue('espalha') + i * 0.09)
    }
    // o suspiro do começo da cena seguinte: os pedaços "caem" um pouco e somem
    tl.to(el, { y: y + 40 + i * 6, rotation: r * 1.6, duration: 1.0, ease: 'sine.inOut' }, cena.end)
    tl.to(el, { opacity: 0, scale: 0.6, filter: 'blur(6px)', duration: 0.25, ease: 'power2.in' }, some - 0.12 + i * 0.04)
  })
  tl.fromTo($('.main'), { scale: 1 }, { scale: 1.03, duration: cena.dur, ease: 'sine.inOut' }, cena.start)
  K.out($('.main'), cena.end - 0.26, 0.28, -50)
})
