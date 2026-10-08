# Produto — kz (inventário de funcionalidades)

> **Fonte única do que a kz faz hoje.** Nenhuma peça mostra ou promete funcionalidade que não esteja aqui como `pronta`. Alimenta a série 8 (kz na prática), os mockups, a carta de vendas, a LP e os anúncios. O produto está em desenvolvimento: telas, painéis e visual ainda vão mudar, então reconferir antes de cada print ou peça.
>
> **Levantamento:** 2026-10-07, navegação só de leitura no app logado (kz.app.br, conta do Oliver) por subagente. Sem dado de paciente registrado.
> **Maturidade:** `pronta` (em uso, pode divulgar) · `pronta, sem uso` (existe, mas não estava configurada na conta) · `oculta` (no código, escondida: **não divulgar**) · `não existe`.

## 1. Funcionalidades
| # | funcionalidade | o que faz / como funciona | onde fica | dor que resolve | benefício em 1 frase | maturidade |
|---|---|---|---|---|---|---|
| 1 | **Tela de atendimento** (Sessão Inteira) | videochamada própria à esquerda; à direita relógio, próximo compromisso e abas **Anotações** (ao vivo), **Histórico** (notas das sessões anteriores) e **Cliente** (dados); botão Compartilhar gera o link da sala para o paciente; alterna Online/Presencial; "Finalizar sessão" encerra a chamada e conclui a sessão | `/customer/:id/session/:sid` | "procurando aquela anotação 2 min antes da sessão" · alternar 4 apps durante o atendimento | Vídeo, anotação e histórico do paciente na mesma tela. | pronta (vídeo não testado: câmera bloqueada no navegador da IA) |
| 2 | **Videochamada com sala de espera** | o paciente abre o link `kz.app.br/call/…`, digita o nome e entra na sala de espera; o terapeuta vê em tempo real quem chegou, mesmo sem sessão agendada; a chamada acontece dentro da kz | `/waiting-room` + tela de atendimento | "passei a noite atrás de link" | Sem Meet, sem Zoom, sem caçar link. | pronta |
| 3 | **WhatsApp automático** (API oficial da Meta) | **Agenda do dia** para o terapeuta (no mesmo dia ou na véspera, horário escolhido) e **confirmação de sessão** automática para o terapeuta e para o paciente antes de cada sessão | Preferências → WhatsApp | "perco paciente por esquecer" | O lembrete e a sua agenda chegam sozinhos no WhatsApp. | agenda do dia: pronta e rodando (5 terapeutas recebem hoje) · confirmação ao paciente: pronta, desligada na conta do Oliver; horário do lembrete ao paciente não é configurável na tela |
| 4 | **Agenda** | visões dia, semana, mês e ano; online ou presencial; duração com atalhos (50 min, 1h40); **recorrência semanal, quinzenal ou mensal** com data de término; mini-calendário com a agenda do dia ao agendar; reagendar e cancelar pelo evento | `/calendar` + modal Agendar | "marquei dois no mesmo horário" | Agende uma vez e a recorrência monta a semana. | pronta (bloqueios/exceções: não vistos na tela) |
| 5 | **Registro de sessão** (prontuário) | por sessão: tema, observações e editor de texto rico com abas **Notas** e **Planejamento**, salvamento automático; concluir, reabrir; linha do tempo das sessões com status coloridos e busca por data, tema ou conteúdo | `/customer/:id/sessions/:sid` | "paciente pediu a nota e levei um dia para achar" | Cada sessão registrada e encontrada em segundos. | pronta |
| 6 | **Sessão rápida** | atende sem agendar: escolhe o cliente e vai direto para a tela de atendimento; vira registro só quando o terapeuta escreve | botão no topo, atalho, ficha do cliente | encaixe de última hora | Atender agora, sem passar pela agenda. | pronta |
| 7 | **Painel do dia** | saudação, nº de sessões do dia, próxima sessão com contagem regressiva, "Iniciar sessão" e "Ver prontuário" a 1 clique, sessões de hoje e futuras, atalhos (sessão rápida, agendar, novo cliente, nova anotação), clientes frequentes, aniversários dos próximos 30 dias | `/app` | "abro 4 apps para saber o que tenho hoje" | Abra a kz e saiba o que vem agora. | pronta |
| 8 | **Cadastro e ficha do cliente** | cadastro rápido só com o nome; ficha completa em seções: dados pessoais (inclui nome preferido, pronome, identidade de gênero), contato, endereço, contato de emergência, **saúde geral** (doenças, medicamentos, alergias, histórico cirúrgico), **hábitos** (álcool, fumo, atividade física, jogos e apostas), histórico psicológico e médico familiar | `/customer/list`, `/customer/:id/details` | dados espalhados no WhatsApp e em caderno | A anamnese do paciente organizada desde o primeiro contato. | pronta |
| 9 | **Formulário online para o paciente** | o terapeuta envia um link e o próprio paciente preenche a ficha; alerta de cadastro incompleto com "Enviar formulário / Preencher manualmente / Ignorar" | ficha do cliente | digitar tudo à mão | O paciente preenche, você só lê. | pronta (fluxo do paciente não visto) |
| 10 | **Financeiro por cliente** | cobrança por **mensalidade** (valor fixo, vencimento, registro de pagamento, alerta de atraso) ou **pacote de sessões** (créditos descontados a cada sessão, aviso de renovação); painel geral com pendentes no topo | `/customer/:id/financial`, `/finances` | "quem me deve esse mês?" | Saiba quem pagou e quem está pendente sem planilha. | pronta, sem uso (nenhuma cobrança configurada) · **não tem** cobrança online (Pix/cartão), recibo ou relatório |
| 11 | **Documentos** | troca de arquivos com o paciente nas duas direções (recebidos e enviados): receitas, atestados, comprovantes | `/customer/:id/documents` | arquivo perdido no WhatsApp | Os documentos de cada paciente no lugar dele. | pronta, sem uso |
| 12 | **Área do Cliente** (portal do paciente) | o paciente entra com o e-mail cadastrado e uma senha; recebe documentos e o que o terapeuta indicar | card na ficha do cliente | — | Seu paciente com um espaço próprio. | pronta e em uso (1 cliente com acesso); **visão do paciente não vista** |
| 13 | **Métricas do cliente** | total de sessões, agendadas, concluídas, % de presença, duração média, sessões no mês; **exportar dados (LGPD)**; arquivar cliente | `/customer/:id/manage` | — | A frequência de cada paciente num relance. | pronta |
| 14 | **Perfil público** | página do terapeuta com endereço próprio (`slug`): nome, título, CRP, bio, especialidades, abordagem, formação, certificações, valor da sessão, idiomas, "aceitando novos pacientes", contatos (WhatsApp, Instagram, LinkedIn, TikTok) e privacidade | Configurações → Perfil público | "uso Linktree e Doctoralia pago" | Sua página profissional, sem pagar outra ferramenta. | pronta, sem uso (desativado na conta; página publicada não vista) |
| 15 | **Busca global** (Ctrl+K) | busca páginas e clientes | qualquer tela | "onde eu anotei isso?" | Ctrl+K e você acha qualquer coisa. | pronta |
| 16 | **Notificações** | no app e no navegador, com som; abas Sistema, Clientes, Sessões; comportamento durante a sessão | sino + Preferências | — | — | pronta |
| 17 | **Preferências** | editor com linhas de caderno e tamanho de fonte; tema claro/escuro; idioma; duração padrão da sessão; fuso e horário de atendimento | Configurações → Preferências | — | A kz do seu jeito. | pronta |
| 18 | **Assinatura, indicações e suporte** | planos via Stripe com histórico; link de indicação (1 crédito quando o indicado assina); tickets de suporte | Configurações, `/support` | — | — | pronta |

