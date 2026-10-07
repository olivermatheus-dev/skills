// Convenção de caminhos: fonte única para app e ferramentas.
import { join } from 'node:path';

export const COMPANIES = 'companies';
export const company = (slug: string) => join(COMPANIES, slug);
export const P = {
  project: (s: string) => join(company(s), 'project.yml'),
  tags: (s: string) => join(company(s), 'tags.yml'),
  context: (s: string) => join(company(s), 'context'),
  brand: (s: string) => join(company(s), 'brand'),
  board: (s: string) => join(company(s), 'board'),
  personas: (s: string) => join(company(s), 'personas'),
  notes: (s: string) => join(company(s), 'notes'),
  ideas: (s: string) => join(company(s), 'ideas'),
  competitors: (s: string) => join(company(s), 'competitors'),
  competitor: (s: string, id: string) => join(company(s), 'competitors', id),
  competitorFile: (s: string, id: string) => join(company(s), 'competitors', id, 'competitor.md'),
  marks: (s: string, id: string) => join(company(s), 'competitors', id, 'marks.json'),
  snapshots: (s: string, id: string) => join(company(s), 'competitors', id, 'snapshots'),
  /** imagens baixadas (avatar, capa, thumbnails): local, fora do git */
  media: (s: string, id: string) => join(company(s), 'competitors', id, 'media'),
};
