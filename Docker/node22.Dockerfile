# Etapa 1: Build
FROM node:22 AS builder

WORKDIR /app

# Copiar dependências primeiro (melhor uso de cache)
COPY package*.json tsconfig.json ./

RUN npm install

# Copiar código fonte
COPY src ./src

# Compilar
RUN npx tsc

# Etapa 2: Runtime (sem node_modules de dev)
FROM node:22-slim

WORKDIR /app

# Copiar package.json e instalar só as dependências de produção
COPY package*.json ./
RUN npm install --only=production

# Copiar apenas os arquivos compilados (sem node_modules de dev)
COPY --from=builder /app/dist ./dist

# Criar pasta de logs
RUN mkdir -p /app/logs

CMD ["node", "dist/index.js"]