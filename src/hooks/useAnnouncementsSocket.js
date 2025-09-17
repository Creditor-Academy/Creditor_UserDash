import { useEffect } from 'react';
import { getSocket } from '@/services/socketClient';

export function useAnnouncementsSocket({ groupId, onNew }) {
  useEffect(() => {
    if (!groupId) return;
    
    const socket = getSocket();
    
    // Join group room
    socket.emit('joinGroup', { groupId, userId: 'current-user' });
    
    // Listen for new announcements
    if (onNew) {
      socket.on('groupAnnouncementCreated', onNew);
    }
    
    return () => {
      if (onNew) {
        socket.off('groupAnnouncementCreated', onNew);
      }
      socket.emit('leaveGroup', { groupId, userId: 'current-user' });
    };
  }, [groupId, onNew]);

  const publishAnnouncement = (payload) => {
    const socket = getSocket();
    socket.emit('createGroupAnnouncement', { ...payload, groupId });
  };

  return { publishAnnouncement };
}

export default useAnnouncementsSocket;


