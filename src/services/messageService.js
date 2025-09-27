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

// Private Group API functions
export async function createPrivateGroup(groupData) {
  try {
    const response = await api.post('/api/private-groups', groupData, {
      withCredentials: true,
    });
    return response?.data;
  } catch (error) {
    console.error('messageService.createPrivateGroup error:', error);
    throw error;
  }
}

export async function getPrivateGroupById(groupId) {
  try {
    const response = await api.get(`/api/private-groups/${groupId}`, {
      withCredentials: true,
    });
    return response?.data;
  } catch (error) {
    console.error('messageService.getPrivateGroupById error:', error);
    throw error;
  }
}

export async function getPrivateGroupMembers(groupId) {
  try {
    const response = await api.get(`/api/private-groups/${groupId}/members`, {
      withCredentials: true,
    });
    return response?.data;
  } catch (error) {
    console.error('messageService.getPrivateGroupMembers error:', error);
    throw error;
  }
}

export async function updatePrivateGroup(groupId, updateData) {
  try {
    const response = await api.put(`/api/private-groups/${groupId}`, updateData, {
      withCredentials: true,
    });
    return response?.data;
  } catch (error) {
    console.error('messageService.updatePrivateGroup error:', error);
    throw error;
  }
}

export async function deletePrivateGroup(groupId) {
  try {
    const response = await api.delete(`/api/private-groups/${groupId}`, {
      withCredentials: true,
    });
    return response?.data;
  } catch (error) {
    console.error('messageService.deletePrivateGroup error:', error);
    throw error;
  }
}

export async function addPrivateGroupMembers(groupId, userIds) {
  try {
    const response = await api.post(`/api/private-groups/${groupId}/members`, {
      user_ids: userIds
    }, {
      withCredentials: true,
    });
    return response?.data;
  } catch (error) {
    console.error('messageService.addPrivateGroupMembers error:', error);
    throw error;
  }
}

export async function removePrivateGroupMember(groupId, userId) {
  try {
    const response = await api.delete(`/api/private-groups/${groupId}/members/${userId}`, {
      withCredentials: true,
    });
    return response?.data;
  } catch (error) {
    console.error('messageService.removePrivateGroupMember error:', error);
    throw error;
  }
}

export async function promotePrivateGroupAdmin(groupId, userId) {
  try {
    const response = await api.post(`/api/private-groups/${groupId}/admin`, {
      user_id: userId
    }, {
      withCredentials: true,
    });
    return response?.data;
  } catch (error) {
    console.error('messageService.promotePrivateGroupAdmin error:', error);
    throw error;
  }
}

export async function getMyPrivateGroup() {
  try {
    const response = await api.get('/api/private-groups/me', {
      withCredentials: true,
    });
    return response?.data;
  } catch (error) {
    console.error('messageService.getMyPrivateGroup error:', error);
    throw error;
  }
}

export async function invitePrivateGroupMembers(groupId, userIds, expiresInHours = 72) {
  try {
    const response = await api.post(`/api/private-groups/${groupId}/invitations`, {
      user_ids: userIds,
      expires_in_hours: expiresInHours
    }, {
      withCredentials: true,
    });
    return response?.data;
  } catch (error) {
    console.error('messageService.invitePrivateGroupMembers error:', error);
    throw error;
  }
}

export async function getInvitationByToken(token) {
  try {
    const response = await api.get(`/api/private-groups/invite/${token}`, {
      withCredentials: true,
    });
    return response?.data;
  } catch (error) {
    console.error('messageService.getInvitationByToken error:', error);
    throw error;
  }
}

export async function getMyMemberPrivateGroups() {
  try {
    const response = await api.get('/api/private-groups/member-of', {
      withCredentials: true,
    });
    return response?.data;
  } catch (error) {
    console.error('messageService.getMyMemberPrivateGroups error:', error);
    throw error;
  }
}

export async function deleteMyPrivateGroup() {
  try {
    const response = await api.delete('/api/private-groups/me', {
      withCredentials: true,
    });
    return response?.data;
  } catch (error) {
    console.error('messageService.deleteMyPrivateGroup error:', error);
    throw error;
  }
}