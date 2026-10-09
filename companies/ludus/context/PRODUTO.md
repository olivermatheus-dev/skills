# Produto — ludus (registro de funcionalidades)

> **Registro factual** do que o Ludus tem, para travar promessa falsa em qualquer peça. Não é copy.
> Fonte: resumo do Oliver de 2026-10-09 (repositório `Desktop/git/ludus`). *No ar* = existe no código; **não quer dizer publicado na internet** (o deploy está pausado). Reconferir antes de usar em peça.

## 1. No ar (no código)
| área | o que faz |
|---|---|
| Cadastro e ficha do aluno | cria, busca, edita, arquiva; ficha com resumo, objetivo, rosto, abas de aulas, plano e financeiro |
| Convite e acesso do aluno | link gerado pelo professor, aluno cria conta e liga à ficha; abaixo de 12 anos só o responsável recebe |
| Agenda | semana, dia e mês; marcar, remarcar, cancelar; recorrência "toda semana por N semanas" com alcance (só esta, próximas, todas); indisponibilidade e férias; painel do dia; relatório |
| Aulas | presença, concluir e desfazer, "avisou"; falta sem aviso cobra, experimental não |
| Planejamento do aluno | quadro visual das aulas, com última aula dada e seção sem data (em evolução) |
| Financeiro | livro de entradas e saídas (corrige com lançamento contrário), contas a receber e a pagar, meios de pagamento, categorias, pacote que vira crédito, estorno, relatórios |
| Matérias | matéria → módulos → tópicos → materiais, árvore lateral, arrastar e soltar |
| Mensagens prontas | modelos de WhatsApp editáveis, com variáveis e prévia (aniversário, convite) |
| Lembrete de aula | "Aulas de amanhã" abre o WhatsApp com a mensagem; agenda assinável no Google ou iPhone |
| Chamada de vídeo | sala própria por aula, WebRTC, aluno entra pelo app (2 pessoas) |
| App do aluno (`/student`) | básico: próximas aulas de todos os professores, lista de professores, entrar na sala |
| Páginas sem login | cobrança (`/pagar`), confirmação de aula (`/confirmar`), convidado na sala |
| Tutoriais e central de ajuda | rotas existem; acabamento não confirmado |
| Turmas e aulas em grupo | turma, matrícula, presença; tratado como v2 ("Em desenvolvimento" no menu) |

## 2. Em desenvolvimento
Cobrança ao aluno (falta gerar e acompanhar, "Já paguei" com comprovante, conciliação, recibo) · recibo oficial e imposto (Carnê-Leão, faturamento do MEI; sem nota fiscal) · sala de aula online refeita · reposição completa e "Avisou" pelo aluno · série sem fim e "Estender" · programas e percurso do aluno · redesenho de Matérias · Jornal do professor (resumo semanal/mensal) · central de suporte com chamados · agenda: ocupação e semana típica · estado da aula ("Faltou", pagamento por ícone) · vídeos de lançamento.

## 3. Só planejado
Convite por e-mail e acesso sem senha · área do aluno completa (cobranças, recibos, materiais, remarcação) · página pública do professor com aula experimental · IA em pontos específicos (nota pós-aula, relatório do mês, exercício) · criador de materiais · exercícios e motor de Trilhas · assinatura do Ludus · tela de equipe e permissões · acessibilidade ampla · portal white label · vídeo em grupo.

## 4. Fora por decisão
Gateway de pagamento e baixa automática (nunca) · nota fiscal · saldo do pacote no app do aluno (fora do MVP) · cor da marca do professor nas páginas do aluno.

## Log
- 2026-10-09: criado a partir do resumo de negócio.
