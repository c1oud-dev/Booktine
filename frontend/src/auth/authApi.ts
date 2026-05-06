import { http, setAccessToken } from '../api/http';
import type { ApiResponse } from '../types/api';

type AuthTokenPayload = {
  accessToken?: string;
  token?: string;
};

const resolveToken = (payload: AuthTokenPayload) => payload.accessToken ?? payload.token ?? null;

export const authApi = {
  signup: async (email: string, password: string) => {
    return http.post('/users/signup', { email, password });
  },

  login: async (email: string, password: string) => {
    const response = await http.post<ApiResponse<AuthTokenPayload>>('/auth/login', { email, password });
    const token = resolveToken(response.data.data);

    if (token) {
      setAccessToken(token);
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
