# InterFacil — Sistema de Interfone Inteligente

Guia completo para rodar o projeto localmente do zero.

---

## Pré-requisitos

Instale as ferramentas abaixo antes de começar:

| Ferramenta | Link |
|---|---|
| Node.js v18 ou superior | https://nodejs.org |
| Docker Desktop | https://www.docker.com/products/docker-desktop |
| Git | https://git-scm.com |
| Android Studio | https://developer.android.com/studio |
| VS Code | https://code.visualstudio.com |
| DBeaver (opcional) | https://dbeaver.io |
| Postman (opcional) | https://www.postman.com |

---

## Estrutura do projeto

```
InterFacil/
├── backend/
│   ├── auth-service/         # Autenticação e JWT
│   ├── registro-service/     # Cadastro de residências e dispositivos
│   ├── chamada-service/      # Gerenciamento de chamadas
│   └── notif-service/        # Notificações push
├── signaling-server/         # Servidor WebRTC (Socket.io)
├── android-app/              # App Android (Kotlin)
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

Aguarde cerca de 30 segundos e verifique se os 3 containers estão rodando:

```bash
docker ps
```

Você deve ver:

```
interfone-postgres    → porta 5432
interfone-redis       → porta 6379
interfone-rabbitmq    → porta 5672 e 15672
```

Para confirmar que o RabbitMQ subiu, acesse no navegador:
**http://localhost:15672**
- Usuário: `admin`
- Senha: `senha123`

---

## 3. Auth Service

### Instalar e configurar

```bash
cd backend/auth-service
npm install
```

Crie o arquivo `.env` na pasta `backend/auth-service/`:

```env
DATABASE_URL="postgresql://admin:senha123@localhost:5432/interfone"
JWT_SECRET="interfone_secret_2024"
PORT=3001
```

### Rodar a migration do banco

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Iniciar o serviço

```bash
npm run dev
```

Deve aparecer no terminal:
```
Auth Service rodando na porta 3001
```

### Testar no Postman

**Cadastrar administrador:**
```
POST http://localhost:3001/auth/register
Content-Type: application/json

{
  "email": "admin@interfone.com",
  "senha": "123456"
}
```

Resposta esperada:
```json
{
  "mensagem": "Usuário criado",
  "id": 1
}
```

**Fazer login:**
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

## 4. Registro Service

### Instalar e configurar

```bash
cd backend/registro-service
npm install
```

Crie o arquivo `.env` na pasta `backend/registro-service/`:

```env
DATABASE_URL="postgresql://admin:senha123@localhost:5432/interfone"
PORT=3002
```

### Rodar a migration do banco

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Iniciar o serviço

```bash
npm run dev
```

Deve aparecer no terminal:
```
Registro Service rodando na porta 3002
```

### Testar no Postman

**Cadastrar uma residência:**
```
POST http://localhost:3002/residencias
Content-Type: application/json

{
  "nome": "Apartamento 101",
  "numero": "101"
}
```

**Cadastrar a portaria:**
```
POST http://localhost:3002/dispositivos
Content-Type: application/json

{
  "nome": "Portaria Principal",
  "token": "portaria-001",
  "tipo": "portaria"
}
```

**Cadastrar dispositivo de uma residência:**
```
POST http://localhost:3002/dispositivos
Content-Type: application/json

{
  "nome": "Dispositivo Apto 101",
  "token": "apto-101-device",
  "tipo": "residencia",
  "residenciaId": 1
}
```

**Listar residências:**
```
GET http://localhost:3002/residencias
```

**Listar dispositivos:**
```
GET http://localhost:3002/dispositivos
```

---

## 5. Visualizar os dados no DBeaver

O DBeaver permite visualizar todas as tabelas do banco de dados PostgreSQL.

### Criar a conexão

1. Abra o DBeaver
2. Clique no ícone de tomada no canto superior esquerdo — **"New Database Connection"**
3. Selecione **PostgreSQL** e clique em **Next**
4. Preencha os campos:

| Campo | Valor |
|---|---|
| Host | localhost |
| Port | 5432 |
| Database | interfone |
| Username | admin |
| Password | senha123 |

5. Clique em **"Test Connection"**
   - Na primeira vez, o DBeaver pedirá para baixar o driver do PostgreSQL — clique em **Download** e aguarde
6. Clique em **Finish**

### Visualizar as tabelas

No painel esquerdo, navegue até:

```
interfone → Schemas → public → Tables
```

Você verá as tabelas:
- `Usuario` — administradores cadastrados
- `Residencia` — apartamentos e casas
- `Dispositivo` — celulares associados às residências

### Ver os dados de uma tabela

Clique com o botão direito em qualquer tabela e selecione **"View Data"**.

Os registros aparecerão em formato de planilha, onde você pode filtrar, ordenar e exportar.

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

**Os containers não sobem:**
Verifique se o Docker Desktop está aberto e rodando antes de executar `docker-compose up -d`.

**Erro de conexão com o banco:**
Confirme que o container `interfone-postgres` está rodando com `docker ps` e que o `.env` tem a URL correta.

**Porta já em uso:**
Algum outro serviço está usando a porta. Troque o `PORT` no `.env` para outra porta disponível.

**npm run dev não encontra o arquivo:**
Confirme que a pasta `src/` e o arquivo `index.js` foram criados corretamente dentro do serviço.