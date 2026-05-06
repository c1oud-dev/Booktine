import { http } from './http';
import type { ApiResponse } from '../types/api';

export interface UserProfile {
  id: number;
  email: string;
  nickname: string;
  aboutMe: string | null;
  profileImageUrl: string | null;
  readingCount: number;
  completedCount: number;
}

export interface UpdateProfilePayload {
  nickname: string;
  aboutMe: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export async function getMyProfile() {
  const res = await http.get<ApiResponse<UserProfile>>('/users/me');
  return res.data.data;
}

export async function updateMyProfile(payload: UpdateProfilePayload) {
  const res = await http.put<ApiResponse<UserProfile>>('/users/me', payload);
  return res.data.data;
}

export async function uploadMyProfileImage(image: File) {
  const formData = new FormData();
  formData.append('image', image);

  const res = await http.post<ApiResponse<UserProfile>>('/users/me/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

export async function changePassword(payload: ChangePasswordPayload) {
  await http.post('/auth/password', payload);
}

export async function deleteMyAccount() {
  await http.delete('/users/me');
}