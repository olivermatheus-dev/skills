// Limpeza leve do markdown que sai do editor antes de gravar: o MDXEditor exporta parágrafos vazios
// (Enter duas vezes) como várias linhas em branco. Junta 3+ quebras em 2, fora de blocos de código,
// e termina o arquivo com uma única quebra de linha.
export function tidyMd(md: string): string {
  const parts = md.split(/(^```[\s\S]*?^```[^\n]*$)/m);
  return parts.map((p, i) => (i % 2 ? p : p.replace(/\n{3,}/g, '\n\n'))).join('').replace(/^\n+/, '').replace(/\s*$/, '\n');
}
