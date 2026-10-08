# Produto — kz (registro de funcionalidades)

> **Registro factual do que a kz tem hoje:** o que cada funcionalidade faz, como funciona, onde fica e em que estado está. Não é copy: benefícios, argumentos e forma de falar de cada feature ficam para a carta de vendas (T-0014, item 5). Serve para comparar com os concorrentes, anotar, e travar promessa falsa em qualquer peça.
>
> **Levantamento:** 2026-10-07, navegação só de leitura no app logado (kz.app.br, conta do Oliver). O produto está em desenvolvimento: telas, painéis e visual ainda vão mudar. Reconferir antes de usar em peça.
> **Grupos** iguais aos da análise de concorrentes (`competitors/*/analysis/features.json`). Versão estruturada para comparação: [`produto/features.json`](../produto/features.json).
> **Estado:** `pronta` (em uso) · `pronta, sem uso` (existe, não estava configurada na conta) · `oculta` (no código, escondida da interface) · `não existe`.

## 1. Funcionalidades por grupo

### Agenda
| funcionalidade | o que faz / como funciona | onde | estado |
|---|---|---|---|
| Agenda | visões dia, semana, mês e ano, com nº da semana e linha da hora atual; evento abre resumo com ver detalhes, alterar e cancelar | `/app/calendar` | pronta |
| Agendamento | modal com busca de cliente, online ou presencial, mini-calendário com a agenda do dia ao lado, hora, duração (atalhos 50 min e 1h40), observações | botão Agendar | pronta |
| Sessões recorrentes | semanal, quinzenal ou mensal, com data de término opcional; reagendamento aparece com status "Reagendada" | modal Agendar | pronta |
| Bloqueios / exceções | — | — | não visto na interface |
| Sessão rápida | atende sem agendar: escolhe o cliente e vai direto para a tela de atendimento; só vira registro quando o terapeuta escreve | botão no topo, atalho, ficha do cliente | pronta |
| Painel do dia | saudação, nº de sessões do dia, próxima sessão com contagem regressiva, "Iniciar sessão" e "Ver prontuário", sessões de hoje e futuras com status, atalhos (sessão rápida, agendar, novo cliente, nova anotação), clientes frequentes, aniversários dos próximos 30 dias | `/app` (= Meu Consultório) | pronta |
| Agendamento online pelo paciente | — | — | não existe |
| Integração com Google Agenda / iCal | — | — | não existe |

### Teleatendimento
| funcionalidade | o que faz / como funciona | onde | estado |
|---|---|---|---|
| Videochamada própria | chamada dentro da kz, sem Meet/Zoom; "Compartilhar" gera o link `kz.app.br/call/…` para o paciente | tela de atendimento | pronta (vídeo não testado no levantamento: câmera bloqueada) |
| Sala de espera | o paciente abre o link, digita o nome e entra na sala de espera; o terapeuta vê em tempo real quem chegou, mesmo sem sessão agendada | `/app/waiting-room` | pronta |
| Tela de atendimento | vídeo à esquerda; à direita relógio, próximo compromisso e abas **Anotações** (ao vivo), **Histórico** (notas das sessões anteriores) e **Cliente** (dados); alterna Online/Presencial; "Finalizar sessão" encerra a chamada e conclui a sessão. É a **Sessão Inteira** da COPY | `/customer/:id/session/:sid` | pronta |

### Prontuário
| funcionalidade | o que faz / como funciona | onde | estado |
|---|---|---|---|
| Registro de sessão | por sessão: status, tipo, data e duração editáveis, tema, observações e editor de texto rico com abas **Notas** e **Planejamento**, salvamento automático; concluir, cancelar, reabrir, excluir | `/customer/:id/sessions/:sid` | pronta |
| Linha do tempo de sessões | lista de sessões do cliente com status coloridos, busca por data, tema ou conteúdo, filtro | mesma tela | pronta |
| Anotações do cliente | notas avulsas por cliente (fora da sessão), com visualizador; "Nota rápida" na visão geral | `/customer/:id/notes-history` | pronta |
| Ficha do cliente (anamnese) | dados pessoais (nome preferido, pronome, identidade de gênero, orientação, raça, escolaridade, CPF, estado civil, profissão), contato, endereço, contato de emergência, saúde geral (doenças, alergias, medicamentos, histórico cirúrgico, condições crônicas), hábitos (fumo, álcool, atividade física, jogos e apostas), histórico psicológico e médico familiar, "como te conheceu"; seções filtráveis | `/customer/:id/details` | pronta |
| Formulário online | o terapeuta envia um link e o paciente preenche a própria ficha; alerta de cadastro incompleto (enviar formulário, preencher manualmente, ignorar) | ficha do cliente | pronta (fluxo do paciente não visto) |
| Documentos | troca de arquivos com o paciente (recebidos e enviados): receitas, atestados, comprovantes; imagens, PDF e áudio | `/customer/:id/documents` | pronta, sem uso |
| Métricas do cliente | total de sessões, agendadas, concluídas, % de presença, duração média, sessões no mês | `/customer/:id/manage` | pronta |
| Modelos de anamnese/documentos, escalas e testes, assinatura digital | — | — | não existe |
| Processos terapêuticos | citado no BUSINESS antigo | — | não existe (nem no código) |

