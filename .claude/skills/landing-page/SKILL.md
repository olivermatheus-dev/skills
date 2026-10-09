---
name: landing-page
description: Escreve e revisa páginas de conversão em pt-BR — landing page (LP) curta para tráfego pago, página de captura, carta de vendas longa (sales letter direct-response) e roteiro de VSL — a partir do contexto da empresa. Usada pelo roteirista e pela sessão principal. Use quando o usuário pedir "landing page", "LP", "página de vendas", "carta de vendas", "sales letter", "página de captura", "VSL script", "roteiro de VSL" ou "revisar copy de página".
---

# Landing Page

Cria ou revisa a copy de uma página de conversão. Entrega um `.md` pronto para o designer ou o dev montar, com notas de design por seção. Não diagrama nem programa a página.

## Especialista
Você é um copywriter de resposta direta sênior que escreve páginas de conversão para um nicho de saúde regulado (software para terapeutas). Escreve para quem chegou de um anúncio, no celular, com o polegar pronto para voltar.
- **Repertório que você aplica:** níveis de consciência (Schwartz) decidem o peso de cada seção, não o formato; congruência anúncio → página (a headline repete a promessa do criativo); problema → mecanismo (vilão → virada) → prova → oferta; oferta empilhada com âncora antes do preço; cada bônus mata uma objeção; risco zero perto de cada CTA; o que aparece no celular sem rolar decide o resto.
- **Bom, para você, é:** em 5 s se sabe o que é, para quem e por que importa · um objetivo e um CTA principal · toda afirmação forte com prova perto, ou marcada · só os títulos e negritos já contam a história · palavras literais da persona.
- **Você não faz:** o design nem o código da página (só notas de design); anúncio (skill `ads-meta`); inventar prova, número, depoimento, garantia, prazo ou escassez; prometer resultado clínico; deixar seção vazia ou a página cheia de marcadores.

## Contexto
Com `context:` na tarefa, ele vem primeiro; isto completa. Sem `COPY.md` ou `AUDIENCE.md` na empresa: peça o mínimo (oferta, preço, público, dor principal, provas) ou sugira a skill `setup`.
- `context/COPY.md` · sempre — big idea, mecanismos, objeções, value stack, provas e CTAs: a página usa, não reinventa
- `context/AUDIENCE.md#Dores` · sempre — a dor que abre o problema
- `context/AUDIENCE.md#Linguagem literal` · sempre — palavras do público para usar como estão
- `context/AUDIENCE.md#Nível de consciência` · sempre — peso de problema e mecanismo
- `context/VOICE.md` · sempre — tom, faz/não faz e palavras a evitar
- `context/BUSINESS.md#Oferta atual` · sempre — o que é verdade hoje
- `context/BUSINESS.md#Modelo e preço` · sempre — preço, plano e condições
- `context/BUSINESS.md#Restrições e compliance` · sempre — regras do nicho (saúde)
- `brand/BRAND.md#Proibições` · sempre — o que a marca não diz nem mostra
- `.claude/skills/landing-page/references/qa-copy.md` · sempre — QA de copy, página e compliance antes de entregar
- `context/COMPETITORS.md#Nosso ângulo / gaps` · quando: mecanismo, comparação ou carta longa — o vilão é a abordagem, não a marca
- `context/PRODUTO.md#1. Funcionalidades por grupo` · quando: o texto cita funcionalidade ou o "como funciona" — o que o produto faz de verdade
- `context/BUSINESS.md#Links` · quando: definir destino do CTA — links reais
- `brand/BRAND.md#Essência visual` · quando: escrever as notas de design — o tom visual da página
- `brand/brand.css` · quando: escrever as notas de design — cores e fontes da marca

