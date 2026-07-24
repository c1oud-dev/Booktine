import http from 'k6/http';
import { check, sleep } from 'k6';
import { login, authHeaders, BASE_URL } from './common.js';

export const options = {
  stages: [
    { duration: '1m', target: 5 },   // Warm-up
    { duration: '3m', target: 20 },  // Light
    { duration: '5m', target: 50 },  // Normal
    { duration: '5m', target: 100 }, // Heavy
    { duration: '3m', target: 150 }, // Over
    { duration: '1m', target: 0 },   // 종료
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const token = login();
  const headers = authHeaders(token);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // GET /stats
  const statsRes = http.get(`${BASE_URL}/stats`, headers);
  check(statsRes, { '기본 통계 조회 성공': (r) => r.status === 200 });
  sleep(0.5);

  // GET /stats/genre
  const genreRes = http.get(`${BASE_URL}/stats/genre`, headers);
  check(genreRes, { '장르별 통계 조회 성공': (r) => r.status === 200 });
  sleep(0.5);

  // GET /stats/annual/completed-counts
  const countRes = http.get(`${BASE_URL}/stats/annual/completed-counts?year=${year}`, headers);
  check(countRes, { '연간 월별 완독 수 조회 성공': (r) => r.status === 200 });
  sleep(0.5);

  // GET /stats/annual/completed-summary
  const summaryRes = http.get(`${BASE_URL}/stats/annual/completed-summary?year=${year}`, headers);
  check(summaryRes, { '연간 완독 요약 조회 성공': (r) => r.status === 200 });
  sleep(0.5);

  // GET /goals/monthly
  const monthlyRes = http.get(`${BASE_URL}/goals/monthly?year=${year}&month=${month}`, headers);
  check(monthlyRes, { '월간 목표 조회 성공': (r) => r.status === 200 });
  sleep(0.5);

  // GET /goals/annual
  const annualRes = http.get(`${BASE_URL}/goals/annual?year=${year}`, headers);
  check(annualRes, { '연간 목표 조회 성공': (r) => r.status === 200 });

  sleep(1);
}