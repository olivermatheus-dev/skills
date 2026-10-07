// Editar concorrente: nome, tipo, status, tags, favorito, perfis (adicionar/remover) e observações (markdown). Excluir com confirmação.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, type Competitor, type DetectedLink } from '../../api';
import { MarkdownEditor } from '../Markdown';
import { Button, Drawer, ErrorBox, Field, Input, Select } from '../ui';
import { useCompetitorActions } from './useCompetitorActions';
import { KINDS, PlatformIcon, keyFor, platformLabel, slugify } from './lib';

type Prof = Competitor['profiles'][number];

/** Salvar e excluir são otimistas: o painel fecha na hora; erro → `onFailed` reabre com o rascunho e o erro. */
export default function EditCompetitor({ slug, open, onClose, onFailed, data, body, snapshotsCount, initialError }: {
  slug: string; open: boolean; onClose: () => void; onFailed: (draft: { data: Competitor; body: string }, error: unknown) => void;
  data: Competitor; body: string; snapshotsCount: number; initialError?: unknown;
}) {
  const nav = useNavigate();
  const actions = useCompetitorActions(slug);
  const [d, setD] = useState(data);
  const [md, setMd] = useState(body);
  const [tags, setTags] = useState(data.tags.join(', '));
  const [link, setLink] = useState('');
  const [det, setDet] = useState<DetectedLink | null>(null);
  const [error, setError] = useState<unknown>(initialError ?? null);

  useEffect(() => { if (open) { setD(data); setMd(body); setTags(data.tags.join(', ')); setLink(''); setDet(null); setError(initialError ?? null); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!link.trim()) { setDet(null); return; }
    const t = setTimeout(() => api.detectLink(link).then(setDet).catch(() => setDet(null)), 200);
    return () => clearTimeout(t);
  }, [link]);

  const addProfile = () => {
    if (!det) return;
    const p: Prof = det.kind === 'conteudo' && det.platform === 'tiktok' && det.handle
      ? { platform: 'tiktok', url: `https://www.tiktok.com/@${det.handle}`, handle: det.handle }
      : { platform: det.platform as Prof['platform'], url: det.url, handle: det.handle, externalId: det.externalId };
    if (d.profiles.some((x) => keyFor(x) === keyFor(p))) { setError(new Error('esse perfil já está na lista')); return; }
    setD({ ...d, profiles: [...d.profiles, p] });
    setLink('');
  };

  function save() {
    const tagList = [...new Set(tags.split(/[,\n]/).map((t) => slugify(t.trim().replace(/^#/, ''))).filter((t) => t && t !== 'item'))];
    const next = { ...d, tags: tagList };
    void actions.save(d.id, next, md, { onError: (e) => onFailed({ data: next, body: md }, e) });
    onClose();
  }
  function remove() {
    if (!window.confirm(`Excluir "${d.name}"?\n\nApaga a pasta inteira: ${snapshotsCount} coleta(s), marcações e imagens. Não dá para desfazer.\n(Para só parar de acompanhar, use Status → Arquivado.)`)) return;
    void actions.remove(d.id, { onError: () => nav(`/p/${slug}/concorrentes/${d.id}`) });
    nav(`/p/${slug}/concorrentes`);
  }

  return (
    <Drawer open={open} onClose={onClose} title={`Editar · ${data.name}`}>
      <div className="grid grid-cols-2 gap-x-4">
        <div className="col-span-2"><Field label="Nome"><Input className="w-full" value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} /></Field></div>
        <Field label="Tipo">
          <Select className="w-full" value={d.kind} onChange={(e) => setD({ ...d, kind: e.target.value as Competitor['kind'] })}>
            {Object.entries(KINDS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        </Field>
        <Field label="Status" hint="arquivado = sai do “Puxar todos”, mantém o histórico">
          <Select className="w-full" value={d.status} onChange={(e) => setD({ ...d, status: e.target.value as Competitor['status'] })}>
            <option value="ativo">Ativo</option><option value="arquivado">Arquivado</option>
          </Select>
        </Field>
        <div className="col-span-2 flex gap-4 items-start">
          <div className="flex-1"><Field label="Tags" hint="separadas por vírgula"><Input className="w-full" value={tags} onChange={(e) => setTags(e.target.value)} /></Field></div>
          <label className="flex items-center gap-2 text-sm mt-6 select-none"><input type="checkbox" checked={d.favorite} onChange={(e) => setD({ ...d, favorite: e.target.checked })} /> ★ Favorito</label>
        </div>
      </div>

      <Field label={`Perfis (${d.profiles.length})`}>
        <div className="border border-border rounded-lg divide-y divide-border">
          {d.profiles.map((p, i) => (
            <div key={`${p.platform}-${p.url}`} className="flex items-center gap-3 px-3 py-2 text-sm">
              <PlatformIcon platform={p.platform} size={18} />
              <div className="min-w-0 flex-1">
                <div className="font-medium">{platformLabel(p.platform)} {p.handle && <span className="text-muted font-normal">{p.platform === 'site' ? p.handle : `@${p.handle}`}</span>}</div>
                <a href={p.url} target="_blank" rel="noreferrer" className="text-xs text-muted truncate block hover:text-accent">{p.url}</a>
              </div>
              <button className="text-xs text-danger hover:underline" onClick={() => setD({ ...d, profiles: d.profiles.filter((_, j) => j !== i) })}>remover</button>
            </div>
          ))}
          <div className="flex items-center gap-2 px-3 py-2">
            {det ? <PlatformIcon platform={det.platform} size={18} /> : <span className="w-[18px]" />}
            <Input className="flex-1 !py-1 text-xs font-mono" value={link} onChange={(e) => setLink(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addProfile()} placeholder="colar link de outro perfil…" />
            <Button variant="soft" className="!py-1 text-xs" disabled={!det} onClick={addProfile}>{det ? `+ ${platformLabel(det.platform)}` : '+ Adicionar'}</Button>
          </div>
        </div>
        <div className="text-xs text-muted mt-1">Remover um perfil não apaga as coletas dele (ficam na pasta snapshots/).</div>
      </Field>

      <Field label="Observações">
        <MarkdownEditor value={md} onChange={setMd} placeholder="Por que acompanhar, posicionamento, oferta, o que copiar de estrutura…" minHeight={160} />
      </Field>

      <ErrorBox error={error} />
      <div className="flex items-center gap-2 mt-4 sticky bottom-0 bg-surface py-3 border-t border-border">
        <Button variant="danger" onClick={remove}>Excluir</Button>
        <div className="flex-1" />
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button onClick={save} disabled={!d.name.trim()}>Salvar</Button>
      </div>
    </Drawer>
  );
}
