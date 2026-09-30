import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Разбиваем вендоров на отдельные чанки: они меняются редко и кешируются
// независимо от кода приложения.
// ВАЖНО: без catch-all — иначе часть библиотек, зависящих от React, попадает
// в отдельный чанк и возникает циклическая зависимость (React === undefined)
const manualChunks = (id: string): string | undefined => {
  if (!id.includes('node_modules')) {
    return undefined
  }
  if (id.includes('/react-dom/') || id.includes('/scheduler/')) {
    return 'vendor-react-dom'
  }
  if (id.includes('/react-router')) {
    return 'vendor-router'
  }
  if (id.includes('/@tanstack/')) {
    return 'vendor-query'
  }
  if (id.includes('/@radix-ui/')) {
    return 'vendor-radix'
  }
  if (id.includes('/axios/')) {
    return 'vendor-http'
  }
  if (id.includes('/lucide-react/')) {
    return 'vendor-icons'
  }
  return undefined
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
})
