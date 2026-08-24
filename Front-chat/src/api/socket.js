import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || undefined;

let socket = null;

export function connectSocket(accessToken) {
  if (socket) {
    socket.auth = { token: accessToken };
    return socket;
  }
  socket = io(SOCKET_URL, {
    auth: { token: accessToken },
    autoConnect: true,
  });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
