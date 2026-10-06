# Visual — kz

Calma antes de impacto. Fundo claro creme, coral só como destaque, pastéis suaves, cantos arredondados e muito respiro. Peças de conteúdo usam sempre o modo claro (o dark mode existe só dentro do app). Tokens tirados do CSS de kz.app.br (Mantine).

## Cores
| Cor | Hex | Uso |
|---|---|---|
| Coral (marca) | #ef7960 | CTA, destaque, links. Em pontos, nunca em blocos grandes |
| Coral profundo | #d66954 (#bc5a47 p/ AAA) | texto de ênfase sobre claro |
| Coral suave | #fce0d7 / #fef2ee | fundos de tag e de realce |
| Creme | #faf8f5 | fundo padrão de todas as peças |
| Branco | #ffffff | cards, superfícies |
| Creme escuro | #f4f1ec | seções secundárias |
| Texto | #2b2b2b | texto principal |
| Texto 2 / 3 | #5a5a5a / #8a8a8a | descrições / metadados |
| Borda | #e8e4dc | bordas |
| Pastéis | sage #cfe0d0 · lavanda #d8d2e3 · céu #cdd8e0 · manteiga #f1e7c9 · rosa #f1d6cc · argila #ddcfc2 | categorias, apoios |

Nunca usar cores digitais puras (#FF0000, #00FF00 etc.) nem coral, vermelho e amarelo na mesma peça.

## Tipografia
**Montserrat** (Google Fonts, pesos 300–800) em tudo. Títulos 700 com line-height 1.15 e letter-spacing −0.01em. Subtítulos 600. Corpo 400 com line-height 1.6. Sem caixa alta em texto longo, sem peso 900, sem serifa. Em email, Arial como alternativa.

## Imagem
- **Foto:** luz natural, tons quentes, mulheres em consultório acolhedor (escutando, escrevendo, lendo), close médio em mãos e expressão. Nada de banco de imagens corporativo, aperto de mão ou gráfico subindo.
- **Ilustração:** orgânica e abstrata, traço leve, curvas, paleta coral + pastéis. Nada de foguete nem personagens corporativos.
- **Ícones:** Lucide ou Phosphor, linha de 1.5 px, cantos arredondados
- **Carrossel:** 1080×1350, margem de 80 px ou mais, título Montserrat 700 com coral em destaque

## Tokens CSS
```css
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
:root{
  --bg:#faf8f5;
  --surface:#ffffff;
  --surface-2:#f4f1ec;
  --text:#2b2b2b;
  --muted:#5a5a5a;
  --subtle:#8a8a8a;
  --border:#e8e4dc;
  --primary:#ef7960;
  --primary-deep:#d66954;
  --accent:#d66954;
  --accent-soft:#fce0d7;
  --pastel-sage:#cfe0d0;
  --pastel-lavender:#d8d2e3;
  --pastel-rose:#f1d6cc;
  --font-heading:"Montserrat",-apple-system,"Segoe UI",Roboto,Arial,sans-serif;
  --font-body:"Montserrat",-apple-system,"Segoe UI",Roboto,Arial,sans-serif;
  --radius:16px;
  --radius-sm:10px;
  --shadow:0 8px 24px rgba(43,43,43,.08);
}
```

## A validar
- Logotipo está em revisão: faltam variações, área de proteção e versões monocromáticas
- O creme #faf8f5 funciona bem nas peças reais?
- Biblioteca de ilustrações própria e templates no Figma/Canva
- Fonte display alternativa para peças especiais
