// Comparar > Preços (?v=oferta). Visões por chips (?p=): Régua (compacta, padrão) · Lado a lado (completa).
// Dados: analysis/precos.json de cada concorrente + a Kzloo de intel/referencia.json (R$ 129, sem somar extras por uso: decisão de 2026-10-08).
// Funciona com dados antigos (sem includes/matrix/limits mostra "—") e fica completa conforme a re-coleta (fase D) chega.
import { useMemo, useState } from 'react';
import { Columns3, Ruler } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import type { MarketRow } from '../../../components/competitors/area';
import { Chips } from '../../../components/competitors/lib';
import { useMatrix } from '../../../queries';
import { buildPlanRows, type Lens } from './precosLib';
import Regua from './PrecosRegua';
import Lado from './PrecosLado';

const PVIEWS = { regua: { label: 'Régua', icon: Ruler }, lado: { label: 'Lado a lado', icon: Columns3 } } as const;
type PView = keyof typeof PVIEWS;

export default function Precos({ slug, rows, refRow }: { slug: string; rows: MarketRow[]; refRow: MarketRow | null }) {
  const [sp, setSp] = useSearchParams();
  const raw = sp.get('p') ?? '';
  const p = (Object.hasOwn(PVIEWS, raw) ? raw : 'regua') as PView;
  const m = useMatrix(slug).data;
  const [lens, setLens] = useState<Lens>({ cycle: 'mensal', promo: 'vigente' });
  const pr = useMemo(() => buildPlanRows(rows, refRow), [rows, refRow]);
  const set = (x: PView, extra?: Record<string, string>) => {
    const n = new URLSearchParams(sp);
    n.delete('p'); n.delete('s'); n.delete('sel');
    if (x !== 'regua') n.set('p', x);
    for (const [k, v] of Object.entries(extra ?? {})) n.set(k, v);
    setSp(n, { replace: true });
  };
  const nComp = new Set(pr.filter((x) => !x.isRef).map((x) => x.compId)).size;
  const nSolo = new Set(pr.filter((x) => !x.isRef && x.paid && x.audience === 'solo').map((x) => x.compId)).size;
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Chips value={p} onChange={(x) => set(x)} options={Object.entries(PVIEWS).map(([value, v]) => ({ value: value as PView, label: <span className="inline-flex items-center gap-1.5"><v.icon className="size-3.5" strokeWidth={1.8} />{v.label}</span> }))} />
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">Ciclo
          <Chips value={lens.cycle} onChange={(cycle) => setLens((l) => ({ ...l, cycle }))} options={[{ value: 'mensal', label: 'Mensal' }, { value: 'anual', label: 'Anual eq.' }]} />
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">Promoção
          <Chips value={lens.promo} onChange={(promo) => setLens((l) => ({ ...l, promo }))} options={[{ value: 'vigente', label: 'Vigente' }, { value: 'cheio', label: 'Preço cheio' }]} />
        </span>
        <span className="text-xs text-muted-foreground" title="Comparação justa: plano para 1 profissional, mensal com mensal e anual com anual. Planos de equipe só na Base Equipe/Todos.">
          {nComp} concorrentes com preço{nSolo < nComp ? ` · ${nSolo} com plano para 1 profissional` : ''} · mesmo ciclo
        </span>
      </div>
      {p === 'regua' && <Regua slug={slug} pr={pr} m={m} lens={lens} onOpen={(key) => set('lado', { s: 'custom', sel: key })} />}
      {p === 'lado' && <Lado slug={slug} pr={pr} m={m} lens={lens} />}
    </div>
  );
}
