import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import dsv from '@rollup/plugin-dsv' 
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(),dsv()],
  css: {
    /*preprocessorOptions: {
      scss: {
        additionalData: `@use "${resolve('src/estilos/_variables.scss')}" as *;`
      }
    }*/
  },
  base: '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    }
  },
  build: {
    minify: false,
    sourcemap: false,
  },
})