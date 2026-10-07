// Kit de marca (tarefa 024): edita o brand.json com prévia ao vivo; salvar gera o brand.css e o bloco do kit no BRAND.md.
// Seções: Estilo (preset + fazer / não fazer + anotações) · Cores · Tipografia (fontes) · Forma · Ícones (Lucide) · Outros tokens.
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Bell, CalendarCheck, Check, Clock, FileText, Heart, MessageCircle, Users, Wallet, type LucideIcon } from 'lucide-react';
import { api, type Brand, type BrandFont, type BrandPreset } from '../../api';
import { Badge, Button, Card, ErrorBox, Input, LinesInput, Select, Textarea, cx } from '../ui';
import { toast } from '../toast';
import { qk, useBrandKit } from '../../queries';

const SAMPLE_ICONS: [string, LucideIcon][] = [['calendar-check', CalendarCheck], ['bell', Bell], ['users', Users], ['wallet', Wallet], ['file-text', FileText], ['message-circle', MessageCircle], ['clock', Clock], ['heart', Heart], ['check', Check]];
const isColor = (v: string) => /^(#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|oklch\()/i.test(v.trim());
const isHex6 = (v: string) => /^#[0-9a-f]{6}$/i.test(v.trim());
const FONT_TOKENS = ['font-heading', 'font-body', 'font-accent'];
const SHAPE_TOKENS = ['radius', 'radius-sm', 'border-width', 'shadow-sm', 'shadow-md', 'shadow-lg'];
const TYPE_TOKENS = ['weight-heading', 'tracking-heading', 'leading-heading', 'case-heading'];

// contraste WCAG entre duas cores hex
function lum(hex: string) {
  const h = hex.replace('#', ''), f = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6);
  const [r, g, b] = [0, 2, 4].map((i) => { const c = parseInt(f.slice(i, i + 2), 16) / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

const firstFamily = (stack: string) => stack.split(',')[0].trim().replace(/["']/g, '');
const fallbackOf = (stack: string) => stack.split(',').slice(1).join(',');

function Section({ title, hint, children, right }: { title: string; hint?: string; children: ReactNode; right?: ReactNode }) {
  return (
    <section className="mb-8">
      <div className="flex items-baseline gap-x-3 gap-y-0.5 mb-2 flex-wrap">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">{title}</div>
        {hint && <div className="text-xs text-muted">{hint}</div>}
        <div className="ml-auto">{right}</div>
      </div>
      {children}
    </section>
  );
}

const toBase64 = (f: File) => new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1] ?? ''); r.onerror = () => rej(r.error); r.readAsDataURL(f); });

export default function BrandEditor({ slug, onDirty }: { slug: string; onDirty?: (d: boolean) => void }) {
  const { data, isLoading, error } = useBrandKit(slug);
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Brand | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<unknown>(null);
  useEffect(() => { if (data) setDraft(structuredClone(data.brand)); }, [data]);
  const dirty = !!data && !!draft && (data.imported || JSON.stringify(draft) !== JSON.stringify(data.brand));
  useEffect(() => { onDirty?.(dirty); }, [dirty, onDirty]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); };
    window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const tokens = useMemo(() => new Map((draft?.groups ?? []).flatMap((g) => g.tokens).map((t) => [t.name, t.value])), [draft]);
  const tk = (n: string) => tokens.get(n) ?? '';
  const update = (fn: (b: Brand) => void) => setDraft((d) => { if (!d) return d; const n = structuredClone(d); fn(n); return n; });
  const setToken = (name: string, value: string) => update((b) => { for (const g of b.groups) for (const t of g.tokens) if (t.name === name) t.value = value; });

  const save = async () => {
    if (!draft) return;
    setSaving(true); setSaveError(null);
    try {
      const r = await api.saveBrand(slug, draft);
      qc.setQueryData(qk.brand(slug), r);
      void qc.invalidateQueries({ queryKey: qk.brandCss(slug) });
      toast.ok('Kit salvo · brand.css e BRAND.md atualizados');
    } catch (e) { setSaveError(e); toast.error(e, 'Não foi possível salvar o kit'); } finally { setSaving(false); }
  };
  const applyPreset = (p: BrandPreset) => update((b) => {
    for (const g of b.groups) for (const t of g.tokens) if (p.tokens[t.name] != null) t.value = p.tokens[t.name];
    b.icons = { ...b.icons, ...p.icons };
    b.style.preset = p.id;
  });

  // prévia: tokens do rascunho como variáveis CSS + @font-face das fontes do kit
  const vars = useMemo(() => Object.fromEntries([...tokens].map(([k, v]) => [`--${k}`, v])) as CSSProperties, [tokens]);
  const fontCss = useMemo(() => (draft?.fonts ?? []).map((f) => f.source === 'google'
    ? `@import url('https://fonts.googleapis.com/css2?family=${(f.google ?? '').replace(/ /g, '+')}&display=swap');`
    : f.files.map((x) => `@font-face{font-family:"${f.family}";font-style:${x.style};font-weight:${x.weight};src:url("${api.brandFileUrl(slug, x.src)}");${x.unicodeRange ? `unicode-range:${x.unicodeRange};` : ''}}`).join('\n')).join('\n'), [draft?.fonts, slug]);

  if (isLoading || !draft) return <div className="max-w-6xl mx-auto px-8 py-6"><ErrorBox error={error} />{!error && <div className="h-60 rounded-xl bg-surface-2 animate-pulse" />}</div>;

  const colorTokens = draft.groups.map((g) => ({ label: g.label, tokens: g.tokens.filter((t) => isColor(t.value)) })).filter((g) => g.tokens.length);
  const otherTokens = draft.groups.flatMap((g) => g.tokens).filter((t) => !isColor(t.value) && !FONT_TOKENS.includes(t.name) && !SHAPE_TOKENS.includes(t.name) && !TYPE_TOKENS.includes(t.name));
  const families = [...new Set(draft.fonts.map((f) => f.family))];
  const bg = tk('bg');
  const iconColor = `var(--${draft.icons.color})`;
  const iconProps = { strokeWidth: draft.icons.stroke, color: iconColor, fill: draft.icons.style === 'preenchido' ? iconColor : 'none', size: 22 };
  const preset = data?.presets.find((p) => p.id === draft.style.preset);

  return (
    <div className="max-w-6xl mx-auto px-8 py-6">
      <style>{fontCss}</style>
      <div className="flex items-start gap-4 mb-5">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Kit de marca</h2>
          <div className="text-sm text-muted mt-0.5">Edite aqui; salvar grava <span className="font-mono text-xs">brand/brand.json</span>, gera o <span className="font-mono text-xs">brand.css</span> (carrossel, vídeo e LP) e o bloco do kit no <span className="font-mono text-xs">BRAND.md</span>.</div>
        </div>
        <div className="ml-auto flex gap-2 shrink-0">
          {dirty && <Button variant="ghost" onClick={() => data && setDraft(structuredClone(data.brand))}>Descartar</Button>}
          <Button disabled={!dirty || saving} onClick={save}>{saving ? 'Salvando…' : 'Salvar kit'}</Button>
        </div>
      </div>
      {data?.imported && <Card className="mb-4 text-sm bg-amber-50 border-amber-200">Este kit foi lido do <code>brand.css</code> atual e ainda não existe como <code>brand.json</code>. Salve para passar a editar por aqui.</Card>}
      <ErrorBox error={saveError} />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px] items-start">
        <div>
          <Section title="Estilo" hint="O preset ajusta forma, tipografia e ícones de uma vez (cores e fontes ficam).">
            <div className="grid gap-3 sm:grid-cols-2 mb-3">
              {data?.presets.map((p) => (
                <Card key={p.id} className={cx('cursor-default', draft.style.preset === p.id && 'ring-2 ring-accent')}>
                  <div className="flex items-center gap-2"><div className="font-medium text-sm">{p.label}</div>{draft.style.preset === p.id && <Badge color="#4f46e5">aplicado</Badge>}</div>
                  <div className="text-xs text-muted mt-1">{p.summary}</div>
                  <div className="mt-3"><Button variant="soft" onClick={() => applyPreset(p)}>{draft.style.preset === p.id ? 'Reaplicar valores' : 'Aplicar'}</Button></div>
                </Card>
              ))}
              <Card className={cx(!draft.style.preset && 'ring-2 ring-accent')}>
                <div className="font-medium text-sm">Estilo livre</div>
                <div className="text-xs text-muted mt-1">Sem preset: valem só os tokens e as suas anotações.</div>
                <div className="mt-3"><Button variant="ghost" disabled={!draft.style.preset} onClick={() => update((b) => { b.style.preset = undefined; })}>Usar estilo livre</Button></div>
              </Card>
            </div>
            {preset && <ul className="text-xs text-muted list-disc pl-5 mb-3 space-y-0.5">{preset.rules.map((r) => <li key={r}>{r}</li>)}</ul>}
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block"><div className="text-xs font-medium mb-1">Fazer <span className="text-muted font-normal">(1 por linha)</span></div>
                <LinesInput rows={4} value={draft.style.do} onChange={(v) => update((b) => { b.style.do = v; })} placeholder="ex.: foto real de terapeuta, luz natural" /></label>
              <label className="block"><div className="text-xs font-medium mb-1">Não fazer <span className="text-muted font-normal">(regra dura)</span></div>
                <LinesInput rows={4} value={draft.style.dont} onChange={(v) => update((b) => { b.style.dont = v; })} placeholder="ex.: coral em bloco grande" /></label>
            </div>
            <label className="block mt-3"><div className="text-xs font-medium mb-1">Anotações de estilo</div>
              <Textarea rows={3} value={draft.style.notes ?? ''} onChange={(e) => update((b) => { b.style.notes = e.target.value || undefined; })} placeholder="Qualquer direção para o designer e o editor de vídeo (vai para o BRAND.md)." /></label>
          </Section>

          <Section title="Cores" hint={`contraste medido sobre o fundo (--bg ${bg})`}>
            {colorTokens.map((g) => (
              <div key={g.label} className="mb-4">
                <div className="text-xs text-muted mb-1.5">{g.label}</div>
                <div className="grid gap-2 grid-cols-1 2xl:grid-cols-2">
                  {g.tokens.map((t) => {
                    const c = isHex6(t.value) && isHex6(bg) && t.name !== 'bg' ? contrast(t.value, bg) : null;
                    return (
                      <div key={t.name} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-2 py-1.5" title={t.note}>
                        <label className="relative w-8 h-8 rounded-md border border-border shrink-0 overflow-hidden cursor-pointer" style={{ background: t.value }}>
                          {isHex6(t.value) && <input type="color" className="absolute inset-0 opacity-0 cursor-pointer" value={t.value} onChange={(e) => setToken(t.name, e.target.value)} aria-label={`cor ${t.name}`} />}
                        </label>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-mono font-medium truncate">--{t.name}</div>
                          {t.note && <div className="text-[10px] text-muted truncate">{t.note}</div>}
                        </div>
                        <Input className="w-24 font-mono text-xs px-2 py-1" value={t.value} onChange={(e) => setToken(t.name, e.target.value)} />
                        {c != null && <span className={cx('text-[10px] font-mono w-10 text-right', c >= 4.5 ? 'text-ok' : c >= 3 ? 'text-amber-600' : 'text-muted')} title="contraste sobre o fundo (≥ 4,5 = texto ok)">{c.toFixed(1)}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </Section>

          <Section title="Tipografia" hint="Fontes locais rendem sem internet (vídeo e carrossel). Envie .woff2 com a licença.">
            <Card className="mb-3 space-y-3">
              {FONT_TOKENS.filter((n) => tokens.has(n)).map((n) => (
                <div key={n} className="grid grid-cols-[140px_1fr] items-center gap-3">
                  <span className="text-xs font-mono">--{n}</span>
                  <Select value={firstFamily(tk(n))} onChange={(e) => setToken(n, `"${e.target.value}",${fallbackOf(tk(n)) || '-apple-system,"Segoe UI",Roboto,Arial,sans-serif'}`)}>
                    {[...new Set([firstFamily(tk(n)), ...families])].map((f) => <option key={f}>{f}</option>)}
                  </Select>
                </div>
              ))}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border">
                <label className="text-xs">Peso do título<Select className="w-full mt-1" value={tk('weight-heading')} onChange={(e) => setToken('weight-heading', e.target.value)}>{['400', '500', '600', '700', '800'].map((w) => <option key={w}>{w}</option>)}</Select></label>
                <label className="text-xs">Espaçamento<Input className="w-full mt-1 font-mono text-xs" value={tk('tracking-heading')} onChange={(e) => setToken('tracking-heading', e.target.value)} /></label>
                <label className="text-xs">Entrelinha<Input className="w-full mt-1 font-mono text-xs" value={tk('leading-heading')} onChange={(e) => setToken('leading-heading', e.target.value)} /></label>
                <label className="text-xs">Caixa<Select className="w-full mt-1" value={tk('case-heading')} onChange={(e) => setToken('case-heading', e.target.value)}><option value="none">normal</option><option value="uppercase">CAIXA ALTA</option></Select></label>
              </div>
            </Card>
            <FontList slug={slug} fonts={draft.fonts} files={data?.fonts ?? []} onChange={(fonts) => update((b) => { b.fonts = fonts; })} />
          </Section>

          <Section title="Forma" hint="Arredondamento, bordas e sombras">
            <Card className="space-y-3">
              {(['radius', 'radius-sm'] as const).map((n) => (
                <div key={n} className="grid grid-cols-[140px_1fr_64px_40px] items-center gap-3">
                  <span className="text-xs font-mono">--{n}</span>
                  <input type="range" min={0} max={40} value={parseInt(tk(n)) || 0} onChange={(e) => setToken(n, `${e.target.value}px`)} />
                  <span className="text-xs font-mono text-right">{tk(n)}</span>
                  <span className="h-7 w-10 border border-border bg-surface-2" style={{ borderRadius: tk(n) }} />
                </div>
              ))}
              <div className="grid grid-cols-[140px_1fr] items-center gap-3"><span className="text-xs font-mono">--border-width</span><Input className="w-24 font-mono text-xs" value={tk('border-width')} onChange={(e) => setToken('border-width', e.target.value)} /></div>
              {(['shadow-sm', 'shadow-md', 'shadow-lg'] as const).map((n) => (
                <div key={n} className="grid grid-cols-[140px_1fr_40px] items-center gap-3">
                  <span className="text-xs font-mono">--{n}</span>
                  <Input className="font-mono text-xs" value={tk(n)} onChange={(e) => setToken(n, e.target.value)} />
                  <span className="h-7 w-10 bg-surface rounded" style={{ boxShadow: tk(n) }} />
                </div>
              ))}
            </Card>
          </Section>

          <Section title="Ícones" hint="Lucide (lucide.dev) · nas peças: node tools/icon.mjs <nome> --brand <slug>">
            <Card>
              <div className="grid grid-cols-[140px_1fr_48px] items-center gap-3 mb-3">
                <span className="text-xs">Traço</span>
                <input type="range" min={0.75} max={2.5} step={0.25} value={draft.icons.stroke} onChange={(e) => update((b) => { b.icons.stroke = Number(e.target.value); })} />
                <span className="text-xs font-mono text-right">{draft.icons.stroke}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-3 mb-3">
                <span className="text-xs">Estilo</span>
                <div className="flex gap-1.5">{(['linha', 'preenchido'] as const).map((s) => <button key={s} onClick={() => update((b) => { b.icons.style = s; })} className={cx('px-2.5 py-1 rounded-full text-xs border', draft.icons.style === s ? 'bg-accent text-white border-accent' : 'border-border')}>{s}</button>)}</div>
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center gap-3 mb-4">
                <span className="text-xs">Cor</span>
                <Select value={draft.icons.color} onChange={(e) => update((b) => { b.icons.color = e.target.value; })}>{[...tokens].filter(([, v]) => isColor(v)).map(([n]) => <option key={n} value={n}>--{n}</option>)}</Select>
              </div>
              <div className="flex gap-4 flex-wrap p-3 rounded-lg" style={{ ...vars, background: 'var(--bg)' }}>
                {SAMPLE_ICONS.map(([n, I]) => <span key={n} title={n}><I {...iconProps} /></span>)}
              </div>
            </Card>
          </Section>

          {otherTokens.length > 0 && (
            <Section title="Outros tokens">
              <Card className="p-0 overflow-hidden">
                {otherTokens.map((t) => (
                  <div key={t.name} className="grid grid-cols-[180px_1fr] gap-3 px-4 py-1.5 border-b border-border last:border-0 items-center" title={t.note}>
                    <span className="text-xs font-mono text-muted truncate">--{t.name}</span>
                    <Input className="font-mono text-xs py-1" value={t.value} onChange={(e) => setToken(t.name, e.target.value)} />
                  </div>
                ))}
              </Card>
            </Section>
          )}
        </div>

        <div className="xl:sticky xl:top-4 xl:order-none order-first max-w-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted mb-2">Prévia ao vivo</div>
          <Preview vars={vars} iconProps={iconProps} />
          <p className="text-xs text-muted mt-2">Amostra com os tokens do rascunho (ainda não salvos). Peças reais usam o <code>brand.css</code> gerado ao salvar.</p>
        </div>
      </div>
    </div>
  );
}

/** slide 4:5 de amostra + mini slide inverso, desenhados só com as variáveis do kit */
function Preview({ vars, iconProps }: { vars: CSSProperties; iconProps: { strokeWidth: number; color: string; fill: string; size: number } }) {
  const h: CSSProperties = { fontFamily: 'var(--font-heading)', fontWeight: 'var(--weight-heading)' as never, letterSpacing: 'var(--tracking-heading)', lineHeight: 'var(--leading-heading)', textTransform: 'var(--case-heading)' as never, color: 'var(--text)' };
  return (
    <div style={vars} className="space-y-3">
      <div className="aspect-[4/5] w-full overflow-hidden flex flex-col p-6 border border-border" style={{ background: 'var(--bg)', fontFamily: 'var(--font-body)', color: 'var(--text)', borderRadius: 12 }}>
        <span className="self-start px-2.5 py-1 text-[10px] font-semibold" style={{ background: 'var(--accent-soft)', color: 'var(--accent)', borderRadius: 999 }}>AGENDA</span>
        <div className="mt-4 text-[26px]" style={h}>Sua agenda <span style={{ color: 'var(--primary)' }}>trabalha</span> por você.</div>
        <div className="mt-2 text-[12px]" style={{ color: 'var(--muted)' }}>Lembrete automático e confirmação em um toque.</div>
        <div className="mt-auto p-3 flex items-center gap-3" style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-md)', border: 'var(--border-width) solid var(--border)' }}>
          <span className="w-9 h-9 grid place-items-center shrink-0" style={{ background: 'var(--accent-soft)', borderRadius: 'var(--radius-sm)' }}><CalendarCheck {...iconProps} size={18} /></span>
          <div className="min-w-0"><div className="text-[12px] font-semibold">Próxima sessão</div><div className="text-[11px]" style={{ color: 'var(--muted)' }}>Hoje, 14h · confirmada</div></div>
          <span className="ml-auto px-2.5 py-1 text-[11px] font-semibold" style={{ background: 'var(--primary)', color: 'var(--on-primary)', borderRadius: 'var(--radius-sm)' }}>Ver</span>
        </div>
      </div>
      <div className="p-4 flex items-center gap-3" style={{ background: 'var(--inverse-bg)', color: 'var(--on-inverse)', borderRadius: 12 }}>
        <Bell {...iconProps} color="var(--on-inverse)" fill="none" />
        <div className="text-[15px]" style={{ ...h, color: 'var(--on-inverse)' }}>Nenhum paciente esquecido.</div>
      </div>
    </div>
  );
}

/** fontes do kit: locais (arquivos em brand/fonts/) e do Google Fonts */
function FontList({ slug, fonts, files, onChange }: { slug: string; fonts: BrandFont[]; files: string[]; onChange: (f: BrandFont[]) => void }) {
  const [google, setGoogle] = useState('');
  const [busy, setBusy] = useState(false);
  const qc = useQueryClient();
  const upload = async (list: FileList | null) => {
    if (!list?.length) return;
    setBusy(true);
    try {
      const added: BrandFont['files'] = [];
      let license: string | undefined;
      for (const f of Array.from(list)) {
        const r = await api.uploadBrandFont(slug, f.name, await toBase64(f));
        if (r.file.endsWith('.txt')) license = r.file;
        else added.push({ src: r.file, style: /italic/i.test(f.name) ? 'italic' : 'normal', weight: /variable|wght|\[/i.test(f.name) ? '100 900' : '400' });
      }
      if (added.length) {
        const family = prompt('Nome da família da fonte (como vai aparecer no CSS):', Array.from(list)[0].name.replace(/[-_.].*$/, '')) ?? '';
        if (family.trim()) onChange([...fonts, { family: family.trim(), source: 'local', files: added, display: 'block', ...(license ? { license } : {}) }]);
      }
      void qc.invalidateQueries({ queryKey: qk.brand(slug) });
      toast.ok('Arquivo(s) enviados para brand/fonts/');
    } catch (e) { toast.error(e, 'Não foi possível enviar a fonte'); } finally { setBusy(false); }
  };
  return (
    <Card className="p-0 overflow-hidden">
      {fonts.map((f, i) => (
        <div key={`${f.family}-${i}`} className="flex items-center gap-3 px-4 py-2 border-b border-border text-sm">
          <span className="font-medium w-36 truncate" style={{ fontFamily: `"${f.family}"`, fontStyle: f.files[0]?.style }}>{f.family}</span>
          <Badge>{f.source === 'local' ? `local · ${f.files.length} arquivo(s)` : 'Google Fonts'}</Badge>
          {f.license ? <span className="text-[11px] text-muted font-mono truncate">{f.license}</span> : f.source === 'local' && <span className="text-[11px] text-amber-600">sem licença registrada</span>}
          <button className="ml-auto text-xs text-danger" onClick={() => onChange(fonts.filter((_, j) => j !== i))}>remover</button>
        </div>
      ))}
      <div className="flex items-center gap-2 px-4 py-2.5 flex-wrap text-sm">
        <label className={cx('text-xs text-accent cursor-pointer hover:underline', busy && 'opacity-50')}>
          + enviar fonte (.woff2 / .ttf + licença .txt)<input type="file" multiple accept=".woff2,.woff,.ttf,.otf,.txt" className="hidden" onChange={(e) => { void upload(e.target.files); e.target.value = ''; }} />
        </label>
        <span className="text-muted text-xs">ou Google Fonts:</span>
        <Input className="w-40 text-xs py-1" value={google} onChange={(e) => setGoogle(e.target.value)} placeholder="ex.: Inter" />
        <Button variant="ghost" disabled={!google.trim()} onClick={() => { const fam = google.trim(); onChange([...fonts, { family: fam, source: 'google', google: `${fam}:wght@400;500;600;700`, files: [], display: 'swap' }]); setGoogle(''); }}>Adicionar</Button>
        {files.length > 0 && <span className="text-[11px] text-muted ml-auto">{files.length} arquivo(s) em brand/fonts/</span>}
      </div>
    </Card>
  );
}
