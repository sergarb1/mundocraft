import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Relative base so the app works both at a domain root and under
  // https://<user>.github.io/<repo>/ on GitHub Pages.
  base: './',
  plugins: [vue(), tailwindcss()],
  build: {
    target: 'es2020',
  },
})
