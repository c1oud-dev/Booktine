import { http } from './http';
import type { ApiResponse } from '../types/api';
import type { BookNote, BookNotePayload, Memo, MemoPayload } from '../types/bookNote';

export async function getBookNotes() {
  const res = await http.get<ApiResponse<BookNote[]>>('/posts');
  return res.data.data;
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

export async function getMemos() {
  const res = await http.get<ApiResponse<Memo[]>>('/memos');
  return res.data.data;
}

export async function createMemo(payload: MemoPayload) {
  const res = await http.post<ApiResponse<Memo>>('/memos', payload);
  return res.data.data;
}

export async function updateMemo(id: number, payload: MemoPayload) {
  const res = await http.put<ApiResponse<Memo>>(`/memos/${id}`, payload);
  return res.data.data;
}

export async function deleteMemo(id: number) {
  await http.delete(`/memos/${id}`);
}
