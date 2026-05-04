export type ReadingStatus = 'WISHLIST' | 'READING' | 'COMPLETED' | 'PAUSED';

export interface BookNote {
  id: number;
  userId: number;
  title: string;
  coverImageUrl: string | null;
  author: string;
  genre: string;
  publisher: string;
  publishedDate: string;
  summary: string;
  readingStatus: ReadingStatus;
  completedDate: string | null;
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
  genre: string;
  publisher: string;
  publishedDate: string;
  summary: string;
  readingStatus: ReadingStatus;
  completedDate?: string | null;
}

export interface MemoPayload {
  content: string;
  page: number;
}
