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

  // POST /posts
  const postRes = http.post(`${BASE_URL}/posts`, JSON.stringify({
    title: '부하테스트 도서',
    author: '테스트 저자',
    publisher: '테스트 출판사',
    readingStatus: 'READING',
    totalPage: 300,
  }), headers);
  check(postRes, { '게시글 작성 성공': (r) => r.status === 200 || r.status === 201 });
  sleep(0.5);

  // POST /posts/{postId}/memos
  const post = JSON.parse(postRes.body);
  if (post.data && post.data.id) {
    const postId = post.data.id;

    const memoRes = http.post(`${BASE_URL}/posts/${postId}/memos`, JSON.stringify({
      content: '부하테스트 메모 내용',
      page: 10,
    }), headers);
    check(memoRes, { '메모 작성 성공': (r) => r.status === 200 || r.status === 201 });
  }

  sleep(1);
}