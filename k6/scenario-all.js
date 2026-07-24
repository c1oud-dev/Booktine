import http from 'k6/http';
import { check, sleep } from 'k6';
import { login, authHeaders, BASE_URL } from './common.js';

export const options = {
  scenarios: {
    scenario_a: {
      executor: 'ramping-vus',
      stages: [
        { duration: '1m', target: 5 },
        { duration: '3m', target: 20 },
        { duration: '5m', target: 50 },
        { duration: '5m', target: 100 },
        { duration: '1m', target: 0 },
      ],
      exec: 'scenarioA',
    },
    scenario_b: {
      executor: 'ramping-vus',
      stages: [
        { duration: '1m', target: 5 },
        { duration: '3m', target: 20 },
        { duration: '5m', target: 50 },
        { duration: '5m', target: 100 },
        { duration: '1m', target: 0 },
      ],
      exec: 'scenarioB',
    },
    scenario_c: {
      executor: 'ramping-vus',
      stages: [
        { duration: '1m', target: 5 },
        { duration: '3m', target: 20 },
        { duration: '5m', target: 50 },
        { duration: '5m', target: 100 },
        { duration: '1m', target: 0 },
      ],
      exec: 'scenarioC',
    },
    scenario_d: {
      executor: 'ramping-vus',
      stages: [
        { duration: '1m', target: 5 },
        { duration: '3m', target: 20 },
        { duration: '5m', target: 50 },
        { duration: '5m', target: 100 },
        { duration: '1m', target: 0 },
      ],
      exec: 'scenarioD',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.01'],
  },
};

export function scenarioA() {
  const token = login();
  const headers = authHeaders(token);

  const meRes = http.get(`${BASE_URL}/users/me`, headers);
  check(meRes, { '[A] 내 정보 조회 성공': (r) => r.status === 200 });
  sleep(0.5);

  const postsRes = http.get(`${BASE_URL}/posts`, headers);
  check(postsRes, { '[A] 게시글 목록 조회 성공': (r) => r.status === 200 });

  const posts = JSON.parse(postsRes.body);
  if (posts.data && posts.data.length > 0) {
    const postId = posts.data[0].id;
    const postRes = http.get(`${BASE_URL}/posts/${postId}`, headers);
    check(postRes, { '[A] 게시글 단건 조회 성공': (r) => r.status === 200 });
    sleep(0.5);

    const memosRes = http.get(`${BASE_URL}/posts/${postId}/memos`, headers);
    check(memosRes, { '[A] 메모 목록 조회 성공': (r) => r.status === 200 });
  }
  sleep(1);
}

export function scenarioB() {
  const token = login();
  const headers = authHeaders(token);

  const postRes = http.post(`${BASE_URL}/posts`, JSON.stringify({
    title: '부하테스트 도서',
    author: '테스트 저자',
    publisher: '테스트 출판사',
    readingStatus: 'READING',
    totalPage: 300,
  }), headers);
  check(postRes, { '[B] 게시글 작성 성공': (r) => r.status === 200 || r.status === 201 });
  sleep(0.5);

  const post = JSON.parse(postRes.body);
  if (post.data && post.data.id) {
    const memoRes = http.post(`${BASE_URL}/posts/${post.data.id}/memos`, JSON.stringify({
      content: '부하테스트 메모 내용',
      page: 10,
    }), headers);
    check(memoRes, { '[B] 메모 작성 성공': (r) => r.status === 200 || r.status === 201 });
  }
  sleep(1);
}

export function scenarioC() {
  const token = login();
  const headers = authHeaders(token);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const statsRes = http.get(`${BASE_URL}/stats`, headers);
  check(statsRes, { '[C] 기본 통계 조회 성공': (r) => r.status === 200 });
  sleep(0.5);

  const genreRes = http.get(`${BASE_URL}/stats/genre`, headers);
  check(genreRes, { '[C] 장르별 통계 조회 성공': (r) => r.status === 200 });
  sleep(0.5);

  const countRes = http.get(`${BASE_URL}/stats/annual/completed-counts?year=${year}`, headers);
  check(countRes, { '[C] 연간 월별 완독 수 조회 성공': (r) => r.status === 200 });
  sleep(0.5);

  const summaryRes = http.get(`${BASE_URL}/stats/annual/completed-summary?year=${year}`, headers);
  check(summaryRes, { '[C] 연간 완독 요약 조회 성공': (r) => r.status === 200 });
  sleep(0.5);

  const monthlyRes = http.get(`${BASE_URL}/goals/monthly?year=${year}&month=${month}`, headers);
  check(monthlyRes, { '[C] 월간 목표 조회 성공': (r) => r.status === 200 });
  sleep(0.5);

  const annualRes = http.get(`${BASE_URL}/goals/annual?year=${year}`, headers);
  check(annualRes, { '[C] 연간 목표 조회 성공': (r) => r.status === 200 });
  sleep(1);
}

export function scenarioD() {
  const token = login();
  const headers = authHeaders(token);

  const postsRes = http.get(`${BASE_URL}/community/posts`, headers);
  check(postsRes, { '[D] 커뮤니티 목록 조회 성공': (r) => r.status === 200 });
  sleep(0.5);

  const posts = JSON.parse(postsRes.body);
  if (posts.data && posts.data.content && posts.data.content.length > 0) {
    const postId = posts.data.content[0].id;

    const postRes = http.get(`${BASE_URL}/community/posts/${postId}`, headers);
    check(postRes, { '[D] 커뮤니티 단건 조회 성공': (r) => r.status === 200 });
    sleep(0.5);

    const commentsRes = http.get(`${BASE_URL}/community/posts/${postId}/comments`, headers);
    check(commentsRes, { '[D] 댓글 목록 조회 성공': (r) => r.status === 200 });
    sleep(0.5);

    // POST /community/posts/{postId}/likes
    const likeRes = http.post(`${BASE_URL}/community/posts/${postId}/likes`, null, headers);
    check(likeRes, { '좋아요 성공': (r) => r.status === 200 || r.status === 201 });
    sleep(0.5);

    // DELETE /community/posts/{postId}/likes
    const unlikeRes = http.del(`${BASE_URL}/community/posts/${postId}/likes`, null, headers);
    check(unlikeRes, { '좋아요 취소 성공': (r) => r.status === 200 });
  }
  sleep(1);
}