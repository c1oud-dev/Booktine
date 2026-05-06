import { http, setAccessToken } from '../api/http';
import type { ApiResponse } from '../types/api';

type AuthTokenPayload = {
  accessToken?: string;
  token?: string;
};

const SIGNUP_PURPOSE = 'SIGNUP';
const resolveToken = (payload: AuthTokenPayload) => payload.accessToken ?? payload.token ?? null;

export const authApi = {
  sendSignupEmailCode: async (email: string) => {
    return http.post('/auth/email/send', { email, purpose: SIGNUP_PURPOSE });
  },

  verifySignupEmailCode: async (email: string, code: string) => {
    return http.post('/auth/email/verify', { email, code, purpose: SIGNUP_PURPOSE });
  },

  signup: async (email: string, password: string, nickname: string) => {
    return http.post('/users/signup', { email, password, nickname });
  },

  login: async (email: string, password: string, keepLogin = false) => {
    const response = await http.post<ApiResponse<AuthTokenPayload>>('/auth/login', { email, password, keepLogin });
    const token = resolveToken(response.data.data);

    if (token) {
      setAccessToken(token, keepLogin);
    }

    return response;
  },

  logout: async () => {
    const response = await http.post('/auth/logout');
    setAccessToken(null);
    return response;
  },

  reissue: async () => {
    const response = await http.post<ApiResponse<AuthTokenPayload>>('/auth/reissue');
    const token = resolveToken(response.data.data);

    if (!token) {
      setAccessToken(null);
      throw new Error('재발급 응답에 access token이 없습니다.');
    }

    setAccessToken(token);
    return token;
  },
};
