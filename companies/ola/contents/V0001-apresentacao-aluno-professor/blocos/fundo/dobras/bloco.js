BLOCO('fundo/dobras', function ({ tl, $, params }) {
  const pano = $('.pano')
  const mapa = params.dobras || {}
  T.tl.scenes.forEach((s, k) => {
    const d = mapa[s.id] || 'creme'
    const el = document.createElement('div')
    el.style.background = `var(--dobra-${d}-fundo)`
    pano.appendChild(el)
    // a 1ª cena já está no 1º quadro (estado do DOM, não um set em 0)
    if (k === 0) el.style.opacity = 1
    else tl.set(el, { opacity: 1 }, s.start)
    if (k < T.tl.scenes.length - 1) tl.set(el, { opacity: 0 }, s.end)
  })
})
