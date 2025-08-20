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