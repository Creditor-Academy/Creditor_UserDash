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

export function useGroupChatSocket({ groupId, onMessage, onTyping }) {
  const groupIdRef = useRef(groupId);
  groupIdRef.current = groupId;

  useEffect(() => {
    if (!groupId) return;

    // ensure socket is instantiated
    getSocket();
    joinGroupRoom(groupId);

    if (onMessage) onChatMessage(onMessage);
    if (onTyping) onChatTyping(onTyping);

    return () => {
      if (onMessage) offChatMessage(onMessage);
      if (onTyping) offChatTyping(onTyping);
      leaveGroupRoom(groupIdRef.current);
    };
  }, [groupId]);

  const sendMessage = (payload) => emitChatMessage({ ...payload, groupId });
  const sendTyping = (payload) => emitChatTyping({ ...payload, groupId });

  return { sendMessage, sendTyping };
}

export default useGroupChatSocket;


