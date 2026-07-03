# RELATÓRIO TÉCNICO — PROJETO INTERFACIL

> **Sistema de interfone inteligente para condomínios utilizando arquitetura de microsserviços.**

---

##  Sumário

1. [Visão Geral](#1-visão-geral)
2. [Infraestrutura](#2-infraestrutura)
3. [Backend](#3-backend)
4. [Banco de Dados](#4-banco-de-dados)
5. [Frontend Mobile](#5-frontend-mobile)
6. [Frontend Web](#6-frontend-web)
7. [Fluxos Funcionando](#7-fluxos-funcionando-hoje)
8. [Problemas Conhecidos](#8-fluxos-com-problemas)
9. [Implementações Pendentes](#9-o-que-falta-implementar)
10. [Débitos Técnicos](#10-débitos-técnicos)
11. [Recomendações para Apresentação](#11-recomendações-para-apresentação)

---

## 1. VISÃO GERAL

### Informações Gerais

- **Nome do Projeto:** InterFacil — Sistema de interfone inteligente para condomínios
- **Propósito:** Comunicação de voz entre portaria e moradores usando dispositivos Android antigos como terminais de interfone
- **Padrão de Arquitetura:** Microsserviços (4 serviços + signaling server + shared-db)

### Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Backend** | Node.js, Express 5, Prisma ORM, PostgreSQL, Socket.io, JWT, bcryptjs |
| **Mobile** | React Native (Expo SDK 56), React Navigation, Axios, Socket.io Client, Poppins fonts, expo-linear-gradient |
| **Web** | HTML5, CSS3, JavaScript vanilla, Vite |
| **Infraestrutura** | Docker (PostgreSQL, Redis, RabbitMQ) |

### Estrutura de Pastas

```
InterFacil/
├── docker-compose.yml              # PostgreSQL, Redis, RabbitMQ
├── backend/
│   ├── auth-service/       (3001)   # Login/registro com JWT
│   ├── registro-service/   (3002)   # CRUD residências e dispositivos
│   ├── chamada-service/    (3003)   # Histórico de chamadas
│   ├── notif-service/      ( — )   # **VAZIO** - nada implementado
│   └── shared-db/                  # Prisma Client compartilhado
├── signaling-server/       (3004)   # Socket.io para chamadas em tempo real
└── Frontend/
    ├── mobile/             (Expo)   # App React Native (5 telas)
    └── web/                (5173)   # Dashboard+Dispositivos (Vite)
```

---

## 2. INFRAESTRUTURA

### Docker Compose (docker-compose.yml)

| Serviço | Porta | Imagem | Volumes | Status |
|---------|-------|--------|---------|--------|
| PostgreSQL | 5432 | `postgres:15` | `postgres_data` |  Ativo |
| Redis | 6379 | `redis:7` | — |  Não utilizado |
| RabbitMQ | 5672/15672 | `rabbitmq:3-management` | — |  Não utilizado |

### Observações

>  **Nenhum dos 3 serviços está sendo usado diretamente pelo código além do PostgreSQL.** Redis e RabbitMQ estão provisionados mas sem uso no código atual.

---

## 3. BACKEND — ANÁLISE POR MICROSSERVIÇO

### 3.1 Auth Service

**Características:**
- **Porta:** `3001`
- **Arquivo Principal:** `backend/auth-service/src/index.js`
- **Status:**  **Completo**

**Dependências:**
```json
{
  "express": "5",
  "cors": "latest",
  "dotenv": "latest",
  "bcryptjs": "latest",
  "jsonwebtoken": "latest",
  "pg": "latest",
  "shared-db": "local"
}
```

**Rotas Implementadas:**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/auth/register` | Cadastra admin com senha hasheada |
| `POST` | `/auth/login` | Autentica, retorna JWT + nome + id |

**Modelo:** `Usuario` (Prisma)

**Variáveis de Ambiente:**
- `DATABASE_URL`
- `JWT_SECRET`
- `PORT`

**Recursos:**
-  CORS ativo
-  Endpoints de recuperação de senha
-  Refresh token

---

### 3.2 Registro Service

**Características:**
- **Porta:** `3002`
- **Arquivo Principal:** `backend/registro-service/src/index.js`
- **Status:**  **Completo**

**Dependências:**
```json
{
  "express": "5",
  "cors": "latest",
  "dotenv": "latest",
  "pg": "latest",
  "shared-db": "local"
}
```

**Rotas Implementadas:**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/residencias` | Lista residências com dispositivos |
| `POST` | `/residencias` | Cadastra residência |
| `DELETE` | `/residencias/:id` | Remove residência |
| `GET` | `/dispositivos` | Lista dispositivos com residência + usuário |
| `POST` | `/dispositivos` | Cadastra dispositivo |
| `DELETE` | `/dispositivos/:id` | Remove dispositivo |
| `GET` | `/dispositivos/por-usuario/:id` | Busca dispositivo pelo ID do usuário |

**Recursos:**
-  CORS ativo
-  PUT/PATCH para editar dispositivos

---

### 3.3 Chamada Service

**Características:**
- **Porta:** `3003`
- **Arquivo Principal:** `backend/chamada-service/src/index.js`
- **Status:**  **Completo**

**Dependências:**
```json
{
  "express": "4",
  "cors": "latest",
  "dotenv": "latest",
  "@prisma/client": "latest",
  "pg": "latest"
}
```

**Rotas Implementadas:**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/chamadas` | Lista TODAS as chamadas |
| `GET` | `/chamadas/por-dispositivo/:androidId` | Lista chamadas do dispositivo (origem OU destino) |
| `POST` | `/chamadas` | Registra nova chamada |
| `PATCH` | `/chamadas/:id` | Atualiza status, atendidoEm, encerradoEm |

**Recursos:**
-  CORS ativo
-  Import do shared-db usa caminho relativo (`../../../shared-db`) em vez de symlink

---

### 3.4 Notif Service

**Características:**
- **Porta:** N/A
- **Status:**  **VAZIO**

>  **Diretório existe mas nenhum arquivo foi criado.**
> 
> Implementação completa do serviço de notificações push pendente.

---

### 3.5 Signaling Server

**Características:**
- **Porta:** `3004`
- **Arquivo Principal:** `signaling-server/index.js`
- **Status:**  **Completo**

**Dependências:**
```json
{
  "express": "5",
  "cors": "latest",
  "dotenv": "latest",
  "socket.io": "4"
}
```

**Rota HTTP:**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/status` | Retorna dispositivos conectados no momento |

**Eventos Socket.io:**

** Eventos Recebidos:**
- `registrar`
- `chamar`
- `aceitar_chamada`
- `recusar_chamada`
- `encerrar_chamada`

** Eventos Emitidos:**
- `registrado`
- `status_atualizado`
- `chamada_recebida`
- `chamada_aceita`
- `chamada_recusada`
- `chamada_encerrada`
- `dispositivo_offline`

**Recursos:**
-  CORS global ativo
-  Sem problemas conhecidos

---

### 3.6 Shared DB

**Características:**
- **Arquivo Principal:** `backend/shared-db/index.js`
- **Exportações:** `{ prisma, PrismaClient }`

**Dependências:**
```json
{
  "@prisma/client": "latest",
  "bcryptjs": "latest"
}
```

**Status:**
-  Prisma gerado (`node_modules/@prisma/client` existe)
-  Seed configurado

**Dados de Seed:**
- 4 usuários (admin, Gabriel, Laura, Felipe)
- 3 residências (APTO 001-003)
- 4 dispositivos (1 portaria + 3 celulares)
- 3 chamadas de exemplo

---

## 4. BANCO DE DADOS

**Provedor:** PostgreSQL 15

### Tabelas

#### `usuarios`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária |
| `nome` | String | Nome do usuário |
| `email` | String (unique) | Email único |
| `senha_hash` | String | Senha hasheada com bcrypt |
| `perfil` | Enum | admin / operador / morador |
| `foto_url` | String | URL da foto de perfil |
| `token_recuperacao` | String | Token para recuperação de senha |
| `token_expira_em` | DateTime | Expiração do token |
| `criado_em` | DateTime | Data de criação |
| `ultimo_login` | DateTime | Último acesso |

#### `residencias`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária |
| `identificador` | String (unique) | Código único (ex: APT-001) |
| `bloco` | String | Bloco/condomínio |
| `usuario_id` | UUID (FK) | Proprietário |
| `ativa` | Boolean | Status |
| `criado_em` | DateTime | Data de criação |

#### `dispositivos`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária |
| `residencia_id` | UUID (FK) | Residência associada |
| `tipo` | Enum | residencia / portaria |
| `nome_dispositivo` | String | Nome amigável |
| `android_id` | String (unique) | ID único do Android |
| `ip_local` | String | IP da rede local |
| `mac_address` | String | Endereço MAC |
| `versao_app` | String | Versão do app instalado |
| `ultimo_ping` | DateTime | Último ping recebido |
| `criado_em` | DateTime | Data de criação |

#### `chamadas`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária |
| `dispositivo_origem_id` | UUID (FK) | Quem iniciou |
| `dispositivo_destino_id` | UUID (FK) | Quem recebeu |
| `iniciado_em` | DateTime | Horário de início |
| `atendido_em` | DateTime | Horário de atendimento |
| `encerrado_em` | DateTime | Horário de término |
| `status` | Enum | atendida / nao_atendida / recusada / erro |

#### `notificacoes`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária |
| `dispositivo_id` | UUID (FK) | Dispositivo destino |
| `chamada_id` | UUID (FK) | Chamada relacionada |
| `tipo` | Enum | chamada / sistema / atualizacao |
| `mensagem` | String | Conteúdo |
| `lida` | Boolean | Status de leitura |
| `criado_em` | DateTime | Data de criação |

#### `atualizacoes_remotas`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária |
| `dispositivo_id` | UUID (FK) | Dispositivo alvo |
| `versao_nova` | String | Versão a atualizar |
| `url_pacote` | String | URL do APK |
| `status` | Enum | pendente / em_andamento / concluida / erro |
| `solicitado_em` | DateTime | Quando foi solicitado |
| `concluido_em` | DateTime | Quando foi concluído |

#### `logs_sistema`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária |
| `usuario_id` | UUID (FK) | Usuário responsável |
| `dispositivo_id` | UUID (FK) | Dispositivo afetado |
| `acao` | String | O que foi feito |
| `detalhes` | String | Detalhes adicionais |
| `criado_em` | DateTime | Data da ação |

### Relacionamentos

```
Usuario
  ├─ 1:N ──→ Residencia
  │           └─ 1:N ──→ Dispositivo
  │                       ├─ N:M ──→ Chamada (via origem/destino)
  │                       ├─ 1:N ──→ Notificacao
  │                       │           └─ N:1 ──→ Chamada
  │                       └─ 1:N ──→ AtualizacaoRemota
  └─ 1:N ──→ LogsSistema
              └─ N:1 ──→ Dispositivo
```

### Configuração Prisma

-  Schema configurado
-  Seed funcional
-  Migrations: Usa `db push` em vez de `migrate` (sem pasta `prisma/migrations`)

---

## 5. FRONTEND MOBILE

### Configuração Geral

| Item | Versão |
|------|--------|
| **Framework** | Expo SDK 56 |
| **React Native** | 0.85.3 |
| **React** | 19.2.3 |

### Dependências Principais

```json
{
  "react-navigation/stack": "latest",
  "react-navigation/bottom-tabs": "latest",
  "axios": "latest",
  "socket.io-client": "latest",
  "async-storage": "latest",
  "expo-linear-gradient": "latest",
  "expo-font": "latest",
  "@expo-google-fonts/poppins": "latest"
}
```

### Telas

| Tela | Arquivo | O que Exibe | API/Endpoint | Navegação |
|------|---------|-----------|-------------|-----------|
| **Splash** | `SplashScreen.js` | Logo animado, auto-redireciona | Nenhuma | → Login (após 3s) |
| **Login** | `LoginScreen.js` | Formulário email+senha | `POST /auth/login`<br/>`GET /dispositivos/por-usuario/:id` | → MainTabs |
| **Home** | `HomeScreen.js` | Portaria + lista de contatos com status online | `GET /dispositivos`<br/>`GET /status` (signaling) | → Chamada (chamando) |
| **Histórico** | `HistoricoScreen.js` | Chamadas agrupadas por data | `GET /chamadas/por-dispositivo/:androidId` | Nenhuma |
| **Chamada** | `ChamadaScreen.js` | Tela de chamada recebendo/chamando | Socket.io eventos | ← goBack |

### Bugs Conhecidos 

>  **ChamadaScreen:** `handleAceitar` e `handleEncerrar` só fazem `console.log` e `goBack`
> 
> **Problema:** Não emitem eventos socket reais (`aceitar_chamada`, `encerrar_chamada`)

### Serviços

#### `api.js` — Axios Instances

```javascript
authApi      → http://localhost:3001
registroApi  → http://localhost:3002
chamadaApi   → http://localhost:3003
```

#### `socketService.js` — Socket.io Client

```javascript
Socket → http://localhost:3004
```

### Assets

**Imagens (9 total):**
- `avatar.png`
- `historico.png`
- `home.png`
- `logo.png`
- `logo_inicial.png`
- `search.png`
- `settings.png`
- `telefone-offline.png`
- `telefone-online.png`

**Fontes:** Poppins (400, 600, 700) via `@expo-google-fonts/poppins`

### Navegação

```
Splash
  ↓
Login
  ↓
MainTabs (Bottom Tabs)
  ├─ Home
  ├─ Histórico
  └─ Configurações (Settings)
  
  (Modal: ChamadaScreen sobrepõe as abas)
```

**Fluxo Completo:**
```
Splash → Login → Home/Histórico → Chamada
```

### Socket.io

** Eventos Enviados:**
- `registrar`
- `chamar`
- `aceitar_chamada`
- `recusar_chamada`
- `encerrar_chamada`

** Eventos Recebidos:**
- `connect`
- `registrado`
- `chamada_recebida`
- `status_atualizado`
- `chamada_aceita`
- `chamada_recusada`
- `chamada_encerrada`
- `dispositivo_offline`

**Status de Implementação:**
-  Funcionando para registro e chamadas recebidas
-  Ações de aceitar/recusar/encerrar na ChamadaScreen não disparam eventos socket

---

## 6. FRONTEND WEB

### Visão Geral

- **Status:** Frontend visual apenas — **sem integração real com backend**
- **Dados:** Mockados (comentários com chamadas reais de API)

### Páginas

| Página | Arquivo | Descrição |
|--------|---------|-----------|
| **Dashboard** | `index.html` | Métricas, monitor de rede, modal de cadastro |
| **Dispositivos** | `dispositivos.html` | Tabela de dispositivos com CRUD, busca, filtros |

### Stack

| Ferramenta | Versão |
|-----------|--------|
| **Build** | Vite 8 |
| **Markup** | HTML5 |
| **Estilo** | CSS3 (Vanilla) |
| **Lógica** | JavaScript Vanilla |

### Estatísticas de Código

| Arquivo | Linhas |
|---------|--------|
| `style-dashboard.css` | 905 |
| `style-dispositivos.css` | 990 |

### Status

-  **Dados mockados** — sem integração real com APIs
-  **Chamadas API comentadas** — prontas mas não ativas

---

## 7. FLUXOS FUNCIONANDO HOJE

-  **Login:** Tela → auth-service → AsyncStorage → MainTabs
-  **Listar contatos:** HomeScreen → registro-service → lista dispositivos
-  **Status online:** signaling-server socket → HomeScreen (dispositivosOnline)
-  **Histórico filtrado:** HistoricoScreen → chamada-service → chamadas do dispositivo
-  **Registro/logout de dispositivo via socket:** signaling-server
-  **Receber chamada:** signaling-server → HomeScreen → ChamadaScreen (modo recebendo)

---

## 8. FLUXOS COM PROBLEMAS

-  **Aceitar/Recusar/Encerrar chamada:** ChamadaScreen não emite eventos socket
  - `handleAceitar` e `handleEncerrar` são placeholders
  
-  **Iniciar chamada da HomeScreen:** Emite `chamar` via socket, mas backend não cria registro na tabela `chamadas`
  
-  **Atualizar status chamada no banco:** Nenhum fluxo chama `PATCH /chamadas/:id` para registrar `atendidoEm`/`encerradoEm`
  
-  **Notificações push:** Serviço `notif-service` não existe
  
-  **Web frontend:** Dados mockados, sem integração com APIs reais

---

## 9. O QUE FALTA IMPLEMENTAR

###  Prioridade ALTA
*Necessário para demonstração funcional*

1. **Ações de chamada funcionais**
   - ChamadaScreen precisa emitir eventos socket (`aceitar_chamada`, `recusar_chamada`, `encerrar_chamada`)
   - Backend precisa registrar/atualizar chamadas no banco

2. **Criação de chamada no banco ao iniciar**
   - HomeScreen/chamar precisa fazer `POST /chamadas` após emitir socket

3. **notif-service**
   - Implementar serviço de notificações push para alertar moradores
   - Pode ser versão mínima para demonstração

###  Prioridade MÉDIA
*Complementaria o MVP*

4. **Editar dispositivo**
   - Backend não tem `PUT /dispositivos/:id`
   - Rota no Prisma está pronta, só adicionar no router

5. **Refresh token / recuperação de senha**
   - Auth service só tem login e register

6. **Web frontend integrado**
   - Conectar dashboard e dispositivos.js às APIs reais

###  Prioridade BAIXA
*Nice-to-have*

7. **Tela de Configurações**
   - Tab existe mas reusa HomeScreen

8. **Filtros no histórico**
   - Por status, por data

9. **Paginação nas listas**
   - Dispositivos, chamadas

10. **Tema escuro / responsivo avançado**

---

## 10. DÉBITOS TÉCNICOS

###  Configuração e Ambiente

| Problema | Severidade | Descrição |
|----------|-----------|-----------|
| **Hardcodes** |  Alta | URLs fixas `localhost:3001-3004` no frontend e `.env` — sem variáveis de ambiente no mobile |
| **Express inconsistente** |  Média | auth/registro/signaling usam express 5, chamada-service usa express 4 |
| **Import inconsistente** |  Média | chamada-service importa shared-db com caminho relativo (`../../../shared-db`), outros usam symlink |

###  Segurança

| Problema | Severidade | Descrição |
|----------|-----------|-----------|
| **JWT secret hardcoded** |  Crítica | Encontrado no `.env` do repositório: `interfone_secret_2024` |
| **Senhas em texto puro** |  Crítica | Senhas presentes no `docker-compose.yml` |

###  Tratamento de Erros

| Problema | Severidade | Descrição |
|----------|-----------|-----------|
| **Erro em ChamadaScreen** |  Média | Não trata erro de navegação se `route.params` estiver incompleto |

###  Dependências

| Problema | Severidade | Descrição |
|----------|-----------|-----------|
| **Redis e RabbitMQ não utilizados** |  Baixa | Provisionados no Docker mas zero código os utiliza |
| **Notif-service vazio** |  Bloqueador | Diretório existe mas sem nenhum arquivo |

###  Seed

| Problema | Severidade | Descrição |
|----------|-----------|-----------|
| **Seed sem verificação** |  Média | Seed.ts sempre recria dados, sem verificar se já existem |

---

## 11. RECOMENDAÇÕES PARA APRESENTAÇÃO

###  O que Demonstrar ao Vivo

1. **Login com usuário seed**
   - Email: `gabriel@interfacil.com`
   - Senha: `senha123`

2. **HomeScreen — Contatos com Status Online**
   - Mostrar lista de dispositivos
   - Exibir ícones de status (online/offline)

3. **Iniciar Chamada**
   - Se signaling server estiver rodando com 2 dispositivos
   - Demonstrar recebimento em tempo real

4. **Histórico — Chamadas Filtradas**
   - Agrupadas por data
   - Exibindo status e direção

###  Ordem Sugerida de Execução

```bash
# 1. Iniciar infraestrutura
docker compose up

# 2. Iniciar backend (em ordem)
# Terminal 1: Auth Service
cd backend/auth-service && npm install && npm start

# Terminal 2: Shared DB (generate + seed)
cd backend/shared-db && npm install && npx prisma db push && npx prisma db seed

# Terminal 3: Registro Service
cd backend/registro-service && npm install && npm start

# Terminal 4: Chamada Service
cd backend/chamada-service && npm install && npm start

# Terminal 5: Signaling Server
cd signaling-server && npm install && npm start

# 3. Iniciar mobile
npx expo start
```

###  Pontos Fortes

-  Arquitetura de microsserviços bem definida
-  Prisma com schema completo e seed funcional
-  Socket.io integrado para tempo real
-  AsyncStorage persistindo sessão
-  Código organizado e limpo

###  Pontos a Evitar na Demo

-  **Não demonstrar** ações de aceitar/recusar chamada (não funcionam de verdade)
-  **Não mencionar** notif-service vazio
-  **Evitar mostrar** ChamadaScreen como "completa" (ações socket são placeholder)
-  **Não mostrar** Redis/RabbitMQ se perguntarem (não são usados)

---

