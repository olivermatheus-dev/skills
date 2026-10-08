// Novo conteúdo: colar/enviar um roteiro pronto (.md/.txt/.docx) → contents/AAAA-MM-DD-<tema>/roteiro.md,
// ou escolher um formato da galeria (027) e escrever só o pedido → briefing.md, para a IA escrever o roteiro.
// O formato fica na ficha (peca.json) e (opcional) vira a tarefa no quadro para a IA, já com a skill certa.
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, type NewPieceInput } from '../../api';
import { Button, Drawer, ErrorBox, Field, Input, Select, Textarea } from '../kit';
import { toast } from '../toast';
import { qk, useFormats } from '../../queries';

const toBase64 = (f: File) => new Promise<string>((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(String(r.result).split(',')[1] ?? '');
  r.onerror = () => rej(r.error);
  r.readAsDataURL(f);
});

export default function NewPiece({ slug, open, onClose, onCreated, initialFormat = '' }: { slug: string; open: boolean; onClose: () => void; onCreated: (path: string) => void; initialFormat?: string }) {
  const qc = useQueryClient();
  const { data: formats = [] } = useFormats();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [upload, setUpload] = useState<NewPieceInput['upload']>();
  const [formato, setFormato] = useState(initialFormat);
  const [notes, setNotes] = useState('');
  const [task, setTask] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  useEffect(() => { if (open) setFormato(initialFormat); }, [open, initialFormat]);
  const reset = () => { setTitle(''); setText(''); setUpload(undefined); setFormato(''); setNotes(''); setTask(true); setError(null); };
  const fmt = formats.find((f) => f.id === formato);
  const noScript = !upload && !text.trim();

  const pickFile = async (f?: File) => {
    if (!f) return;
    if (!title.trim()) setTitle(f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '));
    if (/\.docx$/i.test(f.name)) { setUpload({ name: f.name, base64: await toBase64(f) }); setText(''); }
    else if (/\.(md|txt|markdown)$/i.test(f.name)) { setText(await f.text()); setUpload(undefined); }
    else toast.info('Envie .md, .txt ou .docx');
  };
  const create = async () => {
    setBusy(true); setError(null);
    try {
      const r = await api.createPiece(slug, { title, text: upload ? undefined : text, upload, formato: formato || undefined, notes, task });
      void qc.invalidateQueries({ queryKey: qk.pieces(slug) });
      void qc.invalidateQueries({ queryKey: qk.formats() });
      if (r.task) void qc.invalidateQueries({ queryKey: qk.tasks(slug) });
      toast.ok(r.task ? `Criado · tarefa ${r.task.id} no quadro` : 'Criado');
      reset(); onCreated(r.path);
    } catch (e) { setError(e); } finally { setBusy(false); }
  };
  const canCreate = title.trim() && (!noScript || formato) && !busy;

  return (
    <Drawer open={open} onClose={onClose} title={fmt ? `Novo conteúdo · ${fmt.nome}` : 'Novo conteúdo'} canClose={() => !(text.trim() || upload) || confirm('Descartar o roteiro?')}>
      <Field label="Nome" hint="Vira a pasta: AAAA-MM-DD-nome. Sem roteiro, é o próprio pedido (sobre o quê).">
        <Input className="w-full" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ex.: 5 sinais de que sua agenda está te sabotando" autoFocus />
      </Field>
      <Field label="Formato" hint={fmt ? fmt.essencia : 'Em branco = a IA sugere o formato pelo roteiro.'}>
        <Select className="w-full" value={formato} onChange={(e) => setFormato(e.target.value)}>
          <option value="">— a IA escolhe —</option>
          {(['imagem', 'video'] as const).map((m) => (
            <optgroup key={m} label={m === 'imagem' ? 'Imagem' : 'Vídeo'}>
              {formats.filter((f) => f.midia === m).map((f) => <option key={f.id} value={f.id}>{f.nome}{f.status === 'rascunho' ? ' (rascunho)' : ''}</option>)}
            </optgroup>
          ))}
        </Select>
      </Field>
      <Field label={formato ? 'Roteiro (opcional)' : 'Roteiro'} hint={formato ? 'Sem roteiro, a IA escreve um no formato e manda para você aprovar antes de produzir.' : 'Cole o texto ou envie um arquivo (.md, .txt, .docx). Fica salvo como roteiro.md.'}>
        {upload ? (
          <div className="flex items-center gap-2 text-sm border border-border rounded-md px-3 py-2">
            <span className="font-mono">{upload.name}</span><span className="text-muted-foreground">(o texto é extraído ao criar)</span>
            <button className="ml-auto text-xs text-destructive" onClick={() => setUpload(undefined)}>remover</button>
          </div>
        ) : (
          <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); void pickFile(e.dataTransfer.files[0]); }}>
            <Textarea rows={formato ? 6 : 14} className="font-mono text-[13px]" value={text} onChange={(e) => setText(e.target.value)} placeholder="Cole aqui o roteiro (ou arraste um arquivo)…" />
          </div>
        )}
        <label className="inline-block mt-2 text-xs text-primary-ink cursor-pointer hover:underline">
          enviar arquivo…<input type="file" accept=".md,.txt,.markdown,.docx" className="hidden" onChange={(e) => { void pickFile(e.target.files?.[0]); e.target.value = ''; }} />
        </label>
      </Field>
      <label className="flex items-center gap-2 text-sm mb-4">
        <input type="checkbox" checked={task} onChange={(e) => setTask(e.target.checked)} /> Criar tarefa no quadro para a IA produzir
      </label>
      {(task || (formato && noScript)) && (
        <Field label={formato && noScript ? 'Pedido e observações' : 'Observações (opcional)'}>
          <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={formato && noScript ? 'ex.: sobre esquecer de confirmar sessão; tom leve; postar sexta' : 'ex.: usar a voz da Carla; 9:16; postar sexta'} />
        </Field>
      )}
      <ErrorBox error={error} />
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button disabled={!canCreate} onClick={create}>{busy ? 'Criando…' : 'Criar conteúdo'}</Button>
      </div>
    </Drawer>
  );
}
