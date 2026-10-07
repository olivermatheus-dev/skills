// Convenção de caminhos: fonte única para app e ferramentas.
import { join } from 'node:path';

export const COMPANIES = 'companies';
export const company = (slug: string) => join(COMPANIES, slug);
export const P = {
  project: (s: string) => join(company(s), 'project.yml'),
  tags: (s: string) => join(company(s), 'tags.yml'),
  context: (s: string) => join(company(s), 'context'),
  brand: (s: string) => join(company(s), 'brand'),
  /** material bruto do estúdio de mockups (028): <AAAA-MM-DD>-<tela>/captura.json + original.png */
  capturas: (s: string) => join(company(s), 'capturas'),
  board: (s: string) => join(company(s), 'board'),
  personas: (s: string) => join(company(s), 'personas'),
  notes: (s: string) => join(company(s), 'notes'),
  ideas: (s: string) => join(company(s), 'ideas'),
  competitors: (s: string) => join(company(s), 'competitors'),
  competitor: (s: string, id: string) => join(company(s), 'competitors', id),
  competitorFile: (s: string, id: string) => join(company(s), 'competitors', id, 'competitor.md'),
  marks: (s: string, id: string) => join(company(s), 'competitors', id, 'marks.json'),
  snapshots: (s: string, id: string) => join(company(s), 'competitors', id, 'snapshots'),
  /** análise por módulo (analysis/<modulo>.json, pedido.json, notas.json) */
  analysis: (s: string, id: string) => join(company(s), 'competitors', id, 'analysis'),
  /** texto extraído do site pelo script (local, fora do git; refazível) */
  site: (s: string, id: string) => join(company(s), 'competitors', id, 'site'),
  /** imagens baixadas (avatar, capa, thumbnails): local, fora do git */
  media: (s: string, id: string) => join(company(s), 'competitors', id, 'media'),
};
