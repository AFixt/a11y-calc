import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Config for the demo app (dev server and preview)
export default defineConfig({
  plugins: [react()],
})
