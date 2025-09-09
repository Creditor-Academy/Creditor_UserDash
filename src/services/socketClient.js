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

// Function to get token from localStorage
function getTokenFromStorage() {
  return localStorage.getItem('token');
}

const socketOrigin = deriveSocketOrigin(API_BASE);

let socket;

export function getSocket() {
  if (!socket) {
    const token = getTokenFromStorage();
    console.log('token from localStorage', token);
    socket = io(socketOrigin, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: { token: token ? `Bearer ${token}` : undefined }
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

// Allow updating token at runtime (e.g., after login/refresh)
export function refreshSocketAuth(newToken) {
  localStorage.setItem('token', newToken || '');
  if (socket) {
    try {
      socket.auth = { token: newToken ? `Bearer ${newToken}` : undefined };
      socket.connect();
    } catch {}
  }
}

export default getSocket;

// ---- Helper APIs for group rooms and events ----

export function joinGroupRoom(args) {
  try {
    const s = getSocket();
    const groupId = typeof args === 'object' ? args.groupId : args;
    const userId = typeof args === 'object' ? args.userId : undefined;
    const payload = { groupId: String(groupId), userId };
    // New API
    s.emit('room:join', payload);
    // Legacy aliases
    s.emit('joinGroup', payload);
    s.emit('group:join', payload);
  } catch {}
}

export function leaveGroupRoom(args) {
  try {
    const s = getSocket();
    const groupId = typeof args === 'object' ? args.groupId : args;
    const userId = typeof args === 'object' ? args.userId : undefined;
    const payload = { groupId: String(groupId), userId };
    // New API
    s.emit('room:leave', payload);
    // Legacy aliases
    s.emit('leaveGroup', payload);
    s.emit('group:leave', payload);
  } catch {}
}

// Chat: subscribe/unsubscribe
export function onChatMessage(handler) {
  const s = getSocket();
  s.on('chat:message', handler);
  // Legacy alias
  s.on('newGroupMessage', handler);
}

export function offChatMessage(handler) {
  const s = getSocket();
  s.off('chat:message', handler);
  // Legacy alias
  s.off('newGroupMessage', handler);
}

export function onChatTyping(handler) {
  const s = getSocket();
  s.on('chat:typing', handler);
}

export function offChatTyping(handler) {
  const s = getSocket();
  s.off('chat:typing', handler);
}

export function emitChatMessage(payload) {
  const s = getSocket();
  s.emit('chat:message', payload);
  // Legacy alias
  s.emit('sendGroupMessage', payload);
}

export function emitChatTyping(payload) {
  const s = getSocket();
  s.emit('chat:typing', payload);
}

// Announcements
export function onAnnouncementNew(handler) {
  const s = getSocket();
  s.on('announcement:new', handler);
}

export function offAnnouncementNew(handler) {
  const s = getSocket();
  s.off('announcement:new', handler);
}

export function emitAnnouncementNew(payload) {
  const s = getSocket();
  s.emit('announcement:new', payload);
}