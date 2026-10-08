// Configurações do projeto: cor do projeto (cor principal da interface) e chaves de API. Cada projeto tem a sua (companies/<slug>/.env); a geral (.env da raiz) é reserva.
// O valor só vai do navegador para o arquivo: a tela mostra se está definida e os 4 últimos caracteres.
import { useEffect, useState } from 'react';
import { Palette as PaletteIcon } from 'lucide-react';
import { Card as UiCard, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button as UiButton } from '@/components/ui/button';
import { Input as UiInput } from '@/components/ui/input';
import { aplicarCor } from '@/lib/theme';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api, type SecretState } from '../api';
import { Badge, Button, Card, ErrorBox, Input, PageHeader } from '../components/kit';
import { toast } from '../components/toast';
import { qk, useBrandCss, useProject, useSecrets } from '../queries';
import { AppContent } from '../components/AppContent';

export default function Settings() {
  const { slug = '' } = useParams();
  const { data, isLoading, error } = useSecrets(slug);
  const [showGeneral, setShowGeneral] = useState(false);
  return (
    <AppContent narrow>
      <PageHeader title="Configurações" subtitle="Cor do projeto e chaves de API." />
      <CorDoProjeto slug={slug} />
      <h2 className="text-sm font-semibold mb-1">Chaves de API</h2>
      <p className="text-sm text-muted-foreground mb-4">{`Ficam em companies/${slug}/.env, fora do git. Ordem de uso: projeto > geral.`}</p>
      <ErrorBox error={error} />
      {isLoading && <div className="h-40 rounded-xl bg-muted animate-pulse" />}
      <div className="space-y-3">{data?.map((s) => <SecretRow key={s.key} slug={slug} s={s} scope="projeto" />)}</div>
      <div className="mt-10">
        <button className="text-sm text-muted-foreground hover:text-foreground" onClick={() => setShowGeneral(!showGeneral)}>
          {showGeneral ? '▾' : '▸'} Chaves gerais do hub (.env da raiz, usadas só quando o projeto não tem a sua)
        </button>
        {showGeneral && <div className="space-y-3 mt-3">{data?.map((s) => <SecretRow key={s.key} slug={slug} s={s} scope="geral" />)}</div>}
      </div>
    </AppContent>
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
            <code className="text-[11px] text-muted-foreground">{s.key}</code>
            {current ? <Badge color="#16a34a">{current}</Badge> : <Badge>vazia</Badge>}
            {scope === 'projeto' && !s.project && s.general && <Badge color="#d97706">usando a geral</Badge>}
          </div>
          <div className="text-xs text-muted-foreground mt-1">{s.hint}</div>
        </div>
      </div>
      <form className="flex gap-2 mt-3" onSubmit={(e) => { e.preventDefault(); if (value.trim()) void save(value); }}>
        <Input type="password" autoComplete="off" spellCheck={false} className="flex-1 font-mono" placeholder={current ? 'Colar nova chave para trocar' : 'Colar a chave'} value={value} onChange={(e) => setValue(e.target.value)} />
        <Button type="submit" disabled={busy || !value.trim()}>Salvar</Button>
        {s.test && scope === 'projeto' && <Button type="button" variant="ghost" disabled={busy || !s.active} onClick={runTest}>Testar</Button>}
        {current && <Button type="button" variant="danger" disabled={busy} onClick={() => confirm(`Remover ${s.key} (${scope})?`) && save('')}>Remover</Button>}
      </form>
      {test && <div className={`text-xs mt-2 ${test.ok ? 'text-green-700' : 'text-destructive'}`}>{test.ok ? '✓' : '✗'} {test.message}</div>}
    </Card>
  );
}

/** cor principal da interface neste projeto (project.yml → color). Vazio = a cor da marca (brand.css → --primary). */
function CorDoProjeto({ slug }: { slug: string }) {
  const qc = useQueryClient();
  const projeto = useProject(slug);
  const marca = useBrandCss(slug);
  const daMarca = marca.data?.text?.match(/--primary\s*:\s*(#[0-9a-f]{3,6})\b/i)?.[1] ?? '';
  const salva = projeto.data?.color ?? '';
  const [cor, setCor] = useState<string | null>(null);
  const atual = cor ?? (salva || daMarca || '#4f46e5');
  const valida = /^#[0-9a-f]{6}$/i.test(atual);
  // prévia ao vivo; ao sair sem salvar, volta para a cor salva
  useEffect(() => { if (cor && valida) aplicarCor(cor); return () => aplicarCor(salva || daMarca || null); }, [cor, valida, salva, daMarca]);
  const salvar = async (color: string | null) => {
    if (!projeto.data) return;
    try {
      await api.saveProject(slug, { ...projeto.data, color: color ?? undefined });
      await qc.invalidateQueries({ queryKey: qk.project(slug) });
      void qc.invalidateQueries({ queryKey: qk.projects() });
      setCor(null);
      toast.ok(color ? 'Cor do projeto salva' : 'Voltou para a cor da marca');
    } catch (e) { toast.error(e); }
  };
  return (
    <UiCard className="mb-8 gap-4 py-5">
      <CardHeader className="px-5">
        <CardTitle className="flex items-center gap-2"><PaletteIcon className="size-4 text-primary-ink" />Cor do projeto</CardTitle>
        <CardDescription>Vira a cor principal da interface quando este projeto está aberto (botões, item ativo, seleção). Vazio = cor da marca{daMarca ? ` (${daMarca})` : ''}.</CardDescription>
      </CardHeader>
      <CardContent className="px-5 flex flex-wrap items-center gap-3">
        <input type="color" value={valida ? atual : '#4f46e5'} onChange={(e) => setCor(e.target.value)} className="size-9 rounded-md border border-border bg-transparent p-0.5 cursor-pointer" />
        <UiInput value={atual} onChange={(e) => setCor(e.target.value)} className="w-32 font-mono" />
        <UiButton disabled={!valida || cor === null} onClick={() => salvar(atual)}>Salvar cor</UiButton>
        {(salva || cor) && <UiButton variant="ghost" onClick={() => { setCor(null); aplicarCor(daMarca || null); void salvar(null); }}>Usar a cor da marca</UiButton>}
        <span className="flex items-center gap-2 text-sm"><span className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium">Botão</span><span className="text-primary-ink font-medium">texto na cor</span></span>
      </CardContent>
    </UiCard>
  );
}
