import api from './apiClient';

// Fetch all conversations for the current user
export async function getAllConversations() {
  try {
    const response = await api.get('/api/private-messaging/getAllConversation', {
      withCredentials: true,
    });
    // New unified shape: { code, data, success, message }
    // Fallback to older shapes just in case
    const payload = response?.data?.data
      ?? response?.data?.allConversationIds
      ?? (Array.isArray(response?.data) ? response.data : []);
    return payload || [];
  } catch (error) {
    console.error('messageService.getAllConversations error:', error);
    throw error;
  }
}


// Load previous messages for a specific conversation
export async function loadPreviousConversation(conversationId) {
  try {
    const response = await api.post('/api/private-messaging/conversation/messages', {
      conversationid: conversationId,
    }, {
      withCredentials: true,
    });
    // New unified shape: { code, data, success, message }
    // Previously: { messages: {...} }
    return response?.data?.data || response?.data?.messages || null;
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
    return {
      data: response?.data?.data ?? null,
      message: response?.data?.message,
      success: Boolean(response?.data?.success),
    };
  } catch (error) {
    console.error('messageService.deleteConversationMessage error:', error);
    throw error;
  }
}


// Delete an entire conversation
export async function deleteConversation(conversationId) {
  try {
    const response = await api.delete('/api/private-messaging/conversation/delete', {
      data: { conversation_id: conversationId },
      withCredentials: true,
    });
    return {
      data: response?.data?.data ?? null,
      message: response?.data?.message,
      success: Boolean(response?.data?.success),
    };
  } catch (error) {
    console.error('messageService.deleteConversation error:', error);
    throw error;
  }
}