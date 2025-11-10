import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // React 및 핵심 라이브러리
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // 폼 관련
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // 데이터 페칭
          'query-vendor': ['@tanstack/react-query'],
          // 상태 관리
          'state-vendor': ['jotai'],
          // Supabase
          'supabase-vendor': ['@supabase/supabase-js'],
          // 유틸리티
          'utils-vendor': ['date-fns', 'ofetch'],
        },
      },
    },
  },
});
