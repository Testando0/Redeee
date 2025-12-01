# -----------------------------------------------------------------------------
# STAGE 1: CONSTRUÇÃO (Instala dependências e faz o build do Frontend)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

# 1. Copia o backend/package.json (o único que você tem) e o server.js
WORKDIR /app
COPY backend/package.json .
COPY backend/server.js .

# 2. Instala TODAS as dependências do backend (incluindo as de dev como Vite e React)
RUN npm install

# 3. Copia TODO o código fonte (Frontend e Backend)
COPY backend/ /app/backend/
COPY frontend/ /app/frontend/

# 4. CONFIGURAÇÃO CRÍTICA DO BUILD:
# Mudamos o diretório de trabalho para onde o index.html está (frontend).
# Rodamos o build DENTRO do /app/frontend.
# O resultado (dist) será criado em /app/frontend/dist.
WORKDIR /app/frontend

# CRÍTICO: Roda o build (que usa o script definido no backend/package.json)
# O build deve funcionar aqui porque o index.html e main.jsx estão no diretório atual.
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
# O build foi feito em /app/frontend/dist e é copiado para /app/public (como o server.js espera)
COPY --from=builder /app/frontend/dist /app/public

EXPOSE 3001 
# Comando de inicialização: Roda o servidor Node.js.
CMD ["node", "server.js"]
