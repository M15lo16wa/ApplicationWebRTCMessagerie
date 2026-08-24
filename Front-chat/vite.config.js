import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const certPath = path.resolve(__dirname, "../certs/dev-cert.pem");
const keyPath = path.resolve(__dirname, "../certs/dev-key.pem");
const hasCert = fs.existsSync(certPath) && fs.existsSync(keyPath);

const BACKEND_ORIGIN = "https://localhost:4000";
const proxy = {
  "/api": { target: BACKEND_ORIGIN, changeOrigin: true, secure: false },
  "/uploads": { target: BACKEND_ORIGIN, changeOrigin: true, secure: false },
  "/socket.io": { target: BACKEND_ORIGIN, changeOrigin: true, secure: false, ws: true },
};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    https: hasCert ? { cert: fs.readFileSync(certPath), key: fs.readFileSync(keyPath) } : undefined,
    proxy,
  },
});
