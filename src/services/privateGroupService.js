import api from './apiClient';

// Private Group API functions wefrtyukilo;iuytrew
export async function createPrivateGroup(groupData) {
  try {
    // Ensure group_type is always PRIVATE for private groups
    const payload = {
      ...groupData,
      group_type: 'PRIVATE'
    };
    
    const response = await api.post('/api/private-groups', payload, {
      withCredentials: true,
    });
    return response?.data;
  } catch (error) {
    console.error('privateGroupService.createPrivateGroup error:', error);
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
    console.error('privateGroupService.getPrivateGroupMembers error:', error);
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
    console.error('privateGroupService.updatePrivateGroup error:', error);
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
    console.error('privateGroupService.deletePrivateGroup error:', error);
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
    console.error('privateGroupService.addPrivateGroupMembers error:', error);
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
    console.error('privateGroupService.removePrivateGroupMember error:', error);
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
    console.error('privateGroupService.promotePrivateGroupAdmin error:', error);
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
    console.error('privateGroupService.getMyPrivateGroup error:', error);
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
    console.error('privateGroupService.invitePrivateGroupMembers error:', error);
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
    console.error('privateGroupService.getInvitationByToken error:', error);
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
    console.error('privateGroupService.getMyMemberPrivateGroups error:', error);
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
    console.error('privateGroupService.deleteMyPrivateGroup error:', error);
    throw error;
  }
}

export async function getGroupMembers(groupId) {
  try {
    const response = await api.get(`/api/private-groups/${groupId}/members`, {
      withCredentials: true,
    });
    return response?.data;
  } catch (error) {
    console.error('privateGroupService.getGroupMembers error:', error);
    throw error;
  }
}
// This is the api for the leaving group by members , this is not original this is put by the cursor
export async function leavePrivateGroup(groupId) {
  try {
    const response = await api.delete(`/api/private-groups/${groupId}/leave`, {
      withCredentials: true,
    });
    return response?.data;
  } catch (error) {
    console.error('privateGroupService.leavePrivateGroup error:', error);
    throw error;
  }
}

