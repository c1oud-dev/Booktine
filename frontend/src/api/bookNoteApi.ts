import { http } from './http';
import type { ApiResponse, PageResponse } from '../types/api';
import type { BookNote, BookNotePayload, Memo, MemoPayload } from '../types/bookNote';

export async function getBookNotes(page = 0, size = 20) {
  const res = await http.get<ApiResponse<PageResponse<BookNote>>>('/posts', { params: { page, size } });
  return res.data.data.content;
}

export async function getBookNote(id: number) {
  const res = await http.get<ApiResponse<BookNote>>(`/posts/${id}`);
  return res.data.data;
}

export async function createBookNote(payload: BookNotePayload) {
  const res = await http.post<ApiResponse<BookNote>>('/posts', payload);
  return res.data.data;
}

export async function updateBookNote(id: number, payload: BookNotePayload) {
  const res = await http.put<ApiResponse<BookNote>>(`/posts/${id}`, payload);
  return res.data.data;
}

export async function deleteBookNote(id: number) {
  await http.delete(`/posts/${id}`);
}

export async function getMemos(postId: number, page = 0, size = 20) {
  const res = await http.get<ApiResponse<PageResponse<Memo>>>(`/posts/${postId}/memos`, { params: { page, size } });
  return res.data.data.content;
}

export async function createMemo(postId: number, payload: MemoPayload) {
  const res = await http.post<ApiResponse<Memo>>(`/posts/${postId}/memos`, payload);
  return res.data.data;
}

export async function updateMemo(postId: number, memoId: number, payload: MemoPayload) {
  const res = await http.put<ApiResponse<Memo>>(`/posts/${postId}/memos/${memoId}`, payload);
  return res.data.data;
}

export async function deleteMemo(postId: number, memoId: number) {
  await http.delete(`/posts/${postId}/memos/${memoId}`);
}
