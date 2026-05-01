import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Config for the demo app (dev server, preview, and Lighthouse CI target).
// Output goes to dist-demo/ so it doesn't collide with the library build
// (which writes ESM/CJS/types into dist/).
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-demo',
    emptyOutDir: true,
  },
  preview: {
    port: 4173,
  },
});
