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

// Function to get cookie value by name
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

const socketOrigin = deriveSocketOrigin(API_BASE);

let socket;

export function getSocket() {
  if (!socket) {
    const token = getCookie("refresh_token");
    console.log('refresh_token', token);
    socket = io(socketOrigin, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: { token }
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


