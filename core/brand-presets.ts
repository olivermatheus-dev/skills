// Presets de estilo do kit de marca (tarefa 024). Aplicar um preset troca os tokens de FORMA e TIPOGRAFIA abaixo
// (cores e fontes ficam como estão) e escreve as regras no bloco do kit no BRAND.md. Outros presets entram aqui depois.
export interface BrandPreset {
  id: string;
  label: string;
  summary: string;
  /** regras que as skills seguem (vão para o BRAND.md) */
  rules: string[];
  /** valores de token aplicados (nome sem --) */
  tokens: Record<string, string>;
  icons: { stroke: number; style: 'linha' | 'preenchido' };
}

export const BRAND_PRESETS: BrandPreset[] = [
  {
    id: 'minimalista-apple',
    label: 'Minimalista (estilo Apple)',
    summary: 'Pouco elemento, muito respiro, uma ideia por tela; a tipografia faz o trabalho.',
    rules: [
      'Muito respiro: margens largas, no máximo 1 bloco de conteúdo + 1 apoio por slide/cena.',
      'Fundo liso e claro (`--bg`/`--surface`); nada de textura, gradiente, padrão ou foto de banco.',
      'Uma cor de destaque (`--primary`) usada com parcimônia: 1 palavra, 1 ícone ou 1 botão por tela.',
      'Hierarquia por tamanho e peso, não por cor: título grande (peso 600), texto curto, no máximo 2 tamanhos por tela.',
      'Cantos suaves (`--radius`), sombras quase invisíveis (`--shadow-sm`); bordas finas só quando precisar separar.',
      'Ícones de linha finos, do mesmo tamanho e alinhados ao texto; nunca ícone decorativo sem função.',
      'Sem ornamentos: nada de emoji, adesivo, rabisco, sublinhado colorido ou caixa alta em frase.',
    ],
    tokens: {
      'weight-heading': '600',
      'tracking-heading': '-0.022em',
      'leading-heading': '1.08',
      'case-heading': 'none',
      radius: '18px',
      'radius-sm': '12px',
      'border-width': '1px',
      'shadow-sm': '0 1px 2px rgba(0,0,0,.04)',
      'shadow-md': '0 4px 16px rgba(0,0,0,.05)',
      'shadow-lg': '0 12px 32px rgba(0,0,0,.07)',
    },
    icons: { stroke: 1.5, style: 'linha' },
  },
];
