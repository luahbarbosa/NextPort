# 📟 Interfone Inteligente

### Sistema de comunicação de voz em tempo real para condomínios
Reutilize dispositivos Android antigos como terminais de interfone — sem instalar aplicativos.

---

## 📖 Sobre o Projeto
O **Interfone Inteligente** é um sistema de comunicação de voz em tempo real desenvolvido para condomínios, com foco em baixo custo e simplicidade de uso.

A proposta é transformar dispositivos Android antigos em terminais de interfone, eliminando a necessidade de equipamentos caros ou a instalação de aplicativos. Tudo funciona diretamente pelo navegador, rodando prioritariamente em rede local Wi-Fi — com suporte opcional a redes móveis (4G/5G) como redundância.

---

## 🛠️ Tecnologias Utilizadas

| Componente | Tecnologia | Função no Projeto |
| :--- | :--- | :--- |
| **🖥️ Servidor** | Node.js + Express + Socket.io | Comunicação em tempo real e sinalização entre os terminais. |
| **📱 App nos celulares** | Navegador Web (Google Chrome) | Acesso direto ao sistema, dispensando instalação de apps. |
| **🎙️ Chamadas de voz** | WebRTC Nativo + Socket.io | Comunicação de áudio P2P (ponto a ponto) diretamente pelo browser. |
| **🗄️ Banco de dados** | SQLite / JSON | Armazenamento leve, rápido e sem necessidade de configurações complexas. |
| **🖱️ Painel administrativo**| HTML5 + CSS3 + JavaScript | Interface web para cadastro, remoção e monitoramento dos dispositivos. |

---

## 🏗️ Arquitetura do Sistema
*Seção em desenvolvimento. Os diagramas arquiteturais, fluxo de dados e mapeamento de componentes estão sendo refinados e serão publicados na próxima versão do documento.*

---

## 📋 Pré-requisitos
* Node.js v18 ou superior.
* Dispositivos Android com navegador Chrome atualizado (com suporte a WebRTC).
* Rede Wi-Fi local estável.
* **Configuração de HTTPS/SSL** (obrigatório para que o navegador libere o acesso ao microfone via WebRTC).

---

## ⚠️ Possíveis Gargalos e Desafios
* **Infraestrutura de Rede:** A qualidade e estabilidade do áudio dependem diretamente da cobertura do sinal Wi-Fi do condomínio.
* **Compatibilidade de Hardware:** Celulares obsoletos demais (ex: Android 4.4 ou inferior) podem ter versões do Chrome incompatíveis com os protocolos atuais do WebRTC.
* **Consumo de Bateria:** Dispositivos com a tela ligada ou em uso contínuo demandam alimentação constante na tomada.

---

## 🛡️ Tolerância a Falhas

| Mecanismo | Descrição |
| :--- | :--- |
| **🔁 Reconexão automática** | Os terminais restabelecem a conexão com o servidor automaticamente em caso de queda rápida de sinal. |
| **📡 Monitoramento em tempo real** | O painel administrativo exibe o status online/offline de cada terminal continuamente (Heartbeat). |
| **📶 Redundância de rede** | Suporte a dados móveis (4G/5G) como contingência caso a rede Wi-Fi local falhe. |
| **💾 Persistência de dados** | O SQLite garante a integridade dos dados e configurações mesmo após reinicializações do servidor. |

---

## 🎯 Resultados Esperados
- [x] Protótipo funcional com ao menos 3 dispositivos homologados.
- [x] Chamadas de voz estáveis em ambiente de rede controlada.
- [x] Painel administrativo operacional para cadastro de residências.
- [x] Persistência de dados (dispositivos, residências e histórico de chamadas).
- [x] Demonstração prática validada em cenário real.

guia para rodar o backend
- backend/readne.md