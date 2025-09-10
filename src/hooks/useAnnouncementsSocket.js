import { useEffect } from 'react';
import {
  getSocket,
  joinGroupRoom,
  leaveGroupRoom,
  onAnnouncementNew,
  offAnnouncementNew,
  emitAnnouncementNew,
} from '@/services/socketClient';

export function useAnnouncementsSocket({ groupId, onNew }) {
  useEffect(() => {
    if (!groupId) return;
    getSocket();
    joinGroupRoom(groupId);
    if (onNew) onAnnouncementNew(onNew);
    return () => {
      if (onNew) offAnnouncementNew(onNew);
      leaveGroupRoom(groupId);
    };
  }, [groupId]);

  const publishAnnouncement = (payload) => emitAnnouncementNew({ ...payload, groupId });

  return { publishAnnouncement };
}

export default useAnnouncementsSocket;


