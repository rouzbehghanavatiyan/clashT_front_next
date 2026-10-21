const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

const isBrowser = () => typeof window !== "undefined";

export const saveTokens = (accessToken: string, refreshToken: string) => {
  if (!isBrowser()) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const getAccessToken = () =>
  isBrowser() ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;

export const getRefreshToken = () =>
  isBrowser() ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;

export const removeTokens = () => {
  if (!isBrowser()) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};