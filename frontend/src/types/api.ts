export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN';