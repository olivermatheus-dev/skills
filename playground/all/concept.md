A ideia é que esse repositório sirva como uma base de operaçÕes de marketing que possa se expandir aos poucos. Com fluxos de skills progressivas para cada tarefa principal que um gestor de marketing precisa. 

A principio teremos fluxos de skills para principalmente:
- Setup/Briefing Geral: Vai guiar o usuário para preencher todos os arquivos de contexto necessários para o projeto, dando sugestões inteligentes em cada etapa relevante. (sobre a empresa, tom de voz, público-alvo, produto, posicionamento, personas, gatilhos mentais mais eficientes, gatilhos, desejo de cada uma das personas, etc)
- Criação de Conteúdo: Fluxos para criação de conteúdo para redes sociais, blogs, e-mail marketing, etc. Com sugestões de temas, formatos, e estratégias de engajamento.
- Análise de Dados: Fluxos para interpretar dados de campanhas, identificar tendências, e otimizar estratégias de marketing com base em insights.
- Gestão de Campanhas: Fluxos para planejar, executar e monitorar campanhas de marketing, incluindo definição de objetivos, segmentação de público, escolha de canais, e avaliação de resultados.


Cada fluxo terá uma skill orquestradora própria, que guiará o usuário por cada etapa do processo, garantindo que todas as informações relevantes sejam coletadas e utilizadas de forma eficiente.

Cada skill deve saber encontrar os arquivos de contexto necessários para cada empresa com base nas necessidades. Cada skill só deve acessar os arquivos necessários para a execução dela.

Dentro do arquivo de claude.md teremos todos os fluxos e os apontamentos para as skills orquestradoras e skills principais diretamente nele. Toda vez que solicitarmos algo, ele deve identificar a skill ou fluxo adequado para executarmos a tarefa, e seguir o passo a passo definido para cada um deles.


Fluxo de primeiro uso: 
- usuário clona o repositório e roda o install.sh
- com as skills instaladas, o usuário roda a skill de setup-briefing para cada empresa (orquestradora do fluxo de setup/briefing geral)
- essa skill cria a estrutura de pastas para aquela empresa, e gera os arquivos de contexto iniciais, guiando o usuário para preenchê-los, cada skill especializada em um tipo de informação (persona, tom de voz, público-alvo, etc) pode ser chamada para ajudar a preencher cada arquivo de contexto específico, garantindo que as informações sejam completas e bem estruturadas.
- com os arquivos de contexto preenchidos, o usuário pode então rodar as skills de criação de conteúdo, análise de dados, ou gestão de campanhas, que vão utilizar as informações do briefing para gerar outputs mais alinhados e eficientes.
