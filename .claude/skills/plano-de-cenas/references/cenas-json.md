# cenas.json (contrato do plano de cenas, tarefa 047)

Plano em formato de máquina. `node tools/video/plano.mjs check <pasta>` confere; `plano.mjs timeline <pasta>` gera a `timeline.json` (scenes com `use`, `on_screen`, `params`; events com `cue` e `word`), que o `tts.mjs` encaixa no áudio. Os campos de vídeo (`vo`, `use`, `on_screen`, `params`, `lead`/`tail`/`min`/`len`/`pause`, `camadas`) seguem `.claude/skills/video/references/blocos.md`.

```json
{
  "versao": 1,
  "nivel": "medio",
  "recorte": "Kz organiza a rotina do terapeuta autônomo num lugar só",
  "duracao_alvo": 30,
  "formatos": ["4x5", "9x16"],
  "entrada": { "tipo": "roteiro | transcricao | tema", "fonte": "roteiro.md", "tempos": false },

  "conceito": {
    "nome": "Peças que se juntam",
    "mundo": "a rotina é um quebra-cabeça espalhado; a kz é a peça que encaixa tudo",
    "motivo": "4 fragmentos (agenda, ficha, nota, mensagem)",
    "transicao": "match cut no motivo; hard cut na batida no resto",
    "curva": [3, 2, 1, 4, 3, 2, 1],
    "evitar": ["foguete", "gráfico subindo", "pessoa frustrada no notebook"],
    "alternativas": ["Dia em fast-forward: relógio que acelera…", "Mesa bagunçada vista de cima…"]
  },

  "vo": [{ "id": "f1", "text": "Você é terapeuta e ainda organiza sua rotina em vários lugares diferentes?" }],

  "ideias": [
    { "id": "i1", "fala": "f1", "trecho": "Você é terapeuta", "tipo": "pergunta", "ancora": "terapeuta",
      "emocao": "reconhecimento", "entender": "isto é para mim", "prova": null }
  ],

  "camadas": [{ "use": "fundo/blobs" }],

  "scenes": [
    {
      "id": "s1",
      "ideias": ["i1", "i2"],
      "block": "gancho",
      "intensidade": 3,
      "vo": ["f1"],
      "relacao": "complementa",
      "acrescenta": "a 'rotina em vários lugares' vira 4 pedaços que se espalham: dá forma ao problema",
      "motivo": "os 4 fragmentos nascem aqui, espalhados",
      "composicao": "4:5: pergunta no terço de cima, fragmentos em arco embaixo · 9:16: tudo no alto (legenda do Reels embaixo)",
      "olhar": "centro-alto",
      "poses": ["início: selo + 'Você é terapeuta?' grande no centro", "meio: a pergunta sobe e encolhe", "fim: 4 fragmentos espalhados em volta"],
      "use": "abertura/pergunta-fragmentos",
      "on_screen": "Você é *terapeuta*?|Sua rotina em *vários lugares* diferentes?",
      "params": {},
      "headline": "Você é terapeuta?",
      "icone": "stethoscope",
      "gestos": [
        { "cue": "entra", "at": 0.02, "o_que": "pergunta entra inteira com o selo", "sfx": "whoosh fino" },
        { "cue": "troca", "word": "f1:ainda", "offset": -0.12, "o_que": "pergunta sobe e dá lugar à segunda frase", "sfx": "swish" },
        { "cue": "espalha", "word": "f1:vários", "offset": -0.08, "o_que": "4 fragmentos saltam em cascata", "sfx": "4 pops" }
      ],
      "vivo": "fragmentos com deriva lenta",
      "entra": "1º quadro já com a pergunta (sem fade do preto)",
      "sai": "fragmentos ficam e caem na próxima (match no motivo)",
      "som": "whoosh · swish · pops",
      "fontes": [],
      "lead": 0.35, "tail": 0.25
    },
    {
      "id": "s7",
      "block": "cartão final",
      "intensidade": 1,
      "relacao": "mostra",
      "acrescenta": "onde encontrar: o site sendo aberto",
      "novo": { "tipo": "cta", "id": "navegador-kz", "spec": "aba abre, URL digitada, cursor clica Ir; slots: url|titulo; cues: entra, digita, clique", "slots": ["url", "titulo"], "cues": ["entra", "digita", "clique"] },
      "style_frame": "style/s7.png",
      "len": 3.5
    }
  ],

  "revisao": [{ "rodada": 1, "por": "agent:revisor (opus)", "nota": "29/36", "arquivo": "revisao-plano-1.md", "aplicado": "s3 trocada por contraste; motivo entra na s5" }],
  "status": "aguardando aval"
}
```

## Campos da cena
| campo | obrigatório | o que é |
|---|---|---|
| `id`, `ideias` | sim | id da cena (vira o da timeline) e as ideias que ela cobre |
| `block` | sim | função no arco: gancho · conceito · dor · produto · virada · revelação · prova · cartão final |
| `intensidade` | sim | 0–4 |
| `vo` ou `len` | sim | falas da cena ou duração sem fala |
| `relacao` | sim | `mostra` · `complementa` · `contrasta` · `prova` · `literal` (≤ 30%) |
| `acrescenta` | sim | o que a imagem diz que a fala não diz (vira `note` na timeline) |
| `motivo` | ≥ metade das cenas | como o motivo do conceito aparece ou evolui aqui |
| `composicao`, `olhar` | sim | layout nos 2 formatos; região do ponto de atenção |
| `poses` | sim | início · meio · fim |
| `use` ou `novo` | sim | bloco existente, ou bloco a criar com `tipo`, `id`, `spec`, `slots`, `cues` (+ `style_frame`) |
| `ajuste_bloco` | se `use` precisa mudar | o que muda no bloco existente (param novo, detalhe); feito depois do aval. Sem ele, param que o `bloco.json` não declara gera aviso |
| `on_screen`, `params` | sim / se houver | textos por slot (`|`, `*ênfase*`) e params do bloco |
| `headline`, `icone` | Padrões do Oliver | headline em tela de UI/cards; ícone Lucide de apoio por ideia |
| `gestos[]` | sim | `{ cue, word: "f1:palavra" \| at \| before_end, offset?, type?, o_que, sfx }`; todo cue do bloco precisa de um. A palavra é a **falada** (`say` quando existe); 2ª ocorrência: `"f1:palavra#2"` |
| `vivo` | se ficar > 1,5 s sem gesto | o que mantém a tela viva (deriva, partícula, câmera lenta) |
| `entra`, `sai` | sim | ligação com a cena anterior e a próxima |
| `som` | sim | resumo do som da cena (detalhe: `sound-designer`) |
| `fontes[]` | se afirma algo | `{ afirmacao, fonte, status }`; `a confirmar` bloqueia |
| `alternativas[]` | alto, intensidade ≥ 3 | 2 outras soluções em 1 linha cada |
| `lead`, `tail`, `min`, `len`, `pause` | não | tempos do layout (skill `video`) |
