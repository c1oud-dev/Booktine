import { http } from './http';
import type { ApiResponse, PageResponse } from '../types/api';

export interface CommunityPost {
  id: number;
  userId: number;
  authorNickname: string;
  authorProfileImageUrl: string | null;
  title: string;
  content: string;
  category: "GENERAL" | "REVIEW" | "QUESTION" | "RECOMMEND";
  likeCount: number;
  isLiked: boolean;
  isDeleted: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityComment {
  id: number;
  postId: number;
  userId: number;
  authorNickname: string;
  authorProfileImageUrl: string | null;
  content: string;
  parentId: number | null;
  depth: 1 | 2;
  isDeleted: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityPostPayload {
  title: string;
  content: string;
  category: "GENERAL" | "REVIEW" | "QUESTION" | "RECOMMEND";
}

export interface CommunityCommentPayload {
  content: string;
  parentId?: number | null;
}

export interface CommunityCommentUpdatePayload {
  content: string;
}

export async function getCommunityPosts(page = 0, size = 10, category?: string) {
  const res = await http.get<ApiResponse<PageResponse<CommunityPost>>>('/community/posts', { params: { page, size, category } });
  return res.data.data;
}

export async function createCommunityPost(payload: CommunityPostPayload) {
  const res = await http.post<ApiResponse<CommunityPost>>('/community/posts', payload);
  return res.data.data;
}

export async function getCommunityPost(postId: number) {
  const res = await http.get<ApiResponse<CommunityPost>>(`/community/posts/${postId}`);
  return res.data.data;
}

export async function updateCommunityPost(postId: number, payload: CommunityPostPayload) {
  const res = await http.put<ApiResponse<CommunityPost>>(`/community/posts/${postId}`, payload);
  return res.data.data;
}

export async function deleteCommunityPost(postId: number) {
  await http.delete<ApiResponse<void>>(`/community/posts/${postId}`);
}

export async function getCommunityComments(postId: number) {
  const res = await http.get<ApiResponse<CommunityComment[]>>(`/community/posts/${postId}/comments`);
  return res.data.data;
}

export async function createCommunityComment(postId: number, payload: CommunityCommentPayload) {
  const res = await http.post<ApiResponse<CommunityComment>>(`/community/posts/${postId}/comments`, payload);
  return res.data.data;
}

export async function updateCommunityComment(commentId: number, payload: CommunityCommentUpdatePayload) {
  const res = await http.put<ApiResponse<CommunityComment>>(`/community/posts/comments/${commentId}`, payload);
  return res.data.data;
}

export async function deleteCommunityComment(commentId: number) {
  await http.delete<ApiResponse<void>>(`/community/posts/comments/${commentId}`);
}

export async function likeCommunityPost(postId: number) {
  const res = await http.post<ApiResponse<CommunityPost>>(`/community/posts/${postId}/likes`);
  return res.data.data;
}

export async function unlikeCommunityPost(postId: number) {
  const res = await http.delete<ApiResponse<CommunityPost>>(`/community/posts/${postId}/likes`);
  return res.data.data;
}

export async function getPopularCommunityPostsByLikes() {
  const res = await http.get<ApiResponse<CommunityPost[]>>('/community/popular/likes');
  return res.data.data;
}

export async function getPopularCommunityPostsByComments() {
  const res = await http.get<ApiResponse<CommunityPost[]>>('/community/popular/comments');
  return res.data.data;
}