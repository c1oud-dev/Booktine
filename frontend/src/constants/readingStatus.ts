import type { ReadingStatus } from '../types/bookNote';

export const STATUS_LABEL: Record<ReadingStatus, string> = {
  WISHLIST: '읽고 싶은 책',
  READING: '읽는 중',
  COMPLETED: '완독',
  PAUSED: '중단',
};

export const STATUS_CLASS_NAME: Record<ReadingStatus, string> = {
  WISHLIST: 'bg-violet-100 text-violet-700',
  READING: 'bg-sky-100 text-sky-700',
  COMPLETED: 'bg-primary text-primary-foreground',
  PAUSED: 'bg-amber-100 text-amber-700',
};

export const READING_STATUS_OPTIONS: ReadingStatus[] = [
  'WISHLIST', 'READING', 'COMPLETED', 'PAUSED'
];

export const CARD_STATUS_CLASS_NAME: Record<ReadingStatus, string> = {
  WISHLIST: 'border-violet-300 border-2 bg-card',
  READING: 'border-sky-300 border-2 bg-card',
  COMPLETED: 'border-primary border-2 bg-card',
  PAUSED: 'border-amber-300 border-2 bg-card',
};