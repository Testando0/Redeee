# -----------------------------------------------------------------------------
# STAGE 1: CONSTRUÇÃO DO FRONTEND (REACT/VITE)
# Objetivo: Criar a pasta 'dist' otimizada do React.
# -----------------------------------------------------------------------------
FROM node:20-alpine AS frontend_builder

WORKDIR /app/frontend

# 1. Copia o package.json e instala as dependências do frontend.
# OMITIMOS o package-lock.json para evitar o erro de arquivo não encontrado.
COPY frontend/package.json .
RUN npm install

# 2. Copia o código fonte do frontend e executa o build (cria a pasta 'dist')
COPY frontend/ /app/frontend
RUN npm run build

# -----------------------------------------------------------------------------
# STAGE 2: BACKEND E AMBIENTE DE EXECUÇÃO (RUNTIME)
# Objetivo: Servir a API e os arquivos estáticos do Frontend.
# -----------------------------------------------------------------------------
FROM node:20-alpine

# Define o diretório de trabalho principal
WORKDIR /app

# 1. Configuração e Instalação do Backend (API)
# OMITIMOS o package-lock.json do backend também para máxima compatibilidade.
COPY backend/package.json .
RUN npm install --only=production

# 2. Copia o código do servidor (o server.js unificado)
COPY backend/server.js .

# 3. Copia os arquivos estáticos do Frontend (já construídos)
# Copia o resultado do build do Stage 1 para a pasta 'public' do nosso servidor Node.
COPY --from=frontend_builder /app/frontend/dist /app/public

# 4. Configuração de Rede
EXPOSE 3001 

# Comando de inicialização: Roda o servidor Node.js.
CMD ["node", "server.js"]
