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
        const errorMessage = errorData.error?.message || `Request failed with status ${response.status}`;
        setError(errorMessage);
        throw new Error(errorMessage);
      }
      
      // ✨ 改善：處理沒有回傳內容的 HTTP 狀態碼
      // 204 No Content, 205 Reset Content, 304 Not Modified 等
      if (response.status === 204 || response.status === 205 || response.status === 304) {
        setData(null as T);
        return null;
      }

      // 檢查 Content-Type 是否為 JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // 非 JSON 回應，可能是純文字或其他格式
        const text = await response.text();
        setData(text as T);
        return text as T;
      }

      const result: T = await response.json();
      setData(result);
      return result;

    } catch (err: any) {
      const errorMessage = err.message || 'An unknown error occurred';
      setError(errorMessage);
      console.error(`API call failed for ${method} ${url}:`, err);
      throw err; // 重新拋出錯誤，讓呼叫者可以 catch
    } finally {
      setIsLoading(false);
    }
  }, [method, url]);

  return { data, error, isLoading, exec };
} 