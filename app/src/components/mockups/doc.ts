// Editor de mockups (tarefa 030): tipos e operações puras sobre o documento (mockup.json versão 2).
// Geometria relativa: x, y = centro (fração do formato); w, h, tamanho em u = menor lado do formato.
// Regra de edição por formato: no formato PRINCIPAL (o 1º da lista) mexe na base, que vale para todos;
// nos outros grava um ajuste fino só daquele formato (camada.formatos[fmt]) — "voltar ao padrão" apaga o ajuste.
import type { MockupScene } from '../../api';

export type Doc = MockupScene;
export type Camada = Doc['camadas'][number] & Record<string, any>;
export type Fundo = Doc['fundo'] & Record<string, any>;
export type Fmt = Doc['formatos'][number];
export const FORMATOS: Record<Fmt, [number, number]> = { '1:1': [1080, 1080], '4:5': [1080, 1350], '9:16': [1080, 1920], '16:9': [1920, 1080] };
export const FMT_NOME: Record<Fmt, string> = { '1:1': 'Quadrado 1:1', '4:5': 'Feed 4:5', '9:16': 'Stories 9:16', '16:9': 'Paisagem 16:9' };
export interface Caixa { x: number; y: number; w: number; h: number }
export const GEO = ['x', 'y', 'w', 'h', 'rot', 'tamanho'] as const;
export type Geo = Partial<Record<(typeof GEO)[number], number>>;

export const principal = (d: Doc): Fmt => d.formatos[0];
/** geometria efetiva da camada no formato (base + ajuste fino) */
export function geo(c: Camada, fmt: Fmt): Required<Pick<Geo, 'x' | 'y' | 'w' | 'rot'>> & Geo {
  const g: any = { x: 0.5, y: 0.5, w: 0.6, rot: 0 };
  for (const k of GEO) if (c[k] != null) g[k] = c[k];
  const f = c.formatos?.[fmt];
  if (f) for (const k of GEO) if (f[k] != null) g[k] = f[k];
  return g;
}
export const temAjuste = (c: Camada, fmt: Fmt) => !!c.formatos?.[fmt] && Object.keys(c.formatos[fmt]!).length > 0;

/** muda a geometria respeitando a regra do formato principal */
export function comGeo(d: Doc, id: string, fmt: Fmt, patch: Geo): Doc {
  return mapCamada(d, id, (c) => {
    if (fmt === principal(d)) return { ...c, ...patch };
    const f = { ...(c.formatos ?? {}) } as Record<string, Geo>;
    f[fmt] = { ...(f[fmt] ?? {}), ...patch };
    return { ...c, formatos: f };
  });
}
export const semAjuste = (d: Doc, id: string, fmt: Fmt): Doc => mapCamada(d, id, (c) => {
  const f = { ...(c.formatos ?? {}) } as Record<string, Geo>;
  delete f[fmt];
  const { formatos: _, ...resto } = c;
  return Object.keys(f).length ? { ...resto, formatos: f } : resto;
});
export const mapCamada = (d: Doc, id: string, fn: (c: Camada) => Camada): Doc => ({ ...d, camadas: d.camadas.map((c) => (c.id === id ? fn(c as Camada) : c)) });
export const props = (d: Doc, id: string, patch: Record<string, unknown>): Doc => mapCamada(d, id, (c) => ({ ...c, ...patch }));

export function novoId(d: Doc) {
  let n = d.camadas.length + 1;
  while (d.camadas.some((c) => c.id === `c${n}`)) n++;
  return `c${n}`;
}
const NOMES: Record<Camada['tipo'], string> = { aparelho: 'Aparelho', imagem: 'Imagem', texto: 'Texto', forma: 'Forma' };
/** camadas novas: tamanhos que já saem bonitos (texto no topo, dentro da área segura) */
export function novaCamada(d: Doc, tipo: Camada['tipo'], extra: Partial<Camada> = {}): Camada {
  const id = novoId(d), nome = `${NOMES[tipo]} ${d.camadas.filter((c) => c.tipo === tipo).length + 1}`;
  const base: Record<Camada['tipo'], Partial<Camada>> = {
    aparelho: { x: 0.5, y: 0.58, w: 0.8, sombra: { preset: 'produto' } },
    imagem: { x: 0.5, y: 0.5, w: 0.5, raio: 0.02, sombra: { preset: 'suave' } },
    texto: { x: 0.5, y: 0.16, w: 0.84, texto: 'Seu título com *destaque*', fonte: 'titulo', tamanho: 0.072 },
    forma: { x: 0.5, y: 0.5, w: 0.4, h: 0.12, forma: 'retangulo', vidro: true, raio: 0.03 },
  };
  return { id, tipo, nome, ...base[tipo], ...extra } as Camada;
}

/** desenho da prévia de um fundo (miniatura do painel): CSS aproximado, o real é pintado pelo runtime */
export function fundoCss(f: Fundo): string {
  const c = (v?: string, p = '#eee') => (!v ? p : v.startsWith('--') ? `var(${v})` : v);
  if (f.tipo === 'cor') return c(f.cor);
  if (f.tipo === 'transparente') return 'repeating-conic-gradient(#e7e7ea 0 25%, #fff 0 50%) 0 0/12px 12px';
  if (f.tipo === 'linear') return `linear-gradient(${f.angulo ?? 180}deg, ${(f.paradas ?? []).map((p: any) => `${c(p.cor)} ${p.pos * 100}%`).join(', ')})`;
  if (f.tipo === 'radial') return `radial-gradient(circle at ${(f.centro?.x ?? 0.5) * 100}% ${(f.centro?.y ?? 0.4) * 100}%, ${(f.paradas ?? []).map((p: any) => `${c(p.cor)} ${p.pos * 100}%`).join(', ')})`;
  if (f.tipo === 'malha') return [...(f.pontos ?? []).map((p: any) => `radial-gradient(circle at ${p.x * 100}% ${p.y * 100}%, ${c(p.cor)} 0%, transparent ${Math.round(p.r * 140)}%)`), c(f.base)].join(', ');
  return c(f.base, '#ddd');
}