### Comunicação/WhatsApp
| funcionalidade | o que faz / como funciona | onde | estado |
|---|---|---|---|
| Agenda do dia no WhatsApp | envia ao terapeuta a agenda do dia, no mesmo dia ou na véspera, no horário escolhido (API oficial da Meta) | Preferências → WhatsApp | pronta e rodando (5 terapeutas recebem às 07h–08h) |
| Confirmação de sessão no WhatsApp | antes de cada sessão, envia confirmação automática ao terapeuta e ao paciente | Preferências → WhatsApp | pronta, desligada na conta do Oliver; horário do envio ao paciente não é configurável na tela |
| Botão WhatsApp do cliente | abre conversa com o paciente a partir da lista e da ficha | lista e ficha de clientes | pronta |
| Notificações | no app e no navegador, com som; abas Sistema, Clientes, Sessões; comportamento durante a sessão configurável | sino + Preferências | pronta |
| Lembrete por e-mail / SMS | — (e-mail só tem modelo de teste no admin) | — | não existe |

### Financeiro
| funcionalidade | o que faz / como funciona | onde | estado |
|---|---|---|---|
| Cobrança por cliente | **mensalidade** (valor fixo, vencimento mensal, registro manual de pagamento, alerta de atraso) ou **pacote de sessões** (créditos descontados a cada sessão, aviso de renovação) | `/customer/:id/financial` | pronta, sem uso |
| Painel de cobranças | cobranças por cliente com os pendentes no topo | `/app/finances` | pronta, sem uso |
| Cobrança online (Pix, cartão, boleto), recibo, NFS-e/Receita Saúde, relatórios, fluxo de caixa | — | — | não existe |

### Portal do paciente
| funcionalidade | o que faz / como funciona | onde | estado |
|---|---|---|---|
| Área do Cliente | o paciente entra com o e-mail cadastrado e cria senha; recebe documentos e o que o terapeuta indicar; a ficha mostra o status de acesso | card na ficha do cliente | pronta e em uso (1 cliente com acesso); visão do paciente não vista |
| Relato entre sessões / diário de humor | citado no BUSINESS antigo | — | não visto (pode estar nas Ferramentas ocultas) |

### Marketing/Site
| funcionalidade | o que faz / como funciona | onde | estado |
|---|---|---|---|
| Perfil público | página do terapeuta com endereço próprio (slug): nome, título, CRP, bio, especialidades, abordagem, formação, certificações, valor da sessão, idiomas, "aceitando novos pacientes", contatos (WhatsApp, Instagram, LinkedIn, TikTok), privacidade (idade, gênero, contato) | Configurações → Perfil público | pronta, sem uso (desativado na conta; página publicada não vista) |
| Indicações | link de indicação e convite por e-mail; 1 crédito quando o indicado assina | Configurações → Indicações | pronta |

### Segurança/LGPD
| funcionalidade | o que faz / como funciona | onde | estado |
|---|---|---|---|
| Exportar dados do cliente (LGPD) | exporta os dados do paciente | `/customer/:id/manage` | pronta |
| Arquivar cliente | tira o cliente da lista ativa ("Ver arquivados") | `manage` + lista | pronta |
| Aceite de termos | registro de aceite | Preferências → Termos | pronta |
| Criptografia em trânsito e em repouso | afirmada na COPY | — | **a confirmar por escrito (T-0010)** |

