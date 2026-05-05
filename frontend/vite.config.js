import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 3000,
    open: process.env.ELECTRON !== '1',
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
