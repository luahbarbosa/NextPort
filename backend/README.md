# NextPort — Guia do Backend

Guia completo para rodar o backend do projeto localmente do zero.

---

## Pre-requisitos

| Ferramenta | Link |
|---|---|
| Node.js v18 ou superior | https://nodejs.org |
| Docker Desktop | https://www.docker.com/products/docker-desktop |
| Git | https://git-scm.com |
| DBeaver (opcional) | https://dbeaver.io |
| Postman (opcional) | https://www.postman.com |

---

## Estrutura do projeto

```
NextPort/
├── docker-compose.yml        # PostgreSQL, Redis, RabbitMQ
├── start.bat                 # Script para iniciar todos os servicos
├── backend/
│   ├── shared-db/            # Banco de dados centralizado (Prisma)
│   ├── auth-service/         # Autenticacao e JWT
│   ├── registro-service/     # Cadastro de residencias e dispositivos
│   ├── chamada-service/      # Gerenciamento de chamadas
│   └── notif-service/        # Notificacoes push (pendente)
├── signaling-server/         # Servidor de sinalizacao (Socket.io)
└── Frontend/
    ├── (painel web Vite)
    └── mobile/               # App React Native (Expo)
```

---

## 1. Clone o repositorio

```bash
git clone https://github.com/seu-usuario/nextport.git
cd nextport
```

---

## 2. Suba a infraestrutura com Docker

Com o Docker Desktop aberto e rodando, execute na raiz do projeto:

```bash
docker compose up -d
```

Verifique se os 3 containers estao rodando:

```bash
docker ps
```

Voce deve ver:

```
interfone-postgres    -> porta 5432
interfone-redis       -> porta 6379
interfone-rabbitmq    -> porta 5672 e 15672
```

Painel do RabbitMQ: **http://localhost:15672**
- Usuario: `admin`
- Senha: `senha123`

---

## 3. Banco de dados centralizado (shared-db)

O projeto utiliza um unico modulo de banco de dados compartilhado entre todos os microservicos.

```bash
cd backend/shared-db
npm install
```

Crie o arquivo `.env` em `backend/shared-db/`:

```env
DATABASE_URL="postgresql://admin:senha123@localhost:5432/interfone"
```

Rode o schema e o seed:

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

O seed cria automaticamente:
- 4 usuarios (admin, Gabriel, Laura, Felipe)
- 3 residencias (APTO 001-003)
- 4 dispositivos (1 portaria + 3 celulares)
- 3 chamadas de exemplo

As 7 tabelas criadas sao: `usuarios`, `residencias`, `dispositivos`, `chamadas`, `notificacoes`, `atualizacoes_remotas`, `logs_sistema`.

> A partir de agora, nunca mais rode `prisma migrate` dentro dos microservicos individuais. Todas as alteracoes no banco sao feitas aqui no `shared-db`.

---

## 4. Iniciar todos os servicos (start.bat)

O arquivo `start.bat` na raiz do projeto inicia **todos os 4 servicos backend de uma vez**, cada um em uma janela separada:

```bat
start.bat
```

O que o script faz automaticamente:
1. Verifica se o PostgreSQL esta rodando no Docker
2. Instala dependencias do `shared-db` no `chamada-service` (se necessario)
3. Abre 4 janelas do CMD, cada uma rodando um servico

> Pre-requisitos: Docker Desktop aberto com containers rodando (`docker compose up -d`), Node.js e npm instalados.

### Alternativa: iniciar cada servico manualmente

Se preferir iniciar um servico por vez, abra terminais separados:

**Auth Service (porta 3001):**
```bash
cd backend/auth-service
npm install
npm run dev
```

Crie o `.env` em `backend/auth-service/`:
```env
DATABASE_URL="postgresql://admin:senha123@localhost:5432/interfone"
JWT_SECRET="interfone_secret_2024"
PORT=3001
```

**Registro Service (porta 3002):**
```bash
cd backend/registro-service
npm install
npm run dev
```

Crie o `.env` em `backend/registro-service/`:
```env
DATABASE_URL="postgresql://admin:senha123@localhost:5432/interfone"
PORT=3002
```

**Chamada Service (porta 3003):**
```bash
cd backend/chamada-service
npm install
npm run dev
```

Crie o `.env` em `backend/chamada-service/`:
```env
DATABASE_URL="postgresql://admin:senha123@localhost:5432/interfone"
PORT=3003
```

**Signaling Server (porta 3004):**
```bash
cd signaling-server
npm install
npm run start
```

Crie o `.env` em `signaling-server/`:
```env
PORT=3004
```

---

## 5. Testar no Postman

### Login com o admin do seed

```
POST http://localhost:3001/auth/login
Content-Type: application/json

{
  "email": "admin@interfacil.com",
  "senha": "admin123"
}
```

Resposta esperada:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

> Guarde esse token — ele sera usado nas requisicoes autenticadas.

### Listar residencias (populadas pelo seed)

```
GET http://localhost:3002/residencias
```

### Listar dispositivos

```
GET http://localhost:3002/dispositivos
```

### Cadastrar nova residencia

```
POST http://localhost:3002/residencias
Content-Type: application/json

{
  "identificador": "Apartamento 102",
  "bloco": "A",
  "usuarioId": 1
}
```

### Cadastrar dispositivo

```
POST http://localhost:3002/dispositivos
Content-Type: application/json

{
  "nomeDispositivo": "Celular Apto 102",
  "androidId": "apto-102-device",
  "tipo": "residencia",
  "residenciaId": 1
}
```

### Listar chamadas

```
GET http://localhost:3003/chamadas
```

### Chamadas por dispositivo

```
GET http://localhost:3003/chamadas/por-dispositivo/<androidId>
```

---

## 6. Visualizar os dados no DBeaver

### Criar a conexao

1. Abra o DBeaver
2. Clique em **"New Database Connection"**
3. Selecione **PostgreSQL** e clique em **Next**
4. Preencha:

| Campo | Valor |
|---|---|
| Host | localhost |
| Port | 5432 |
| Database | interfone |
| Username | admin |
| Password | senha123 |

5. Clique em **"Test Connection"** — na primeira vez ele pedira para baixar o driver, clique em **Download**
6. Clique em **Finish**

### Visualizar as tabelas

No painel esquerdo navegue ate:

```
interfone -> Schemas -> public -> Tables
```

Voce vera as 7 tabelas do projeto. Clique com botao direito em qualquer uma e selecione **"View Data"** para ver os registros.

---

## Portas utilizadas

| Servico | Porta |
|---|---|
| Auth Service | 3001 |
| Registro Service | 3002 |
| Chamada Service | 3003 |
| Signaling Server | 3004 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| RabbitMQ (AMQP) | 5672 |
| RabbitMQ (Painel) | 15672 |

---

## Duvidas frequentes

**Os containers nao sobem:** Verifique se o Docker Desktop esta aberto antes de rodar `docker compose up -d`.

**Erro de conexao com o banco:** Confirme que o container `interfone-postgres` esta rodando com `docker ps`.

**App nao conecta ao backend pelo Expo:** Certifique-se de que o celular e o computador estao na mesma rede Wi-Fi. Atualize o IP no `.env` do mobile para o endereco IP local do computador.

**Porta ja em uso:** Troque o `PORT` no `.env` do servico correspondente.

**Seed rodou duas vezes e duplicou dados:** Delete o banco e rode novamente:
```bash
cd backend/shared-db
npx prisma db push --force-reset
npx prisma db seed
```
