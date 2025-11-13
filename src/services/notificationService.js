import axios from 'axios';
import { getAuthHeader } from '@/services/authHeader';

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  'https://creditor-backend-testing-branch.onrender.com';

/*
BACKEND ROUTES THAT NEED TO BE ENABLED:
In your router file, uncomment these routes for full notification functionality:

router.put("/mark-as-read", verifyToken, markAsRead);
router.post("/course", verifyToken, createCourseAddedNotification);
router.post("/module-published", verifyToken, createModulePublishedNotificationInternal);
router.post("/quiz", verifyToken, createQuizAddedNotification);
router.post("/payment", verifyToken, createPaymentNotification);
router.post("/system", verifyToken, createSystemNotification);

Currently only GET /api/notifications is enabled.
*/

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'https://sharebackend-sdkp.onrender.com';

// Fetch notifications for current user
export async function fetchNotifications() {
  const url = `${API_BASE}/api/notifications`;
  console.log('Fetching notifications from:', url);
  const response = await axios.get(url, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    withCredentials: true,
  });
  console.log('Fetch notifications response:', response.data);
  return response;
}

// Mark all notifications as read for current user
export async function markAllNotificationsRead() {
  const url = `${API_BASE}/api/notifications/mark-as-read`;
  console.log('Marking all notifications as read:', url);
  const response = await axios.put(
    url,
    {},
    {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      withCredentials: true,
    }
  );
  console.log('Mark all as read response:', response.data);
  return response;
}

// Create payment notification for current user
export async function createPaymentNotification() {
  const url = `${API_BASE}/api/notifications/payment`;
  return axios.post(
    url,
    {},
    {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      withCredentials: true,
    }
  );
}

// Create course notification for ALL users (admin function)
export async function createCourseNotification(courseId) {
  const url = `${API_BASE}/api/notifications/course`;
  console.log('Creating course notification for courseId:', courseId);
  const response = await axios.post(
    url,
    { courseId },
    {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      withCredentials: true,
    }
  );
  console.log('Course notification API response:', response.data);
  return response;
}

// Create module published notification for enrolled users only (admin function)
export async function createModulePublishedNotification(courseId, moduleId) {
  const url = `${API_BASE}/api/notifications/module-published`;
  return axios.post(
    url,
    { courseId, moduleId },
    {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      withCredentials: true,
    }
  );
}

// Create quiz notification
export async function createQuizNotification(quizId) {
  const url = `${API_BASE}/api/notifications/quiz`;
  return axios.post(
    url,
    { quizId },
    {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      withCredentials: true,
    }
  );
}

// Create system notification for current user
export async function createSystemNotification(title, message) {
  const url = `${API_BASE}/api/notifications/system`;
  return axios.post(
    url,
    { title, message },
    {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      withCredentials: true,
    }
  );
}

// Create ticket-reply notification for a specific user
export async function createTicketReplyNotification(ticketId, userId) {
  // Primary expected route
  const urlPrimary = `${API_BASE}/api/notifications/ticket-reply`;
  const payload = { ticketId, userId };
  const options = {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    withCredentials: true,
  };
  try {
    return await axios.post(urlPrimary, payload, options);
  } catch (error) {
    // Optional fallback route name if backend uses different naming
    if (error?.response?.status === 404) {
      const urlAlt = `${API_BASE}/api/notifications/ticket`;
      return axios.post(urlAlt, payload, options);
    }
    throw error;
  }
}

// Generic notification creation (fallback)
export async function createNotification(notification) {
  const url = `${API_BASE}/api/notifications/create`;
  return axios.post(url, notification, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    withCredentials: true,
  });
}

// Broadcast notification to all users (admin function)
export async function broadcastNotificationToAllUsers({
  title,
  message,
  type = 'info',
}) {
  return createNotification({ title, message, type, audience: 'all' });
}
