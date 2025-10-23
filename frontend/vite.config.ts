import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // 代码分割优化
    rollupOptions: {
      output: {
        // 手动分包
        manualChunks: {
          // React 核心库单独打包
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI 组件库单独打包
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-slot',
            '@radix-ui/react-toast',
          ],
          // 状态管理和工具库
          'utils-vendor': ['zustand', 'axios', 'date-fns'],
        },
      },
    },
    // 警告大小限制
    chunkSizeWarningLimit: 1000,
    // 资源内联限制
    assetsInlineLimit: 4096,
  },
})
