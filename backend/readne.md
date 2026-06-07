Aqui está o README atualizado completo:

---

# InterFacil — Sistema de Interfone Inteligente

Guia completo para rodar o projeto localmente do zero.

---

## Pré-requisitos

| Ferramenta | Link |
|---|---|
| Node.js v18 ou superior | https://nodejs.org |
| Docker Desktop | https://www.docker.com/products/docker-desktop |
| Git | https://git-scm.com |
| VS Code | https://code.visualstudio.com |
| Expo Go (celular Android/iOS) | Play Store / App Store |
| DBeaver (opcional) | https://dbeaver.io |
| Postman (opcional) | https://www.postman.com |

---

## Estrutura do projeto

```
InterFacil/
├── backend/
│   ├── shared-db/            # Banco de dados centralizado (Prisma)
│   ├── auth-service/         # Autenticação e JWT
│   ├── registro-service/     # Cadastro de residências e dispositivos
│   ├── chamada-service/      # Gerenciamento de chamadas
│   └── notif-service/        # Notificações push
├── signaling-server/         # Servidor WebRTC (Socket.io)
├── android-app/              # App mobile (Expo / React Native)
├── painel-admin/             # Painel web (React)
└── docker-compose.yml        # Infraestrutura local
```

---

## 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/interfacil.git
cd interfacil
```

---

## 2. Suba a infraestrutura com Docker

Com o Docker Desktop aberto e rodando, execute na raiz do projeto:

```bash
docker-compose up -d
```

Verifique se os 3 containers estão rodando:

```bash
docker ps
```

Você deve ver:

```
interfone-postgres    → porta 5432
interfone-redis       → porta 6379
interfone-rabbitmq    → porta 5672 e 15672
```

Painel do RabbitMQ: **http://localhost:15672**
- Usuário: `admin`
- Senha: `senha123`

---

## 3. Banco de dados centralizado (shared-db)

O projeto utiliza um único módulo de banco de dados compartilhado entre todos os microsserviços. Você só precisa rodar a migration uma vez.

```bash
cd backend/shared-db
npm install
```

Crie o arquivo `.env` em `backend/shared-db/`:

```env
DATABASE_URL="postgresql://admin:senha123@localhost:5432/interfone"
```

Rode a migration e o seed:

```bash
npx prisma migrate dev --name shared_init
npx prisma generate
npm run seed
```

O seed cria automaticamente:
- 1 usuário admin
- 3 moradores
- 3 residências
- 1 portaria
- 4 dispositivos
- 3 chamadas de exemplo

As 7 tabelas criadas são: `usuarios`, `residencias`, `dispositivos`, `chamadas`, `notificacoes`, `atualizacoes_remotas`, `logs_sistema`.

> A partir de agora, nunca mais rode `prisma migrate` dentro dos microsserviços individuais. Todas as alterações no banco são feitas aqui no `shared-db`.

---

## 4. Auth Service

```bash
cd backend/auth-service
npm install
```

Crie o `.env` em `backend/auth-service/`:

```env
DATABASE_URL="postgresql://admin:senha123@localhost:5432/interfone"
JWT_SECRET="interfone_secret_2024"
PORT=3001
```

Inicie o serviço:

```bash
npm run dev
```

### Testar no Postman

**Login com o admin do seed:**
```
POST http://localhost:3001/auth/login
Content-Type: application/json

{
  "email": "admin@interfone.com",
  "senha": "123456"
}
```

Resposta esperada:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

> Guarde esse token — ele será usado nas requisições autenticadas.

---

## 5. Registro Service

```bash
cd backend/registro-service
npm install
```

Crie o `.env` em `backend/registro-service/`:

```env
DATABASE_URL="postgresql://admin:senha123@localhost:5432/interfone"
PORT=3002
```

Inicie o serviço:

```bash
npm run dev
```

### Testar no Postman

**Listar residências (já populadas pelo seed):**
```
GET http://localhost:3002/residencias
```

**Listar dispositivos:**
```
GET http://localhost:3002/dispositivos
```

**Cadastrar nova residência:**
```
POST http://localhost:3002/residencias
Content-Type: application/json

{
  "identificador": "Apartamento 102",
  "bloco": "A",
  "usuarioId": 1
}
```

**Cadastrar dispositivo:**
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

---

## 6. App mobile (Expo)

```bash
cd android-app
npm install
```

Inicie o app:

```bash
npx expo start
```

Um QR Code aparecerá no terminal. Abra o app **Expo Go** no seu celular Android e escaneie o QR Code para rodar o app diretamente no dispositivo.

> O celular e o computador precisam estar na mesma rede Wi-Fi.

---

## 7. Visualizar os dados no DBeaver

### Criar a conexão

1. Abra o DBeaver
2. Clique em **"New Database Connection"**
3. Selecione **PostgreSQL** → **Next**
4. Preencha:

| Campo | Valor |
|---|---|
| Host | localhost |
| Port | 5432 |
| Database | interfone |
| Username | admin |
| Password | senha123 |

5. Clique em **"Test Connection"** — na primeira vez ele pedirá para baixar o driver, clique em **Download**
6. Clique em **Finish**

### Visualizar as tabelas

No painel esquerdo navegue até:

```
interfone → Schemas → public → Tables
```

Você verá as 7 tabelas do projeto. Clique com botão direito em qualquer uma → **"View Data"** para ver os registros.

---

## Portas utilizadas

| Serviço | Porta |
|---|---|
| Auth Service | 3001 |
| Registro Service | 3002 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| RabbitMQ (AMQP) | 5672 |
| RabbitMQ (Painel) | 15672 |

---

## Dúvidas frequentes

**Os containers não sobem:** Verifique se o Docker Desktop está aberto antes de rodar `docker-compose up -d`.

**Erro de conexão com o banco:** Confirme que o container `interfone-postgres` está rodando com `docker ps`.

**App não conecta ao backend pelo Expo:** Certifique-se de que o celular e o computador estão na mesma rede Wi-Fi. Substitua `10.0.2.2` pelo IP local do seu computador (ex: `192.168.1.x`).

**Porta já em uso:** Troque o `PORT` no `.env` do serviço correspondente.