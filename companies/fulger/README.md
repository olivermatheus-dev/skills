# Molde de empresa

Copiado pela skill `setup` ao cadastrar uma empresa: `cp -r companies/_modelo companies/<slug>`.

```
context/          6 arquivos de estratégia (criados pela skill setup)
brand/            BRAND.md (regras) · brand.json (tokens) → brand.css (gerado: `npm run brand -- <slug>`) · logo/ icons/ vectors/ fonts/ photos/ screenshots/
video-templates/  templates de vídeo da empresa
contents/         AAAA-MM-DD-<tema>/  peças de conteúdo
campaigns/        AAAA-MM-DD-<campanha>/  anúncios, LPs, cartas
board/            Kanban: 1 arquivo por tarefa (T-NNNN-<slug>.md) + recorrentes.json — ver skill orquestrar
```

Nomes de arquivo de marca: `logo-<horizontal|vertical|simbolo>-<cor|branco|preto>.svg`, `icone-<nome>.svg`, `foto-<assunto>-NN.jpg`, `tela-<funcionalidade>-NN.png`.
