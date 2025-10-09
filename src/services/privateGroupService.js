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
    // Prefer PATCH by id (common for partial updates)
    const patchById = await api.patch(`/api/private-groups/${groupId}`, updateData, {
      withCredentials: true,
    });
    return patchById?.data;
  } catch (error) {
    // Try PUT by id
    try {
      const putById = await api.put(`/api/private-groups/${groupId}`, updateData, {
        withCredentials: true,
      });
      return putById?.data;
    } catch (errorPutId) {
      // Try PATCH /me
      try {
        const patchMe = await api.patch('/api/private-groups/me', updateData, {
          withCredentials: true,
        });
        return patchMe?.data;
      } catch (errorPatchMe) {
        // Try PUT /me
        try {
          const putMe = await api.put('/api/private-groups/me', updateData, {
            withCredentials: true,
          });
          return putMe?.data;
        } catch (errorPutMe) {
          console.error('privateGroupService.updatePrivateGroup errors:', {
            patchById: error?.response?.status,
            putById: errorPutId?.response?.status,
            patchMe: errorPatchMe?.response?.status,
            putMe: errorPutMe?.response?.status,
          });
          throw errorPutMe;
        }
      }
    }
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
    const response = await api.get(`/api/private-groups/invitations/${token}`, {
      withCredentials: true,
    });
    return response?.data;
  } catch (error) {
    console.error('privateGroupService.getInvitationByToken error:', error);
    throw error;
  }
}

// Accept private group invitation by token
export async function acceptPrivateGroupInvitation(token) {
  try {
    const response = await api.post(`/api/private-groups/invitations/${token}/accept`, {}, {
      withCredentials: true,
    });
    return response?.data;
  } catch (error) {
    console.error('privateGroupService.acceptPrivateGroupInvitation error:', error);
    throw error;
  }
}

// Reject private group invitation by token
export async function rejectPrivateGroupInvitation(token) {
  try {
    const response = await api.post(`/api/private-groups/invitations/${token}/reject`, {}, {
      withCredentials: true,
    });
    return response?.data;
  } catch (error) {
    console.error('privateGroupService.rejectPrivateGroupInvitation error:', error);
    throw error;
  }
}

// Get pending invitations for the current user
export async function getPendingInvitations() {
  try {
    const response = await api.get('/api/private-groups/invitations/pending', {
      withCredentials: true,
    });
    return response?.data;
  } catch (error) {
    console.error('privateGroupService.getPendingInvitations error:', error);
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
// This is the api for the leaving group by members
export async function leavePrivateGroup(groupId) {
  try {
    const response = await api.post(`/api/private-groups/${groupId}/leave`, {}, {
      withCredentials: true,
    });
    return response?.data;
  } catch (error) {
    console.error('privateGroupService.leavePrivateGroup error:', error);
    throw error;
  }
}

// Get private group messages
export async function getPrivateGroupMessages(groupId, page = 1, limit = 50) {
  try {
    const response = await api.get(`/api/private-groups/${groupId}/messages`, {
      params: { page, limit },
      withCredentials: true,
    });
    return response?.data;
  } catch (error) {
    console.error('privateGroupService.getPrivateGroupMessages error:', error);
    throw error;
  }
}

// Send a private group message
// Supports JSON payload for text messages and FormData for image/file messages
export async function sendPrivateGroupMessage(groupId, payload, isMultipart = false) {
  try {
    const isFormData = isMultipart || (typeof FormData !== 'undefined' && payload instanceof FormData);
    const config = {
      headers: isFormData 
        ? { 'Content-Type': 'multipart/form-data' } 
        : { 'Content-Type': 'application/json' },
      withCredentials: true,
    };

    const body = isFormData ? payload : payload; // axios handles both
    const response = await api.post(`/api/private-groups/${groupId}/messages`, body, config);
    return response?.data;
  } catch (error) {
    console.error('privateGroupService.sendPrivateGroupMessage error:', error);
    throw error;
  }
}

// Delete private group message
export async function deletePrivateGroupMessage(groupId, messageId) {
  try {
    const response = await api.delete(`/api/private-groups/${groupId}/messages/${messageId}`, {
      withCredentials: true,
    });
    return response?.data;
  } catch (error) {
    console.error('privateGroupService.deletePrivateGroupMessage error:', error);
    throw error;
  }
}

// Edit private group message (universal - any member can edit)
export async function editPrivateGroupMessage(groupId, messageId, { content }) {
  try {
    const response = await api.put(`/api/private-groups/${groupId}/messages/${messageId}`, { content }, {
      withCredentials: true,
    });
    return response?.data;
  } catch (error) {
    console.error('privateGroupService.editPrivateGroupMessage error:', error);
    throw error;
  }
}

