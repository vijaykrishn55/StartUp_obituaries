import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

function getApiOrigin() {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  try {
    const url = new URL(base);
    return `${url.protocol}//${url.host}`; // strip /api
  } catch {
    return 'http://localhost:5000';
  }
}

export function getSocket(): Socket {
  if (!socket) {
    socket = io(getApiOrigin(), {
      withCredentials: true,
      transports: ['websocket'],
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
