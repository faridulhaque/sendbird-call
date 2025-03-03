import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    host: true, // Allows external access
    port: 3000, // Optional: Change to your preferred port
    strictPort: true, // Ensures the selected port is used
    cors: true, // Enables CORS
    allowedHosts: true, // Allows all hosts
  },
});

// https://vite.dev/config/
