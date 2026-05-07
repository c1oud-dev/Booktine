import { http } from './http';
import type { ApiResponse, PageResponse } from '../types/api';
import type { BookNote } from '../types/bookNote';
import type { UserProfile } from './userApi';
import type { Genre } from './genreApi';
import type { Inquiry } from './inquiryApi';

export async function getAdminUsers(page = 0, size = 10) {
  const res = await http.get<ApiResponse<PageResponse<UserProfile>>>('/admin/users', { params: { page, size, sort: 'id,desc' } });
  return res.data.data;
}

export async function getAdminPosts(page = 0, size = 10) {
  const res = await http.get<ApiResponse<PageResponse<BookNote>>>('/admin/posts', { params: { page, size, sort: 'id,desc' } });
  return res.data.data;
}
export async function getAdminGenres() {
  const res = await http.get<ApiResponse<Genre[]>>('/admin/genres');
  return res.data.data;
}

export async function createAdminGenre(name: string) {
  const res = await http.post<ApiResponse<Genre>>('/admin/genres', { name });
  return res.data.data;
}

export async function deleteAdminGenre(id: number) {
  await http.delete(`/admin/genres/${id}`);
}

export async function getAdminInquiries(page = 0, size = 10) {
  const res = await http.get<ApiResponse<PageResponse<Inquiry>>>('/admin/inquiries', { params: { page, size, sort: 'createdAt,desc' } });
  return res.data.data;
}