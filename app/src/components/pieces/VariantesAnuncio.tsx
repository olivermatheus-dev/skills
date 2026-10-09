// Anúncio do projeto de variantes (045 F): monta o pacote para subir na Meta (MP4 com o nome do anúncio, planilha da
// importação em massa, lista para colar à mão, UTMs) e importa o CSV de resultados do Gerenciador → vencedora por eixo
// + linhas no campaigns/LOG_ANGULOS.md. Tudo pelo tools/lib/pacote.mjs no servidor (zero LLM).
import { useRef, useState } from 'react';
import { ChevronDown, ChevronRight, FolderOpen, Loader2, Package, Trophy, Upload } from 'lucide-react';
import { api, type EixoResultado, type PacoteAnuncio, type VariantesVista } from '../../api';
import { toast } from '../toast';
import { Badge, Button, Card, Input, cx } from '../kit';
import { desktop } from './library';

const ABERTO_KEY = 'hub:variantes:anuncio';
const lerAberto = () => { try { return localStorage.getItem(ABERTO_KEY) === '1'; } catch { return false; } };
const pct = (v: number | null | undefined) => (v == null ? '—' : `${(v * 100).toFixed(1).replace('.', ',')}%`);
const brl = (v: number | null | undefined) => (v == null ? '—' : `R$ ${v.toFixed(2).replace('.', ',')}`);
const STATUS_COR = { vencedor: '#16a34a', 'em teste': '#d97706', aposentado: '#71717a' } as const;
const METRICA = { hook: 'gancho', retencao: 'retenção', ctr: 'CTR' } as const;

export default function VariantesAnuncio({ slug, path, data, marcadas, onView }: { slug: string; path: string; data: VariantesVista; marcadas: string[]; onView: (v: VariantesVista) => void }) {
  const [aberto, setAberto] = useState(lerAberto);
  const [link, setLink] = useState(data.anuncio?.link ?? '');
  const [busy, setBusy] = useState<'pacote' | 'csv' | null>(null);
  const [pacote, setPacote] = useState<PacoteAnuncio | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const an = data.anuncio;
  if (!an) return null; // servidor antigo
  const aprovadas = data.variantes.filter((v) => v.gerada && (v.aval === 'aprovada' || v.aval === 'final')).map((v) => v.id);
  const ids = marcadas.length ? marcadas : aprovadas;
  const res = an.resultado;
  const toggle = () => { const n = !aberto; setAberto(n); try { localStorage.setItem(ABERTO_KEY, n ? '1' : '0'); } catch { /* sem storage */ } };

  const montar = async () => {
    setBusy('pacote');
    try {
      const r = await api.pacoteAnuncio(slug, path, { ids: marcadas, link });
      setPacote(r.pacote); onView(r.view);
      toast.ok(`Pacote com ${r.pacote.anuncios.length} anúncio(s) em pacote/${r.pacote.data}`);
    } catch (e) { toast.error(e, 'Não foi possível montar o pacote'); } finally { setBusy(null); }
  };
  const importar = async (f: File) => {
    setBusy('csv');
    try {
      const r = await api.resultadosAnuncio(slug, path, { csv: await f.text(), nome: f.name });
      onView(r.view);
      const venc = r.resultado.eixos.filter((e) => e.vencedora).map((e) => `${e.eixo}: ${e.vencedora}`);
      toast.ok(venc.length ? `Venceu ${venc.join(' · ')}` : `${Object.keys(r.resultado.variantes).length} variante(s) com resultado, sem vencedora ainda`);
      if (r.resultado.sem_par.length) toast.error(new Error(`sem par no projeto: ${r.resultado.sem_par.slice(0, 4).join(', ')}`), 'Alguns anúncios do CSV não são deste projeto');
    } catch (e) { toast.error(e, 'Não foi possível importar'); } finally { setBusy(null); if (file.current) file.current.value = ''; }
  };

  return (
    <Card className="p-0">
      <button onClick={toggle} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left">
        {aberto ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        <Package className="size-4 text-muted-foreground" /><span className="font-medium">Anúncio</span>
        <span className="text-muted-foreground truncate">
          {res ? `resultado de ${res.data.split('-').reverse().join('/')}${res.eixos.some((e) => e.vencedora) ? ` · venceu ${res.eixos.filter((e) => e.vencedora).map((e) => e.vencedora).join(', ')}` : ''}` : an.pacotes.length ? `pacote de ${an.pacotes[0].split('-').reverse().join('/')}` : 'pacote para subir na Meta e resultados'}
        </span>
      </button>
      {aberto && (
        <div className="px-4 pb-4 space-y-4 border-t border-border pt-3">
          {/* 1. pacote */}
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">1 · Pacote para subir</div>
            <div className="flex flex-wrap items-center gap-2">
              <Input className="flex-1 min-w-[240px]" placeholder="Link de destino (https://…), com as UTMs a gente cuida" value={link} onChange={(e) => setLink(e.target.value)} />
              <Button disabled={!ids.length || !!busy} onClick={() => void montar()} title={marcadas.length ? 'as variantes marcadas' : 'as variantes aprovadas ou finais'}>
                {busy === 'pacote' ? <Loader2 className="size-4 animate-spin" /> : <Package className="size-4" />}Montar pacote ({ids.length} {marcadas.length ? 'marcada(s)' : 'aprovada(s)'})
              </Button>
              {an.pacotes[0] && <Button variant="ghost" onClick={() => desktop(slug, path, 'reveal', `pacote/${an.pacotes[0]}/pacote.md`)}><FolderOpen className="size-4" />Pasta</Button>}
            </div>
            {!ids.length && <p className="text-xs text-muted-foreground">Aprove as variantes que vão para o anúncio (ou marque as caixas) para montar o pacote.</p>}
            <p className="text-xs text-muted-foreground">Sai em <span className="font-mono">pacote/&lt;data&gt;/</span>: os MP4 com o nome do anúncio, <b>anuncios.csv</b> (Gerenciador → Importar), <b>pacote.md</b> (lista para colar à mão) e as UTMs. Textos, títulos e botão vêm dos Insumos (Copys, Headlines, CTAs).</p>
            {pacote && (
              <div className="rounded-lg bg-muted/60 p-2.5 text-xs space-y-1">
                <div><b>{pacote.anuncios.length} anúncio(s)</b> · campanha <span className="font-mono">{pacote.campanha}</span> · {pacote.textos.length} texto(s), {pacote.titulos.length} título(s), botão {pacote.botao}</div>
                {pacote.avisos.length > 0 && <ul className="list-disc pl-4 text-amber-700 dark:text-amber-400">{pacote.avisos.map((a, i) => <li key={i}>{a}</li>)}</ul>}
              </div>
            )}
          </div>

          {/* 2. resultados */}
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">2 · Resultados</div>
            <div className="flex flex-wrap items-center gap-2">
              <input ref={file} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void importar(f); }} />
              <Button variant="soft" disabled={!!busy} onClick={() => file.current?.click()}>
                {busy === 'csv' ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}Importar CSV do Gerenciador
              </Button>
              <span className="text-xs text-muted-foreground">Relatório por anúncio com Valor usado, Impressões, Cliques no link, Resultados, Reproduções de 3 s e ThruPlays. A vencedora vai para o LOG_ANGULOS.md.</span>
            </div>
            {res && <Resultado res={res} />}
          </div>
        </div>
      )}
    </Card>
  );
}

