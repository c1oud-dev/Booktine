import { getAccessToken } from './http';
import { http } from './http';
import type { ApiResponse } from '../types/api';

export interface Reminder {
  id: number;
  userId: number;
  reminderTime: string;
  message: string;
}

export interface ReminderPayload {
  reminderTime: string;
  message: string;
}

export async function getReminders() {
  const res = await http.get<ApiResponse<Reminder[]>>('/reminders');
  return res.data.data;
}

export async function createReminder(payload: ReminderPayload) {
  const res = await http.post<ApiResponse<Reminder>>('/reminders', payload);
  return res.data.data;
}

export async function deleteReminder(reminderId: number) {
  await http.delete(`/reminders/${reminderId}`);
}

export function createReminderEventSource() {
  const token = getAccessToken();
  const baseURL = import.meta.env.VITE_API_BASE_URL ?? '';
  const url = new URL(`${baseURL}/reminders/connect`, window.location.origin);

  if (token) {
    url.searchParams.set('access_token', token);
  }

  return new EventSource(url.toString(), { withCredentials: true });
}
