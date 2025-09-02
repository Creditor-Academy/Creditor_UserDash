import api from './apiClient';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://sharebackend-sdkp.onrender.com';

// Get group by ID
export const getGroupById = async (groupId) => {
  try {
    const response = await api.get(`${API_BASE}/groups/${groupId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching group:', error);
    throw error;
  }
};

// Get group members
export const getGroupMembers = async (groupId) => {
  try {
    const response = await api.get(`${API_BASE}/groups/${groupId}/members`);
    return response.data;
  } catch (error) {
    console.error('Error fetching group members:', error);
    throw error;
  }
};

// Add member to group
export const addGroupMember = async (groupId, userId = null) => {
  try {
    const payload = userId ? { userId } : {};
    const response = await api.post(`${API_BASE}/groups/${groupId}/addMember`, payload);
    return response.data;
  } catch (error) {
    console.error('Error adding group member:', error);
    throw error;
  }
};

// Get all groups
export const getAllGroups = async () => {
  try {
    const response = await api.get(`${API_BASE}/groups`);
    return response.data;
  } catch (error) {
    console.error('Error fetching groups:', error);
    throw error;
  }
};

// Create new group
export const createGroup = async (groupData) => {
  try {
    const response = await api.post(`${API_BASE}/groups`, groupData);
    return response.data;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

// Get group messages
export const getGroupMessages = async (groupId, page = 1, limit = 50) => {
  try {
    const response = await api.get(`${API_BASE}/groups/${groupId}/messages`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching group messages:', error);
    throw error;
  }
};

// Send group message
export const sendGroupMessage = async (groupId, messageData) => {
  try {
    const response = await api.post(`${API_BASE}/groups/${groupId}/messages`, messageData);
    return response.data;
  } catch (error) {
    console.error('Error sending group message:', error);
    throw error;
  }
};

// Delete group message
export const deleteGroupMessage = async (groupId, messageId) => {
  try {
    const response = await api.delete(`${API_BASE}/groups/${groupId}/messages/${messageId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting group message:', error);
    throw error;
  }
};

// Get group posts
export const getGroupPosts = async (groupId) => {
  try {
    const response = await api.get(`${API_BASE}/groups/${groupId}/posts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching group posts:', error);
    throw error;
  }
};

// Create group post
export const createGroupPost = async (postData) => {
  try {
    const response = await api.post(`${API_BASE}/groups/createPost`, postData);
    return response.data;
  } catch (error) {
    console.error('Error creating group post:', error);
    throw error;
  }
};

// Add comment to post
export const addComment = async (postId, commentData) => {
  try {
    const response = await api.post(`${API_BASE}/groups/posts/${postId}/comments`, commentData);
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Add like to post
export const addLike = async (postId) => {
  try {
    const response = await api.post(`${API_BASE}/groups/posts/${postId}/likes`);
    return response.data;
  } catch (error) {
    console.error('Error adding like:', error);
    throw error;
  }
};