import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { PAGES, ProjectsPage } from './pages';
import { useProjects } from './queries';

function Home() {
  const { data } = useProjects();
  if (!data) return null;
  const last = localStorage.getItem('hub:project');
  const slug = data.find((p) => p.slug === last)?.slug ?? data[0]?.slug;
  return slug ? <Navigate to={`/p/${slug}`} replace /> : <Navigate to="/projetos" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/projetos" element={<Layout><ProjectsPage.element /></Layout>} />
      <Route path="/p/:slug" element={<Layout />}>
        {PAGES.map((p) => <Route key={p.path} index={p.path === ''} path={p.path || undefined} element={<p.element />} />)}
        {PAGES.flatMap((p) => (p.children ?? []).map((c) => <Route key={`${p.path}/${c.path}`} path={`${p.path}/${c.path}`} element={<c.element />} />))}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
