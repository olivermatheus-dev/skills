// Onde a rodada guarda o que é dela. No git: companies/<slug>/curadoria/rodadas/<id>/ (pedido, consultas, resultado).
// Fora do git: data/curadoria/<slug>/<id>/ (brutos, candidatos, achados, verificados, sintese, páginas baixadas).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { P } from '../../schema';

// Caminhos absolutos a partir da raiz do hub (HUB_ROOT quando o app roda numa cópia; senão a pasta atual), como o core/store.ts.
const ROOT = process.env.HUB_ROOT ?? process.cwd();
export const roundDir = (slug: string, round: string) => join(ROOT, P.curadoria(slug), 'rodadas', round);
export const workDir = (slug: string, round: string) => join(ROOT, 'data', 'curadoria', slug, round);
export const work = (slug: string, round: string, f: string) => join(workDir(slug, round), f);

export function readJsonFile<T>(file: string): T {
  if (!existsSync(file)) throw new Error(`não achei ${file}`);
  return JSON.parse(readFileSync(file, 'utf8')) as T;
}
export function writeJsonFile(file: string, v: unknown) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(v, null, 2)}\n`);
}

/** rodadas/<id>/consultas.json: as consultas por idioma e os termos que o script usa na pré-triagem */
export interface Queries {
  pt: string[];
  en: string[];
  /** consultas para fontes de notícia (Google Notícias); vazio = usa as pt */
  noticias?: string[];
  /** janela das notícias em dias (padrão aprovado: 60) */
  noticiasDias?: number;
  /** termos (sem acento, minúsculos) que contam pontos de aderência na pré-triagem */
  termos?: string[];
  /** máximo de itens por consulta e fonte */
  max?: number;
}
export const queriesFile = (slug: string, round: string) => join(roundDir(slug, round), 'consultas.json');
