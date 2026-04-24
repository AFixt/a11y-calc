import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Config for the demo app (dev server and preview)
export default defineConfig({
  plugins: [react()],
});
