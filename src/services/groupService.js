import api from './apiClient';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000';

/**
 * Create a new group
 * @param {Object} groupData - Group data
 * @param {string} groupData.name - Group name
 * @param {string} groupData.description - Group description
 * @param {string} groupData.created_by - User ID who created the group
 * @returns {Promise<Object>} Response with created group data
 */
export async function createGroup(groupData) {
  try {
    console.log("📤 groupService: Creating group:", groupData);
    
    const response = await api.post('/groups', groupData, {
      withCredentials: true,
    });
    
    console.log("✅ groupService: Group created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ groupService: Error creating group:", error);
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
    
    const response = await api.get('/groups', {
      withCredentials: true,
    });
    
    console.log("✅ groupService: Groups fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ groupService: Error fetching groups:", error);
    throw error;
  }
}

/**
 * Get a specific group by ID
 * @param {string} groupId - Group ID
 * @returns {Promise<Object>} Response with group data
 */
export async function getGroupById(groupId) {
  try {
    console.log("📤 groupService: Fetching group by ID:", groupId);
    
    const response = await api.get(`/groups/${groupId}`, {
      withCredentials: true,
    });
    
    console.log("✅ groupService: Group fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ groupService: Error fetching group:", error);
    throw error;
  }
}

/**
 * Update a group
 * @param {string} groupId - Group ID
 * @param {Object} groupData - Updated group data
 * @returns {Promise<Object>} Response with updated group data
 */
export async function updateGroup(groupId, groupData) {
  try {
    console.log("📤 groupService: Updating group:", groupId, groupData);
    
    const response = await api.put(`/groups/${groupId}`, groupData, {
      withCredentials: true,
    });
    
    console.log("✅ groupService: Group updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ groupService: Error updating group:", error);
    throw error;
  }
}

/**
 * Delete a group
 * @param {string} groupId - Group ID
 * @returns {Promise<Object>} Response with deletion status
 */
export async function deleteGroup(groupId) {
  try {
    console.log("📤 groupService: Deleting group:", groupId);
    
    const response = await api.delete(`/groups/${groupId}`, {
      withCredentials: true,
    });
    
    console.log("✅ groupService: Group deleted successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ groupService: Error deleting group:", error);
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
    
    const response = await api.post('/groups/createPost', postData, config);
    console.log("✅ groupService: Group post created:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ groupService: Error creating group post:", error);
    throw error;
  }
}

/**
 * Get all posts for a specific group
 * @param {string} groupId - Group ID
 * @returns {Promise<Object>} API response with posts list
 */
export async function getGroupPosts(groupId) {
  try {
    if (!groupId) throw new Error('groupId is required');
    console.log("📥 groupService: Fetching posts for group:", groupId);
    const response = await api.get(`/groups/${groupId}/posts`, {
      withCredentials: true,
    });
    console.log("✅ groupService: Posts fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ groupService: Error fetching group posts:", error);
    throw error;
  }
}

/**
 * Add a member to a group
 * - If userId is provided: attempts to add that user (admin-only per backend)
 * - If userId is omitted: current user joins the group
 * @param {string} groupId
 * @param {string=} userId
 */
export async function addGroupMember(groupId, userId = null) {
  try {
    if (!groupId) throw new Error('groupId is required');
    console.log("📤 groupService: Adding member to group:", groupId, "User ID:", userId);
    
    const payload = userId ? { userId } : {};
    console.log("📤 groupService: Making request to:", `/groups/${groupId}/addMember`);
    console.log("📤 groupService: Request payload:", payload);
    console.log("📤 groupService: API base URL:", import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000');
    
    // Test the API endpoint first
    try {
      const testResponse = await api.get(`/groups/${groupId}`, {
        withCredentials: true,
      });
      console.log("✅ groupService: Group exists:", testResponse.data);
    } catch (testError) {
      console.warn("⚠️ groupService: Group test failed:", testError.response?.status, testError.response?.data);
    }
    
    const response = await api.post(`/groups/${groupId}/addMember`, payload, {
      withCredentials: true,
    });
    
    console.log("✅ groupService: Member added successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ groupService: Error adding member:", error);
    console.error("❌ groupService: Error details:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    throw error;
  }
}

/**
 * Get all members of a group
 * @param {string} groupId
 */
export async function getGroupMembers(groupId) {
  try {
    if (!groupId) throw new Error('groupId is required');
    console.log("📥 groupService: Fetching members for group:", groupId);
    const response = await api.get(`/groups/${groupId}/members`, {
      withCredentials: true,
    });
    console.log("✅ groupService: Group members fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ groupService: Error fetching group members:", error);
    throw error;
  }
}