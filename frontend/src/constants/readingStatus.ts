import type { ReadingStatus } from '../types/bookNote';

export const STATUS_LABEL: Record<ReadingStatus, string> = {
  WISHLIST: '읽고 싶은 책',
  WANT_TO_READ: '읽고 싶은 책',
  READING: '읽는 중',
  COMPLETED: '완독',
  PAUSED: '중단',
};

export const STATUS_CLASS_NAME: Record<ReadingStatus, string> = {
  WISHLIST: 'bg-secondary text-secondary-foreground',
  WANT_TO_READ: 'bg-secondary text-secondary-foreground',
  READING: 'bg-primary text-primary-foreground',
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  PAUSED: 'bg-amber-50 text-amber-700',
};
export const READING_STATUS_OPTIONS: ReadingStatus[] = ['WISHLIST', 'WANT_TO_READ', 'READING', 'COMPLETED', 'PAUSED'];