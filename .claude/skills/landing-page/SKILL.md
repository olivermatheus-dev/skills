---
name: landing-page
description: Escreve e revisa páginas de conversão em pt-BR — landing page (LP) curta para tráfego pago, página de captura, carta de vendas longa (sales letter direct-response) e roteiro de VSL — a partir do contexto da empresa. Use quando o usuário pedir "landing page", "LP", "página de vendas", "carta de vendas", "sales letter", "página de captura", "VSL script", "roteiro de VSL" ou "revisar copy de página".
---

# Landing Page

Cria ou revisa a copy de uma página de conversão. Saída: um `.md` pronto para o designer/dev montar.

## Antes de começar

1. **Empresa:** pelo `CLAUDE.md`; na dúvida, perguntar.
2. **Ler** `companies/<slug>/context/`: `BUSINESS.md`, `AUDIENCE.md`, `VOICE.md`, `COPY.md` (obrigatórios), `COMPETITORS.md`; e `companies/<slug>/brand/BRAND.md` + `brand.css` para as notas de design.
3. Sem `COPY.md` ou `AUDIENCE.md`: pedir o mínimo (oferta, preço, público, dor principal, provas) ou sugerir a skill `setup`.
4. **Nunca inventar** provas, números, depoimentos, garantias ou prazos. Faltou → `[PROVA: ...]` / `[a confirmar]`.

## Escolher o formato

| Formato | Quando |
|---|---|
| **Página de captura** | Troca de isca (checklist, aula, lista de espera, diagnóstico) por contato |
| **LP curta** | Padrão. Tráfego pago, assinatura/ticket até ~R$ 300, agendamento, WhatsApp, "pedir acesso" |
| **Carta de vendas longa** | Ticket alto (≳ R$ 500 ou anual caro), oferta nova e complexa, público cético |
| **Roteiro de VSL** | Mesma lógica da carta, quando o público consome melhor vídeo |

Público pouco consciente (níveis 1–3) **não muda o formato** de uma oferta barata: muda o peso. Na LP curta, aumente Problema + Mecanismo e abra pela dor, não pelo produto. Na dúvida, LP curta.

## Processo

1. **Definir em 5 linhas e mostrar antes de escrever:** objetivo (1 ação) · persona · nível de consciência · oferta (o que, preço, garantia) · fonte de tráfego + ângulo do anúncio.
2. **Escrever** na estrutura abaixo, seguindo as regras de escrita.
3. **QA:** `references/qa-copy.md`. Corrigir antes de entregar.
4. **Salvar** em `companies/<slug>/campaigns/AAAA-MM-DD-<campanha>/` como `lp.md`, `carta.md` ou `vsl.md` (pasta existente da campanha, se houver).

## Estruturas

### Página de captura
1. Headline com a promessa da isca + sub (o que recebe, quando)
2. Formulário (2–3 campos) + botão com benefício
3. 3 bullets do que recebe
4. Prova curta (quem fala / número real)
5. Privacidade + o que acontece depois do envio

### LP curta
1. **Hero:** headline (mesma promessa do anúncio) + sub + CTA + imagem/vídeo do produto
2. **Prova rápida:** número, logos, mídia ou autoridade
3. **Problema:** a dor nas palavras do público + custo de não resolver
4. **Mecanismo:** por que isto funciona quando o resto falhou (vilão → virada)
5. **3 benefícios** (benefício + "o que isso significa")
6. **Como funciona:** 3 passos até o primeiro resultado
7. **Prova social:** depoimentos/resultados
8. **Oferta + garantia + CTA** + FAQ (3–5 objeções do `COPY.md`)

**Sem prova?** Não deixe seção vazia nem página cheia de marcadores: corte a seção 7, use na 2 a autoridade que existe (fundador, tempo de desenvolvimento, quem está no time) e liste as provas a coletar em Pendências.

### Carta de vendas longa
Headline + lead (nomeia o vilão) → história/identificação → problema + mecanismo da falha ("não é culpa sua") → mecanismo único → prova → oferta empilhada com âncora antes do preço → bônus (cada um mata uma objeção) → garantia → escassez **só se real** → FAQ (não funciona / não pra mim / não consigo / não posso pagar / não confio) → P.S. (promessa + garantia + CTA). CTA a cada bloco grande.

### Roteiro de VSL
Mesma sequência da carta, falada: hook que nomeia o vilão (0–30 s) → promessa → por que me ouvir → história do vilão → revelação do mecanismo → prova → oferta + objeções + CTA. Falas curtas, `[TELA: ...]` para o apoio visual. Se o vídeo for em motion, o roteiro vira briefing da skill `video`.

## Regras de escrita

- **Um objetivo, um CTA principal.** Secundário só se não competir.
- **Congruência:** a headline do hero repete a promessa do criativo que traz o tráfego.
- Palavras literais do público (`AUDIENCE.md`) e tom do `VOICE.md`. Big idea, mecanismos, objeções, value stack, provas e CTAs vêm do `COPY.md`, sem reinventar.
- Benefício antes de característica; concreto > vago; frases curtas; parágrafos de 1–3 linhas (celular).
- Botão com verbo + benefício ("Pedir meu acesso", "Falar no WhatsApp"), nunca "Enviar".
- Brasil: R$, parcelamento quando houver, Pix, WhatsApp quando fizer sentido.

## Formato de saída

```markdown
# <Página> — <formato>
**Objetivo:** ... | **Público:** ... | **Consciência:** ... | **Tráfego:** ...
**Oferta:** ... | **CTA principal:** ...

## Headlines para teste A/B
- A: ... (ângulo) · B: ... · C: ...

## Seção 1 — Hero
**Headline:** ... **Sub:** ... **CTA:** ...
> Design: imagem, posição do botão, o que aparece no celular sem rolar.

## Seção 2 — ...

## Pendências
## QA
```

## Revisar copy existente
Ler a copy + contexto → rodar `references/qa-copy.md` → entregar problemas por prioridade, correções (antes → depois) e 2–3 headlines. Salvar `revisao-lp.md` na pasta da campanha, se houver.

## Nichos regulados
Saúde, finanças e afins: **sempre** o check de compliance do QA. Na dúvida, sinalizar em Pendências em vez de publicar.
