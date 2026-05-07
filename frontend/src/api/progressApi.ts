import { http } from './http';
import type { ApiResponse } from '../types/api';

export interface GenreStats {
  genre: string;
  count: number;
  percentage: number;
}

export interface MonthlyReadCount {
  month: number;
  count: number;
}

export interface MonthlyGoal {
  id: number;
  year: number;
  month: number;
  goalCount: number;
}

export interface AnnualGoal {
  id: number;
  year: number;
  goalCount: number;
}

export interface GoalPayload {
  year: number;
  goalCount: number;
}

export interface MonthlyGoalPayload extends GoalPayload {
  month: number;
}

export async function getGenreStats(year?: number, month?: number) {
  const res = await http.get<ApiResponse<GenreStats[]>>('/stats/genre', { params: { year, month } });
  return res.data.data;
}

export async function getAnnualCompletedCounts(year: number) {
  const res = await http.get<ApiResponse<MonthlyReadCount[]>>('/stats/annual/completed-counts', { params: { year } });
  return res.data.data;
}

export async function getMonthlyGoal(year: number, month: number) {
  const res = await http.get<ApiResponse<MonthlyGoal>>('/goals/monthly', { params: { year, month } });
  return res.data.data;
}

export async function createMonthlyGoal(payload: MonthlyGoalPayload) {
  const res = await http.post<ApiResponse<MonthlyGoal>>('/goals/monthly', payload);
  return res.data.data;
}

export async function updateMonthlyGoal(year: number, month: number, payload: MonthlyGoalPayload) {
  const res = await http.put<ApiResponse<MonthlyGoal>>('/goals/monthly', payload, { params: { year, month } });
  return res.data.data;
}

export async function getAnnualGoal(year: number) {
  const res = await http.get<ApiResponse<AnnualGoal>>('/goals/annual', { params: { year } });
  return res.data.data;
}

export async function createAnnualGoal(payload: GoalPayload) {
  const res = await http.post<ApiResponse<AnnualGoal>>('/goals/annual', payload);
  return res.data.data;
}

export async function updateAnnualGoal(year: number, payload: GoalPayload) {
  const res = await http.put<ApiResponse<AnnualGoal>>('/goals/annual', payload, { params: { year } });
  return res.data.data;
}

export interface BasicStats {
  totalFinished: number;
  currentYearFinished: number;
  currentMonthFinished: number;
}

export async function getBasicStats() {
  const res = await http.get<ApiResponse<BasicStats>>('/stats');
  return res.data.data;
}