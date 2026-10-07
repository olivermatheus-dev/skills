// Configurações do projeto: chaves de API. Cada projeto tem a sua (companies/<slug>/.env); a geral (.env da raiz) é reserva.
// O valor só vai do navegador para o arquivo: a tela mostra se está definida e os 4 últimos caracteres.
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api, type SecretState } from '../api';
import { Badge, Button, Card, ErrorBox, Input, PageHeader } from '../components/ui';
import { toast } from '../components/toast';
import { qk, useSecrets } from '../queries';

export default function Settings() {
  const { slug = '' } = useParams();
  const { data, isLoading, error } = useSecrets(slug);
  const [showGeneral, setShowGeneral] = useState(false);
  return (
    <div className="p-8 max-w-4xl">
      <PageHeader title="Configurações" subtitle={`Chaves de API deste projeto. Ficam em companies/${slug}/.env, fora do git. Ordem de uso: projeto > geral.`} />
      <ErrorBox error={error} />
      {isLoading && <div className="h-40 rounded-xl bg-surface-2 animate-pulse" />}
      <div className="space-y-3">{data?.map((s) => <SecretRow key={s.key} slug={slug} s={s} scope="projeto" />)}</div>
      <div className="mt-10">
        <button className="text-sm text-muted hover:text-text" onClick={() => setShowGeneral(!showGeneral)}>
          {showGeneral ? '▾' : '▸'} Chaves gerais do hub (.env da raiz, usadas só quando o projeto não tem a sua)
        </button>
        {showGeneral && <div className="space-y-3 mt-3">{data?.map((s) => <SecretRow key={s.key} slug={slug} s={s} scope="geral" />)}</div>}
      </div>
    </div>
  );
}

function SecretRow({ slug, s, scope }: { slug: string; s: SecretState; scope: 'projeto' | 'geral' }) {
  const qc = useQueryClient();
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [test, setTest] = useState<{ ok: boolean; message: string } | null>(null);
  const current = scope === 'projeto' ? s.project : s.general;

  const save = async (v: string) => {
    setBusy(true); setTest(null);
    try {
      await api.setSecret(slug, s.key, v, scope);
      setValue('');
      await qc.invalidateQueries({ queryKey: qk.secrets(slug) });
      toast.ok(v ? 'Chave salva' : 'Chave removida');
    } catch (e) { toast.error(e, 'Não foi possível salvar a chave'); } finally { setBusy(false); }
  };
  const runTest = async () => {
    setBusy(true);
    try { setTest(await api.testSecret(slug, s.key)); } catch (e) { setTest({ ok: false, message: String((e as Error).message) }); } finally { setBusy(false); }
  };

  return (
    <Card>
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">{s.label}</span>
            <code className="text-[11px] text-muted">{s.key}</code>
            {current ? <Badge color="#16a34a">{current}</Badge> : <Badge>vazia</Badge>}
            {scope === 'projeto' && !s.project && s.general && <Badge color="#d97706">usando a geral</Badge>}
          </div>
          <div className="text-xs text-muted mt-1">{s.hint}</div>
        </div>
      </div>
      <form className="flex gap-2 mt-3" onSubmit={(e) => { e.preventDefault(); if (value.trim()) void save(value); }}>
        <Input type="password" autoComplete="off" spellCheck={false} className="flex-1 font-mono" placeholder={current ? 'Colar nova chave para trocar' : 'Colar a chave'} value={value} onChange={(e) => setValue(e.target.value)} />
        <Button type="submit" disabled={busy || !value.trim()}>Salvar</Button>
        {s.test && scope === 'projeto' && <Button type="button" variant="ghost" disabled={busy || !s.active} onClick={runTest}>Testar</Button>}
        {current && <Button type="button" variant="danger" disabled={busy} onClick={() => confirm(`Remover ${s.key} (${scope})?`) && save('')}>Remover</Button>}
      </form>
      {test && <div className={`text-xs mt-2 ${test.ok ? 'text-green-700' : 'text-danger'}`}>{test.ok ? '✓' : '✗'} {test.message}</div>}
    </Card>
  );
}
