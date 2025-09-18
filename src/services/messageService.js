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


// Delete a specific message in a conversation
export async function deleteConversationMessage(params) {
  try {
    const { messageid, conversation_id, roomId } = params;

    const response = await api.delete('/api/private-messaging/message/delete', {
      data: { messageid, conversation_id, roomId }, 
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('messageService.deleteConversationMessage error:', error);
    throw error;
  }
}

