// Coleta longa do Instagram (aba Redes e conteúdos do concorrente): até 1 ou 2 anos para trás, em lotes que continuam de
// onde o anterior parou. Mostra até onde chegou e os limites da conta secundária; "Continuar acervo" roda 1 lote no fundo.
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Archive } from 'lucide-react';
import { api } from '../../api';
import { qk } from '../../queries';
import { toast } from '../toast';
import { Button, cx, fmtDate } from '../kit';
import { Chips, Spinner, fmtDateTime } from './lib';
import { useColetas } from '../atividade/useColeta';

const ALVOS = [{ value: '365', label: '1 ano' }, { value: '730', label: '2 anos' }];

export default function AcervoPanel({ slug, id }: { slug: string; id: string }) {
  const qc = useQueryClient();
  const key = ['acervo', slug, id];
  const { data: s } = useQuery({ queryKey: key, queryFn: () => api.acervo(slug, id), enabled: !!slug && !!id });
  const rodando = useColetas(slug)('acervo', id);
  const [alvo, setAlvo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!s?.temInstagram) return null;
  const a = s.acervo;
  const alvoDias = Number(alvo ?? a?.alvoDias ?? 365);
  const pct = a?.maisAntigo ? Math.min(100, Math.round(((Date.now() - Date.parse(a.maisAntigo)) / 86_400_000 / alvoDias) * 100)) : 0;
  const terminado = !!a?.terminado && a.alvoDias >= alvoDias;
  async function run() {
    setBusy(true);
    try {
      const r = await api.runAcervo(slug, id, alvoDias);
      toast.ok(`Acervo: ${r.novos} posts novos · até ${r.ate ? fmtDate(r.ate) : '—'}${r.terminado ? ' · terminado' : ''}`);
      if (r.erros.length) toast.error(new Error(r.erros.join(' · ')), 'Lote com avisos');
    } catch (e) { toast.error(e, 'Lote não rodou'); }
    finally {
      setBusy(false);
      void qc.invalidateQueries({ queryKey: key });
      void qc.invalidateQueries({ queryKey: qk.competitor(slug, id) });
    }
  }
  const ultimo = a?.lotes.at(-1);
  return (
    <section className="mt-4 bg-card border border-border rounded-xl px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span className="inline-flex items-center gap-2 font-medium"><Archive className="size-4 text-muted-foreground" />Acervo do Instagram</span>
        <Chips value={String(alvoDias)} onChange={setAlvo} options={ALVOS} />
        <span className="text-xs text-muted-foreground">
          {a ? <>{a.posts} posts · chegou até <b className="text-foreground font-medium">{a.maisAntigo ? fmtDate(a.maisAntigo) : '—'}</b>{terminado ? ' · completo' : ''}</> : 'ainda não começou'}
        </span>
        <span className="ml-auto flex items-center gap-2">
          {!s.conta.ok && <span className="text-xs text-warning-ink" title={s.conta.motivo ?? ''}>libera {s.conta.liberaEm ? fmtDateTime(s.conta.liberaEm) : ''}</span>}
          <Button variant="ghost" className="!py-1 text-xs" onClick={run} disabled={busy || !!rodando || !s.conta.ok || !s.sessao || terminado}
            title={!s.sessao ? 'salve os cookies da conta secundária em Configurações' : !s.conta.ok ? s.conta.motivo ?? '' : `1 lote: até ${s.conta.limites.paginas * 12} posts, com pausas`}>
            {busy || rodando ? <><Spinner /> lendo…</> : a ? 'Continuar acervo' : 'Começar acervo'}
          </Button>
        </span>
      </div>
      {a && <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden"><div className={cx('h-full transition-all', terminado ? 'bg-success' : 'bg-primary')} style={{ width: `${Math.max(3, pct)}%` }} /></div>}
      <p className="mt-1.5 text-[11px] text-muted-foreground">
        Lotes de até {s.conta.limites.paginas * 12} posts que continuam de onde o anterior parou, devagar (12–24 s entre páginas). Para proteger a conta secundária: até {s.conta.limites.lotesPorDia} lotes por dia ({s.conta.lotes24h} nas últimas 24 h), {Math.round(s.conta.limites.intervaloMs / 3_600_000)} h entre lotes, só das {s.conta.limites.horario[0]}h às {s.conta.limites.horario[1]}h, e qualquer aviso do Instagram pausa tudo por 48 h.
        {ultimo?.erro && <span className="text-warning-ink"> Último lote: {ultimo.erro}</span>}
      </p>
    </section>
  );
}
