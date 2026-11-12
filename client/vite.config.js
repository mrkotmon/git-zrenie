import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // На GitHub Pages сайт лежит в /git-zrenie/, локально — в корне.
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  // npm run dev: запросы к /api уходят на сервер из папки server (порт 3001).
  server: { proxy: { '/api': 'http://127.0.0.1:3001' } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    include: ['src/**/*.test.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/main.jsx',
        'src/setupTests.js',
        'src/**/*.test.{js,jsx}',
        'src/mocks/handlers.js',
        'src/test/**',
      ],
      thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 },
    },
  },
});
