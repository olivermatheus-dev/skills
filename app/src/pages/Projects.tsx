import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api, type Project } from '../api';
import { qk, runOptimistic, useProjects } from '../queries';
import { Button, Card, ErrorBox, Input, PageHeader } from '../components/kit';
import { AppContent } from '../components/AppContent';

export default function Projects() {
  const qc = useQueryClient();
  const { data = [] } = useProjects();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  // Criar é otimista: o cartão aparece na hora; erro → some, os campos voltam preenchidos e o erro aparece.
  const [error, setError] = useState<unknown>(null);
  const create = () => {
    const s = slug, n = name;
    const temp = { slug: s, name: n, description: '', segment: '', status: 'ativo', socials: [], created: new Date().toISOString().slice(0, 10) } as unknown as Project;
    setError(null); setName(''); setSlug('');
    void runOptimistic(qc, {
      mutationFn: () => api.createProject(s, n),
      apply: () => [[qk.projects(), (old: Project[] | undefined) => [...(old ?? []), temp]]],
      onSuccess: (r) => qc.setQueryData<Project[]>(qk.projects(), (old) => old?.map((x) => (x.slug === s ? r : x))),
      onError: (e) => { setError(e); setName(n); setSlug(s); },
      invalidate: () => [qk.projects()],
      okMessage: `Projeto ${n} criado`,
    }, undefined).catch(() => {});
  };
  return (
    <AppContent narrow>
      <PageHeader title="Projetos" subtitle="Cada empresa ou projeto tem marca, contexto, personas, concorrentes, quadro e anotações." />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {data.map((p) => (
          <Link key={p.slug} to={`/p/${p.slug}`}>
            <Card className="hover:border-primary transition">
              <div className="font-semibold">{p.name}</div>
              <div className="text-sm text-muted-foreground">{p.segment || p.description || p.slug}</div>
            </Card>
          </Link>
        ))}
      </div>
      <Card>
        <div className="font-medium mb-3">Novo projeto</div>
        <div className="flex gap-2 flex-wrap">
          <Input placeholder="Nome (ex.: Kzloo)" value={name} onChange={(e) => { setName(e.target.value); setSlug(e.target.value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')); }} />
          <Input placeholder="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-40" />
          <Button disabled={!name || !slug} onClick={create}>Criar</Button>
        </div>
        <ErrorBox error={error} />
      </Card>
    </AppContent>
  );
}
