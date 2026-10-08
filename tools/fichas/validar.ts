// Validação das fichas de análise para o `npm run validate` (tarefa 040): schema + vocabulário + chave × nome do arquivo.
// Também confere o próprio vocabulário, o pedido e os relatórios. Sem dependência do código do app.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Ficha, fichaFileName, issuesFicha } from '../../schema/ficha';
import { FichasPedido, Relatorio } from '../../schema/relatorio';
import { parseMd } from '../../core/frontmatter';
import { ROOT, VOCAB_FILE, loadVocab, loadFormatos, loadTags } from './lib';
import { numerosForaDosAgregados } from './relatorio-lib';

type Erro = { file: string; issues: string[] };
const fmt = (e: { issues: { path: PropertyKey[]; message: string }[] }) => e.issues.map((i) => `${i.path.join('.') || '(raiz)'}: ${i.message}`);
const json = (f: string) => JSON.parse(readFileSync(f, 'utf8').replace(/^﻿/, ''));

export function validarFichas(): Erro[] {
  const erros: Erro[] = [];
  const rel = (p: string) => p.replace(`${ROOT}\\`, '').replace(`${ROOT}/`, '').replace(/\\/g, '/');
  let vocab;
  try { vocab = loadVocab(); } catch (e) { return [{ file: rel(VOCAB_FILE), issues: [(e as Error).message] }]; }
  const formatos = loadFormatos();
  const companies = join(ROOT, 'companies');
  for (const slug of readdirSync(companies).filter((d) => !d.startsWith('_') && existsSync(join(companies, d, 'competitors')))) {
    const ctx = { vocab, formatos, tags: loadTags(slug) };
    for (const comp of readdirSync(join(companies, slug, 'competitors'))) {
      const fd = join(companies, slug, 'competitors', comp, 'fichas');
      if (existsSync(fd)) for (const f of readdirSync(fd).filter((x) => x.endsWith('.json'))) {
        const file = join(fd, f);
        try {
          if (f === 'pedido.json') { const r = FichasPedido.safeParse(json(file)); if (!r.success) erros.push({ file: rel(file), issues: fmt(r.error) }); continue; }
          const r = Ficha.safeParse(json(file));
          if (!r.success) { erros.push({ file: rel(file), issues: fmt(r.error) }); continue; }
          const issues = issuesFicha(r.data, ctx);
          if (fichaFileName(r.data.key) !== f) issues.push(`nome do arquivo (${f}) diferente da chave (${r.data.key} → ${fichaFileName(r.data.key)})`);
          if (r.data.competitorId !== comp) issues.push(`competitorId "${r.data.competitorId}" diferente da pasta (${comp})`);
          if (issues.length) erros.push({ file: rel(file), issues });
        } catch (e) { erros.push({ file: rel(file), issues: [(e as Error).message] }); }
      }
      const rd = join(companies, slug, 'competitors', comp, 'relatorios');
      if (existsSync(rd)) for (const f of readdirSync(rd).filter((x) => x.endsWith('.md'))) {
        const file = join(rd, f);
        const r = Relatorio.safeParse(parseMd(readFileSync(file, 'utf8')).data);
        if (!r.success) { erros.push({ file: rel(file), issues: fmt(r.error) }); continue; }
        const issues: string[] = [];
        if (`${r.data.id}.md` !== f) issues.push(`id "${r.data.id}" diferente do nome do arquivo`);
        if (r.data.competitor !== comp) issues.push(`competitor "${r.data.competitor}" diferente da pasta (${comp})`);
        const semFicha = r.data.itens.filter((k) => !existsSync(join(fd, fichaFileName(k))));
        if (semFicha.length) issues.push(`itens sem ficha: ${semFicha.join(', ')}`);
        const l = r.data.leitura;
        if (l) {
          const fora = [...l.padroes, ...l.copiar, ...l.evitar, ...l.ideias].flatMap((b) => b.itens).filter((k) => !r.data.itens.includes(k));
          if (fora.length) issues.push(`a leitura cita item(ns) fora da rodada: ${[...new Set(fora)].join(', ')}`);
          const nums = numerosForaDosAgregados(r.data);
          if (nums.length) issues.push(`a leitura cita número(s) fora dos agregados: ${nums.join(', ')}`);
        }
        if (issues.length) erros.push({ file: rel(file), issues });
      }
    }
  }
  return erros;
}
