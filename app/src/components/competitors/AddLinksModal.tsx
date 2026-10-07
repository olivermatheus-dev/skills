// "Adicionar": cola 1 ou VÁRIOS links (1 por linha) → detecção ao vivo → cria concorrente(s) ou junta a um existente.
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { qk } from '../../queries';
import { useCompetitorActions } from './useCompetitorActions';
import { api, type CollectResult, type Competitor, type DetectedLink, type Doc } from '../../api';
import { Button, ErrorBox, Field, Input, Select, Textarea, cx } from '../ui';
import { KINDS, Modal, PlatformIcon, Spinner, keyFor, platformLabel, slugify } from './lib';

type Mode = 'one' | 'each' | 'existing';
interface Line { raw: string; det?: DetectedLink | null; problem?: string; warn?: string; dupOf?: string }

const nameFromHandle = (d?: DetectedLink | null) => {
  if (!d) return '';
  const h = d.handle ?? d.externalId ?? '';
  return d.platform === 'site' ? h.replace(/^www\./, '').replace(/\.(com|net|org|app|io|example|co)(\.[a-z]{2})?$/, '') : h;
};

/** link de conteúdo → perfil quando dá (TikTok tem o @ no link do vídeo) */
function toProfile(d: DetectedLink): Competitor['profiles'][number] | null {
  if (d.kind === 'conteudo') {
    if (d.platform === 'tiktok' && d.handle) return { platform: 'tiktok', url: `https://www.tiktok.com/@${d.handle}`, handle: d.handle };
    if (d.platform === 'youtube') return { platform: 'youtube', url: d.url }; // o coletor descobre o canal pelo vídeo
    return null;
  }
  return { platform: d.platform as Competitor['profiles'][number]['platform'], url: d.url, handle: d.handle, externalId: d.externalId };
}

