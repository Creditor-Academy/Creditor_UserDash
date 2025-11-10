import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'node:inspector/promises': path.resolve(
        __dirname,
        './src/test/mocks/inspector.js'
      ),
      inspector: path.resolve(__dirname, './src/test/mocks/inspector.js'),
    },
  },
  define: {
    'process.env.NODE_ENV': '"test"',
  },
});
