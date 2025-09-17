import api from './apiClient';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://sharebackend-sdkp.onrender.com';

// Get group by ID
export const getGroupById = async (groupId) => {
  try {
    const response = await api.get(`/groups/${groupId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching group:', error);
    throw error;
  }
};

// Get group members
export const getGroupMembers = async (groupId) => {
  try {
    const response = await api.get(`/groups/${groupId}/members`);
    return response.data;
  } catch (error) {
    console.error('Error fetching group members:', error);
    throw error;
  }
};

// (duplicate createCourseGroup removed)

/**
 * Create a new course-related group
 * @param {Object} payload
 * @param {string} payload.name
 * @param {string} payload.description
 * @param {string} payload.course_id
 */
export async function createCourseGroup(payload) {
  try {
    // Normalize possible image field aliases so backend variants capture it
    const image = payload.thumbnail || payload.banner || payload.image_url || payload.imageUrl || payload.image;
    const body = {
      ...payload,
      ...(image ? {
        thumbnail: image,
        banner: image,
        image_url: image,
        imageUrl: image,
        image: image,
      } : {}),
    };
    console.log("📤 groupService: Creating course group:", body);
    const response = await api.post('/groups/course', body, {
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
    
    const response = await api.get(`/groups`);
    
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
    const response = await api.post(`/groups/${groupId}/addMember`, payload);
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
    // send common aliases for the image so backend variations still capture it
    const image = groupData.thumbnail || groupData.banner || groupData.image_url || groupData.imageUrl || groupData.image;
    const payload = {
      ...groupData,
      ...(image ? {
        thumbnail: image,
        banner: image,
        image_url: image,
        imageUrl: image,
        image: image,
      } : {}),
    };
    const response = await api.post(`/groups`, payload);
    return response.data;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

// Update an existing group
export const updateGroup = async (groupId, update) => {
  try {
    const image = update.thumbnail || update.banner || update.image_url || update.imageUrl || update.image;
    const payload = {
      ...update,
      ...(image ? {
        thumbnail: image,
        banner: image,
        image_url: image,
        imageUrl: image,
        image: image,
      } : {}),
    };
    const response = await api.put(`/groups/${groupId}`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating group:', error);
    throw error;
  }
};

// Get group messages
export const getGroupMessages = async (groupId, page = 1, limit = 50) => {
  try {
    const response = await api.get(`/groups/${groupId}/messages`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching group messages:', error);
    throw error;
  }
}

// Send a group message
// Supports JSON payload for text messages and FormData for image/file messages
export const sendGroupMessage = async (groupId, payload, isMultipart = false) => {
  try {
    const isFormData = isMultipart || (typeof FormData !== 'undefined' && payload instanceof FormData);
    const config = isFormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : { headers: { 'Content-Type': 'application/json' } };

    const body = isFormData ? payload : payload; // axios handles both
    const response = await api.post(`/groups/${groupId}/messages`, body, config);
    return response.data;
  } catch (error) {
    console.error('Error sending group message:', error);
    throw error;
  }
};

// POLLS
export const createGroupPoll = async (groupId, poll) => {
  try {
    // Backend expects poll_question, poll_expires_at, poll_allow_multiple, poll_is_anonymous, options: string[]
    const pollExpiresAt = poll.durationMinutes && Number(poll.durationMinutes) > 0
      ? new Date(Date.now() + Number(poll.durationMinutes) * 60 * 1000).toISOString()
      : undefined;

    const payload = {
      poll_question: poll.question,
      poll_expires_at: pollExpiresAt,
      poll_allow_multiple: !!poll.allowMultiple,
      poll_is_anonymous: !!poll.isAnonymous,
      options: (poll.options || []).map(String),
    };

    // Prefer /groups prefix, fallback to no prefix
    try {
      const response = await api.post(`/groups/${groupId}/polls`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    } catch (err1) {
      if (err1?.response?.status === 404) {
        const response = await api.post(`/${groupId}/polls`, payload, {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
      }
      throw err1;
    }
  } catch (error) {
    const status = error?.response?.status;
    const msg = error?.response?.data?.message || error?.message || 'Unknown error';
    console.error('Error creating poll:', status, msg);
    // Fallback: some backends accept polls as a message with type POLL
    if (status === 404) {
      try {
        const body = { type: 'POLL', poll: payload };
        const response = await api.post(`/groups/${groupId}/messages`, body, {
          headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
      } catch (fallbackErr) {
        console.error('Fallback create poll via messages failed:', fallbackErr?.response?.status, fallbackErr?.response?.data?.message || fallbackErr?.message);
        throw fallbackErr;
      }
    }
    throw error;
  }
};

export const voteGroupPoll = async (groupId, pollId, { messageId, optionId }) => {
  try {
    try {
      const response = await api.post(`/groups/${groupId}/polls/${pollId}/vote`, { message_id: messageId, option_id: optionId });
      return response.data;
    } catch (err1) {
      if (err1?.response?.status === 404) {
        const response = await api.post(`/${groupId}/polls/${pollId}/vote`, { message_id: messageId, option_id: optionId });
        return response.data;
      }
      throw err1;
    }
  } catch (error) {
    console.error('Error voting poll:', error);
    throw error;
  }
};

export const getGroupPoll = async (groupId, pollId) => {
  try {
    try {
      const response = await api.get(`/groups/${groupId}/polls/${pollId}`);
      return response.data;
    } catch (err1) {
      if (err1?.response?.status === 404) {
        const response = await api.get(`/${groupId}/polls/${pollId}`);
        return response.data;
      }
      throw err1;
    }
  } catch (error) {
    console.error('Error fetching poll:', error);
    throw error;
  }
};

// PIN
export const pinGroupMessage = async (groupId, messageId, pinned) => {
  try {
    const response = await api.post(`/groups/${groupId}/messages/${messageId}/pin`, { pinned });
    return response.data;
  } catch (error) {
    console.error('Error pinning message:', error);
    throw error;
  }
};

// PIN POLL
export const pinGroupPoll = async (groupId, pollId) => {
  // Prefer /groups prefix (observed 200), fallback to no prefix
  try {
    const response = await api.post(`/groups/${groupId}/polls/${pollId}/pin`);
    return response.data;
  } catch (err1) {
    if (err1?.response?.status === 404) {
      const response = await api.post(`/${groupId}/polls/${pollId}/pin`);
      return response.data;
    }
    throw err1;
  }
};

// GET PINNED POLLS
export const getPinnedPolls = async (groupId) => {
  try {
    // Prefer /groups prefix, fallback to no prefix
    try {
      const response = await api.get(`/groups/${groupId}/polls/pinned`);
      return response.data;
    } catch (err1) {
      if (err1?.response?.status === 404) {
        const response = await api.get(`/${groupId}/polls/pinned`);
        return response.data;
      }
      throw err1;
    }
  } catch (error) {
    console.error('Error fetching pinned polls:', error);
    throw error;
  }
};

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
    
    const response = await api.post(`/groups/createPost`, postData, config);
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
    const response = await api.delete(`/groups/${groupId}/messages/${messageId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting group message:', error);
    throw error;
  }
};

// Edit group message (owner or admin)
export const editGroupMessage = async (groupId, messageId, { content }) => {
  try {
    const response = await api.put(`/groups/${groupId}/messages/${messageId}`, { content });
    return response.data;
  } catch (error) {
    console.error('Error editing group message:', error);
    throw error;
  }
};

// Get group posts
export const getGroupPosts = async (groupId) => {
  try {
    const response = await api.get(`/groups/${groupId}/posts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching group posts:', error);
    throw error;
  }
};

// Add comment to post
export const addComment = async (postId, commentData) => {
  try {
    const response = await api.post(`/groups/posts/${postId}/comments`, commentData);
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Edit comment by commentId
export const editComment = async (commentId, commentData) => {
  try {
    const response = await api.put(`/groups/comments/${commentId}`, commentData);
    return response.data;
  } catch (error) {
    console.error('Error editing comment:', error);
    throw error;
  }
};

// Delete comment (admin can delete any, user can delete own)
export const deleteComment = async (commentId) => {
  try {
    const response = await api.delete(`/groups/comments/${commentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

// Make a user admin of a group (only callable by current group admin)
export const makeGroupAdmin = async ({ groupId, userId }) => {
  try {
    const response = await api.post(`/groups/make-admin`, { groupId, userId });
    return response.data;
  } catch (error) {
    console.error('Error making group admin:', error);
    throw error;
  }
};

// ANNOUNCEMENT FUNCTIONS

// Create announcement
export const createAnnouncement = async (groupId, announcementData) => {
  try {
    const formData = new FormData();
    formData.append('title', announcementData.title);
    formData.append('content', announcementData.content);
    
    if (announcementData.media) {
      formData.append('media', announcementData.media);
    }

    const response = await api.post(`/groups/${groupId}/announcements`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }
};

// Get announcements
export const getAnnouncements = async (groupId) => {
  try {
    const response = await api.get(`/groups/${groupId}/announcements`);
    return response.data;
  } catch (error) {
    console.error('Error fetching announcements:', error);
    throw error;
  }
};

// Get single announcement
export const getAnnouncementById = async (announcementId) => {
  try {
    const response = await api.get(`/groups/announcements/${announcementId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching announcement:', error);
    throw error;
  }
};

// Update announcement
export const updateAnnouncement = async (announcementId, announcementData) => {
  try {
    // Accept either FormData or plain object
    const formData = announcementData instanceof FormData ? announcementData : (() => {
      const fd = new FormData();
      if (announcementData?.title !== undefined && announcementData?.title !== null) {
        fd.append('title', announcementData.title);
      }
      if (announcementData?.content !== undefined && announcementData?.content !== null) {
        fd.append('content', announcementData.content);
      }
      if (announcementData?.media) {
        fd.append('media', announcementData.media);
      }
      return fd;
    })();

    const response = await api.put(`/groups/announcements/${announcementId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating announcement:', error);
    throw error;
  }
};

// Delete announcement
export const deleteAnnouncement = async (announcementId) => {
  try {
    const response = await api.delete(`/groups/announcements/${announcementId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting announcement:', error);
    throw error;
  }
};

// Check if user is admin of a specific group
export const isUserGroupAdmin = async (groupId) => {
  try {
    const response = await api.get(`/groups/${groupId}/members`);
    const members = response.data?.data || response.data || [];
    const currentUserId = localStorage.getItem('userId');
    
    // Check if current user is in the members list with ADMIN role
    const currentUserMember = members.find(member => 
      (member.user?.id || member.user_id || member.id) === currentUserId
    );
    
    return currentUserMember?.role === 'ADMIN' || currentUserMember?.is_admin === true;
  } catch (error) {
    console.error('Error checking group admin status:', error);
    return false;
  }
};

// Add like to post
export const addLike = async (postId) => {
  try {
    const response = await api.post(`/groups/posts/${postId}/likes`);
    return response.data;
  } catch (error) {
    console.error('Error adding like:', error);
    throw error;
  }
};

// Remove like from post
export const removeLike = async (postId) => {
  try {
    const response = await api.delete(`/groups/posts/${postId}/likes`);
    return response.data;
  } catch (error) {
    console.error('Error removing like:', error);
    throw error;
  }
};

// Delete a specific group post by postId (admin only)
export const deleteGroupPost = async (postId) => {
  try {
    const response = await api.delete(`/groups/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting group post:', error);
    throw error;
  }
};

// Delete a group by ID (explicit local endpoint as requested)
export const deleteGroupById = async (groupId) => {
  try {
    const response = await api.delete(`/groups/${groupId}`, {
      withCredentials: true,
      data: { group_id: groupId },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
};

// Delete a member from a group
export const deleteGroupMember = async (groupId, memberId) => {
  try {
    const response = await api.delete(`/groups/${groupId}/members/${memberId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting group member:', error);
    throw error;
  }
};

// Leave group (current user leaves the group)
export const leaveGroup = async (groupId) => {
  try {
    const response = await api.post(`/groups/${groupId}/leave`);
    return response.data;
  } catch (error) {
    console.error('Error leaving group:', error);
    throw error;
  }
};

/**
 * Get groups for a specific course
 * @param {string|number} courseId - The course ID
 * @returns {Promise<Object>} Response with course groups data
 */
export const getCourseGroups = async (courseId) => {
  try {
    console.log("📤 groupService: Fetching groups for course:", courseId);
    
    const response = await api.get(`/groups/course/${courseId}`);
    
    console.log("✅ groupService: Course groups fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching course groups:', error);
    throw error;
  }
};

/**
 * Add multiple users to a group at once
 * @param {string|number} groupId - The group ID
 * @param {Array<string|number>} userIds - Array of user IDs to add
 * @returns {Promise<Object>} Response with bulk addition results
 */
export const addMultipleGroupMembers = async (groupId, userIds) => {
  try {
    console.log("📤 groupService: Adding multiple members to group:", groupId, userIds);
    
    const response = await api.post(`/groups/${groupId}/addMembers`, {
      userIds: userIds
    });
    
    console.log("✅ groupService: Multiple members added successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding multiple group members:', error);
    throw error;
  }
};