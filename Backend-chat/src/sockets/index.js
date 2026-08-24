import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { env } from "../config/env.js";
import { registerMessagesGateway } from "../modules/messages/messages.gateway.js";
import { registerPresenceGateway } from "../modules/presence/presence.gateway.js";
import { registerSignalingGateway } from "../modules/signaling/signaling.gateway.js";

export function createSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: env.clientOrigins, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentification requise"));
    try {
      const payload = jwt.verify(token, env.jwt.accessSecret);
      socket.userId = payload.sub;
      next();
    } catch {
      next(new Error("Token invalide ou expiré"));
    }
  });

  io.on("connection", (socket) => {
    registerPresenceGateway(io, socket);
    registerMessagesGateway(io, socket);
    registerSignalingGateway(io, socket);
  });

  return io;
}
