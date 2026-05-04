export interface BookNote {
  id: number;
  title: string;
  content: string;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Memo {
  id: number;
  postId?: number;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookNotePayload {
  title: string;
  content: string;
  author?: string;
}

export interface MemoPayload {
  postId: number;
  content: string;
}
