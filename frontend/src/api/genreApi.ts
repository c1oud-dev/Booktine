import { http } from './http';
import type { ApiResponse } from '@/types/api';

export const DEFAULT_GENRES = [
  '소설',
  '에세이',
  '인문',
  '사회',
  '역사',
  '경제/경영',
  '자기계발',
  '과학',
  '기술/IT',
  '예술',
  '시',
  '종교',
  '여행',
  '만화',
  '기타',
];

export interface Genre {
  id: number;
  name: string;
}

export async function getGenres() {
  const res = await http.get<ApiResponse<string[]>>('/genres');
  return res.data.data;
}