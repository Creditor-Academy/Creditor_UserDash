import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://sharebackend-sdkp.onrender.com';

// Convert REST base to socket origin if necessary
function deriveSocketOrigin(base) {
  try {
    const url = new URL(base);
    return `${url.protocol}//${url.host}`; // keep same host
  } catch {
    return base;
  }
}

const socketOrigin = deriveSocketOrigin(API_BASE);

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(socketOrigin, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    // Helpful diagnostics in dev
    socket.on('connect', () => {
      console.log('[socket] connected', socket.id);
    });
    socket.on('disconnect', (reason) => {
      console.log('[socket] disconnected', reason);
    });
    socket.on('connect_error', (err) => {
      console.warn('[socket] connect_error', err?.message || err);
    });
  }
  return socket;
}

export default getSocket;


