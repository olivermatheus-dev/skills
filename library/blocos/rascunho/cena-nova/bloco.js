BLOCO('rascunho/cena-nova', function ({ tl, root, $, cena, partes, params }) {
  $('.rc-tag').textContent = `bloco novo: ${params.novo || '?'}`
  $('.rc-textos').innerHTML = partes().filter(Boolean).map((p) => `<div>${p.replace(/\*(.+?)\*/g, '<span class="acc">$1</span>')}</div>`).join('')
  $('.rc-spec').textContent = params.spec || ''
  tl.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.2 }, cena.start)
  tl.to(root, { opacity: 0, duration: 0.15 }, cena.end - 0.15)
})
