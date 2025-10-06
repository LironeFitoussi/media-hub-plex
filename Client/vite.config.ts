import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import basicSsl from '@vitejs/plugin-basic-ssl'
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), basicSsl()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true, // allow all hosts
    allowedHosts: [
      "fab07e44d065.ngrok-free.app",
      ".ngrok-free.app", // Allow all ngrok-free.app subdomains
    ],
    cors: {
      origin: "https://fab07e44d065.ngrok-free.app",
      credentials: true,
    },
  },
})