import { http } from './http';
import type { ApiResponse, UserRole } from '../types/api';

export interface UserProfile {
  id: number;
  email: string;
  nickname: string;
  aboutMe: string | null;
  profileImageUrl: string | null;
  role: UserRole;
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

export async function checkEmailDuplicated(email: string) {
  const res = await http.get<ApiResponse<boolean>>('/users/check/email', { params: { email } });
  return res.data.data;
}

export async function checkNicknameDuplicated(nickname: string) {
  const res = await http.get<ApiResponse<boolean>>('/users/check/nickname', { params: { nickname } });
  return res.data.data;
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

export async function deleteMyProfileImage() {
  const res = await http.delete<ApiResponse<UserProfile>>('/users/me/image');
  return res.data.data;
}

export async function changePassword(payload: ChangePasswordPayload) {
  await http.post('/auth/password', payload);
}

export async function deleteMyAccount() {
  await http.delete('/users/me');
}