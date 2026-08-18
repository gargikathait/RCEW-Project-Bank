

import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { pathToFileURL } from "url";

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
  plugins: mode === "test" ? [react()] : [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    async configureServer(server) {
  const { createServer } = await server.ssrLoadModule("/server/index.ts");
  const app = createServer();
  server.middlewares.use(app);
},
  };
}
