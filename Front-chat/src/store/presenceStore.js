import { create } from "zustand";

export const usePresenceStore = create((set) => ({
  byUserId: {},

  applyUpdate({ userId, status, lastSeen }) {
    set((state) => ({
      byUserId: { ...state.byUserId, [userId]: { status, lastSeen } },
    }));
  },

  applySnapshot(onlineUserIds) {
    set((state) => {
      const byUserId = { ...state.byUserId };
      for (const userId of onlineUserIds) {
        byUserId[userId] = { status: "online" };
      }
      return { byUserId };
    });
  },

  isOnline(userId) {
    return usePresenceStore.getState().byUserId[userId]?.status === "online";
  },
}));

export function registerPresenceListeners(socket) {
  const handleUpdate = (payload) => usePresenceStore.getState().applyUpdate(payload);
  const handleSnapshot = ({ onlineUserIds }) => usePresenceStore.getState().applySnapshot(onlineUserIds);

  socket.on("presence:update", handleUpdate);
  socket.on("presence:snapshot", handleSnapshot);

  return () => {
    socket.off("presence:update", handleUpdate);
    socket.off("presence:snapshot", handleSnapshot);
  };
}
