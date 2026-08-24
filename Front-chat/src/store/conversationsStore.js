import { create } from "zustand";
import { http } from "../api/http.js";
import { getSocket } from "../api/socket.js";
import { useAuthStore } from "./authStore.js";

export const useConversationsStore = create((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messagesByConversation: {},
  unreadCounts: {},

  async loadConversations() {
    const { data } = await http.get("/conversations");
    set({ conversations: data.conversations });
  },

  async openPrivate(otherUserId) {
    const { data } = await http.post("/conversations/private", { otherUserId });
    await get().loadConversations();
    get().setActiveConversation(data.conversation.id);
    return data.conversation;
  },

  async createGroup(name, memberIds) {
    const { data } = await http.post("/conversations/group", { name, memberIds });
    await get().loadConversations();
    get().setActiveConversation(data.conversation.id);
    return data.conversation;
  },

  async deleteConversation(conversationId) {
    await http.delete(`/conversations/${conversationId}`);
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== conversationId),
      activeConversationId:
        state.activeConversationId === conversationId ? null : state.activeConversationId,
    }));
    get().clearConversationMessages(conversationId);
  },

  setActiveConversation(conversationId) {
    set((state) => ({
      activeConversationId: conversationId,
      unreadCounts: { ...state.unreadCounts, [conversationId]: 0 },
    }));
    getSocket()?.emit("conversation:join", conversationId);
    if (!get().messagesByConversation[conversationId]) {
      get().loadMessages(conversationId);
    }
  },

  closeConversation() {
    set({ activeConversationId: null });
  },

  async loadMessages(conversationId) {
    const { data } = await http.get(`/messages/${conversationId}`);
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: [...data.messages].reverse(),
      },
    }));
  },

  sendMessage(conversationId, content) {
    return new Promise((resolve, reject) => {
      getSocket()?.emit("message:send", { conversationId, content }, (ack) => {
        if (ack?.ok) resolve(ack.message);
        else reject(new Error(ack?.error ?? "Échec de l'envoi"));
      });
    });
  },

  receiveMessage(message) {
    const currentUserId = useAuthStore.getState().user?.id;
    const knownConversation = get().conversations.some((c) => c.id === message.conversationId);
    if (!knownConversation) {
      get().loadConversations();
    }
    set((state) => {
      const existing = state.messagesByConversation[message.conversationId] ?? [];
      const isActive = state.activeConversationId === message.conversationId;
      const isOwn = message.senderId === currentUserId;
      const currentUnread = state.unreadCounts[message.conversationId] ?? 0;
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [message.conversationId]: [...existing, message],
        },
        unreadCounts:
          isActive || isOwn
            ? state.unreadCounts
            : { ...state.unreadCounts, [message.conversationId]: currentUnread + 1 },
      };
    });
  },

  markMessagesRead({ conversationId, messageIds }) {
    get().applyStatus(conversationId, messageIds, "read");
  },

  markMessagesDelivered({ conversationId, messageIds }) {
    get().applyStatus(conversationId, messageIds, "delivered");
  },

  applyStatus(conversationId, messageIds, status) {
    const idsToMark = new Set(messageIds);
    const rank = { sent: 0, delivered: 1, read: 2 };
    set((state) => {
      const existing = state.messagesByConversation[conversationId];
      if (!existing) return {};
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: existing.map((message) =>
            idsToMark.has(message.id) && rank[status] > rank[message.status]
              ? { ...message, status }
              : message,
          ),
        },
      };
    });
  },

  async deleteMessage(conversationId, messageId) {
    await http.delete(`/messages/${conversationId}/${messageId}`);
    get().removeMessages(conversationId, [messageId]);
  },

  async deleteMessages(conversationId, messageIds) {
    const { data } = await http.delete(`/messages/${conversationId}/bulk`, {
      data: { messageIds },
    });
    get().removeMessages(conversationId, data.messageIds);
  },

  async clearConversation(conversationId) {
    await http.delete(`/messages/${conversationId}/all`);
    get().clearConversationMessages(conversationId);
  },

  removeMessages(conversationId, messageIds) {
    const idsToRemove = new Set(messageIds);
    set((state) => {
      const existing = state.messagesByConversation[conversationId];
      if (!existing) return {};
      return {
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: existing.filter((message) => !idsToRemove.has(message.id)),
        },
      };
    });
  },

  clearConversationMessages(conversationId) {
    set((state) => ({
      messagesByConversation: { ...state.messagesByConversation, [conversationId]: [] },
    }));
  },
}));

export function registerConversationsListeners(socket) {
  const handleNewMessage = (message) => {
    useConversationsStore.getState().receiveMessage(message);
  };
  const handleRead = (payload) => {
    useConversationsStore.getState().markMessagesRead(payload);
  };
  const handleDelivered = (payload) => {
    useConversationsStore.getState().markMessagesDelivered(payload);
  };
  socket.on("message:new", handleNewMessage);
  socket.on("message:read", handleRead);
  socket.on("message:delivered", handleDelivered);
  return () => {
    socket.off("message:new", handleNewMessage);
    socket.off("message:read", handleRead);
    socket.off("message:delivered", handleDelivered);
  };
}
