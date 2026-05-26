import { http } from './http';
import { API_BASE_URL } from '@/config/env';
import { getAccessToken } from './http';
import type { ApiResponse } from '@/types/api';

export interface NotificationItem {
  id: number;
  postId: number;
  type: 'COMMENT' | 'LIKE';
  message: string;
  isRead: boolean;
  createdAt: string;
}

export async function getNotifications() {
  const res = await http.get<ApiResponse<NotificationItem[]>>('/notifications');
  return res.data.data;
}

export async function readNotification(id: number) {
  await http.patch<ApiResponse<void>>(`/notifications/${id}/read`);
}

export async function readAllNotifications() {
  await http.patch<ApiResponse<void>>('/notifications/read-all');
}

export function createNotificationEventSource() {
  const token = getAccessToken();
  return new EventSource(`${API_BASE_URL}/notifications/connect?token=${token}`, { withCredentials: true });
}