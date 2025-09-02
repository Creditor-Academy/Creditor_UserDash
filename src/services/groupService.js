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

/**
 * Create a new course-related group
 * @param {Object} payload
 * @param {string} payload.name
 * @param {string} payload.description
 * @param {string} payload.course_id
 */
export async function createCourseGroup(payload) {
  try {
    console.log("📤 groupService: Creating course group:", payload);
    const response = await api.post('/groups/course', payload, {
      withCredentials: true,
    });
    console.log("✅ groupService: Course group created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ groupService: Error creating course group:", error);
    throw error;
  }
}

/**
 * Get all groups
 * @returns {Promise<Object>} Response with groups data
 */
export async function getGroups() {
  try {
    console.log("📤 groupService: Fetching groups");
    
    const response = await api.get(`${API_BASE}/groups`);
    
    console.log("✅ groupService: Groups fetched successfully:", response.data);
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

// (Removed duplicate getGroups definitions)

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
}

/**
 * Create a post inside a group
 * @param {Object|FormData} postData - Post payload (Object for JSON, FormData for file upload)
 * @param {string} postData.group_id - Target group ID
 * @param {"POST"|"ANNOUNCEMENT"} postData.type - Type of post
 * @param {string|null} postData.title - Optional title
 * @param {string} postData.content - Body content
 * @param {string|null} postData.media_url - Optional media URL (for JSON payload)
 * @param {File} postData.media - File object (for FormData payload)
 * @param {boolean} postData.is_pinned - Whether the post is pinned
 * @returns {Promise<Object>} API response
 */
export async function createGroupPost(postData) {
  try {
    console.log("📤 groupService: Creating group post:", postData);
    
    // Determine if we're sending FormData (file upload) or JSON
    const isFormData = postData instanceof FormData;
    
    const config = {
      withCredentials: true,
    };
    
    // If it's FormData, let axios handle the Content-Type header automatically
    // If it's JSON, set the Content-Type to application/json
    if (!isFormData) {
      config.headers = {
        'Content-Type': 'application/json',
      };
    }
    
    const response = await api.post(`${API_BASE}/groups/createPost`, postData, config);
    console.log("✅ groupService: Group post created:", response.data);
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