import { useState, useCallback } from 'react';

type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface UseApiReturn<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  exec: (body?: any) => Promise<T | null>;
}

export function useApi<T>(method: ApiMethod, url: string): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const exec = useCallback(async (body?: any): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.error?.message || `Request failed with status ${response.status}`);
      }
      
      // 處理沒有回傳內容的 204 No Content 狀況
      if (response.status === 204) {
        setData(null);
        return null;
      }

      const result: T = await response.json();
      setData(result);
      return result;

    } catch (err: any) {
      setError(err.message);
      console.error(`API call failed for ${method} ${url}:`, err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [method, url]);

  return { data, error, isLoading, exec };
} 