# API de Produtos

Uma **API RESTful** para gerenciamento de produtos, construída com **TypeScript**, **Node.js**, **Express**, **MongoDB** e **MariaDB**. Permite realizar operações de **CRUD** (Criar, Ler, Atualizar e Deletar) produtos, com autenticação de usuários e registro de logs.

---

## Tecnologias Utilizadas

* **Node.js + TypeScript**
* **Express**
* **MongoDB**
* **MariaDB**
* **Docker**

---

## Funcionalidades

* CRUD completo de produtos:

  * Criar novos produtos
  * Listar produtos
  * Atualizar produtos existentes
  * Deletar produtos
  * Pesquisar por produtos
* Autenticação com JWT
* Registro de logs de operações
* Suporte a múltiplos bancos de dados (**MongoDB** e **MariaDB**)

---

## Instalação e Configuração

### 1. Clonar o repositório

```bash
git clone https://github.com/diogopython/Servidor-produtosAPI-TS.git
cd Servidor-produtosAPI-TS
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar o arquivo `.env` (exemplo)

```env
# MariaDB
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=senha
DB_DATABASE=produtosAPI
DB_PORT=3306

# Token JWT
JWT_SECRET=seu_segredo_jwt_aqui
JWT_EXPIRES_IN=1h

# MongoDB
MONGO_URL=mongodb://user:senha@localhost:27017
MONGO_DB=produtosdb

# Porta da API
PORT=3000

# Manutenção
VALID=true
MSG='Estamos em manutenção, por favor aguarde e tente novamente mais tarde.'
```

### 4. Rodar a API em modo de desenvolvimento

```bash
npm run dev
```

---

## Docker (build & run)

### Build (exemplo)

```bash
# Node 22 + Alpine
docker build -t api-produtos-node22-alpine -f Docker/node22-alpine.Dockerfile .

# Node 22 + Debian
docker build -t api-produtos-node22-debian -f Docker/node22.Dockerfile .

# Node 18 + Debian
docker build -t api-produtos-node18-debian -f Docker/node18.Dockerfile .
```

### Run (exemplo)

```bash
docker run --env-file /your/path/.env \
  -p 3000:3000 \
  --name api-produtos \
  api-produtos-node22-alpine
```

> Se preferir, rode em uma linha só:

```bash
docker run --env-file /your/path/.env -p 3000:3000 --name api-produtos api-produtos-node22-alpine
```

---