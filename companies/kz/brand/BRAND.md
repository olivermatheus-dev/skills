# Marca — kz

> Tokens em `brand.css`. Aqui, como usar. Precedência: isto vence o default das skills.

## Essência visual
**Calma antes de impacto.** Fundo creme, coral só como destaque, pastéis suaves, cantos arredondados e muito respiro. Acolhedor, nunca corporativo. Peças sempre no modo claro (o modo escuro existe só dentro do app).

## Cores
| token | hex | papel / significado |
|---|---|---|
| --bg | #faf8f5 | creme — fundo padrão de todas as peças |
| --surface | #ffffff | cards, janelas do app |
| --surface-2 | #f4f1ec | seções secundárias |
| --text | #2b2b2b | títulos e frases |
| --muted | #5a5a5a | rótulos pequenos dentro do app |
| --primary | #ef7960 | coral da marca: CTA, logo, ponto de destaque. **Em pontos, nunca em blocos grandes** |
| --on-primary | #2b2b2b | texto sobre coral. **Nunca branco sobre coral** (2,8:1, ilegível) |
| --primary como texto | — | **não usar coral #ef7960 como cor de texto** (2,6:1 sobre o creme) |
| --accent | #d66954 | coral profundo: palavra de ênfase sobre fundo claro (#bc5a47 se precisar de AAA) |
| --accent-soft | #fce0d7 | fundo de tag e de realce |
| pastéis | sage #cfe0d0 · lavanda #d8d2e3 · céu #cdd8e0 · manteiga #f1e7c9 · rosa #f1d6cc · argila #ddcfc2 | categorias e apoios (ex.: tipos de sessão na agenda), nunca fundo da peça inteira |

## Texto
- Título e frase em `--text`. Ênfase: 1 palavra por título em `--accent` (3,3:1 sobre o creme: só em título grande, nunca em texto corrido).
- Montserrat em tudo: títulos 700 (line-height 1.15, −0.01em), subtítulos 600, corpo 400 (line-height 1.6).
- Sem caixa alta em texto longo. Sem peso 900. Sem serifa.

## Fundo
Liso, creme `--bg`. Profundidade com cards brancos e sombra suave.

## Formas
Raio 16 px (cards) e 10 px (chips e botões pequenos). Sombras suaves (`--shadow-md` padrão). Bordas `--border` 1 px.

## Logo
Arquivos em `logo/` — **pendente** (logo estava em revisão em abr/2026; aguardando versão final em SVG).

## Imagem, ícones e ilustração
- **Foto:** luz natural, tons quentes, terapeutas em consultório acolhedor (escutando, escrevendo, lendo), close médio em mãos e expressão.
- **Ilustração:** orgânica e abstrata, traço leve, curvas, paleta coral + pastéis.
- **Ícones:** Lucide ou Phosphor, linha 1,5 px, cantos arredondados.

## Movimento
Mais calmo que o default: preferir molas `GENTLE`/`FAST`, evitar `SOFT` com passagem grande e chicotes agressivos. Nada de partículas festivas, exceto confirmação de pagamento/agendamento.

## Som (identidade sonora)
- **Eixos:** orgânico (mais que digital) · suave · minimalista · elegante · natural · quente. Coerente com "calma antes de impacto".
- **Trilha:** acolhedora, 70–95 BPM, piano/cordas leves/pads quentes; nada épico ou agressivo.
- **Efeitos:** clicks e pops discretos de UI, *air* suave para movimento, soft impacts só na revelação, notificação/sucesso gentil (sem "plim" estridente). Famílias: a definir ao montar a biblioteca.
- **Proibido:** bass drop, sirene, glitch agressivo, risada pronta.
- A validar com o Oliver.

## Vídeo
- Formatos padrão: 4:5 e 9:16.
- Voz: rascunho `edge-thalita` (Thalita, grátis); final da ElevenLabs a escolher. Escolha em `brand/voices.json`, catálogo em `library/voices/`. Pronúncia de "kz" na locução: a definir (até lá, a voz não fala o nome).
- Trilha: calma/acolhedora (70–95 BPM).
- Elenco fictício para dados de demonstração: a definir (nomes de terapeutas e pacientes, sempre marcados como ilustrativos).

## Proibições
- Cores digitais puras (#FF0000, #00FF00 etc.); coral, vermelho e amarelo juntos na mesma peça.
- Banco de imagens corporativo, aperto de mão, gráfico subindo, foguete, personagens corporativos.
- Promessas de resultado terapêutico ou uso de depoimento de paciente (regras CFP/CRP — ver `context/BUSINESS.md`).

## Aprendizados
- 2026-10-07 (teste do kit): o ponto/ênfase do logotipo em texto usa `--accent`, nunca `--primary` (coral como texto reprova contraste).

## A validar
- Logo final e variações (horizontal, símbolo, branco); área de proteção.
- O creme #faf8f5 funciona bem nas peças reais?
- Cores de status (`--success/--warning/--danger`) são estimativas — confirmar com o CSS do app.
