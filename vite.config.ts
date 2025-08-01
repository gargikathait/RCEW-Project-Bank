

import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    port: 8080,
    host: 'localhost', // avoid "::"
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 24678, // Use a different port for HMR WebSocket
      clientPort: 24678,
      overlay: false
    },
    fs: {
      allow: ['.'],
      deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', 'server/**']
    }
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();
      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);
    },
  };
}
