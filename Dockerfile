# -----------------------------------------------------------------------------
# STAGE 1: CONSTRUÇÃO (Instala dependências e faz o build do Frontend)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

# O diretório de trabalho será o backend, onde está o único package.json
WORKDIR /app/backend

# CRÍTICO: Copia TODAS as pastas (backend e frontend) para o contexto de build.
# Isso garante que o package.json e os arquivos do React estejam no lugar.
COPY backend/ /app/backend/
COPY frontend/ /app/frontend/

# 1. Instala todas as dependências (incluindo as de dev, como Vite)
# Roda o npm install na pasta /app/backend
RUN npm install

# 2. Executa o build do Frontend
# O script 'build' está no backend/package.json e usa o vite.config.js
# O resultado do build (dist) será criado dentro de /app/backend/
RUN npm run build

# -----------------------------------------------------------------------------
# STAGE 2: AMBIENTE DE EXECUÇÃO (RUNTIME)
# -----------------------------------------------------------------------------
FROM node:20-alpine

WORKDIR /app

# 1. Copia o package.json do estágio anterior e instala SÓ as dependências de produção
COPY --from=builder /app/backend/package.json .
RUN npm install --only=production

# 2. Copia o arquivo principal do servidor
COPY --from=builder /app/backend/server.js .

# 3. Copia os arquivos estáticos do Frontend (já construídos)
# O build foi feito em /app/backend/dist, mas copiamos para /app/public (como o server.js espera)
COPY --from=builder /app/backend/dist /app/public

EXPOSE 3001 
# Comando de inicialização: Roda o servidor Node.js.
CMD ["node", "server.js"]
