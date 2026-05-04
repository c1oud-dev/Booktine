import { http } from './http';
import type { ApiResponse, PageResponse } from '../types/api';

export interface RecommendationBook {
  id: number;
  userId: number;
  title: string;
  author: string;
  publisher: string;
  coverImageUrl: string;
  genre: string;
  description: string;
  isbn: string;
}

export interface SearchBook {
  title: string;
  author: string;
  publisher: string;
  cover: string;
  categoryName: string;
  description: string;
  isbn13: string;
}

export interface SaveRecommendationPayload {
  title: string;
  author: string;
  publisher: string;
  coverImageUrl: string;
  genre: string;
  description: string;
  isbn: string;
}

export async function getRecommendationByGenre(genre: string) {
  const res = await http.get<ApiResponse<RecommendationBook>>('/recommendations', { params: { genre } });
  return res.data.data;
}

export async function searchRecommendationBooks(query: string, page = 0, size = 10) {
  const res = await http.get<ApiResponse<PageResponse<SearchBook>>>('/recommendations/search', {
    params: { query, page, size },
  });
  return res.data.data;
}

export async function getSavedRecommendations(page = 0, size = 10) {
  const res = await http.get<ApiResponse<PageResponse<RecommendationBook>>>('/recommendations/saved', {
    params: { page, size },
  });
  return res.data.data;
}

export async function saveRecommendation(payload: SaveRecommendationPayload) {
  const res = await http.post<ApiResponse<RecommendationBook>>('/recommendations', payload);
  return res.data.data;
}

export async function deleteRecommendation(id: number) {
  await http.delete(`/recommendations/${id}`);
}