### IA
| funcionalidade | o que faz / como funciona | onde | estado |
|---|---|---|---|
| Transcrição por voz | gravar relato e transcrever | código | oculta |
| Qualquer outra IA (nota automática, resumo, assistente) | — | — | não existe |

### Gestão de equipe
Não existe: uso solo, sem secretária, colaboradores ou multiprofissional.

### Outros
| funcionalidade | o que faz / como funciona | onde | estado |
|---|---|---|---|
| Busca global (Ctrl+K) | páginas e clientes | qualquer tela | pronta |
| Preferências | editor com linhas de caderno e tamanho de fonte; tema claro/escuro; idioma; duração padrão da sessão; fuso e horário de atendimento | Configurações → Preferências | pronta |
| Assinatura do terapeuta | planos via Stripe, cancelamento, histórico de pagamentos | Configurações → Assinatura | pronta |
| Suporte | tickets (lista e novo ticket) | `/app/support` | pronta |
| Ferramentas | questionários e checklists recorrentes, formulários personalizados, exercício de respiração, para usar na sessão ou o paciente fazer em casa | código (`/app/tools`) | oculta ("libere só para quem vai testar") |
| Análises | notas clínicas privadas do terapeuta (ex.: tríplice contingência) | código (`/customer/:id/analyses`) | oculta |
| App mobile (iOS/Android) | — | — | não existe (web) |

## 2. Comparação rápida com os 10 concorrentes analisados
Fonte: `competitors/*/analysis/features.json` (2026-10-07).
- **Comuns nos concorrentes e ausentes na kz:** agendamento online pelo paciente · integração com Google Agenda · cobrança online (Pix/cartão/boleto) · NFS-e e recibo Receita Saúde · relatórios financeiros · IA (transcrição, nota automática; 7 de 10 têm grupo de IA) · secretária/multiprofissional (8 de 10) · modelos de anamnese e documentos · escalas e testes · assinatura digital · lembrete por e-mail/SMS · app mobile.
- **Empate (a maioria também tem):** videochamada (7 de 10 têm teleatendimento; 5 com sala própria no navegador, 1 cobra R$ 2 por sessão, 1 só integra Jitsi/Meet) · agenda com recorrência · prontuário · confirmação por WhatsApp.
- **Na kz e raro nos concorrentes:** sala de espera com chegada em tempo real (nenhuma análise cita) · tela de atendimento com vídeo, anotação ao vivo e histórico juntos (nenhuma análise cita como tal) · formulário para o paciente preencher a própria ficha (1 de 10) · agenda do dia enviada ao terapeuta (1 de 10) · cobrança por pacote de sessões (3 de 10).
- Ressalva: as análises listam o que os concorrentes **divulgam** no site, não o que o produto deles faz por dentro.

## 3. Diferenças com o contexto antigo (BUSINESS/COPY, abr/2026)
- "Processos terapêuticos por paciente": não existe.
- Portal com "relato de como tem se sentido entre sessões": não visto.
- "Push": existe notificação no navegador para o terapeuta; push para o paciente não visto.
- Não estavam no contexto: financeiro por mensalidade/pacote, sessão rápida, formulário online, documentos, métricas e exportação LGPD, indicações, busca Ctrl+K.
- Continua verdadeiro: sem NFS-e, sem conta digital, sem BI. O financeiro controla cobranças, não é meio de pagamento.

## 4. Pendências técnicas observadas (para o time de produto)
- 5 sessões do "Paciente Teste QA" presas em "Em andamento" (até 10 dias) geram 5 alertas fixos em todas as telas.
- Erro de texto no alerta: "em andamento **há há** 10 dias".
- 3 modelos de WhatsApp em português cadastrados com idioma "en" na Meta.
- Horário do lembrete ao paciente não configurável na tela (existe no código).

## 5. Não visto no levantamento
Videochamada funcionando e o lado do paciente (`/call`, sala de espera do paciente, Área do Cliente por dentro) · Ferramentas e Análises (ocultas) · página de planos e preços · modais de configurar cobrança, enviar documento e enviar formulário (não abertos para não disparar envio) · perfil público publicado.

## Log
- 2026-10-07 — levantamento no app logado (subagente, só leitura): ~30 funcionalidades prontas, 3 ocultas. Reorganizado nos grupos da análise de concorrentes; benefícios e vitrine saíram daqui (vão para a carta de vendas e a 029).
