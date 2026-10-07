# Galeria de motion (componentes em código)

Componentes genéricos (só tokens e parâmetros) para reaproveitar nos vídeos. O `produce.mjs` copia esta pasta para `render/<formato>/lib/motion/`, então a composição referencia `lib/motion/<categoria>/<id>/<arquivo>`. Tempos sempre vindos da timeline (`T.ev`), nunca escritos à mão. Cada item tem `meta.json` (parâmetros, eventos e SFX sugeridos, exemplo de uso).

| id | o que é | uso |
|---|---|---|
| `cta/navegador` | janela de navegador: aba abre, URL é digitada, cursor clica em Ir, barra carrega, página abre (logo + frase) | cartão final com site; pode passar do fim da locução |

Armadilha: o HyperFrames **embute** o JS na página. Nunca escreva a tag de fechamento de script dentro de um arquivo daqui (nem em comentário).
