// Novo conteúdo a partir de um roteiro pronto: colar o texto ou enviar .md/.txt/.docx → contents/AAAA-MM-DD-<tema>/roteiro.md
// e (opcional) a tarefa "Produzir a partir do roteiro" no quadro, para a IA.
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, type NewPieceInput } from '../../api';
import { Button, Drawer, ErrorBox, Field, Input, Textarea } from '../ui';
import { toast } from '../toast';
import { qk } from '../../queries';

const FORMATS = ['carrossel educativo', 'post frase', 'meme', 'antes e depois', 'reels de texto cinético', 'vídeo de funcionalidade', 'trailer de lançamento', 'diálogo animado', 'vídeo 3D do produto'];

const toBase64 = (f: File) => new Promise<string>((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(String(r.result).split(',')[1] ?? '');
  r.onerror = () => rej(r.error);
  r.readAsDataURL(f);
});

export default function NewPiece({ slug, open, onClose, onCreated }: { slug: string; open: boolean; onClose: () => void; onCreated: (path: string) => void }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [upload, setUpload] = useState<NewPieceInput['upload']>();
  const [format, setFormat] = useState('');
  const [notes, setNotes] = useState('');
  const [task, setTask] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const reset = () => { setTitle(''); setText(''); setUpload(undefined); setFormat(''); setNotes(''); setTask(true); setError(null); };

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
      const r = await api.createPiece(slug, { title, text: upload ? undefined : text, upload, format, notes, task });
      void qc.invalidateQueries({ queryKey: qk.pieces(slug) });
      if (r.task) void qc.invalidateQueries({ queryKey: qk.tasks(slug) });
      toast.ok(r.task ? `Criado · tarefa ${r.task.id} no quadro` : 'Criado');
      reset(); onCreated(r.path);
    } catch (e) { setError(e); } finally { setBusy(false); }
  };
  const canCreate = title.trim() && (upload || text.trim()) && !busy;

  return (
    <Drawer open={open} onClose={onClose} title="Novo conteúdo · roteiro pronto" canClose={() => !(text.trim() || upload) || confirm('Descartar o roteiro?')}>
      <Field label="Nome" hint="Vira a pasta: AAAA-MM-DD-nome.">
        <Input className="w-full" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ex.: 5 sinais de que sua agenda está te sabotando" autoFocus />
      </Field>
      <Field label="Roteiro" hint="Cole o texto ou envie um arquivo (.md, .txt, .docx). Fica salvo como roteiro.md.">
        {upload ? (
          <div className="flex items-center gap-2 text-sm border border-border rounded-md px-3 py-2">
            <span className="font-mono">{upload.name}</span><span className="text-muted">(o texto é extraído ao criar)</span>
            <button className="ml-auto text-xs text-danger" onClick={() => setUpload(undefined)}>remover</button>
          </div>
        ) : (
          <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); void pickFile(e.dataTransfer.files[0]); }}>
            <Textarea rows={14} className="font-mono text-[13px]" value={text} onChange={(e) => setText(e.target.value)} placeholder="Cole aqui o roteiro (ou arraste um arquivo)…" />
          </div>
        )}
        <label className="inline-block mt-2 text-xs text-accent cursor-pointer hover:underline">
          enviar arquivo…<input type="file" accept=".md,.txt,.markdown,.docx" className="hidden" onChange={(e) => { void pickFile(e.target.files?.[0]); e.target.value = ''; }} />
        </label>
      </Field>
      <label className="flex items-center gap-2 text-sm mb-4">
        <input type="checkbox" checked={task} onChange={(e) => setTask(e.target.checked)} /> Criar tarefa no quadro para a IA produzir a partir deste roteiro
      </label>
      {task && <>
        <Field label="Formato (opcional)" hint="Em branco = a IA sugere o formato pelo roteiro.">
          <Input className="w-full" list="fmt-list" value={format} onChange={(e) => setFormat(e.target.value)} placeholder="ex.: carrossel educativo" />
          <datalist id="fmt-list">{FORMATS.map((f) => <option key={f} value={f} />)}</datalist>
        </Field>
        <Field label="Observações (opcional)">
          <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ex.: usar a voz da Carla; 9:16; postar sexta" />
        </Field>
      </>}
      <ErrorBox error={error} />
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button disabled={!canCreate} onClick={create}>{busy ? 'Criando…' : 'Criar conteúdo'}</Button>
      </div>
    </Drawer>
  );
}