## 2. No código, mas oculto (não divulgar até liberar)
- **Ferramentas:** questionários e checklists recorrentes, formulários personalizados, exercício de respiração, para usar na sessão ou o paciente fazer em casa ("libere só para quem vai testar").
- **Análises:** notas clínicas privadas do terapeuta (ex.: tríplice contingência).
- **Transcrição por voz:** gravar relato e transcrever.

## 3. O que a kz NÃO faz hoje
Cobrança online ao paciente (Pix/cartão) · recibo/NFS-e · relatório financeiro · prescrição · BI · multiusuário (secretária, clínica) · lembrete por e-mail · **processos terapêuticos** (estão no BUSINESS/COPY, mas não existem no app nem no código) · "anamnese" com esse nome (o equivalente é a ficha + formulário online).

## 4. Diferenças com o contexto antigo (corrigir em BUSINESS e COPY — T-0014 item 3)
- Remover "processos terapêuticos por paciente" (não existe).
- Portal do paciente: o contexto diz "relata como tem se sentido entre sessões"; isso não foi visto (pode estar nas Ferramentas ocultas). Até confirmar, falar só em acesso e documentos.
- "Push": existe notificação no navegador para o **terapeuta**; push para o paciente não foi visto.
- Acrescentar o que o contexto não tinha: financeiro por mensalidade/pacote, sessão rápida, formulário online, documentos, métricas e exportação LGPD, indicações.
- "Sem NFS-e, conta digital ou BI" continua verdadeiro; o financeiro é controle de cobrança, não meio de pagamento.

## 5. Vitrine: 6 posts de kz na prática (proposta revisada)
1. **Tela de atendimento** (Sessão Inteira): vídeo + anotação + histórico numa tela. O post de produto mais importante.
2. **WhatsApp automático:** agenda do dia e confirmação de sessão sozinhas.
3. **Agenda com recorrência:** agende uma vez, a semana se monta.
4. **Registro de sessão:** Notas + Planejamento, linha do tempo e busca.
5. **Ficha + formulário online:** o paciente preenche a anamnese, você só lê.
6. **Financeiro por cliente:** mensalidade ou pacote, quem está pendente.
Reserva: sala de espera, perfil público, painel do dia, métricas do cliente, área do cliente.

## 6. Prints
Melhores telas: painel do dia · linha do tempo de sessões com Notas/Planejamento · calendário em Semana (com a semana cheia) · modal Agendar com recorrência aberta · Preferências → WhatsApp · tela de atendimento (com o vídeo funcionando) · métricas do cliente.
Antes de printar:
- **Conta de demonstração com pacientes fictícios** (o painel mostra nomes reais em "Clientes frequentes").
- Concluir ou apagar as sessões presas de "Paciente Teste QA" (geram 5 alertas fixos sobre a tela).
- Zoom do navegador em 200% (ou tela 2×), sem a área Admin no menu.
- Salvar em `_inbox/visual/` → `node tools/mockup/captura.mjs <png> --empresa kz`.

## 7. Achados para o time de produto
- 5 sessões do "Paciente Teste QA" presas em "Em andamento" (até 10 dias) geram 5 alertas fixos em todas as telas.
- Erro de texto no alerta: "em andamento **há há** 10 dias".
- 3 modelos de WhatsApp em português cadastrados com idioma "en" na Meta.
- Horário do lembrete ao paciente não é configurável na tela (só existe no código).

## Log
- 2026-10-07 — rascunho a partir do print do painel + BUSINESS/COPY.
- 2026-10-07 — reescrito após levantamento no app logado: 18 funcionalidades prontas, 3 ocultas; processos terapêuticos não existem; WhatsApp automático confirmado; vitrine revisada.
