import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// O ponto de falha está quase sempre aqui: o Vite não consegue encontrar
// o index.html porque está em uma pasta vizinha (frontend).

export default defineConfig({
  plugins: [react()],
  build: {
    // Define o ponto de entrada como o index.html na pasta 'frontend'
    rollupOptions: {
      input: 'frontend/index.html', 
    },
    // O diretório de saída será 'dist', dentro da pasta 'backend'
    outDir: 'dist',
    emptyOutDir: true
  }
});
