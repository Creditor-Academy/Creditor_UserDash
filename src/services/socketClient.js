import { io } from 'socket.io-client';
import { getAccessToken } from './tokenService';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://creditor-backend-ceds.onrender.com';

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
  return getAccessToken(); // Use tokenService for consistency
}

const socketOrigin = deriveSocketOrigin(API_BASE);

let socket;

export function getSocket() {
  if (!socket) {
    const token = getTokenFromStorage();
    console.log('token from localStorage', token);
    if (!token) {
      console.warn('[socket] No token found, creating unauthenticated socket');
    }

    socket = io(socketOrigin, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: { token: token || null },
      timeout: 20000,
      forceNew: true
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
      // Don't show toast here as it's handled in ChatPage
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

export function reconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  return getSocket();
}

// Group room management
export function joinGroupRoom(groupId) {
  const s = getSocket();
  if (s && groupId) {
    s.emit('join_group_room', { groupId });
    console.log('[socket] joined group room:', groupId);
  }
}

export function leaveGroupRoom(groupId) {
  const s = getSocket();
  if (s && groupId) {
    s.emit('leave_group_room', { groupId });
    console.log('[socket] left group room:', groupId);
  }
}

// Announcement functions
export function onAnnouncementNew(callback) {
  const s = getSocket();
  if (s) {
    s.on('announcement_new', callback);
  }
}

export function offAnnouncementNew(callback) {
  const s = getSocket();
  if (s) {
    s.off('announcement_new', callback);
  }
}

export function emitAnnouncementNew(payload) {
  const s = getSocket();
  if (s) {
    s.emit('announcement_new', payload);
  }
}

export default getSocket;