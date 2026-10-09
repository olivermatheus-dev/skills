// Paleta tonal (tarefa 049 F): escala 50…950 da cor principal; clicar copia o hex, o seletor sobrescreve um passo.
import { useMemo } from 'react';
import { Copy, RotateCcw, X } from 'lucide-react';
import { Button, Card, cx } from '../kit';
import { toast } from '../toast';
import type { Brand } from '../../api';
import { TONE_STEPS, bestInk, grade, resolveTonal } from '../../../../core/tonal';

const USO: { faixa: string; passos: number[]; texto: string }[] = [
  { faixa: 'Fundo claro', passos: [50, 100], texto: 'fundo do slide e cartões claros' },
  { faixa: 'Campo de cor', passos: [200, 300], texto: 'blocos, tags, realces' },
  { faixa: 'Ênfase', passos: [600, 700], texto: 'palavra de destaque, ícone, botão' },
  { faixa: 'Slide escuro', passos: [800, 900], texto: 'fundo escuro quente (nunca preto puro)' },
];
const hex6 = (v?: string) => !!v && /^#[0-9a-f]{6}$/i.test(v);

export default function TonalPalette({ draft, update }: { draft: Brand; update: (fn: (b: Brand) => void) => void }) {
  const tokenVal = (n: string) => draft.groups.flatMap((g) => g.tokens).find((t) => t.name === n)?.value;
  const primary = tokenVal('primary');
  const tonal = useMemo(() => (hex6(primary) ? resolveTonal(primary!, draft.tonal) : null), [primary, draft.tonal]);
  if (!tonal) return <Card className="text-sm text-muted-foreground">Defina o token <code>--primary</code> como hex (#rrggbb) para gerar a paleta.</Card>;
  const cands = [
    ...(['ink', 'text'] as const).filter((n) => hex6(tokenVal(n))).map((n) => ({ name: n === 'ink' ? 'tinta (--ink)' : 'texto (--text)', hex: tokenVal(n)! })),
    { name: 'branco', hex: '#ffffff' },
  ];
  const setOverride = (step: number, value?: string) => update((b) => {
    const t = resolveTonal(primary!, b.tonal);
    if (value) t.overrides[step] = value.toLowerCase(); else delete t.overrides[step];
    b.tonal = resolveTonal(primary!, t);
  });
  const copy = (hex: string) => { void navigator.clipboard?.writeText(hex); toast.ok(`${hex} copiado`); };
  const nOver = Object.keys(tonal.overrides).length;

  return (
    <div>
      <Card className="p-3">
        <div className="grid grid-cols-6 sm:grid-cols-11 gap-1.5">
          {TONE_STEPS.map((s) => {
            const hex = tonal.steps[s], ink = bestInk(hex, cands), over = tonal.overrides[s] != null;
            return (
              <div key={s} className="min-w-0">
                <button type="button" onClick={() => copy(hex)} title={`Copiar ${hex}`} className="group w-full h-20 rounded-lg border border-border flex flex-col items-start justify-between p-1.5 text-left"
                  style={{ background: hex, color: ink.hex }}>
                  <span className="text-[11px] font-semibold">{s}{s === 500 && ' ·base'}</span>
                  <span className="flex items-center gap-1 text-[10px] font-mono opacity-90"><Copy size={10} className="opacity-0 group-hover:opacity-100" />{hex}</span>
                </button>
                <div className="mt-1 flex items-center gap-1 text-[10px]" title={`Texto sobre este tom: ${ink.name} · ${ink.ratio.toFixed(1)}:1`}>
                  <span className={cx('font-semibold rounded px-1', grade(ink.ratio) === '✗' ? 'bg-red-100 text-red-700' : grade(ink.ratio) === 'AAA' ? 'bg-green-100 text-green-700' : 'bg-emerald-50 text-emerald-700')}>{grade(ink.ratio)}</span>
                  <span className="font-mono text-muted-foreground">{ink.ratio.toFixed(1)}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-1">
                  <label className="relative text-[10px] text-primary-ink cursor-pointer hover:underline" title="Escolher outra cor para este passo">
                    {over ? 'fixado' : 'trocar'}
                    <input type="color" className="absolute inset-0 opacity-0 cursor-pointer w-full" value={hex} onChange={(e) => setOverride(s, e.target.value)} aria-label={`trocar tom ${s}`} />
                  </label>
                  {over && <button type="button" className="text-muted-foreground hover:text-foreground" title="Voltar ao automático" onClick={() => setOverride(s)}><X size={11} /></button>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <Button variant="soft" onClick={() => update((b) => { b.tonal = resolveTonal(primary!, { auto: true, overrides: {} }); })}><RotateCcw size={13} className="inline mr-1.5 -mt-0.5" />Regerar da cor principal</Button>
          <span className="text-xs text-muted-foreground">Base {primary}{nOver ? ` · ${nOver} passo(s) fixado(s) por você` : ' · tudo automático'}. O tom 500 é a própria cor principal; a escala segue ela ao mudar --primary.</span>
        </div>
      </Card>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4 mt-3">
        {USO.map((u) => (
          <div key={u.faixa} className="rounded-lg border border-border bg-card p-2.5">
            <div className="flex mb-1.5 h-5 rounded overflow-hidden border border-border">{u.passos.map((p) => <span key={p} className="flex-1" style={{ background: tonal.steps[p] }} />)}</div>
            <div className="text-xs font-medium">{u.faixa} <span className="font-mono text-muted-foreground font-normal">{u.passos.join('–')}</span></div>
            <div className="text-[11px] text-muted-foreground">{u.texto}</div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground mt-2">Nas peças: <code>var(--tone-N)</code> para o fundo e <code>var(--on-tone-N)</code> para o texto sobre ele (já escolhe a tinta com contraste ≥ 4,5:1 sempre que possível). Pastéis só como cor de categoria; coral só em pontos.</p>
    </div>
  );
}
