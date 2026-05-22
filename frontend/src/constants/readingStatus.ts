import type { ReadingStatus } from '../types/bookNote';

export const STATUS_LABEL: Record<ReadingStatus, string> = {
  WISHLIST: '읽고 싶은 책',
  READING: '읽는 중',
  COMPLETED: '완독',
  PAUSED: '중단',
};

export const STATUS_CLASS_NAME: Record<ReadingStatus, string> = {
  WISHLIST: 'bg-violet-50 text-violet-400',
  READING: 'bg-sky-50 text-sky-400',
  COMPLETED: 'bg-emerald-50 text-emerald-400',
  PAUSED: 'bg-amber-50 text-amber-400',
};

export const READING_STATUS_OPTIONS: ReadingStatus[] = [
  'WISHLIST', 'READING', 'COMPLETED', 'PAUSED'
];

export const CARD_STATUS_CLASS_NAME: Record<ReadingStatus, string> = {
  WISHLIST: 'border-violet-200 border-2 bg-card',
  READING: 'border-sky-200 border-2 bg-card',
  COMPLETED: 'border-emerald-200 border-2 bg-card',
  PAUSED: 'border-amber-200 border-2 bg-card',
};