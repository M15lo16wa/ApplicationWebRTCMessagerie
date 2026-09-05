import "dotenv/config";
import { exec } from "node:child_process";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { callsRouter } from "./modules/calls/calls.routes.js";
import { contactsRouter } from "./modules/contacts/contacts.routes.js";
import { conversationsRouter } from "./modules/conversations/conversations.routes.js";
import { filesRouter } from "./modules/files/files.routes.js";
import { uploadsRouter } from "./modules/files/uploads.routes.js";
import { messagesRouter } from "./modules/messages/messages.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";
import { createSocketServer } from "./sockets/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors({ origin: env.clientOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", uploadsRouter);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/conversations", conversationsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/files", filesRouter);
app.use("/api/users", usersRouter);
app.use("/api/calls", callsRouter);
app.use("/api/contacts", contactsRouter);

app.use(errorMiddleware);

const CERT_DIR = path.resolve(__dirname, "../../certs");
const certPath = path.join(CERT_DIR, "dev-cert.pem");
const keyPath = path.join(CERT_DIR, "dev-key.pem");
const hasCert = fs.existsSync(certPath) && fs.existsSync(keyPath);

const httpServer = hasCert
  ? https.createServer({ cert: fs.readFileSync(certPath), key: fs.readFileSync(keyPath) }, app)
  : http.createServer(app);

const io = createSocketServer(httpServer);
app.set("io", io);

httpServer.listen(env.port, () => {
  if (!hasCert) {
    console.warn("Aucun certificat trouvé dans /certs — HTTP seulement (micro bloqué hors localhost).");
  }
});

let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  httpServer.close();
  exec("docker compose stop", { cwd: path.resolve(__dirname, "..") }, () => {
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
