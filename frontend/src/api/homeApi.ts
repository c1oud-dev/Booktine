import { http } from './http';
import type { ApiResponse, PageResponse } from '../types/api';

export interface HomePost {
  id: number;
  title: string;
  author: string | null;
  genre: string | null;
  readingStatus: string;
  createdAt: string;
}

export interface BasicStats {
  totalFinished: number;
  currentYearFinished: number;
  currentMonthFinished: number;
}

export interface BestsellerBook {
  title: string;
  author: string;
  publisher: string;
  cover: string;
  categoryName: string;
  description: string;
  isbn13: string;
}

export async function getHomeStats() {
  const res = await http.get<ApiResponse<BasicStats>>('/stats');
  return res.data.data;
}

export async function getRecentPosts(size = 5) {
  const res = await http.get<ApiResponse<PageResponse<HomePost>>>('/posts', {
    params: { page: 0, size, sort: 'createdAt,desc' },
  });
  return res.data.data;
}

export async function getBestsellers(size = 6) {
  const res = await http.get<ApiResponse<PageResponse<BestsellerBook>>>('/recommendations/bestseller', {
    params: { page: 0, size },
  });
  return res.data.data;
}
