# -----------------------------------------------------------------------------
# STAGE 1: CONSTRUÇÃO DO FRONTEND (REACT/VITE)
# -----------------------------------------------------------------------------
# Usamos uma imagem Node completa para o processo de build do frontend.
FROM node:20-alpine AS frontend_builder

WORKDIR /app/frontend

# Copia e instala dependências do frontend
COPY frontend/package.json .
COPY frontend/package-lock.json .
# Nota: Recomenda-se usar package-lock.json
RUN npm install

# Copia o código fonte do frontend e executa o build (cria a pasta 'dist')
COPY frontend/ /app/frontend
RUN npm run build

# -----------------------------------------------------------------------------
# STAGE 2: BACKEND E AMBIENTE DE EXECUÇÃO (RUNTIME)
# -----------------------------------------------------------------------------
# Usamos uma imagem Node mais leve para o ambiente de produção.
FROM node:20-alpine

# Define o diretório de trabalho principal
WORKDIR /app

# 1. Configuração e Instalação do Backend (API)
# Copia o package.json do backend para instalar apenas as dependências de produção
COPY backend/package.json .
COPY backend/package-lock.json .
RUN npm install --only=production

# 2. Copia o código do servidor
# O server.js FINAL deve ser uma versão que serve arquivos estáticos (ver arquivo abaixo)
COPY backend/server.js .

# 3. Copia os arquivos estáticos do Frontend (já construídos)
# Copia o resultado do build do Stage 1 para a pasta 'public' do nosso servidor Node.
COPY --from=frontend_builder /app/frontend/dist /app/public

# 4. Configuração de Rede
# Render e outras plataformas injetam a porta na variável de ambiente $PORT. 
# Nosso server.js será ajustado para usar essa variável.
EXPOSE 3001 

# Comando de inicialização: Roda o servidor Node.js.
CMD ["node", "server.js"]
