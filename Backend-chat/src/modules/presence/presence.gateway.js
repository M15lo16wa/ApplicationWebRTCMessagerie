const onlineSockets = new Map();

export function registerPresenceGateway(io, socket) {
  const { userId } = socket;

  socket.emit("presence:snapshot", { onlineUserIds: [...onlineSockets.keys()] });

  if (!onlineSockets.has(userId)) {
    onlineSockets.set(userId, new Set());
    io.emit("presence:update", { userId, status: "online" });
  }
  onlineSockets.get(userId).add(socket.id);

  socket.on("disconnect", () => {
    const sockets = onlineSockets.get(userId);
    sockets?.delete(socket.id);
    if (sockets && sockets.size === 0) {
      onlineSockets.delete(userId);
      io.emit("presence:update", {
        userId,
        status: "offline",
        lastSeen: new Date().toISOString(),
      });
    }
  });
}

export function isOnline(userId) {
  return onlineSockets.has(userId);
}

export function getSocketIds(userId) {
  return [...(onlineSockets.get(userId) ?? [])];
}
