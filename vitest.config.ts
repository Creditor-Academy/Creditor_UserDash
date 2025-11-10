import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup-clean.ts'],
    css: true,
    testTimeout: 10000,
    hookTimeout: 10000,
    coverage: {
      provider: 'v8',
      exclude: [
        'node_modules/**',
        'src/test/**',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/*.spec.{js,jsx,ts,tsx}',
        'coverage/**',
        'dist/**',
        '.next/**',
        'build/**',
      ],
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env.NODE_ENV': '"test"',
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: ['@testing-library/jest-dom'],
  },
  ssr: {
    noExternal: [],
  },
});
