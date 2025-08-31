# API de Produtos

Uma **API RESTful** para gerenciamento de produtos, construída com **TypeScript**, **Node.js**, **Express**, **MongoDB** e **MariaDB**. Permite realizar operações de **CRUD** (Criar, Ler, Atualizar e Deletar) produtos, com autenticação de usuários e registro de logs.

---

## Tecnologias Utilizadas

- **Node.js**: Ambiente de execução TypeScript/JavaScript no servidor  
- **Express**: Framework para criação de APIs RESTful  
- **MongoDB**: Banco de dados NoSQL para armazenamento de dados  
- **MariaDB**: Banco de dados relacional para gerenciamento de informações estruturadas  

---

## Funcionalidades

- CRUD completo de produtos:
  - Criar novos produtos  
  - Listar produtos  
  - Atualizar produtos existentes  
  - Deletar produtos
  - Pesquisar por produtos
- Autenticação básica de usuários  
- Registro de logs de operações  
- Suporte a múltiplos bancos de dados (**MongoDB** e **MariaDB**)  

---

## Instalação e Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/diogopython/Servidor-produtosAPI-TS.git
cd Servidor-produtosAPI-TS
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar o .env da aplicaçao. Exemplo:
```bash
# banco de dados
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=*senha*
DB_DATABASE=produtosAPI

# token
JWT_SECRET=983hye983gr43t53fg5hy24ytg
JWT_EXPIRES_IN=1h

# mongodb
MONGO_URL="mongodb://user:senha@localhost:27017"
MONGO_DB=produtosdb

# porta
PORT=3000

# ativaçao
VALID=true
MSG="Estamos em manutençao, por favor aquarde e tente novamente mais tartde."
```

### 4. Rodar a API

```bash
npm run dev
```