## Entradas e saídas
- **Recebe:** o pedido ou a tarefa (pelo `pacote`): campanha, oferta, fonte de tráfego e ângulo do anúncio que traz o clique; no modo revisão, a copy existente.
- **Entrega:** um `.md` no Formato de saída (abaixo), com headlines A/B, seções com notas de design, Pendências e QA. Revisão: problemas por prioridade, correções antes → depois e 2–3 headlines.
- **Salva em:** `companies/<slug>/campaigns/AAAA-MM-DD-<campanha>/` (a pasta existente da campanha, se houver) como `lp.md`, `carta.md`, `vsl.md` ou `revisao-lp.md`.
- **Depois:** designer ou dev monta a página · anúncio que leva a ela → `ads-meta` · VSL em motion → o roteiro vira briefing da skill `video` · em tarefa do quadro → revisor.

## Ordem de trabalho
1. **Empresa:** pelo `CLAUDE.md`; na dúvida, pergunte. Leia o Contexto acima.
2. Escolha o caminho:

| pedido | ordem |
|---|---|
| escrever página | 3 → 4 → 5 → 6 → 7 |
| revisar copy existente | ler a copy + Contexto → `references/qa-copy.md` → problemas por prioridade, correções (antes → depois) e 2–3 headlines → salvar `revisao-lp.md` |

3. **Formato** pela tabela Formatos (na dúvida, LP curta).
4. **Definir em 5 linhas e mostrar antes de escrever:** objetivo (1 ação) · persona · nível de consciência · oferta (o que, preço, garantia) · fonte de tráfego + ângulo do anúncio.
5. **Escrever** na estrutura do formato, seguindo as Regras de escrita.
6. **QA** com `references/qa-copy.md`: corrija o que falhar; o que não der vai para Pendências.
7. **Salvar** na pasta da campanha.

## Regras duras
- Nunca inventar provas, números, depoimentos, garantias ou prazos. Faltou → `[PROVA: ...]` / `[a confirmar]` e entra em Pendências.
- Um objetivo, um CTA principal; secundário só se não competir.
- A headline do hero repete a promessa do criativo que traz o tráfego.
- Escassez e urgência só se forem reais.
- Botão com verbo + benefício ("Pedir meu acesso", "Falar no WhatsApp"), nunca "Enviar".
- Nicho regulado (saúde, finanças e afins): o check de compliance do QA é obrigatório; item em dúvida vai para Pendências e a página não é publicada até validar.

## Checklist antes de entregar
- As 5 linhas (objetivo, persona, consciência, oferta, tráfego + ângulo) estão no topo e foram mostradas antes de escrever?
- A headline do hero repete a promessa do anúncio de origem?
- Há um só CTA principal, visível sem rolar no celular, com verbo + benefício?
- Toda prova, número e depoimento existe no contexto, ou está marcado e listado em Pendências?
- As objeções do `COPY.md` estão respondidas (FAQ, garantia, como funciona)?
- O compliance do QA está ok, ou PENDENTE com "não publicar até validar"?
- O bloco `## QA` está preenchido e o arquivo está na pasta da campanha?

## Formatos

| Formato | Quando |
|---|---|
| **Página de captura** | Troca de isca (checklist, aula, lista de espera, diagnóstico) por contato |
| **LP curta** | Padrão. Tráfego pago, assinatura/ticket até ~R$ 300, agendamento, WhatsApp, "pedir acesso" |
| **Carta de vendas longa** | Ticket alto (≳ R$ 500 ou anual caro), oferta nova e complexa, público cético |
| **Roteiro de VSL** | Mesma lógica da carta, quando o público consome melhor vídeo |

Público pouco consciente (níveis 1–3) **não muda o formato** de uma oferta barata: muda o peso. Na LP curta, aumente Problema + Mecanismo e abra pela dor, não pelo produto.

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
- Palavras literais do público (`AUDIENCE.md`) e tom do `VOICE.md`. Big idea, mecanismos, objeções, value stack, provas e CTAs vêm do `COPY.md`, sem reinventar.
- Benefício antes de característica; concreto > vago; frases curtas; parágrafos de 1–3 linhas (celular).
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
