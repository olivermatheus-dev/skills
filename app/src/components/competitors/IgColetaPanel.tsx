// Instagram logado (aba Coletas): quanto puxar por perfil (quantidade ou últimos 30/60/90 dias), só reels ou tudo,
// e se a sessão da conta secundária está salva. Sem sessão (ou se ela cair) a coleta usa o acesso público: 6 posts.
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type IgOptions } from '../../api';
import { toast } from '../toast';
import { cx } from '../kit';
import { Chips, PlatformIcon } from './lib';

const QTD = [12, 24, 36, 48];
const DIAS = [30, 60, 90];

export default function IgColetaPanel({ slug }: { slug: string }) {
  const qc = useQueryClient();
  const key = ['coleta-config', slug];
  const { data: d } = useQuery({ queryKey: key, queryFn: () => api.coletaConfig(slug), enabled: !!slug });
  if (!d) return null;
  const o = d.instagram;
  async function save(patch: Partial<IgOptions>) {
    qc.setQueryData(key, { ...d!, instagram: { ...o, ...patch } });
    try { qc.setQueryData(key, await api.saveColetaConfig(slug, patch)); } catch (e) { toast.error(e, 'Não salvou'); void qc.invalidateQueries({ queryKey: key }); }
  }
  const pick = (v: string) => save(v.startsWith('d') ? { modo: 'periodo', dias: Number(v.slice(1)) } : { modo: 'quantidade', quantidade: Number(v.slice(1)) });
  const value = o.modo === 'periodo' ? `d${o.dias}` : `q${o.quantidade}`;
  const extra = o.modo === 'quantidade' && !QTD.includes(o.quantidade) ? [{ value: `q${o.quantidade}`, label: String(o.quantidade) }] : o.modo === 'periodo' && !DIAS.includes(o.dias) ? [{ value: `d${o.dias}`, label: `${o.dias} dias` }] : [];
  return (
    <section className="mb-4 bg-card border border-border rounded-xl px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span className="inline-flex items-center gap-2 font-medium"><PlatformIcon platform="instagram" size={16} />Instagram</span>
        <Chips value={value} onChange={pick} options={[
          ...QTD.map((n) => ({ value: `q${n}`, label: String(n) })),
          ...DIAS.map((n) => ({ value: `d${n}`, label: `${n} dias` })),
          ...extra,
        ]} />
        <Chips value={o.conteudo} onChange={(v) => save({ conteudo: v })} options={[{ value: 'reels', label: 'Só reels' }, { value: 'tudo', label: 'Tudo' }]} />
        <span className={cx('ml-auto text-xs', d.sessao ? 'text-success-ink' : 'text-warning-ink')}>
          {d.sessao
            ? <>sessão salva ({d.sessao === 'projeto' ? 'deste projeto' : 'geral'})</>
            : <>sem sessão: só 6 posts · <Link to={`/p/${slug}/configuracoes`} className="underline hover:text-primary-ink">salvar o sessionid</Link></>}
        </span>
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">
        {o.modo === 'periodo' ? `Tudo dos últimos ${o.dias} dias` : `${o.quantidade} mais recentes`}{o.conteudo === 'reels' ? ' (só reels e vídeos)' : ' (fotos, carrosséis e reels)'} por perfil, com a conta secundária logada, devagar: 1,5–3 min entre um perfil e outro. Se a sessão cair, usa o acesso público (6 posts) e avisa no estado do perfil.
      </p>
      {d.conta && (
        <p className={cx('mt-1 text-[11px]', d.conta.ok ? 'text-muted-foreground' : 'text-warning-ink')}>
          Conta: {d.conta.aberturas24h} de {d.conta.aberturasPorDia} perfis abertos nas últimas 24 h
          {!d.conta.ok && <> · {d.conta.motivo}{d.conta.liberaEm ? `; libera ${new Date(d.conta.liberaEm).toLocaleString('pt-BR')}` : ''} (até lá, 6 posts públicos)</>}
        </p>
      )}
    </section>
  );
}
