PROJETO 1 — Sistema de Interfone
Inteligente de Baixo Custo para
Condomínios

Cenário
Desenvolver um sistema de interfone digital utilizando dispositivos Android antigos como
terminais de comunicação entre residências e portaria.
O sistema deverá funcionar em rede local Wi-Fi, podendo opcionalmente utilizar internet
móvel (4G/5G) como redundância.

Requisitos Funcionais
RF01 — Cadastro de Residências
O sistema deverá permitir o cadastro de casas/apartamentos.

RF02 — Cadastro de Dispositivos
O sistema deverá permitir associar dispositivos Android a uma residência ou à portaria.

RF03 — Chamadas entre Residências
O sistema deverá permitir chamadas de voz entre casas.

RF04 — Chamadas Portaria → Casa
A portaria deverá conseguir iniciar chamadas para qualquer residência.

RF05 — Chamadas Casa → Portaria
As residências deverão conseguir chamar a portaria.

RF06 — Lista de Contatos
Cada terminal deverá exibir a lista de casas disponíveis para comunicação.

RF07 — Controle de Disponibilidade
O sistema deverá indicar se o terminal está online ou offline.

RF08 — Histórico de Chamadas
O sistema deverá armazenar registros das chamadas realizadas.

RF09 — Notificações
O sistema deverá emitir alerta sonoro e visual ao receber chamadas.

RF10 — Gerenciamento Central
A central administrativa deverá permitir:
● cadastrar dispositivos;
● remover dispositivos;
● reiniciar conexões;
● monitorar status da rede.

RF11 — Controle de Usuários
O sistema deverá possuir autenticação administrativa.

RF12 — Atualização Remota
O sistema deverá permitir atualização remota dos terminais.

Requisitos Não Funcionais
● baixo custo operacional;
● funcionamento contínuo;
● tolerância a falhas;
● suporte a múltiplos dispositivos;
● facilidade de manutenção;
● baixo consumo de rede;
● baixa latência nas chamadas.

O Que Esperar Como Resultado Final
Esperado da Aplicação
● protótipo funcional;
● comunicação entre ao menos 3 dispositivos;
● painel administrativo;
● persistência de dados;
● demonstração funcional.

Esperado da Disciplina de Arquitetura
Os alunos deverão explicar:
● arquitetura adotada;
● motivo da escolha;
● fluxo de comunicação;
● gerenciamento de estados;
● escalabilidade;
● tolerância a falhas;
● facilidade de manutenção;
● como adicionar novos módulos futuramente;
● impacto da arquitetura no desempenho;
● possíveis gargalos;
● possibilidades de migração futura.