function Resultado({ res }: { res: NonNullable<NonNullable<VariantesVista['anuncio']>['resultado']> }) {
  return (
    <div className="space-y-3">
      {res.eixos.filter((e) => e.opcoes.length > 1).map((e) => <Eixo key={e.eixo} e={e} />)}
      {res.sem_par.length > 0 && <p className="text-xs text-muted-foreground">Sem par no projeto: {res.sem_par.join(', ')}</p>}
    </div>
  );
}

function Eixo({ e }: { e: EixoResultado }) {
  return (
    <div className="rounded-lg border border-border">
      <div className="px-3 py-2 text-sm flex flex-wrap items-center gap-2">
        <b>{e.eixo}</b>
        {e.vencedora ? <Badge color={STATUS_COR.vencedor}><Trophy className="size-3 inline mr-1" />{e.vencedora}</Badge> : <span className="text-xs text-muted-foreground">sem vencedora</span>}
        <span className="text-xs text-muted-foreground">{e.motivo}</span>
      </div>
      <table className="w-full text-xs tabular-nums">
        <thead className="text-muted-foreground">
          <tr className="border-t border-border">
            {['opção', 'impressões', 'gancho', 'retenção', 'CTR', 'custo/resultado', ''].map((h) => <th key={h} className="text-left font-normal px-3 py-1">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {e.opcoes.map((o) => (
            <tr key={o.opcao} className="border-t border-border">
              <td className="px-3 py-1 font-medium">{o.opcao}</td>
              <td className="px-3 py-1">{o.impressoes?.toLocaleString('pt-BR') ?? '—'}</td>
              {(['hook', 'retencao', 'ctr'] as const).map((k) => <td key={k} className={cx('px-3 py-1', e.metrica === k && 'font-semibold')} title={e.metrica === k ? `decide o eixo (${METRICA[k]})` : undefined}>{pct(o[k])}</td>)}
              <td className="px-3 py-1">{brl(o.cpr)}</td>
              <td className="px-3 py-1">{o.status && <span style={{ color: STATUS_COR[o.status] }}>{o.status}</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
