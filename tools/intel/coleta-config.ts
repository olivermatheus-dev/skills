// Opções de coleta do projeto (companies/<slug>/intel/coleta.json), editáveis na aba Coletas do app.
// Hoje: Instagram logado (quantidade ou período, só reels ou tudo). Arquivo ausente ou campo inválido → padrão.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import * as S from '../../core/store';
import { company } from '../../schema';
import { DEFAULT_IG, type IgOptions } from './types';

export { DEFAULT_IG };

export interface ColetaConfig { instagram: IgOptions }

export const IG_DIAS = [30, 60, 90] as const;

const file = (slug: string) => join(S.ROOT, company(slug), 'intel', 'coleta.json');

/** aceita qualquer coisa e devolve opções válidas (quantidade 6–200, dias 1–365) */
export function cleanIg(v: unknown): IgOptions {
  const o = (v && typeof v === 'object' ? v : {}) as Partial<Record<keyof IgOptions, unknown>>;
  const int = (x: unknown, min: number, max: number, def: number) => { const n = Math.round(Number(x)); return Number.isFinite(n) && n >= min && n <= max ? n : def; };
  return {
    modo: o.modo === 'periodo' ? 'periodo' : 'quantidade',
    quantidade: int(o.quantidade, 6, 200, DEFAULT_IG.quantidade),
    dias: int(o.dias, 1, 365, DEFAULT_IG.dias),
    conteudo: o.conteudo === 'tudo' ? 'tudo' : 'reels',
  };
}

export function readColetaConfig(slug: string): ColetaConfig {
  try { return { instagram: cleanIg(JSON.parse(readFileSync(file(slug), 'utf8')).instagram) }; } catch { return { instagram: { ...DEFAULT_IG } }; }
}

export function saveColetaConfig(slug: string, v: Partial<ColetaConfig>): ColetaConfig {
  const cfg: ColetaConfig = { instagram: cleanIg({ ...readColetaConfig(slug).instagram, ...(v?.instagram ?? {}) }) };
  const f = file(slug);
  if (!existsSync(dirname(f))) mkdirSync(dirname(f), { recursive: true });
  writeFileSync(f, `${JSON.stringify(cfg, null, 2)}\n`);
  return cfg;
}