export default function AddLinksModal({ slug, open, onClose, competitors, targetId }: {
  slug: string; open: boolean; onClose: () => void; competitors: Doc<Competitor>[]; targetId?: string;
}) {
  const qc = useQueryClient();
  const nav = useNavigate();
  const actions = useCompetitorActions(slug);
  const [text, setText] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [detecting, setDetecting] = useState(false);
  const [mode, setMode] = useState<Mode>(targetId ? 'existing' : 'one');
  const [target, setTarget] = useState(targetId ?? '');
  const [name, setName] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [names, setNames] = useState<Record<number, string>>({});
  const [kind, setKind] = useState<Competitor['kind']>('concorrente');
  const [tags, setTags] = useState('');
  const [pullNow, setPullNow] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [done, setDone] = useState<{ id: string; name: string; results?: CollectResult[] }[] | null>(null);

  useEffect(() => { if (open) { setText(''); setLines([]); setDone(null); setError(null); setNameTouched(false); setNames({}); setMode(targetId ? 'existing' : 'one'); setTarget(targetId ?? ''); } }, [open, targetId]);

  // já cadastrados (para avisar duplicado)
  const known = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of competitors) for (const p of c.data.profiles) m.set(keyFor(p), c.data.name);
    return m;
  }, [competitors]);

  // detecção ao vivo, com espera curta enquanto digita
  useEffect(() => {
    const raws = text.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!raws.length) { setLines([]); return; }
    setDetecting(true);
    const t = setTimeout(async () => {
      const seen = new Set<string>();
      const out = await Promise.all(raws.map(async (raw): Promise<Line> => {
        try {
          const det = await api.detectLink(raw);
          if (!det) return { raw, det, problem: 'não parece um link' };
          const prof = toProfile(det);
          if (!prof) return { raw, det, problem: 'link de post: cole o link do perfil' };
          return { raw, det: { ...det, ...prof, kind: 'perfil' }, warn: det.kind === 'conteudo' ? 'link de vídeo → usarei o perfil/canal' : undefined };
        } catch { return { raw, det: null, problem: 'não consegui ler' }; }
      }));
      for (const l of out) {
        if (!l.det || l.problem) continue;
        const k = keyFor(l.det);
        if (seen.has(k)) l.problem = 'repetido na lista';
        else if (known.has(k)) l.dupOf = known.get(k);
        seen.add(k);
      }
      setLines(out);
      setDetecting(false);
    }, 250);
    return () => clearTimeout(t);
  }, [text, known]);

  const good = lines.filter((l) => l.det && !l.problem && !l.dupOf); // já cadastrado em outro: ignora
  useEffect(() => { if (!nameTouched) setName(nameFromHandle(good[0]?.det)); }, [lines]); // eslint-disable-line react-hooks/exhaustive-deps

  const tagList = tags.split(/[,\n]/).map((t) => slugify(t.trim())).filter((t) => t && t !== 'item');
  const canSubmit = good.length > 0 && !busy && (mode === 'existing' ? !!target : mode === 'one' ? !!name.trim() : true);

  // Criar/juntar é otimista: os cards aparecem na lista na hora. Sem "puxar", o resumo já aparece; com "puxar",
  // espera só a criação (para ter o id real) e segue para a coleta, que é lenta por natureza.
  async function submit() {
    setError(null);
    let failed = false;
    const fail = (e: unknown) => { failed = true; setDone(null); setError(e); setBusy(null); };
    try {
      let created: { id: string; name: string }[] = [];
      let ready: Promise<unknown>;
      const profiles = good.map((l) => toProfile(l.det!)!).filter(Boolean);
      if (mode === 'existing') {
        const c = competitors.find((x) => x.data.id === target)!;
        const have = new Set(c.data.profiles.map(keyFor));
        const add = profiles.filter((p) => !have.has(keyFor(p)));
        ready = actions.save(c.data.id, { ...c.data, profiles: [...c.data.profiles, ...add] }, c.body, { onError: fail, okMessage: `${add.length} link(s) adicionado(s)` });
        created = [{ id: c.data.id, name: c.data.name }];
      } else {
        const items = mode === 'one'
          ? [{ name: name.trim(), kind, tags: tagList, profiles }]
          : good.map((l, i) => ({ name: (names[i] ?? nameFromHandle(l.det)).trim() || l.raw, kind, tags: tagList, profiles: [toProfile(l.det!)!] }));
        const r = actions.create(items, { onError: fail });
        created = r.ids.map((id, i) => ({ id, name: items[i].name }));
        ready = r.promise.then((docs) => { created = docs.map((x) => ({ id: x.data.id, name: x.data.name })); });
      }
      if (!pullNow) { setDone(created); return; }
      setBusy('Salvando…');
      await ready;
      if (failed) return;
      const results: { id: string; name: string; results?: CollectResult[] }[] = [...created];
      for (const [i, c] of created.entries()) {
        setBusy(`Puxando ${c.name} (${i + 1}/${created.length})… pode levar 1–2 min`);
        try { results[i] = { ...c, results: await api.collectResults(slug, c.id) }; } catch (e) { results[i] = { ...c, results: [{ key: '-', platform: '-', url: '', ok: false, items: 0, errors: [String((e as Error).message)], warnings: [] }] }; }
      }
      void qc.invalidateQueries({ queryKey: qk.competitorsSummary(slug) });
      for (const c of created) void qc.invalidateQueries({ queryKey: qk.competitor(slug, c.id) });
      setDone(results);
    } catch (e) { setError(e); } finally { setBusy(null); }
  }

  const footer = done ? (
    <>
      <Button variant="ghost" onClick={onClose}>Fechar</Button>
      {done.length === 1 && <Button onClick={() => { onClose(); nav(`/p/${slug}/concorrentes/${done[0].id}`); }}>Abrir {done[0].name}</Button>}
    </>
  ) : (
    <>
      <label className="mr-auto flex items-center gap-2 text-sm text-muted select-none">
        <input type="checkbox" checked={pullNow} onChange={(e) => setPullNow(e.target.checked)} /> Puxar os dados logo em seguida
      </label>
      <Button variant="ghost" onClick={onClose} disabled={!!busy}>Cancelar</Button>
      <Button onClick={submit} disabled={!canSubmit}>{busy ? <><Spinner /> {busy}</> : mode === 'existing' ? `Adicionar ${good.length} link(s)` : mode === 'each' ? `Criar ${good.length} concorrente(s)` : 'Criar concorrente'}</Button>
    </>
  );

  return (
    <Modal open={open} onClose={() => !busy && onClose()} title={targetId ? 'Adicionar links' : 'Adicionar concorrente'} footer={footer}>
      {done ? (
        <div className="space-y-3">
          {done.map((c) => (
            <div key={c.id} className="border border-border rounded-lg p-3">
              <div className="font-medium">✓ {c.name}</div>
              {!c.results && <div className="text-sm text-muted">Salvo. Use “Puxar” quando quiser coletar.</div>}
              {c.results?.map((r) => <ResultLine key={r.key} r={r} />)}
            </div>
          ))}
        </div>
      ) : (
        <>
          <Field label="Links (1 por linha)" hint="YouTube, Instagram, TikTok, site… A plataforma e o perfil são detectados automaticamente.">
            <Textarea rows={4} autoFocus value={text} onChange={(e) => setText(e.target.value)}
              placeholder={'https://www.youtube.com/@canal\nhttps://www.instagram.com/perfil/\nhttps://www.tiktok.com/@perfil\nhttps://site.com.br'} className="font-mono text-xs" />
          </Field>

          {lines.length > 0 && (
            <div className="mb-4 border border-border rounded-lg divide-y divide-border">
              {lines.map((l, i) => {
                const gi = good.indexOf(l);
                return (
                  <div key={`${l.raw}-${i}`} className={cx('flex items-center gap-3 px-3 py-2 text-sm', l.problem && 'bg-red-50/60')}>
                    {l.det ? <PlatformIcon platform={l.det.platform} size={18} /> : <span className="w-[18px] text-center text-danger">!</span>}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{l.det ? platformLabel(l.det.platform) : 'Inválido'}</span>
                        {l.det && <span className="text-muted truncate">{l.det.handle ? (l.det.platform === 'site' ? l.det.handle : `@${l.det.handle}`) : l.det.externalId ?? l.det.url}</span>}
                      </div>
                      <div className="text-xs text-muted truncate">{l.det?.url ?? l.raw}</div>
                    </div>
                    {mode === 'each' && gi >= 0 && (
                      <Input className="w-44 !py-1 text-xs" value={names[gi] ?? nameFromHandle(l.det)} onChange={(e) => setNames({ ...names, [gi]: e.target.value })} placeholder="Nome" />
                    )}
                    <div className="text-xs text-right shrink-0 max-w-[40%]">
                      {l.problem && <span className="text-danger">{l.problem}</span>}
                      {!l.problem && l.dupOf && <span className="text-warn">já está em {l.dupOf} (ignorado)</span>}
                      {!l.problem && !l.dupOf && l.warn && <span className="text-warn">{l.warn}</span>}
                      {!l.problem && !l.dupOf && !l.warn && <span className="text-ok">ok</span>}
                    </div>
                  </div>
                );
              })}
              {detecting && <div className="px-3 py-1.5 text-xs text-muted"><Spinner /> detectando…</div>}
            </div>
          )}

          <div className="flex gap-1 p-0.5 bg-surface-2 rounded-lg mb-4 w-fit">
            {([['one', 'Um concorrente com todos os links'], ['each', 'Um concorrente por link'], ['existing', 'Juntar a um existente']] as [Mode, string][])
              .filter(([m]) => m !== 'existing' || competitors.length)
              .map(([m, label]) => (
                <button key={m} type="button" onClick={() => setMode(m)} className={cx('px-3 py-1.5 rounded-md text-xs font-medium', mode === m ? 'bg-surface shadow-sm' : 'text-muted hover:text-text')}>{label}</button>
              ))}
          </div>

          {mode === 'existing' ? (
            <Field label="Concorrente">
              <Select className="w-full" value={target} onChange={(e) => setTarget(e.target.value)}>
                <option value="">Escolha…</option>
                {competitors.map((c) => <option key={c.data.id} value={c.data.id}>{c.data.name}</option>)}
              </Select>
            </Field>
          ) : (
            <div className="grid grid-cols-[1fr_180px] gap-3">
              {mode === 'one' ? (
                <Field label="Nome"><Input className="w-full" value={name} onChange={(e) => { setName(e.target.value); setNameTouched(true); }} placeholder="Nome do concorrente ou criador" /></Field>
              ) : <div className="text-xs text-muted self-center">O nome de cada um vem do @ (edite na lista acima).</div>}
              <Field label="Tipo">
                <Select className="w-full" value={kind} onChange={(e) => setKind(e.target.value as Competitor['kind'])}>
                  {Object.entries(KINDS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </Select>
              </Field>
              <div className="col-span-2">
                <Field label="Tags" hint="separadas por vírgula"><Input className="w-full" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="ex.: saas, reels, humor" /></Field>
              </div>
            </div>
          )}
          <ErrorBox error={error} />
        </>
      )}
    </Modal>
  );
}

export function ResultLine({ r }: { r: CollectResult }) {
  return (
    <div className="flex items-start gap-2 text-sm py-1">
      <span className={r.ok ? 'text-ok' : 'text-danger'}>{r.ok ? '✓' : '✗'}</span>
      {r.platform !== '-' && <PlatformIcon platform={r.platform} size={16} className="mt-0.5" />}
      <div className="min-w-0">
        <div>
          <span className="font-medium">{r.key !== '-' ? r.key.replace(/^[a-z]+-/, '') : 'coleta'}</span>
          {r.ok && <span className="text-muted"> · {r.items} itens{r.followers != null ? ` · ${r.followers.toLocaleString('pt-BR')} seguidores` : ''} · via {r.source}</span>}
        </div>
        {r.errors.map((e) => <div key={e} className={cx('text-xs', r.ok ? 'text-warn' : 'text-danger')}>{e}</div>)}
        {r.warnings.map((w) => <div key={w} className="text-xs text-muted">{w}</div>)}
      </div>
    </div>
  );
}
