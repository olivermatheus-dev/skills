// Página de uma skill (Agentes e skills → Skills → clique): quem usa, a árvore de arquivos e o editor.
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { api } from '../api';
import { AppContent } from '../components/AppContent';
import { Empty, ErrorBox } from '../components/kit';
import { Avatar, NOME_AGENTE } from '../components/agentes/shared';
import { ArquivosWorkspace } from '../components/agentes/Arquivos';

export default function SkillDetalhe() {
  const { slug = '', skill = '' } = useParams();
  const { data, error, isLoading } = useQuery({ queryKey: ['skill', skill], queryFn: () => api.skill(skill), enabled: !!skill });
  const equipe = useQuery({ queryKey: ['agentes', slug], queryFn: () => api.agentes(slug), enabled: !!slug });
  const base = `/p/${slug}/agentes`;
  return (
    <AppContent>
      <Link to={`${base}?aba=skills`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"><ArrowLeft className="size-3.5" />Skills</Link>
      <ErrorBox error={error} />
      {isLoading && <div className="h-24 rounded-xl bg-muted/70 animate-pulse" />}
      {!isLoading && !data && !error && <Empty title="Skill não encontrada" />}
      {data && (
        <>
          <header className="flex items-start gap-4 mb-5">
            <span className="size-11 shrink-0 rounded-xl grid place-items-center bg-ai-soft text-ai-ink"><Sparkles className="size-5" strokeWidth={1.8} /></span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">{data.id}</h1>
                <span className="text-[11px] text-muted-foreground border border-border rounded-md px-1.5 py-0.5">{data.grupo === 'formato' ? 'Formato' : 'Skill'} · {data.arquivos} arquivo{data.arquivos === 1 ? '' : 's'}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 max-w-4xl leading-relaxed line-clamp-3" title={data.descricao}>{data.descricao}</p>
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                <span className="text-xs text-muted-foreground mr-0.5">Usada por</span>
                {data.agentes.length ? data.agentes.map((id) => {
                  const a = equipe.data?.agentes.find((x) => x.id === id) ?? { id, nome: NOME_AGENTE[id] ?? id, cor: null };
                  return (
                    <Link key={id} to={`${base}/${id}?aba=arquivos&f=${encodeURIComponent(`.claude/skills/${data.id}/SKILL.md`)}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card pl-0.5 pr-2.5 py-0.5 text-xs hover:border-primary/40">
                      <Avatar a={a} size="xs" estado={false} />{a.nome}
                    </Link>
                  );
                }) : <span className="text-xs rounded-full bg-muted px-2 py-0.5">Sessão principal (você chama direto)</span>}
              </div>
            </div>
          </header>
          <ArquivosWorkspace arvore={data.arvore} />
        </>
      )}
    </AppContent>
  );
}
