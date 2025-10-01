# Gerenciador de Produtos
# API:

Uma **API RESTful** para gerenciamento de produtos, construída com **TypeScript**, **Node.js**, **Express**, **MongoDB** e **MariaDB**. Permite realizar operações de **CRUD** (Criar, Ler, Atualizar e Deletar) produtos, com autenticação de usuários e registro de logs.

---

### Tecnologias Utilizadas

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
* Geraçao e altentificaçao por credenciais JWT
* Rota para apagar a conta

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
## API SERVER =>
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

# Email
SMTP_ACTIV=true
SMTP_SERVER=servidor_email
SMTP_PORT=porta_do_servidor
SMTP_USER=seu_email_do_serviço
SMTP_PASS=sua_senha
ADMIN_EMAIL=email_para_ser_avisado_pelo_servidor

## WEB SERVER =>
WEB_PORT=4040
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
docker run -d \
  --name api-produtos \
  --env-file /your/path/.env \
  -v /your/path/logs:/app/logs \
  -p 3000:3000 \
  -p 4040:4040 \
  api-produtos-node22
```

> Se preferir, rode em uma linha só:

```bash
docker run -d --name api-produtos --env-file /your/path/.env -v /your/path/logs:/app/logs -p 3000:3000 -p 4040:4040 api-produtos-node22
```

---

# WEB:
# 🌐 Produtos-CLI-Web

---

## 🚀 Funcionalidades

- 🔑 **Login**
- 📝 **Registro de usuário**
- 💾 **Login automático via credencial salva no navegador**
- ➕ **Adicionar produtos**
- ❌ **Remover produtos**
- 🚪 **Logout**
- 🗑️ **Apagar conta**

---

## 🛠️ Tecnologias

- **HTML5**
- **CSS3**
- **JavaScript (Vanilla JS)**

---

## 📦 Como usar

1. A aplicaçao web e iniciada junto com a api comum simples:
   ```bash
   npm run dev
   ```

---
# Imagem

- **Images do projeto**
- ![Screenshot ilustrativa do projeto](./screenshot.png)