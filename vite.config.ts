import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: new RegExp('^/@/'), replacement: `${resolve('src')}/` },
      { find: new RegExp('^~'), replacement: '' },
    ]
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  }
})
