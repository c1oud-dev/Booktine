let accessToken: string | null = null;

export const accessTokenStore = {
  get: () => accessToken,
  set: (token: string | null) => {
    accessToken = token;
    window.dispatchEvent(new Event('auth-change'));
  },
  clear: () => {
    accessToken = null;
    window.dispatchEvent(new Event('auth-change'));
  },
};