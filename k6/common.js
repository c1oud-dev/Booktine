import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = 'https://api.booktine.cloud';

/**
 * 로그인 후 accessToken 반환
 */
export function login() {
  const res = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: 'loadtest@booktine.com',
    password: 'Loadtest1!',
    keepLogin: false,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, { '로그인 성공': (r) => r.status === 200 });

  const body = JSON.parse(res.body);
  return body.data.accessToken;
}

/**
 * Authorization 헤더 반환
 */
export function authHeaders(token) {
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
}

export { BASE_URL };