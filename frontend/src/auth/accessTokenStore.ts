const ACCESS_TOKEN_KEY = 'booktine.accessToken';

let accessToken: string | null = window.localStorage.getItem(ACCESS_TOKEN_KEY);

export const accessTokenStore = {
  get: () => accessToken,
  set: (token: string | null, persist = false) => {
    accessToken = token;

    if (token && persist) {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
      return;
    }

    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
  clear: () => {
    accessToken = null;
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
};