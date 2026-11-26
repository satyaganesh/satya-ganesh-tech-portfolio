import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: '/satya-ganesh-tech-portfolio/',
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-gsap': ['gsap', 'gsap/ScrollTrigger', 'gsap/ScrollToPlugin'],
          'vendor-lenis': ['lenis'],
          'vendor-matter': ['matter-js'],
          'vendor-fonts': ['@fontsource/anton', '@fontsource/instrument-serif', '@fontsource/jetbrains-mono', '@fontsource-variable/inter'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['gsap', 'lenis', 'matter-js'],
  },
  esbuild: {
    target: 'es2020',
  },
})