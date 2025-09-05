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


