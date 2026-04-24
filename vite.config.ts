/// <reference types="vitest/config" />
import { resolve } from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: './tsconfig.app.json',
      include: ['src'],
      exclude: [
        'src/**/*.test.*',
        'src/__tests__/**',
        'src/main.tsx',
        'src/App.tsx',
        'src/test-setup.ts',
      ],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
        assetFileNames: 'style.[ext]',
      },
    },
    sourcemap: true,
    cssCodeSplit: false,
    copyPublicDir: false,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    exclude: ['e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.css',
        'src/main.tsx',
        'src/test-setup.ts',
        'src/**/*.test.*',
        'src/__tests__/**',
        'src/index.ts',
      ],
    },
  },
});
