import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { accessTokenStore } from '../auth/accessTokenStore';

const baseURL = import.meta.env.VITE_API_BASE_URL;

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export const http = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const setAccessToken = (token: string | null) => {
  accessTokenStore.set(token);

  if (token) {
    http.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete http.defaults.headers.common.Authorization;
};

export const getAccessToken = () => accessTokenStore.get();

let reissuePromise: Promise<string> | null = null;

export const setupAuthInterceptors = (reissueAccessToken: () => Promise<string>) => {
  http.interceptors.request.use((config) => {
    const token = getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  http.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const status = error.response?.status;
      const originalRequest = error.config as RetriableRequestConfig | undefined;

      if (!originalRequest || status !== 401 || originalRequest._retry || originalRequest.url === '/auth/reissue') {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        if (!reissuePromise) {
          reissuePromise = reissueAccessToken();
        }

        const token = await reissuePromise;
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return http(originalRequest);
      } catch (reissueError) {
        setAccessToken(null);
        return Promise.reject(reissueError);
      } finally {
        reissuePromise = null;
      }
    },
  );
};