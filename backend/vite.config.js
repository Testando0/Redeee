import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Este arquivo configura o Vite para buscar os arquivos na pasta 'frontend'
// mesmo sendo executado a partir da pasta 'backend'.

export default defineConfig({
  plugins: [react()],
  build: {
    // Define o ponto de entrada principal: ../frontend/index.html
    // O resolve garante que o caminho seja absoluto a partir do diretório raiz.
    rollupOptions: {
      input: path.resolve(process.cwd(), 'frontend', 'index.html'),
    },
    // O diretório de saída será 'dist', dentro da pasta 'backend'.
    outDir: 'dist',
    emptyOutDir: true
  }
});
