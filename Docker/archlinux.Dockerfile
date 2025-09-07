# Etapa 1: Build
FROM archlinux:latest AS builder

# Instalar dependências básicas e curl
RUN pacman -Syu --noconfirm curl git base-devel

# Instalar Node.js e npm via NodeSource
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && pacman -S --noconfirm nodejs npm

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
FROM archlinux:latest

# Instalar Node.js e npm runtime
RUN pacman -Syu --noconfirm curl \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && pacman -S --noconfirm nodejs npm \
    && pacman -Scc --noconfirm

WORKDIR /app

# Copiar package.json e instalar dependências de produção
COPY package*.json ./
RUN npm install --only=production

# Copiar arquivos compilados do builder
COPY --from=builder /app/dist ./dist

# Criar pasta de logs
RUN mkdir -p /app/logs

# Rodar aplicação
CMD ["node", "dist/index.js"]
