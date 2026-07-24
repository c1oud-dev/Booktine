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

  // GET /community/posts
  const postsRes = http.get(`${BASE_URL}/community/posts`, headers);
  check(postsRes, { '커뮤니티 목록 조회 성공': (r) => r.status === 200 });
  sleep(0.5);

  // GET /community/posts/{postId}
  const posts = JSON.parse(postsRes.body);
  if (posts.data && posts.data.content && posts.data.content.length > 0) {
    const postId = posts.data.content[0].id;

    const postRes = http.get(`${BASE_URL}/community/posts/${postId}`, headers);
    check(postRes, { '커뮤니티 단건 조회 성공': (r) => r.status === 200 });
    sleep(0.5);

    // GET /community/posts/{postId}/comments
    const commentsRes = http.get(`${BASE_URL}/community/posts/${postId}/comments`, headers);
    check(commentsRes, { '댓글 목록 조회 성공': (r) => r.status === 200 });
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