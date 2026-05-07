import { http } from './http';
import type { ApiResponse } from '@/types/api';

export interface InquiryPayload {
  subject: string;
  message: string;
}

export interface Inquiry {
  id: number;
  userId: number;
  userEmail: string;
  userNickname: string;
  subject: string;
  message: string;
  createdAt: string;
}

export async function createInquiry(payload: InquiryPayload) {
  const res = await http.post<ApiResponse<Inquiry>>('/inquiries', payload);
  return res.data.data;
}