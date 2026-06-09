import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // подтягиваем переменные окружения (нужен GOOGLE_CLIENT_ID)
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 5173,
        host: '0.0.0.0', // слушаем на всех интерфейсах, чтобы открывалось и с телефона в той же сети
        proxy: {
          // все запросы на /api перекидываем на бэкенд, чтобы не упираться в CORS
          '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true,
          }
        }
      },
      plugins: [react()],
      define: {
        // прокидываем client id гугла в код фронта
        'process.env.GOOGLE_CLIENT_ID': JSON.stringify(env.GOOGLE_CLIENT_ID)
      },
      resolve: {
        alias: {
          '@': path.resolve(import.meta.dirname || '.', '.'), // чтобы можно было импортить через @/...
        }
      }
    };
});
