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

  // GET /users/me
  const meRes = http.get(`${BASE_URL}/users/me`, headers);
  check(meRes, { '내 정보 조회 성공': (r) => r.status === 200 });
  sleep(0.5);

  // GET /posts
  const postsRes = http.get(`${BASE_URL}/posts`, headers);
  check(postsRes, { '게시글 목록 조회 성공': (r) => r.status === 200 });

  // GET /posts/{id}
  const posts = JSON.parse(postsRes.body);
  if (posts.data && posts.data.length > 0) {
    const postId = posts.data[0].id;

    const postRes = http.get(`${BASE_URL}/posts/${postId}`, headers);
    check(postRes, { '게시글 단건 조회 성공': (r) => r.status === 200 });
    sleep(0.5);

    // GET /posts/{postId}/memos
    const memosRes = http.get(`${BASE_URL}/posts/${postId}/memos`, headers);
    check(memosRes, { '메모 목록 조회 성공': (r) => r.status === 200 });
  }

  sleep(1);
}