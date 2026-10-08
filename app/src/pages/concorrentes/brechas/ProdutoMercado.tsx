// Brechas → Produto × mercado: o produto contra a matriz de funcionalidades (intel/matriz.json).
// Faltam = metade ou mais dos concorrentes têm e você não (ou não confirmou) · Só você tem = ninguém (ou no máx. 2) tem.
import { Link } from 'react-router-dom';
import { ArrowRight, Gem, PackageX } from 'lucide-react';
import { cx } from '../../../components/kit';
import { pct, type MatrixStats } from '../PanoramaBrechas';

export default function ProdutoMercado({ slug, s }: { slug: string; s: MatrixStats | null }) {
  const mat = (f: string) => `/p/${slug}/concorrentes/comparar?v=funcionalidades&f=${f}`;
  if (!s) return (
    <div className="bg-card border border-border rounded-xl p-6 text-center text-sm text-muted-foreground">
      Sem matriz de funcionalidades ainda. Ela sai das análises de funcionalidades dos concorrentes (Comparar → Funcionalidades).
    </div>
  );
  const label = (st?: string) => st === 'nao' ? { t: 'você não tem', c: 'text-destructive' } : st === 'planejado' ? { t: 'planejado', c: 'text-warning-ink' } : { t: 'confirmar se tem', c: 'text-muted-foreground' };
  const bar = (n: number, cls: string) => (
    <span className="w-20 shrink-0 h-1.5 rounded-full bg-muted overflow-hidden"><span className={cx('block h-full rounded-full', cls)} style={{ width: `${(n / s.n) * 100}%` }} /></span>
  );
  return (
    <div className="space-y-4">
      <section className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center gap-x-8 gap-y-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Quanto do mercado o produto cobre</h2>
          <p className="text-xs text-muted-foreground">De {s.m.features.length} funcionalidades da matriz (tem = 1, parcial = ½), contra {s.n} concorrentes.</p>
        </div>
        <div className="flex-1 min-w-64 space-y-1.5">
          {[{ l: 'Você', v: s.mine, c: 'bg-primary' }, { l: 'Concorrente típico (mediana)', v: s.median, c: 'bg-muted-foreground/50' }].map((x) => (
            <div key={x.l} className="flex items-center gap-3 text-xs">
              <span className="w-44 shrink-0 text-muted-foreground">{x.l}</span>
              <span className="flex-1 h-2 rounded-full bg-muted overflow-hidden"><span className={cx('block h-full rounded-full', x.c)} style={{ width: pct(x.v) }} /></span>
              <b className="w-10 text-right tabular-nums">{pct(x.v)}</b>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2 items-start">
        <section className="bg-card border border-border rounded-xl">
          <header className="px-4 pt-4 pb-3 border-b border-border flex items-start gap-3">
            <span className="grid place-items-center size-8 rounded-md bg-destructive/10 text-destructive shrink-0"><PackageX className="size-4" /></span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold">Faltam no produto <span className="font-normal text-muted-foreground tabular-nums">{s.lacunas.length}</span></h2>
              <p className="text-xs text-muted-foreground">Metade ou mais dos concorrentes têm e você não. É o que o cliente pode cobrar na comparação.</p>
            </div>
          </header>
          {s.lacunas.length ? (
            <ul className="divide-y divide-border">
              {s.lacunas.map(({ f, have, nos }) => {
                const l = label(nos);
                return (
                  <li key={f.id} className="px-4 py-2.5 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{f.name}</p>
                      {f.description && <p className="text-xs text-muted-foreground truncate" title={f.description}>{f.description}</p>}
                    </div>
                    <span className={cx('text-[11px] font-medium shrink-0', l.c)}>{l.t}</span>
                    {bar(have, 'bg-destructive/70')}
                    <span className="w-12 text-right text-xs tabular-nums text-muted-foreground" title={`${have} de ${s.n} concorrentes têm`}>{have} de {s.n}</span>
                  </li>
                );
              })}
            </ul>
          ) : <p className="px-4 py-4 text-sm text-muted-foreground">Nada: você tem tudo o que a maioria tem.</p>}
          <footer className="px-4 py-2.5 border-t border-border">
            <Link to={mat('brecha')} className="inline-flex items-center gap-1 text-xs text-primary-ink hover:underline">Abrir na matriz (eles têm, nós não)<ArrowRight className="size-3" /></Link>
          </footer>
        </section>

        <section className="bg-card border border-border rounded-xl">
          <header className="px-4 pt-4 pb-3 border-b border-border flex items-start gap-3">
            <span className="grid place-items-center size-8 rounded-md bg-success/10 text-success-ink shrink-0"><Gem className="size-4" /></span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold">Só você tem <span className="font-normal text-muted-foreground tabular-nums">{s.exclusivas.length}</span></h2>
              <p className="text-xs text-muted-foreground">{s.exclusivas.length} que ninguém mais tem{s.raras.length ? ` e ${s.raras.length} que só 1 ou 2 têm` : ''}. Use na LP, nos anúncios e nos posts.</p>
            </div>
          </header>
          <ul className="divide-y divide-border">
            {[...s.exclusivas, ...s.raras].map(({ f, have }) => (
              <li key={f.id} className="px-4 py-2.5 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{f.name}</p>
                  {f.description && <p className="text-xs text-muted-foreground truncate" title={f.description}>{f.description}</p>}
                </div>
                <span className={cx('text-[11px] font-medium shrink-0', have ? 'text-muted-foreground' : 'text-success-ink')}>{have ? `só ${have} ${have === 1 ? 'tem' : 'têm'}` : 'ninguém mais tem'}</span>
                {bar(have, 'bg-muted-foreground/50')}
                <span className="w-12 text-right text-xs tabular-nums text-muted-foreground">{have} de {s.n}</span>
              </li>
            ))}
            {!s.exclusivas.length && !s.raras.length && <li className="px-4 py-4 text-sm text-muted-foreground">Nenhuma funcionalidade exclusiva pela matriz.</li>}
          </ul>
          <footer className="px-4 py-2.5 border-t border-border">
            <Link to={mat('diferencial')} className="inline-flex items-center gap-1 text-xs text-primary-ink hover:underline">Abrir na matriz (só nós temos)<ArrowRight className="size-3" /></Link>
          </footer>
        </section>
      </div>
    </div>
  );
}
