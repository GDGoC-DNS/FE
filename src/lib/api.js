const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
export const AUTH_LOGOUT_EVENT = 'auth:logout';

export class ApiError extends Error {
  constructor(message, { status, code, path, payload } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.path = path;
    this.payload = payload;
  }
}

const getApiUrl = (path) => {
  if (/^https?:\/\//.test(path) || !API_BASE_URL) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
};

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setTokens = ({ accessToken, refreshToken }) => {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const clearTokens = ({ broadcast = true } = {}) => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);

  if (broadcast && typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
  }
};

const prepareBody = (body, headers) => {
  if (
    body == null ||
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof URLSearchParams ||
    typeof body === 'string'
  ) {
    return body;
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return JSON.stringify(body);
};

const parseResponseBody = async (response) => {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
};

const toApiError = async (response) => {
  let payload = null;

  try {
    payload = await parseResponseBody(response);
  } catch {
    payload = null;
  }

  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    return new ApiError(payload.message || '요청에 실패했습니다.', {
      status: response.status,
      code: payload.code,
      path: payload.path,
      payload,
    });
  }

  return new ApiError(response.statusText || '요청에 실패했습니다.', {
    status: response.status,
    payload,
  });
};

let refreshPromise = null;

const reissueAccessToken = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearTokens();
    throw new ApiError('로그인이 필요합니다.', { status: 401 });
  }

  refreshPromise = (async () => {
    const response = await fetch(getApiUrl('/api/auth/reissue'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      throw await toApiError(response);
    }

    const tokens = await parseResponseBody(response);
    setTokens(tokens || {});
    return tokens?.accessToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
};

const request = async (
  path,
  { method = 'GET', headers, body, auth = false, signal, retryOnAuth = true } = {},
) => {
  const requestHeaders = new Headers(headers || {});
  const requestBody = prepareBody(body, requestHeaders);

  if (auth) {
    const accessToken = getAccessToken();

    if (!accessToken) {
      clearTokens();
      throw new ApiError('로그인이 필요합니다.', { status: 401 });
    }

    requestHeaders.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(getApiUrl(path), {
    method,
    headers: requestHeaders,
    body: requestBody,
    signal,
  });

  if (response.status === 401 && auth && retryOnAuth) {
    const nextAccessToken = await reissueAccessToken();
    const retryHeaders = new Headers(requestHeaders);

    if (nextAccessToken) {
      retryHeaders.set('Authorization', `Bearer ${nextAccessToken}`);
    }

    return request(path, {
      method,
      headers: retryHeaders,
      body: requestBody,
      auth: false,
      signal,
      retryOnAuth: false,
    });
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  return parseResponseBody(response);
};

export const login = async (payload) => {
  const tokens = await request('/api/auth/login', {
    method: 'POST',
    body: payload,
  });

  setTokens(tokens || {});
  return tokens;
};

export const signup = async (payload) => {
  const tokens = await request('/api/auth/signup', {
    method: 'POST',
    body: payload,
  });

  setTokens(tokens || {});
  return tokens;
};

export const getMyInfo = (options = {}) =>
  request('/api/auth/me', {
    auth: true,
    ...options,
  });

export const changePassword = (payload) =>
  request('/api/auth/password', {
    method: 'PUT',
    auth: true,
    body: payload,
  });

export const getMyDomains = (options = {}) =>
  request('/api/domains', {
    auth: true,
    ...options,
  });

export const registerDomain = (payload) =>
  request('/api/domains', {
    method: 'POST',
    auth: true,
    body: payload,
  });

export const deleteDomain = (domainId) =>
  request(`/api/domains/${domainId}`, {
    method: 'DELETE',
    auth: true,
  });

export const checkDomainOwnership = (domainName) => {
  const query = new URLSearchParams({ domainName });

  return request(`/api/domains/ownership?${query.toString()}`);
};

export const getDnsRecords = (domainId, options = {}) =>
  request(`/api/domains/${domainId}/dns`, {
    auth: true,
    ...options,
  });

export const createDnsRecord = (domainId, payload) =>
  request(`/api/domains/${domainId}/dns`, {
    method: 'POST',
    auth: true,
    body: payload,
  });

export const updateDnsRecord = (domainId, recordId, payload) =>
  request(`/api/domains/${domainId}/dns/${recordId}`, {
    method: 'PUT',
    auth: true,
    body: payload,
  });

export const deleteDnsRecord = (domainId, recordId) =>
  request(`/api/domains/${domainId}/dns/${recordId}`, {
    method: 'DELETE',
    auth: true,
  });

export const logout = () => {
  clearTokens();
};
