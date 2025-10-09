import getSocket from './socketClient';

class PrivateGroupSocket {
  constructor() {
    this.socket = null;
    this.initialized = false;
    this.currentRoom = null;
    this.connected = false;
    this.messageQueue = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  initialize() {
    if (this.initialized) return;

    try {
      this.socket = getSocket();
      if (!this.socket) {
        console.error('Failed to get socket instance');
        return;
      }

      // Check initial connection state
      this.connected = this.socket.connected;
      console.log('Initial socket connection state:', this.connected);

      // Handle socket connection events
      this.socket.on('connect', () => {
        console.log('Socket connected');
        this.connected = true;
        this.reconnectAttempts = 0;

        // Re-authenticate on connect
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (token && userId) {
          this.socket.emit('authenticate', { token, userId });
        }

        // Rejoin current room if any
        if (this.currentRoom) {
          this.joinGroup(this.currentRoom);
        }

        // Process queued messages
        this.processMessageQueue();
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
        this.connected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.connected = false;
        
        // Attempt reconnect if within limits
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => {
            console.log(`Reconnect attempt ${this.reconnectAttempts}...`);
            this.socket.connect();
          }, 1000 * this.reconnectAttempts); // Exponential backoff
        }
      });

      // Handle authentication response
      this.socket.on('authenticated', () => {
        console.log('Socket authenticated');
      });

      this.socket.on('unauthorized', (error) => {
        console.error('Socket authentication failed:', error);
      });

      // Handle new messages (listen to both generic and private-specific events)
      this.socket.on('newGroupMessage', (messageWithDetails) => {
        try {
          console.log('Raw socket message received:', messageWithDetails);

          // Handle both direct message and wrapped message formats
          const data = messageWithDetails?.data || messageWithDetails;
          
          if (!data) {
            console.warn('No message data received');
            return;
          }

          // Extract group ID from either format
          const groupId = data.group_id || data.groupId;
          const senderId = data.sender_id || data.senderId || data.userId;
          
          if (!groupId || !senderId) {
            console.warn('Missing required fields:', { groupId, senderId, data });
            return;
          }

          // Map the message to a consistent format
          const message = {
            id: data.id || `temp_${Date.now()}`,
            sender_id: senderId,
            senderId: senderId,
            content: data.content || '',
            text: data.content || '',
            type: (data.type || 'TEXT').toUpperCase(),
            timeStamp: data.timeStamp || data.created_at || new Date(),
            timestamp: data.timeStamp || data.created_at || new Date(),
            status: 'delivered',
            sender: data.sender || {
              id: senderId,
              image: null
            }
          };

          console.log('Processed message:', { groupId, message });

          window.dispatchEvent(new CustomEvent('newGroupMessage', { 
            detail: {
              groupId,
              message
            }
          }));
        } catch (error) {
          console.error('Error processing group message:', error);
        }
      });

      // Handle group events - listen to privateGroup* specific events
      this.socket.on('privateGroupCreated', (data) => {
        console.log('Private group created:', data);
        window.dispatchEvent(new CustomEvent('privateGroupCreated', { detail: data }));
      });

      this.socket.on('privateGroupMemberAdded', (data) => {
        console.log('Member added to private group:', data);
        window.dispatchEvent(new CustomEvent('privateGroupMemberAdded', { detail: data }));
      });

      this.socket.on('privateGroupMembersAdded', (data) => {
        console.log('Members added to private group:', data);
        window.dispatchEvent(new CustomEvent('privateGroupMembersAdded', { detail: data }));
      });

      this.socket.on('privateGroupMemberRemoved', (data) => {
        console.log('Member removed from private group:', data);
        window.dispatchEvent(new CustomEvent('privateGroupMemberRemoved', { detail: data }));
      });

      this.socket.on('privateGroupMemberLeft', (data) => {
        console.log('Member left private group:', data);
        window.dispatchEvent(new CustomEvent('privateGroupMemberLeft', { detail: data }));
      });

      this.socket.on('privateGroupMemberPromoted', (data) => {
        console.log('Member promoted in private group:', data);
        window.dispatchEvent(new CustomEvent('privateGroupMemberPromoted', { detail: data }));
      });

      this.socket.on('privateGroupUserJoined', (payload) => {
        console.log('User joined private group:', payload);
        window.dispatchEvent(new CustomEvent('privateGroupUserJoined', { detail: payload }));
      });

      this.socket.on('privateGroupUserLeft', (payload) => {
        console.log('User left private group:', payload);
        window.dispatchEvent(new CustomEvent('privateGroupUserLeft', { detail: payload }));
      });

      this.socket.on('privateGroupUpdated', (data) => {
        console.log('Private group info updated:', data);
        window.dispatchEvent(new CustomEvent('privateGroupUpdated', { detail: data }));
      });

      this.socket.on('privateGroupDeleted', (data) => {
        console.log('Private group deleted:', data);
        window.dispatchEvent(new CustomEvent('privateGroupDeleted', { detail: data }));
      });

      // Also listen to generic group events as fallback
      this.socket.on('memberAdded', (data) => {
        console.log('Member added (generic event):', data);
        window.dispatchEvent(new CustomEvent('privateGroupMemberAdded', { detail: data }));
      });

      this.socket.on('memberRemoved', (data) => {
        console.log('Member removed (generic event):', data);
        window.dispatchEvent(new CustomEvent('privateGroupMemberRemoved', { detail: data }));
      });

      this.socket.on('userJoinedGroup', (payload) => {
        console.log('User joined group (generic event):', payload);
        window.dispatchEvent(new CustomEvent('privateGroupUserJoined', { detail: payload }));
      });

      this.socket.on('userLeftGroup', (payload) => {
        console.log('User left group (generic event):', payload);
        window.dispatchEvent(new CustomEvent('privateGroupUserLeft', { detail: payload }));
      });

      this.socket.on('groupInfoUpdated', (data) => {
        console.log('Group info updated (generic event):', data);
        window.dispatchEvent(new CustomEvent('privateGroupUpdated', { detail: data }));
      });

      // Handle message edits and deletes
      this.socket.on('privateGroupMessageEdited', (data) => {
        console.log('Private group message edited:', data);
        window.dispatchEvent(new CustomEvent('privateGroupMessageEdited', { detail: data }));
      });

      this.socket.on('groupMessageEdited', (data) => {
        console.log('Group message edited (generic event):', data);
        window.dispatchEvent(new CustomEvent('privateGroupMessageEdited', { detail: data }));
      });

      this.socket.on('messageEdited', (data) => {
        console.log('Message edited (generic event):', data);
        window.dispatchEvent(new CustomEvent('privateGroupMessageEdited', { detail: data }));
      });

      this.socket.on('privateGroupMessageDeleted', (data) => {
        console.log('Private group message deleted:', data);
        window.dispatchEvent(new CustomEvent('privateGroupMessageDeleted', { detail: data }));
      });

      this.socket.on('groupMessageDeleted', (data) => {
        console.log('Group message deleted (generic event):', data);
        window.dispatchEvent(new CustomEvent('privateGroupMessageDeleted', { detail: data }));
      });

      // Handle private group invitations
      this.socket.on('privateGroupInvitationSent', (data) => {
        console.log('Private group invitation sent:', data);
        window.dispatchEvent(new CustomEvent('privateGroupInvitationSent', { detail: data }));
      });

      this.socket.on('privateGroupInvitationAccepted', (data) => {
        console.log('Private group invitation accepted:', data);
        window.dispatchEvent(new CustomEvent('privateGroupInvitationAccepted', { detail: data }));
      });

      this.socket.on('privateGroupInvitationRejected', (data) => {
        console.log('Private group invitation rejected:', data);
        window.dispatchEvent(new CustomEvent('privateGroupInvitationRejected', { detail: data }));
      });

      // Handle errors
      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
        window.dispatchEvent(new CustomEvent('privateGroupError', { detail: error }));
      });

      this.initialized = true;
    } catch (error) {
      console.error('Error initializing private group socket:', error);
    }
  }

  // Process queued messages
  async processMessageQueue() {
    console.log(`Processing message queue (${this.messageQueue.length} items)`);
    while (this.messageQueue.length > 0 && this.connected) {
      const { event, data, callback } = this.messageQueue.shift();
      try {
        await new Promise((resolve, reject) => {
          this.socket.emit(event, data, (response) => {
            if (response?.error) {
              reject(new Error(response.error));
            } else {
              resolve(response);
            }
          });
        });
        if (callback) callback();
      } catch (error) {
        console.error(`Failed to process queued message (${event}):`, error);
        if (callback) callback(error);
      }
    }
  }

  // Join a private group room
  async joinGroup(groupId) {
    if (!this.socket) return;
    
    try {
      // Leave previous room if any
      if (this.currentRoom && this.currentRoom !== groupId) {
        await this.leaveGroup(this.currentRoom);
      }

      console.log('Joining private group:', groupId);
      
      // Join both rooms
      await Promise.all([
        new Promise((resolve) => {
          this.socket.emit('joinGroup', {
            groupId,
            userId: localStorage.getItem('userId')
          }, resolve);
        }),
        new Promise((resolve) => {
          this.socket.emit('join', { room: `group_${groupId}` }, resolve);
        })
      ]);
      
      this.currentRoom = groupId;
      console.log('Successfully joined group:', groupId);
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  }

  // Leave a private group room
  async leaveGroup(groupId) {
    if (!this.socket) return;
    
    try {
      console.log('Leaving private group:', groupId);
      
      // Leave both rooms
      await Promise.all([
        new Promise((resolve) => {
          this.socket.emit('leaveGroup', {
            groupId,
            userId: localStorage.getItem('userId')
          }, resolve);
        }),
        new Promise((resolve) => {
          this.socket.emit('leave', { room: `group_${groupId}` }, resolve);
        })
      ]);

      if (this.currentRoom === groupId) {
        this.currentRoom = null;
      }
      console.log('Successfully left group:', groupId);
    } catch (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  }

  // Send a message to a private group
  async sendMessage(groupId, content, type = 'TEXT', mediaUrl = null) {
    try {
      if (!this.socket) {
        throw new Error('Socket not initialized');
      }
      if (!groupId || !content) {
        throw new Error('Invalid message data: groupId and content are required');
      }

      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('No user ID found for sending message');
      }

      // Ensure we're in the correct room
      if (this.currentRoom !== groupId) {
        await this.joinGroup(groupId);
      }

      // Format message data to match backend expectations
      const messageData = {
        group_id: groupId,
        sender_id: userId,
        content: String(content).trim(),
        type: (type || 'TEXT').toUpperCase(),
        media_url: mediaUrl || null,
        timeStamp: new Date().toISOString()
      };
      
      console.log('Sending private group message:', messageData);
      
      // Return a promise that resolves when the message is sent
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Message send timeout'));
        }, 5000);

        this.socket.emit('sendGroupMessage', messageData, (response) => {
          clearTimeout(timeoutId);
          
          if (response?.error) {
            console.error('Socket send error:', response.error);
            window.dispatchEvent(new CustomEvent('privateGroupError', { 
              detail: { message: response.error }
            }));
            reject(new Error(response.error));
          } else {
            console.log('Message sent successfully:', response);
            // Emit local event for immediate UI update
            window.dispatchEvent(new CustomEvent('newGroupMessage', {
              detail: {
                groupId,
                message: {
                  id: response?.id || `temp_${Date.now()}`,
                  sender_id: userId,
                  content: messageData.content,
                  type: messageData.type,
                  timeStamp: messageData.timeStamp,
                  sender: {
                    id: userId,
                    image: null
                  },
                  status: 'sent'
                }
              }
            }));
            resolve(response);
          }
        });
      }).catch(error => {
        console.error('Failed to send message:', error);
        // Queue message if it's a connection issue
        if (!this.connected) {
          console.log('Socket disconnected, queueing message');
          this.messageQueue.push({
            event: 'sendGroupMessage',
            data: messageData,
            callback: (err) => {
              if (err) {
                window.dispatchEvent(new CustomEvent('privateGroupError', { 
                  detail: { message: 'Failed to send queued message' }
                }));
              }
            }
          });
        } else {
          window.dispatchEvent(new CustomEvent('privateGroupError', { 
            detail: { message: 'Failed to send message' }
          }));
        }
        throw error;
      });
    } catch (error) {
      console.error('Error in sendMessage:', error);
      window.dispatchEvent(new CustomEvent('privateGroupError', { 
        detail: { message: error.message || 'Failed to send message' }
      }));
      throw error;
    }
  }

  // Mark messages as read
  markMessageRead(groupId, messageId) {
    if (!this.socket) return;
    this.socket.emit('markMessageRead', { groupId, messageId });
  }

  // Add member to group
  addMember(groupId, newMemberId) {
    if (!this.socket) return;
    this.socket.emit('addGroupMember', {
      groupId,
      userId: localStorage.getItem('userId'),
      newMemberId
    });
  }

  // Remove member from group
  removeMember(groupId, memberToRemoveId) {
    if (!this.socket) return;
    this.socket.emit('removeGroupMember', {
      groupId,
      userId: localStorage.getItem('userId'),
      memberToRemoveId
    });
  }

  // Update group information
  updateGroupInfo(groupId, updates) {
    if (!this.socket) return;
    this.socket.emit('updateGroupInfo', {
      groupId,
      userId: localStorage.getItem('userId'),
      ...updates
    });
  }
}

// Create a singleton instance
const privateGroupSocket = new PrivateGroupSocket();

export default privateGroupSocket;