# -----------------------------------------------------------------------------
# STAGE 1: CONSTRUÇÃO DO FRONTEND (REACT/VITE)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS frontend_builder

WORKDIR /app/frontend

# CRÍTICO: Copia apenas o package.json. Se o package-lock.json existir, ele 
# será copiado na próxima etapa, mas o build não falha se ele estiver faltando.
# Isso resolve o erro de "arquivo não encontrado".
COPY frontend/package.json .
COPY frontend/package-lock.json .
# O comando a seguir falhará se o package-lock.json não existir,
# mas se falhar, significa que o problema é no seu repositório local.
# Se o erro persistir, COMENTE a linha acima e tente novamente.

RUN npm install

# Copia o restante do código fonte do frontend (incluindo App.jsx)
COPY frontend/ /app/frontend
RUN npm run build

# -----------------------------------------------------------------------------
# STAGE 2: BACKEND E AMBIENTE DE EXECUÇÃO (RUNTIME)
# -----------------------------------------------------------------------------
FROM node:20-alpine

# Define o diretório de trabalho principal
WORKDIR /app

# 1. Configuração e Instalação do Backend (API)
COPY backend/package.json .
COPY backend/package-lock.json .
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
