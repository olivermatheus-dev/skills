import { Navigate, Route, Routes } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from './api';
import Layout from './components/Layout';
import { PAGES } from './pages';
import Projects from './pages/Projects';

function Home() {
  const { data } = useQuery({ queryKey: ['projects'], queryFn: api.projects });
  if (!data) return null;
  const last = localStorage.getItem('hub:project');
  const slug = data.find((p) => p.slug === last)?.slug ?? data[0]?.slug;
  return slug ? <Navigate to={`/p/${slug}`} replace /> : <Navigate to="/projetos" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/projetos" element={<Layout><Projects /></Layout>} />
      <Route path="/p/:slug" element={<Layout />}>
        {PAGES.map((p) => <Route key={p.path} index={p.path === ''} path={p.path || undefined} element={<p.element />} />)}
        {PAGES.flatMap((p) => (p.children ?? []).map((c) => <Route key={`${p.path}/${c.path}`} path={`${p.path}/${c.path}`} element={<c.element />} />))}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
