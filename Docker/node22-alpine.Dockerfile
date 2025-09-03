# Etapa 1: Build
FROM node:22-alpine AS builder

# Instalar ferramentas de build necessárias
#RUN apk add --no-cache git python3 make g++

WORKDIR /app

# Copiar package.json e tsconfig
COPY package*.json tsconfig.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY src ./src

# Compilar TypeScript
RUN npx tsc

# Etapa 2: Runtime
FROM node:22-alpine

WORKDIR /app

# Instalar apenas dependências de produção
COPY package*.json ./
RUN npm install --only=production

# Copiar arquivos compilados
COPY --from=builder /app/dist ./dist

# Criar pasta de logs
RUN mkdir -p /app/logs

# Rodar aplicação
CMD ["node", "dist/index.js"]
