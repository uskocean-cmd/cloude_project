const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface FetchOptions extends RequestInit {
  token?: string;
}

/**
 * APIリクエストを送信する共通関数
 */
export const fetchAPI = async <T>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API request failed');
  }

  return response.json();
};

/**
 * GETリクエスト
 */
export const get = <T>(endpoint: string, token?: string): Promise<T> => {
  return fetchAPI<T>(endpoint, { method: 'GET', token });
};

/**
 * POSTリクエスト
 */
export const post = <T>(endpoint: string, data: unknown, token?: string): Promise<T> => {
  return fetchAPI<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
};

/**
 * PUTリクエスト
 */
export const put = <T>(endpoint: string, data: unknown, token?: string): Promise<T> => {
  return fetchAPI<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
    token,
  });
};

/**
 * DELETEリクエスト
 */
export const del = <T>(endpoint: string, token?: string): Promise<T> => {
  return fetchAPI<T>(endpoint, { method: 'DELETE', token });
};
