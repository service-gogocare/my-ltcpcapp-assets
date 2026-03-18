import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // ✅ 移除 define 中的 GEMINI_API_KEY，不再嵌入前端 bundle
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      // 開發環境下 /api 請求轉發到同一 server
      '/api': 'http://localhost:3000',
    },
  },
  build: {
    outDir: 'dist',
  },
});
