import axios, { AxiosInstance, AxiosError } from 'axios';

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

interface RetryConfig {
  maxRetries: number;
  delay: number;
  backoffMultiplier: number;
}

class ApiService {
  private client: AxiosInstance;
  private cache: Map<string, CacheEntry> = new Map();
  private requestQueue: Map<string, Promise<any>> = new Map();
  private retryConfig: RetryConfig = {
    maxRetries: 3,
    delay: 1000,
    backoffMultiplier: 2,
  };

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle token refresh and errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Handle 401 - token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          localStorage.removeItem('token');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Handle 403 - forbidden
        if (error.response?.status === 403) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }

        return Promise.reject(error);
      }
    );
  }

  private getCacheKey(method: string, url: string, params?: any): string {
    return `${method}:${url}:${JSON.stringify(params || {})}`;
  }

  private isCacheValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  private async retryRequest<T>(
    fn: () => Promise<T>,
    attempt: number = 0
  ): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      if (attempt < this.retryConfig.maxRetries && this._isRetryableError(error)) {
        const delay = this.retryConfig.delay * Math.pow(this.retryConfig.backoffMultiplier, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.retryRequest(fn, attempt + 1);
      }
      throw error;
    }
  }

  private _isRetryableError(error: any): boolean {
    if (!error.response) return true; // Network error
    const status = error.response.status;
    return status === 408 || status === 429 || status >= 500;
  }

  async get<T>(url: string, config?: any, cacheTtl: number = 0): Promise<T> {
    const cacheKey = this.getCacheKey('GET', url, config?.params);

    // Check cache
    if (cacheTtl > 0) {
      const cached = this.cache.get(cacheKey);
      if (cached && this.isCacheValid(cached)) {
        return cached.data as T;
      }
    }

    // Check if request is already in flight (deduplication)
    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey)!;
    }

    // Make request with retry logic
    const promise = this.retryRequest(() => this.client.get<T>(url, config).then((res) => res.data));

    this.requestQueue.set(cacheKey, promise);

    try {
      const data = await promise;

      // Cache the result
      if (cacheTtl > 0) {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl: cacheTtl,
        });
      }

      return data;
    } finally {
      this.requestQueue.delete(cacheKey);
    }
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    return this.retryRequest(() => this.client.post<T>(url, data, config).then((res) => res.data));
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    return this.retryRequest(() => this.client.put<T>(url, data, config).then((res) => res.data));
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    return this.retryRequest(() => this.client.delete<T>(url, config).then((res) => res.data));
  }

  clearCache(pattern?: string) {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

export const apiService = new ApiService();
