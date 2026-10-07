import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import { Button, Card, ErrorBox, Input, PageHeader } from '../components/ui';

export default function Projects() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ['projects'], queryFn: api.projects });
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const create = useMutation({
    mutationFn: () => api.createProject(slug, name),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); setName(''); setSlug(''); },
  });
  return (
    <div className="p-8 max-w-4xl">
      <PageHeader title="Projetos" subtitle="Cada empresa ou projeto tem marca, contexto, personas, concorrentes, quadro e anotações." />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {data.map((p) => (
          <Link key={p.slug} to={`/p/${p.slug}`}>
            <Card className="hover:border-accent transition">
              <div className="font-semibold">{p.name}</div>
              <div className="text-sm text-muted">{p.segment || p.description || p.slug}</div>
            </Card>
          </Link>
        ))}
      </div>
      <Card>
        <div className="font-medium mb-3">Novo projeto</div>
        <div className="flex gap-2 flex-wrap">
          <Input placeholder="Nome (ex.: Kzloo)" value={name} onChange={(e) => { setName(e.target.value); setSlug(e.target.value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')); }} />
          <Input placeholder="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-40" />
          <Button disabled={!name || !slug || create.isPending} onClick={() => create.mutate()}>Criar</Button>
        </div>
        <ErrorBox error={create.error} />
      </Card>
    </div>
  );
}
