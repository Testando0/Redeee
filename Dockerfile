# -----------------------------------------------------------------------------
# STAGE 1: CONSTRUÇÃO (Instala dependências e faz o build do Frontend)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

# Define o diretório de trabalho como a raiz da aplicação
WORKDIR /app

# Copia os arquivos de configuração do backend e o package.json
COPY backend/package.json .
COPY backend/server.js .

# Instala TODAS as dependências (incluindo as de dev como Vite e React)
# O Vite precisa dessas dependências para o build
RUN npm install

# Copia o restante do código fonte (Frontend e configurações do Vite)
COPY backend/vite.config.js ./backend/
COPY frontend/ ./frontend/

# CRÍTICO: Roda o build a partir da raiz. 
# O script 'build' no package.json será atualizado para ser explícito.
RUN npm run build

# -----------------------------------------------------------------------------
# STAGE 2: AMBIENTE DE EXECUÇÃO (RUNTIME)
# -----------------------------------------------------------------------------
FROM node:20-alpine

# Define o diretório de trabalho principal
WORKDIR /app

# 1. Copia o package.json do estágio anterior e instala SÓ as dependências de produção
COPY --from=builder /app/package.json .
RUN npm install --only=production

# 2. Copia o arquivo principal do servidor
COPY --from=builder /app/server.js .

# 3. Copia os arquivos estáticos do Frontend (já construídos)
# O build do Vite coloca o resultado no diretório 'dist'
COPY --from=builder /app/dist /app/public

EXPOSE 3001 
# Comando de inicialização: Roda o servidor Node.js.
CMD ["node", "server.js"]
