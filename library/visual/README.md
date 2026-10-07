# Biblioteca visual (global)

Recursos visuais **compartilhados entre as empresas**: ícones, mapas, bandeiras, logos de terceiros e ilustrações. O que é **da marca** fica em `companies/<slug>/brand/`.
**Ordem de busca:** asset oficial → marca → esta biblioteca → pack compatível → criar. Ver `knowledge/video/infograficos-e-dados.md` §6.

```
library/visual/
  icons/<pack>/          um pack por pasta (uma família = mesmo traço, raio e preenchimento)
  maps/                  SVGs mestres (nunca editar; copiar para a pasta do vídeo e adaptar)
  flags/                 bandeiras (mesmo estilo e proporção)
  logos/                 logos oficiais de terceiros (concorrentes, parceiros, integrações)
  illustrations/         ilustrações com licença
  fx/<tipo>/             efeitos de integração e atmosfera: grain, smoke, fog, dust, light-leaks, bokeh, lens-dirt, reflections (arquivos pesados ficam locais; metadados em `fx/fx.json`: tipo, densidade, velocidade, escala, caráter, direção, profundidade, loop, alpha/preto, licença)
  README.md              este arquivo + registro de licenças (abaixo)
```

## Fontes sugeridas (confirme a licença atual antes de usar)
| tipo | fonte | licença (aprox.) |
|---|---|---|
| ícones | Lucide · Phosphor · Tabler | ISC/MIT (uso comercial livre) |
| mapa-múndi / países | Natural Earth | domínio público |
| Brasil, estados e municípios | malhas do IBGE (converter para SVG) | dados públicos (citar IBGE) |
| bandeiras | flag-icons | MIT |
| ilustrações | unDraw e similares | conferir termos (alguns proíbem revenda ou uso em marca) |
| logos de terceiros | kit de imprensa oficial de cada empresa | uso nominativo/editorial; seguir o guia da marca |

## Registro de licenças
| pasta/arquivo | origem (URL) | licença | atribuição exigida? | data |
|---|---|---|---|---|
| | | | | |

**Sem licença registrada, não usa** (mesma regra da biblioteca de áudio).
