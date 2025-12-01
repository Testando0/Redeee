import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Esta configuração garante que o Vite use a pasta 'frontend' como raiz
// do projeto e coloque o build na pasta 'dist' na raiz do Docker (/app/dist).

export default defineConfig({
  plugins: [react()],
  root: './frontend', // Diz ao Vite para procurar index.html e main.jsx aqui
  build: {
    // A pasta de saída do build (será /app/dist no Docker)
    outDir: '../dist', 
    emptyOutDir: true
  }
});
