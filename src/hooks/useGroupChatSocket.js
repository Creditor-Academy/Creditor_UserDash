import { useEffect, useRef } from 'react';
import {
  getSocket,
  joinGroupRoom,
  leaveGroupRoom,
  onChatMessage,
  offChatMessage,
  onChatTyping,
  offChatTyping,
  emitChatMessage,
  emitChatTyping,
} from '@/services/socketClient';

export function useGroupChatSocket({ groupId, userId, onMessage, onTyping }) {
  const groupIdRef = useRef(groupId);
  groupIdRef.current = groupId;

  useEffect(() => {
    if (!groupId) return;

    const socket = getSocket();
    // Debug all events to inspect server emissions
    const onAnyHandler = (event, ...args) => {
      try { console.debug('[socket:any]', event, args?.[0]); } catch {}
    };
    try { socket.onAny(onAnyHandler); } catch {}

    joinGroupRoom({ groupId, userId });

    if (onMessage) onChatMessage(onMessage);
    if (onTyping) onChatTyping(onTyping);

    return () => {
      if (onMessage) offChatMessage(onMessage);
      if (onTyping) offChatTyping(onTyping);
      leaveGroupRoom({ groupId: groupIdRef.current, userId });
      try { socket.offAny(onAnyHandler); } catch {}
    };
  }, [groupId, userId]);

  const sendMessage = (payload) => emitChatMessage({ ...payload, groupId });
  const sendTyping = (payload) => emitChatTyping({ ...payload, groupId });

  return { sendMessage, sendTyping };
}

export default useGroupChatSocket;


