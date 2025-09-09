import { io } from 'socket.io-client';
import { getAccessToken } from './tokenService';

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

// Function to get access token from the same source as API client
function getTokenFromStorage() {
  try {
    const token = getAccessToken && getAccessToken();
    return token || localStorage.getItem('token');
  } catch {
    return localStorage.getItem('token');
  }
}

const socketOrigin = deriveSocketOrigin(API_BASE);

let socket;

export function getSocket() {
  if (!socket) {
    const token = getTokenFromStorage();
    console.log('[socket] using access token?', Boolean(token));
    socket = io(socketOrigin, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      // Send both variants for compatibility: token and authorization
      auth: {
        token: token ? `Bearer ${token}` : undefined,
        authorization: token ? `Bearer ${token}` : undefined,
      }
    });

    // Helpful diagnostics in dev (no duplicates)
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

// Allow updating token at runtime (e.g., after login/refresh)
export function refreshSocketAuth(newToken) {
  if (socket) {
    try {
      socket.auth = {
        token: newToken ? `Bearer ${newToken}` : undefined,
        authorization: newToken ? `Bearer ${newToken}` : undefined,
      };
      socket.connect();
    } catch {}
  }
}

export default getSocket;
