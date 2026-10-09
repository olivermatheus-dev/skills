// Casamento do texto da tela com a fala, igual ao K.type do runtime e ao QC de sincronia (regra texto-fala): na ordem, com
// repetição, sem acento/pontuação ("e-mail" = "email"). Usado pelo sincronia.mjs e pela validação dos insumos (045 E).
export const fold = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^\w]/g, '');
export const palavras = (s = '') => s.replace(/\*/g, '').split(/[\s|]+/).filter((w) => fold(w));
/** Casa o texto da tela com a fala na ordem: [{ w, t }] (t = null se a fala não diz). `ws` = [{ w, s }]. */
export function casar(texto, ws) {
  let j = 0;
  return palavras(texto).map((w) => {
    const k = ws.findIndex((x, i) => i >= j && fold(x.w) === fold(w));
    if (k < 0) return { w, t: null };
    j = k + 1;
    return { w, t: ws[k].s };
  });
}
