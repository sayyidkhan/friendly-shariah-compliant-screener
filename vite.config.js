import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      'process.env.VITE_GOOGLE_GEMINI_API_KEY': JSON.stringify(env.VITE_GOOGLE_GEMINI_API_KEY)
    },
    base: "/friendly-shariah-compliant-screener/",
    publicDir: "public",
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
}) 