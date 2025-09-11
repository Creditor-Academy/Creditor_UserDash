import api from './apiClient';

// Fetch all conversations for the current user
export async function getAllConversations() {
  try {
    const response = await api.get('/api/private-messaging/getAllConversation', {
      withCredentials: true,
    });
    // Backend returns { allConversationIds: [...] }
    if (Array.isArray(response.data)) return response.data;
    return response.data?.allConversationIds || response.data?.data || [];
  } catch (error) {
    console.error('messageService.getAllConversations error:', error);
    throw error;
  }
}


// Load previous messages for a specific conversation
export async function loadPreviousConversation(conversationId) {
  try {
    const response = await api.post('/api/private-messaging/PreviousConversation', {
      conversationid: conversationId,
    }, {
      withCredentials: true,
    });
    // Response shape: { messages: { id, roomid, cov_messages: [ ... ] } }
    return response.data?.messages || null;
  } catch (error) {
    console.error('messageService.loadPreviousConversation error:', error);
    throw error;
  }
}


