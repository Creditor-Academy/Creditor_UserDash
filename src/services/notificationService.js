export const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://creditor-backend-testing-branch.onrender.com";

import axios from "axios";
import { getAuthHeader } from "@/services/authHeader";

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

// Backend route may be disabled; keep helper for future use
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

// Try multiple endpoints for creating/broadcasting notifications, to be resilient to backend variants
async function postWithFallbacks(endpoints, payload) {
	const headers = {
		"Content-Type": "application/json",
		...getAuthHeader(),
	};
	const errors = [];
	for (const path of endpoints) {
		try {
			const res = await axios.post(`${API_BASE}${path}`, payload, {
				headers,
				withCredentials: true,
			});
			return res?.data || { success: true };
		} catch (err) {
			errors.push({ path, status: err?.response?.status, message: err?.message });
		}
	}
	const error = new Error("All notification endpoints failed");
	error.details = errors;
	throw error;
}

export async function createNotification(notification) {
	// notification: { title, message, type, audience, userIds, created_at }
	const payload = {
		title: notification?.title || "Notification",
		message: notification?.message || notification?.description || "",
		type: notification?.type || "info",
		audience: notification?.audience || "all",
		userIds: notification?.userIds || [],
		created_at: notification?.created_at || new Date().toISOString(),
		read: false,
	};
	return postWithFallbacks([
		"/api/notifications",
		"/api/notifications/create",
		"/api/notification",
		"/api/notification/create",
		"/api/admin/notifications",
		"/api/admin/notifications/create",
	], payload);
}

export async function broadcastNotificationToAllUsers({ title, message, type = "info" }) {
	return createNotification({ title, message, type, audience: "all" });
} 