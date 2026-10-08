// Anúncios: lugar reservado para a Biblioteca de Anúncios da Meta (fase D da 031). Mostra onde ver à mão enquanto isso.
import { useParams } from 'react-router-dom';
import { AreaPage, useMarket } from '../../components/competitors/area';
import { Empty } from '../../components/kit';

export default function Anuncios() {
  const { slug = '' } = useParams();
  const m = useMarket(slug);
  const lib = (q: string) => `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&q=${encodeURIComponent(q)}&search_type=keyword_unordered`;
  return (
    <AreaPage>
      <Empty title="Anúncios ativos dos concorrentes: em breve" hint="O coletor da Biblioteca de Anúncios da Meta (criativos, data de início, variações) entra na fase D. Enquanto isso, abra a biblioteca de cada um:" />
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {m.rows.filter((r) => r.c.data.kind === 'concorrente').map((r) => (
          <a key={r.c.data.id} href={lib(r.c.data.name)} target="_blank" rel="noreferrer" className="text-xs px-2.5 py-1 rounded-md border border-border bg-card hover:border-primary hover:text-primary-ink">{r.c.data.name} ↗</a>
        ))}
      </div>
    </AreaPage>
  );
}
