import { conversationRoom } from "../../sockets/rooms.js";
import { callsService } from "../calls/calls.service.js";

const ringTimers = new Map();

export function registerSignalingGateway(io, socket) {
  socket.on("call:initiate", async ({ conversationId, type, sdpOffer }, ack) => {
    try {
      const call = await callsService.initiate({
        conversationId,
        initiatorId: socket.userId,
        type,
      });

      socket.to(conversationRoom(conversationId)).emit("call:incoming", {
        callId: call.id,
        conversationId,
        type,
        sdpOffer,
        initiatorId: socket.userId,
      });

      const timer = setTimeout(async () => {
        await callsService.decline({ callId: call.id, userId: socket.userId });
        io.to(conversationRoom(conversationId)).emit("call:missed", { callId: call.id });
        ringTimers.delete(call.id);
      }, callsService.ringTimeoutMs);
      ringTimers.set(call.id, timer);

      ack?.({ ok: true, callId: call.id });
    } catch (err) {
      ack?.({ ok: false, error: err.message });
    }
  });

  socket.on("call:accept", async ({ callId, conversationId, sdpAnswer }, ack) => {
    try {
      clearTimeout(ringTimers.get(callId));
      ringTimers.delete(callId);
      await callsService.accept({ callId, userId: socket.userId });
      socket.to(conversationRoom(conversationId)).emit("call:accepted", {
        callId,
        sdpAnswer,
        acceptedBy: socket.userId,
      });
      ack?.({ ok: true });
    } catch (err) {
      ack?.({ ok: false, error: err.message });
    }
  });

  socket.on("call:decline", async ({ callId, conversationId }) => {
    clearTimeout(ringTimers.get(callId));
    ringTimers.delete(callId);
    try {
      await callsService.decline({ callId, userId: socket.userId });
    } catch {}
    io.to(conversationRoom(conversationId)).emit("call:declined", {
      callId,
      declinedBy: socket.userId,
    });
  });

  socket.on("call:ice-candidate", ({ callId, conversationId, candidate }) => {
    socket.to(conversationRoom(conversationId)).emit("call:ice-candidate", { callId, candidate });
  });

  socket.on("call:end", async ({ callId, conversationId }) => {
    try {
      await callsService.end({ callId, userId: socket.userId });
    } catch {}
    io.to(conversationRoom(conversationId)).emit("call:ended", { callId, endedBy: socket.userId });
  });
}
