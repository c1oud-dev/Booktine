import { http } from './http';
import type { ApiResponse, PageResponse } from '../types/api';
import type { BookNote } from '../types/bookNote';
import type { UserProfile } from './userApi';

export async function getAdminUsers(page = 0, size = 10) {
  const res = await http.get<ApiResponse<PageResponse<UserProfile>>>('/admin/users', { params: { page, size, sort: 'id,desc' } });
  return res.data.data;
}

export async function getAdminPosts(page = 0, size = 10) {
  const res = await http.get<ApiResponse<PageResponse<BookNote>>>('/admin/posts', { params: { page, size, sort: 'id,desc' } });
  return res.data.data;
}