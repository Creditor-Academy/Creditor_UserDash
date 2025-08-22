export const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://creditor-backend-testing-branch.onrender.com";

import axios from "axios";
import { getAuthHeader } from "@/services/authHeader";

// Fetch notifications for current user
export async function fetchNotifications() {
	const url = `${API_BASE}/api/notifications`;
	return axios.get(url, {
		headers: {
			"Content-Type": "application/json",
			...getAuthHeader(),
		},
		withCredentials: true,
	});
}

// Mark all notifications as read for current user
export async function markAllNotificationsRead() {
	const url = `${API_BASE}/api/notifications/mark-as-read`;
	return axios.put(url, {}, {
		headers: {
			"Content-Type": "application/json",
			...getAuthHeader(),
		},
		withCredentials: true,
	});
}

// Create payment notification for current user
export async function createPaymentNotification() {
	const url = `${API_BASE}/api/notifications/payment`;
	return axios.post(url, {}, {
		headers: {
			"Content-Type": "application/json",
			...getAuthHeader(),
		},
		withCredentials: true,
	});
}

// Create system notification for current user
export async function createSystemNotification(title, message) {
	const url = `${API_BASE}/api/notifications/system`;
	return axios.post(url, { title, message }, {
		headers: {
			"Content-Type": "application/json",
			...getAuthHeader(),
		},
		withCredentials: true,
	});
}

// Create quiz notification for current user
export async function createQuizNotification(quizId) {
	const url = `${API_BASE}/api/notifications/quiz`;
	return axios.post(url, { quizId }, {
		headers: {
			"Content-Type": "application/json",
			...getAuthHeader(),
		},
		withCredentials: true,
	});
}

// Create course notification for ALL users (admin function)
export async function createCourseNotification(courseId) {
	const url = `${API_BASE}/api/notifications/course`;
	return axios.post(url, { courseId }, {
		headers: {
			"Content-Type": "application/json",
			...getAuthHeader(),
		},
		withCredentials: true,
	});
}

// Create module published notification for enrolled users only (admin function)
export async function createModulePublishedNotification(courseId, moduleId) {
	const url = `${API_BASE}/api/notifications/module-published`;
	return axios.post(url, { courseId, moduleId }, {
		headers: {
			"Content-Type": "application/json",
			...getAuthHeader(),
		},
		withCredentials: true,
	});
}

// Generic notification creation (fallback)
export async function createNotification(notification) {
	const url = `${API_BASE}/api/notifications/create`;
	return axios.post(url, notification, {
		headers: {
			"Content-Type": "application/json",
			...getAuthHeader(),
		},
		withCredentials: true,
	});
}

// Broadcast notification to all users (admin function)
export async function broadcastNotificationToAllUsers({ title, message, type = "info" }) {
	return createNotification({ title, message, type, audience: "all" });
} 