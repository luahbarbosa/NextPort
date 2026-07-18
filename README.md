# NextPort — Sistema de Interfone Inteligente

Sistema de comunicação de voz em tempo real para condomínios, desenvolvido como projeto acadêmico da disciplina de Arquitetura de Software. Utiliza microsserviços para transformar dispositivos Android antigos em terminais de interfone, eliminando a necessidade de equipamentos dedicados.

---

## Indice

1. [Funcionalidades Principais](#funcionalidades-principais)
2. [Tecnologias Utilizadas](#tecnologias-utilizadas)
3. [Pre-requisitos](#pre-requisitos)
4. [Instalacao e Execucao](#instalacao-e-execucao)
   - [Backend/Web via Docker](#backendweb-via-docker)
   - [Mobile via Expo (EAS Build)](#mobile-via-expo-eas-build)
5. [Estrutura de Pastas](#estrutura-de-pastas)
6. [Variaveis de Ambiente](#variaveis-de-ambiente)
7. [Autor(es)](#autores)

---

## Funcionalidades Principais

- **Login e autenticacao** via JWT com perfis (admin, operador, morador)
- **Cadastro de residencias e dispositivos** pelo painel administrativo web ou app mobile
- **Chamadas de voz em tempo real** entre portaria e moradores via Socket.io
- **Status online/offline** dos dispositivos em tempo real
- **Historico de chamadas** filtrado por dispositivo
- **Painel administrativo web** para gerenciamento central de dispositivos
- **App mobile multiplataforma** (Android/iOS) via Expo

---

## Tecnologias Utilizadas

| Camada | Tecnologia | Funcao |
| :--- | :--- | :--- |
| **Backend** | Node.js + Express 5 | API REST para autenticacao, cadastro e chamadas |
| **Banco de Dados** | PostgreSQL 15 + Prisma ORM | Persistencia de dados com schema centralizado |
| **Tempo Real** | Socket.io 4 | Sinalizacao e chamadas de voz em tempo real |
| **Mobile** | React Native + Expo SDK 56 | App mobile para Android e iOS |
| **Navegacao** | React Navigation (Stack + Bottom Tabs) | Navegacao entre telas do app |
| **Requisicoes HTTP** | Axios | Comunicacao entre mobile e backend |
| **Armazenamento Local** | AsyncStorage | Persistencia de sessao no mobile |
| **Frontend Web** | HTML5 + CSS3 + JavaScript Vanilla | Painel administrativo |
| **Build Tool** | Vite 8 | Bundler para o frontend web |
| **Infraestrutura** | Docker + Docker Compose | Orquestracao de PostgreSQL, Redis e RabbitMQ |
| **Icones** | Phosphor Icons | Icones no painel web |

---

## Pre-requisitos

| Ferramenta | Versao Minima | Link |
| :--- | :--- | :--- |
| **Node.js** | v18+ | https://nodejs.org |
| **Docker Desktop** | — | https://www.docker.com/products/docker-desktop |
| **Docker Compose** | v2+ | Incluido no Docker Desktop |
| **Git** | — | https://git-scm.com |
| **Expo Go** | — | Play Store (Android) / App Store (iOS) |
| **Navegador moderno** | Chrome/Firefox | Para acessar o painel web |

---

## Instalacao e Execucao

### 1. Clone o repositorio

```bash
git clone https://github.com/seu-usuario/nextport.git
cd nextport
```

---

### 2. Backend/Web via Docker

#### Subir infraestrutura (PostgreSQL, Redis, RabbitMQ)

```bash
docker compose up -d
```

Verifique se os containers estao rodando:

```bash
docker ps
```

#### Portas expostas pelo Docker Compose

| Servico | Porta | Descricao |
| :--- | :--- | :--- |
| **PostgreSQL** | `5432` | Banco de dados principal |
| **Redis** | `6379` | Cache (provisionado, ainda nao utilizado) |
| **RabbitMQ** | `5672` | Message broker (provisionado, ainda nao utilizado) |
| **RabbitMQ (Painel)** | `15672` | Interface de gerenciamento do RabbitMQ |

> Painel RabbitMQ: http://localhost:15672 (usuario: `admin` / senha: `senha123`)

#### Configurar banco de dados (shared-db)

```bash
cd backend/shared-db
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
```

O seed cria automaticamente:
- 4 usuarios (admin, Gabriel, Laura, Felipe)
- 3 residencias (APTO 001-003)
- 4 dispositivos (1 portaria + 3 celulares)
- 3 chamadas de exemplo

#### Iniciar servicos backend (via script automatico)

O arquivo `start.bat` na raiz do projeto inicia **todos os 4 servicos backend de uma vez**, cada um em uma janela separada:

```bat
start.bat
```

O que o script faz automaticamente:
1. **Verifica** se o PostgreSQL esta rodando no Docker
2. **Instala dependencias** do `shared-db` no `chamada-service` (se necessario)
3. **Abre 4 janelas do CMD**, cada uma rodando um servico:
   - `Auth Service` — porta **3001**
   - `Registro Service` — porta **3002**
   - `Chamada Service` — porta **3003**
   - `Signaling Server` — porta **3004**

> **Pre-requisitos:** Docker Desktop aberto com containers rodando (`docker compose up -d`), Node.js e npm instalados.

#### Portas dos servicos backend

| Servico | Porta | Endereco |
| :--- | :--- | :--- |
| **Auth Service** | `3001` | http://localhost:3001 |
| **Registro Service** | `3002` | http://localhost:3002 |
| **Chamada Service** | `3003` | http://localhost:3003 |
| **Signaling Server** | `3004` | http://localhost:3004 |

#### Rodar o Frontend Web

```bash
cd Frontend
npm install
npm run dev
```

O painel estara disponivel em http://localhost:5173

---

### 3. Mobile via Expo (EAS Build)

O app mobile e construido com **React Native + Expo** e utiliza o **EAS Build** (Expo Application Services) para gerar builds de desenvolvimento. Abaixo esta o fluxo completo, do zero ate rodar o app no celular.

#### 3.1 Pre-requisitos

- Conta gratuita no [Expo](https://expo.dev/)
- **EAS CLI** instalado globalmente:

```bash
npm install -g eas-cli
```

- Estar logado no Expo via terminal:

```bash
eas login
```

#### 3.2 Gerar um build de desenvolvimento

O projeto ja possui o arquivo `eas.json` com o profile `development` configurado. Para gerar um build:

```bash
cd Frontend/mobile
npx eas build --profile development --platform android --clear-cache
```

Esse comando:
1. Envia o codigo-fonte para os servidores do Expo
2. Compila um **development build** (APK) com suporte a bibliotecas nativas customizadas
3. Gera um **link de download** no painel do Expo (expo.dev)

> O build fica disponivel no painel do seu projeto em expo.dev > **Development builds**.

#### 3.3 Baixar e instalar o APK

Apos o build ser concluido (icone verde de sucesso):

1. Acesse [expo.dev](https://expo.dev/) e faca login
2. Va ate o seu projeto > **Builds** > selecione o build mais recente
3. Clique em **"Install"** ou escaneie o **QR Code** exibido na tela
4. O download do `.apk` comecara automaticamente no celular Android
5. Abra o arquivo baixado e permita a instalacao de fontes desconhecidas (se necessario)

> **Dica:** Voce tambem pode acessar o link de download diretamente pelo terminal, onde o EAS exibe a URL apos o build.

#### 3.4 Rodar o app apos instalacao

Depois de instalar o development build no celular, inicie o servidor de desenvolvimento local:

```bash
cd Frontend/mobile
npx expo start --dev-client
```

Um QR Code sera exibido no terminal. **Escaneie o QR Code pelo app que voce acabou de instalar** (nao pelo Expo Go), ja que o development build e um app cliente customizado.

> O celular e o computador devem estar na **mesma rede Wi-Fi**.

#### 3.5 Por que usar Development Build ao inves do Expo Go?

| | Expo Go | Development Build |
| :--- | :--- | :--- |
| **Configuracao** | Nenhuma | Requer build via EAS |
| **Bibliotecas nativas** | Limitadas | Suporte completo |
| **Plugins customizados** | Nao suportados | Suportados |
| **Performance** | Generica | Otimizada para o projeto |

O Development Build e necessario quando o projeto usa **bibliotecas nativas customizadas** ou **plugins** que nao sao compativeis com o Expo Go padrao. O NextPort atualmente usa o plugin `expo-font` e dependencias que beneficiam de um build nativo.

#### 3.6 Arquivo .easignore

O arquivo `.easignore` na pasta `Frontend/mobile/` define quais pastas devem ser ignoradas durante o upload para o EAS Build:

```
android/
ios/
node_modules/
```

Isso garante que:
- `android/` e `ios/` (pastas nativas geradas pelo Expo) nao sejam enviadas ao EAS — elas sao recriadas automaticamente durante a compilacao na nuvem
- `node_modules/` nao seja incluido no pacote de upload — o EAS instala as dependencias automaticamente

#### 3.7 Variaveis de ambiente do mobile

O arquivo `Frontend/mobile/.env` define os enderecos dos servicos backend. **Atualize o IP** para o endereco IP local do seu computador:

```env
EXPO_PUBLIC_AUTH_URL=http://<SEU_IP>:3001
EXPO_PUBLIC_REGISTRO_URL=http://<SEU_IP>:3002
EXPO_PUBLIC_CHAMADA_URL=http://<SEU_IP>:3003
EXPO_PUBLIC_SOCKET_URL=http://<SEU_IP>:3004
```

---

## Estrutura de Pastas

```
NextPort/
├── docker-compose.yml                    # PostgreSQL, Redis, RabbitMQ
├── start.bat                             # Script para iniciar todos os servicos
├── backend/
│   ├── shared-db/                        # Banco de dados centralizado (Prisma)
│   │   ├── prisma/
│   │   │   └── schema.prisma             # Schema do banco de dados
│   │   └── index.js                      # Exporta PrismaClient
│   ├── auth-service/                     # Autenticacao e JWT (porta 3001)
│   │   └── src/
│   │       ├── index.js
│   │       └── routes/
│   ├── registro-service/                 # CRUD residencias e dispositivos (porta 3002)
│   │   └── src/
│   │       ├── index.js
│   │       └── routes/
│   ├── chamada-service/                  # Historico de chamadas (porta 3003)
│   │   └── src/
│   │       ├── index.js
│   │       └── routes/
│   └── notif-service/                    # Notificacoes push (pendente)
├── signaling-server/                     # Socket.io para chamadas em tempo real (porta 3004)
│   └── index.js
├── Frontend/
│   ├── index.html                        # Dashboard — Gerenciamento Central
│   ├── dispositivos.html                 # Gerenciamento de dispositivos
│   ├── login.html                        # Tela de login
│   ├── perfil.html                       # Perfil do usuario
│   ├── senha.html                        # Alteracao de senha
│   ├── vite.config.js                    # Configuracao do Vite
│   ├── src/
│   │   ├── css/                          # Estilos (styles.css, stylesdois.css)
│   │   ├── js/                           # Logica (auth, login, dashboard, etc.)
│   │   └── images/                       # Logos SVG
│   └── mobile/                           # App React Native (Expo)
│       ├── App.js                        # Componente raiz com navegacao
│       ├── app.json                      # Configuracao Expo
│       ├── eas.json                      # Configuracao de profiles do EAS Build
│       ├── .easignore                    # Pastas ignoradas pelo EAS Build
│       ├── assets/                       # Icones e imagens
│       └── src/
│           ├── screens/
│           │   ├── SplashScreen.js
│           │   ├── LoginScreen.js
│           │   ├── HomeScreen.js
│           │   ├── HistoricoScreen.js
│           │   └── ChamadaScreen.js
│           └── services/
│               ├── api.js                # Instancias Axios por servico
│               └── socketService.js      # Conexao Socket.io
```

---

## Variaveis de Ambiente

O projeto nao inclui um `.env.example`, mas os arquivos `.env` de cada servico sao mostrados abaixo para referencia.

### Backend

**`backend/shared-db/.env`**
```env
DATABASE_URL="postgresql://admin:senha123@localhost:5432/interfone"
```

**`backend/auth-service/.env`**
```env
DATABASE_URL="postgresql://admin:senha123@localhost:5432/interfone"
JWT_SECRET="interfone_secret_2024"
PORT=3001
```

**`backend/registro-service/.env`**
```env
DATABASE_URL="postgresql://admin:senha123@localhost:5432/interfone"
PORT=3002
```

**`backend/chamada-service/.env`**
```env
DATABASE_URL="postgresql://admin:senha123@localhost:5432/interfone"
PORT=3003
```

**`signaling-server/.env`**
```env
PORT=3004
```

### Mobile

**`Frontend/mobile/.env`**
```env
EXPO_PUBLIC_AUTH_URL=http://<SEU_IP>:3001
EXPO_PUBLIC_REGISTRO_URL=http://<SEU_IP>:3002
EXPO_PUBLIC_CHAMADA_URL=http://<SEU_IP>:3003
EXPO_PUBLIC_SOCKET_URL=http://<SEU_IP>:3004
```

> **Nota:** Substitua `<SEU_IP>` pelo IP local da maquina onde os servicos backend estao rodando.

---

## Autor(es)

| | |
| :--- | :--- |
| **Disciplina** | Arquitetura de Software |
| **Professor** | Paulo Perris |
| **Integrantes** | Debora Gomes, Jamille Galdino e Luana Bezerra |
| **Data** | 07/2026 |

---

## Licenca

Este projeto esta sob a licenca MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
