// Anúncios: o que os concorrentes estão anunciando agora (Biblioteca de Anúncios da Meta). O corpo mora em AdsView (também usado na ficha).
import { useParams } from 'react-router-dom';
import { AreaPage } from '../../components/competitors/area';
import AdsView from '../../components/competitors/AdsView';

export default function Anuncios() {
  const { slug = '' } = useParams();
  return <AdsView slug={slug} shell={(actions, body) => <AreaPage actions={actions}>{body}</AreaPage>} />;
}
