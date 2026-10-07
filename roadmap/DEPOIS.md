# Adiado

Coisas registradas que **não** fazem parte da prioridade atual. Quando uma voltar, ela vira tarefa no `BACKLOG.md` com pasta própria.

## Vídeo
- **Editor com timeline (estilo CapCut)** integrado ao Claude Code: ver e ajustar o que o Claude gerou (trocar texto de legenda, mudar duração, estilo) com preview. Em 90% dos casos não será necessário. Antes de construir, pesquisar o que já existe (OpenCut, Remotion Studio/Editor Starter, Revideo/Motion Canvas, designcombo react-video-editor, Twick, HyperFrames). Requisito: o Claude e a timeline editam **o mesmo arquivo de projeto**.
- **Engenharia reversa de vídeo → template**: ffmpeg extrai frames por troca de cena; o ritmo vem da detecção de cena; Whisper extrai a fala com tempo por palavra; o Claude analisa os frames (fonte provável, cores, posição e animação da legenda, overlays, moldura) → rascunho de template → render de teste lado a lado → usuário ajusta. A fonte exata é aproximada (sugere a mais parecida do Google Fonts).
- **Base real (filmagem)**: transcrição, remoção de silêncios e tropeços, jump cuts, legendas animadas palavra a palavra, punch-in, b-roll, reframe para 9:16.
- **Compositing sobre filmagem** (quando houver talking head/produto filmado): tracking de ponto/planar com OpenCV ou CoTracker → corner pin (`matrix3d`); recorte de pessoa com SAM 2 / matting (RobustVideoMatting) para texto atrás do sujeito; chroma key e despill no ffmpeg (`chromakey`, `despill`). Regras já em `knowledge/video/efeitos.md` ("Com filmagem").
- **Produção em lote**: N vídeos com o mesmo template a partir de uma lista de roteiros.

## Marketing
- **Skill `ads-google`**: Pesquisa/RSA (15 títulos de até 30 caracteres e 4 descrições de até 90, validados por script), palavras-chave com correspondência, negativas, extensões; PMax/Display/Demand Gen; estrutura inicial simples; saída `campaigns/.../google-ads.md` (+ CSV para o Editor). Avaliar juntar com `ads-meta` numa skill `ads`.
- **Modo SaaS na skill `setup`**: ler site/LP, mapa funcionalidade → benefício → dor, diagnóstico rápido da LP atual.
- **Sistema de marca formal**: `tokens.json` como fonte única → CSS e JS.
- **Evolução do carrossel**: mais formatos (post único, stories, capas, thumbnails) e templates por empresa.

## Gestão
- **Interface visual em Vite** para gerenciar tudo (empresas, projetos, tarefas, ideias, peças exportadas), lendo os arquivos do repo. Só depois do MVP (12 posts da kz).
- **Inteligência de mercado** (anúncios de concorrentes semanais, monitoramento de redes e virais, tendências do Google, ranqueador econômico): análise e desenho em `INTEL.md`.
