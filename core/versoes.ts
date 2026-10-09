// Versões do vídeo no app (tarefa 050 D): cada export guarda a fonte em versoes/vNN/ (tools/video-kit/scripts/versao.mjs).
// Aqui: listar as versões com os MP4 de cada uma e se a fonte atual ainda é a delas, e restaurar uma versão
// (a fonte volta a ser a dela; a de antes fica em versoes/_backup-…). Rotas em app/server/handler.ts.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, ValidationError } from './store';
import { Slug } from '../schema';
import * as VS from '../tools/video-kit/scripts/versao.mjs';
import { video } from '../tools/video-kit/scripts/lib.mjs';
import { previaStatus } from './videoedit';

export interface VersaoVista {
  versao: string; criado: string; nota?: string;
  /** formato → arquivo em exports/ (só o nome) */
  arquivos: Record<string, string>;
  /** a fonte atual (timeline + blocos) é igual à desta versão */
  atual: boolean;
}

function pasta(slug: string, path: string) {
  if (!Slug.safeParse(slug).success) throw new ValidationError(slug, ['slug inválido']);
  if (!path || /(^|\/)\.\.(\/|$)|^\/|[\\:]/.test(path)) throw new ValidationError(path, ['caminho da peça inválido']);
  const dir = join(ROOT, 'companies', slug, 'contents', path);
  if (!existsSync(join(dir, 'timeline.json'))) throw new ValidationError(dir, ['peça sem timeline.json']);
  return dir;
}

export function listarVersoes(slug: string, path: string): { versoes: VersaoVista[]; fonteMudou: boolean } {
  const dir = pasta(slug, path);
  const v = video(dir);
  const atual = VS.hashAtual(v);
  const versoes = VS.versoes(v).map((x) => ({
    versao: x.nome, criado: x.criado, ...(x.nota ? { nota: x.nota } : {}),
    arquivos: Object.fromEntries(Object.entries(x.formatos ?? {}).map(([fmt, f]) => [fmt, String(f).replace(/^exports\//, '')])),
    atual: !!atual && x.hash === atual,
  }));
  return { versoes, fonteMudou: !!versoes.length && !versoes.some((x) => x.atual) };
}

export function restaurarVersao(slug: string, path: string, b: { versao?: string }) {
  const dir = pasta(slug, path);
  if (!/^v\d+$/.test(String(b?.versao ?? ''))) throw new ValidationError(dir, ['versão inválida (ex.: v03)']);
  if (previaStatus(slug, path)?.estado === 'rodando') throw new ValidationError(dir, ['a prévia está sendo gerada: espere terminar']);
  const r = VS.restaurar(video(dir), b.versao!, { fiel: true });
  return { ...r, ...listarVersoes(slug, path) };
}
