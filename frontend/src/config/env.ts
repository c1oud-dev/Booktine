const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

if (!rawApiBaseUrl && import.meta.env.PROD) {
  throw new Error('VITE_API_BASE_URL must be set for production builds.');
}

export const API_BASE_URL = trimTrailingSlash(rawApiBaseUrl || 'http://localhost:8080');