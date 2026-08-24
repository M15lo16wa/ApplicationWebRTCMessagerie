import { conversationRoom } from "../../sockets/rooms.js";
import { conversationsService } from "../conversations/conversations.service.js";
import { messagesService } from "./messages.service.js";

export function registerMessagesGateway(io, socket) {
  messagesService
    .markDeliveredOnConnect(socket.userId)
    .then((byConversation) => {
      for (const [conversationId, messageIds] of byConversation) {
        io.to(conversationRoom(conversationId)).emit("message:delivered", {
          conversationId,
          messageIds,
        });
      }
    })
    .catch(() => {});

  socket.on("conversation:join", async (conversationId, ack) => {
    try {
      await conversationsService.assertParticipant(conversationId, socket.userId);
      socket.join(conversationRoom(conversationId));

      const readMessageIds = await messagesService.markRead(conversationId, socket.userId);
      if (readMessageIds.length > 0) {
        io.to(conversationRoom(conversationId)).emit("message:read", {
          conversationId,
          messageIds: readMessageIds,
        });
      }

      ack?.({ ok: true });
    } catch (err) {
      ack?.({ ok: false, error: err.message });
    }
  });

  socket.on("message:send", async ({ conversationId, content }, ack) => {
    try {
      const message = await messagesService.send({
        conversationId,
        senderId: socket.userId,
        content,
      });
      io.to(conversationRoom(conversationId)).emit("message:new", message);
      ack?.({ ok: true, message });
    } catch (err) {
      ack?.({ ok: false, error: err.message });
    }
  });
}
