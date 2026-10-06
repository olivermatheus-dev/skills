# QA de Copy

Checklist usado por `landing-page` e `ads-meta`. Rodar antes de entregar. Corrigir o que falhar; o que não der para corrigir vai para **Pendências**.

## 1. Seven Sweeps (revisão em 7 passadas)

Uma passada por vez. Depois de cada uma, conferir se as anteriores continuam ok.

- [ ] **Clareza:** dá para entender na primeira leitura? Uma ideia por seção, sem jargão, sem frase tentando dizer tudo.
- [ ] **Voz e tom:** consistente com `VOICE.md` do início ao fim? Sem trechos que viram "corporativo" do nada.
- [ ] **E daí?:** toda característica tem a ponte "o que significa que..." até um benefício que o leitor sente.
- [ ] **Prove:** toda afirmação forte tem prova perto (número, depoimento, caso, autoridade, garantia)? Sem prova → suavizar ou marcar `[PROVA]`.
- [ ] **Especificidade:** troque vago por concreto ("economize tempo" → "4 horas por semana"). O que não dá para tornar específico provavelmente é enchimento: cortar.
- [ ] **Emoção:** o "antes" está vívido? Há micro-história, cena, palavras do público? Emoção a serviço da mensagem, sem manipular.
- [ ] **Risco zero:** perto de cada CTA, as dúvidas estão respondidas? Garantia, o que acontece depois do clique, privacidade, formas de pagamento.

## 2. CRO da página (7 pontos, em ordem de impacto)

- [ ] **Proposta de valor:** em 5 segundos dá para saber o que é, para quem e por que importa?
- [ ] **Headline:** específica, orientada a resultado e **igual à promessa do anúncio** que traz o tráfego.
- [ ] **CTA:** um CTA principal, visível sem rolar (no celular), texto com benefício, repetido nos pontos de decisão.
- [ ] **Hierarquia visual:** quem só escaneia (títulos, negritos, bullets) entende a mensagem? Espaço em branco, imagens que ajudam.
- [ ] **Prova social:** depoimentos com nome/foto/resultado específico, perto dos CTAs e depois das promessas.
- [ ] **Objeções:** as 5 universais tratadas (não funciona / não pra mim / não consigo / não posso pagar / não confio) via FAQ, garantia, comparação, "como funciona".
- [ ] **Fricção:** navegação/links de saída removidos, carregamento rápido, layout mobile ok, próximo passo óbvio.

## 3. Formulário (se houver)

- [ ] Só os campos indispensáveis agora (ideal 2–3). Cada campo extra derruba conversão; o resto se pergunta depois.
- [ ] WhatsApp só se for usado de fato; com máscara de telefone BR.
- [ ] Uma coluna, labels claros, uma pergunta por campo.
- [ ] Valor da troca explícito acima do formulário.
- [ ] Botão com benefício ("Quero receber a aula"), não "Enviar".
- [ ] Linha de privacidade (LGPD) + o que acontece depois do envio (página de obrigado / mensagem no WhatsApp).

## 4. Compliance (obrigatório)

- [ ] **Promessas:** nada de resultado garantido, cura, renda garantida ou prazo certo para resultado individual.
- [ ] **Saúde:** checar o conselho da profissão.
  - Psicologia (CFP/CRP): sem promessa de resultado, sem depoimentos de pacientes, sem sensacionalismo; CRP visível.
  - Medicina (CFM): sem antes-e-depois, sem garantia de resultado, sem depoimento de paciente; CRM + RQE do responsável.
  - Nutrição (CFN/CRN), odontologia (CFO), estética e afins: mesmas cautelas; checar regra específica.
- [ ] **Depoimentos:** reais, autorizados e com "resultados podem variar" quando aplicável. Nunca inventados.
- [ ] **Escassez/urgência:** só se for verdadeira (prazo, vagas, lote).
- [ ] **Preço e condições:** claros, sem letra miúda que contradiga a página (CDC).
- [ ] **Meta Ads:** sem atributos pessoais ("Você está ansioso?"), sem antes-e-depois, sem promessa irreal de dinheiro/saúde.

Se algum item de compliance ficar em dúvida: **sinalizar em Pendências e não publicar** até o cliente validar.

## Saída do QA

Na entrega, incluir um bloco curto:

```markdown
## QA
- Sweeps: ok / ajustes feitos: ...
- CRO: ok / pontos de atenção: ...
- Formulário: ok / n.a.
- Compliance: ok / PENDENTE: ...
```
