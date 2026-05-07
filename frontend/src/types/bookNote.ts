export type ReadingStatus = 'WISHLIST' | 'READING' | 'COMPLETED' | 'PAUSED';
export interface BookNote {
  id: number;
  userId: number;
  title: string;
  coverImageUrl: string | null;
  author: string;
  genre: string | null;
  publisher: string;
  publishedDate: string | null;
  summary: string | null;
  readingStatus: ReadingStatus;
  startDate: string | null;
  completedDate: string | null;
  rating: number | null;
  shortReview: string | null;
  currentPage: number | null;
  totalPage: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Memo {
  id: number;
  postId: number;
  content: string;
  page: number;
  createdAt: string;
  updatedAt: string;
}

export interface BookNotePayload {
  title: string;
  author: string;
  genre?: string | null;
  publisher: string;
  publishedDate?: string | null;
  summary?: string | null;
  readingStatus: ReadingStatus;
  startDate?: string | null;
  completedDate?: string | null;
  rating?: number | null;
  shortReview?: string | null;
  currentPage?: number | null;
  totalPage?: number | null;
}

export interface MemoPayload {
  content: string;
  page: number;
}
