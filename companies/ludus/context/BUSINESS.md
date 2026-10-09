# Negócio — ludus (Ludus)

> Fonte: resumo de negócio do Oliver (2026-10-09), montado só com o que está escrito no repositório do Ludus (`Desktop/git/ludus`). Funcionalidades em detalhe: `PRODUTO.md`.

## O que é
Sistema para quem dá aula organizar o que acontece antes, durante e depois da aula: alunos, agenda, planejamento, materiais, pagamentos e a própria videochamada, num lugar só. Promessa de marca: **"Tire sua escola da cabeça."** Variante: "Você cuida da aula. O Ludus organiza tudo ao redor dela."

Nomes internos: SchoolOS (parte para escolas) e Trilhas (modelo Duolingo, em laboratório). Ao público, só "Ludus".

## Origem
Nasceu como app educacional amplo (professores, escolas, autodidatas, empresas). O MVP foi estreitado para o **professor independente**, com a Gaby (professora de espanhol) como persona de referência.

## Estágio
Pré-lançamento, testes fechados. O MVP de cinco coisas (alunos, portal do aluno, agenda com recorrência, financeiro com pacote virando crédito, videochamada) existe de ponta a ponta no código, percorrido na tela em 2026-09-28.
**Não está em produção:** deploy pausado pelo dono em 2026-09-27. Hospedagem prevista: VPS em São Paulo, ~R$ 80/mês. Domínio: não definido.
Etapa só fecha quando o dono usa e diz que serve. Lançamento público "o quanto antes", sem data.

## Modelo e preço
**Preço: não definido.** A própria landing diz que ainda não há plano nem preço. Acesso **gratuito durante a fase de testes**, por fila de acesso antecipado, liberado aos poucos.
Já decidido para a cobrança futura: cobrar e limitar "do jeito que eu quiser"; vários modelos ao mesmo tempo (professor independente assina sozinho, escola paga cota, por usuário, pacote ou funcionalidade); plano para "uma escola de um professor autônomo e ponto final"; aluno freemium; faturamento provavelmente por Stripe.

## Oferta atual
Entrar na fila de acesso antecipado e testar de graça. Sem trial com prazo, sem garantia (não há cobrança).

## Funcionalidade → benefício → dor
| funcionalidade | benefício | dor |
|---|---|---|
| ficha do aluno com aulas, plano e financeiro | sabe onde cada aluno parou sem procurar | "lembrar onde cada aluno parou" |
| agenda com recorrência e remarcação por alcance | marca o semestre de uma vez, remarca sem refazer | remarcar e organizar a semana na mão |
| pacote de aulas que vira crédito, contas a receber | sabe quem pagou e quem deve | "pacote de aulas que vira conta de cabeça" |
| chamada, falta com regra de cobrança | a falta sem aviso cobra sozinha pela regra dele | discutir falta e reposição caso a caso |
| mensagens prontas e "Aulas de amanhã" no WhatsApp | lembra o aluno em um toque, pelo WhatsApp dele | responder e lembrar todo mundo, todo dia |
| videochamada ligada à aula | dá a aula sem procurar link | vídeo num lugar, agenda em outro |
| link sem login para o aluno (cobrança, confirmar aula, entrar na sala) | o aluno abre no celular, sem instalar nada | aluno que não instala app |
| matérias (roteiro reutilizável) | o método vira material que se reaproveita | material espalhado em pastas |

## Diferenciais
1. **Por dentro, mais completo que a Beaky:** pacote, crédito, parcelas, presença com regra de cobrança, despesas, relatório, vídeo próprio.
2. **A porta é o link:** tudo que vai ao aluno abre em qualquer celular, sem login e sem app.
3. **O professor decide, o sistema facilita:** sem gateway, sem confirmar pagamento sozinho, nada enviado sozinho (a mensagem sai pelo WhatsApp dele).
4. **A aula como centro:** liga ficha, agenda, plano, materiais, vídeo, presença, crédito e dinheiro.
5. **Videochamada própria**, de ponta a ponta, sem serviço de terceiros.
6. **Acabamento:** "um software nível Apple".

## Para quem não é / limitações
- Escola com equipe: não é o alvo do MVP (a tela de equipe e perfis foi adiada).
- Vídeo em grupo: a chamada hoje é de duas pessoas.
- Sem nota fiscal, sem gateway, sem baixa automática de pagamento (por decisão).
- Cobrança com "Já paguei", recibo e remarcação pelo aluno: em construção.
- Ainda não está no ar para o público.

## Links
- Landing: sem domínio público ainda.
- Repositório: `Desktop/git/ludus` (planos em `plan/`, concorrentes em `docs/reference/concorrentes-do-ludus.md`).

## Restrições e compliance
- LGPD: dados de alunos, inclusive menores. Abaixo de 12 anos, só o responsável recebe o convite.
- Nada do professor vai ao link do aluno além de uma lista fechada de campos; recibo sem CPF/CNPJ por padrão.
- Não prometer: preço, data de lançamento, automação de pagamento, nota fiscal, vídeo em grupo.

## A validar
- Preço, planos, nomes de plano e meta de receita.
- Data do lançamento público e domínio.
- Tamanho de mercado (quantos professores independentes, quanto pagam hoje).
- Se o conteúdo fala só com o professor independente (MVP) ou também com pequena escola e professor com método próprio (a landing fala mais largo).
