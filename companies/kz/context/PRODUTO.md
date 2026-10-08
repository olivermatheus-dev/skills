# Produto — kz (inventário de funcionalidades)

> **Rascunho de 2026-10-07, aguardando o Oliver confirmar.** É a fonte única do que a kz faz. Nenhuma peça mostra ou promete funcionalidade que não esteja aqui como **confirmada**. Alimenta a série 8 (kz na prática), os mockups, a carta de vendas, a LP e os anúncios.
>
> **Origem de cada linha:** `print` = visto no print do painel (`brand/screenshots/painel-inicio-2026-10-07.png`) · `contexto` = só escrito em BUSINESS/COPY (abr/2026, nunca revisado) · `?` = dúvida.
> **Status:** `confirmada` · `a confirmar` · `em breve` · `não existe`.

## 1. Funcionalidades
| # | funcionalidade | o que faz | dor que resolve (fala da persona) | benefício em 1 frase | origem | status | print |
|---|---|---|---|---|---|---|---|
| 1 | **Sessão Inteira** (tela de atendimento) | anotações atuais, notas passadas, planejamento pré-sessão e dados do paciente na mesma tela | "procurando aquela anotação 2 min antes da sessão" | Tudo da sessão numa tela, sem trocar de aba. | contexto | a confirmar | falta |
| 2 | **Painel de início** | saudação, próxima sessão com contagem regressiva, "Iniciar sessão" e "Ver prontuário" a 1 clique, sessões de hoje e futuras | "abro 4 apps para saber o que tenho hoje" | Você abre a kz e já sabe o que vem agora. | print | a confirmar | `painel-inicio` |
| 3 | **Agenda e calendário** | sessões recorrentes ("toda terça, desde…") com exceções | "marquei dois no mesmo horário" | A semana se monta sozinha a partir da recorrência. | print + contexto | a confirmar | falta |
| 4 | **Videochamada com sala de espera** | sala própria, paciente espera até o terapeuta abrir | "passei a noite atrás de link" | Sem caçar link: o paciente entra na sala da kz. | print (menu) + contexto | a confirmar | falta |
| 5 | **Lembretes e confirmações no WhatsApp** (+ push) | avisa e confirma a sessão no WhatsApp do paciente | "perco paciente por esquecer" | O lembrete sai sozinho e a confirmação volta para a agenda. | contexto (menu "WhatsApp" é do admin) | **a confirmar: é automático?** (pendência 5 do ESTADO) | falta |
| 6 | **Prontuário e notas de sessão** | planejamento + anotação por sessão, anamnese, notas estruturadas, histórico | "paciente pediu a nota e levei um dia para achar" | O histórico do paciente a um clique, em ordem. | print ("Ver prontuário", "Nova anotação") + contexto | a confirmar | falta |
| 7 | **Processos terapêuticos** | organiza o acompanhamento de cada paciente por processo | "não vejo a evolução do paciente" | A evolução de cada paciente em um só lugar. | contexto | a confirmar | falta |
| 8 | **Portal do paciente** | paciente vê as sessões e relata como tem se sentido entre elas; opcional por paciente | "não sei como ele passou a semana" | Você chega na sessão sabendo como foi a semana dele. | contexto | a confirmar | falta |
| 9 | **Meus clientes** | cadastro e lista de pacientes, clientes frequentes | "contato espalhado no WhatsApp" | Todos os pacientes num cadastro só. | print | a confirmar | falta |
| 10 | **Sessão rápida** | botão e atalho para começar uma sessão na hora | ? | ? | print | **a confirmar: o que faz?** | `painel-inicio` |
| 11 | **Busca global** (Ctrl+K) | busca clientes e sessões de qualquer tela | "onde eu anotei isso?" | Ctrl+K e você acha qualquer paciente ou sessão. | print | a confirmar | `painel-inicio` |
| 12 | **Atalhos** | agendar, novo cliente, nova anotação a 1 clique | — | As tarefas do dia a 1 clique. | print | a confirmar | `painel-inicio` |
| 13 | **Próximos aniversários** | aniversários dos pacientes nos próximos 30 dias | "esqueci o aniversário dela" | Um cuidado a mais, sem depender da memória. | print | a confirmar | `painel-inicio` (vazio) |
| 14 | **Financeiro** | ? | ? | ? | print (menu) | **a confirmar: o que faz?** (o contexto diz "sem NFS-e/conta digital") | falta |
| 15 | **Perfil público** | página do terapeuta com especialidades, abordagem e valor | "uso Linktree e Doctoralia pago" | Sua página profissional sem pagar por outra ferramenta. | contexto | a confirmar | falta |
| 16 | **Notificações** | sino no topo | — | — | print | a confirmar | — |
| 17 | **Segurança** | criptografia em trânsito e em repouso, LGPD | "meus dados clínicos ficam seguros?" | — | contexto | **a confirmar por escrito (T-0010)** | — |

**Área Admin** (Terapeutas, Clientes, Suporte, Assinaturas, Servidor, WhatsApp, Email): é interna da kz, não do terapeuta. Nunca aparece em mockup nem em post (recortar ou usar conta sem admin).

## 2. O que a kz NÃO faz (declarado antes da compra)
Prescrição · NFS-e · conta digital · BI/dashboards de gestão · multiusuário (secretária, clínica) · IA (só no roadmap). Confirmar se continua valendo.

## 3. Candidatas à vitrine (6 posts de kz na prática)
Ordem sugerida pelo impacto na dor principal; o Oliver escolhe:
1. Sessão Inteira (o mecanismo único: é o post de produto mais importante)
2. Lembrete no WhatsApp (se for automático)
3. Videochamada com sala de espera
4. Agenda com recorrência
5. Prontuário e histórico a 1 clique
6. Portal do paciente (diferencial que concorrente não tem)
Reserva: painel de início, perfil público, busca Ctrl+K.

## 4. Prints necessários
Para cada candidata: 1 print da tela inteira e, se der, 1 do detalhe.
- **Zoom do navegador em 200%** (ou tela 2×) para sair nítido no mockup em 3×.
- **Conta de demonstração com pacientes fictícios** (nome, e-mail e anotações inventados). O print de hoje tem nomes e e-mails reais: dá para borrar, mas dado fictício fica muito melhor e evita risco ético (CFP/LGPD).
- Sem a área Admin no menu, se possível.
- Salvar em `_inbox/visual/` → `node tools/mockup/captura.mjs <png> --empresa kz`.

## Log
- 2026-10-07 — rascunho montado a partir do print do painel + BUSINESS/COPY. Novidades vistas no print e ausentes do contexto: Financeiro, Sessão rápida, busca Ctrl+K, atalhos, aniversários, clientes frequentes.
