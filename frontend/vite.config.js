import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const REPO_ROOT = path.resolve(__dirname, '..')

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    fs: { allow: ['..'] },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [path.join(REPO_ROOT, 'frontend_test/setup.js')],
    include: [path.join(REPO_ROOT, 'frontend_test/**/*.test.{js,jsx}')],
    exclude: [path.join(REPO_ROOT, 'frontend_test/node_modules/**')],
    testTimeout: 20000,
    maxConcurrency: 1,
    sequence: { concurrent: false },
  },
})
