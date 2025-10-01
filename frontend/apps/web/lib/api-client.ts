// API 基础配置
// 服务器端使用 Docker 服务名，客户端使用 localhost
const getApiBaseUrl = (): string => {
  if (typeof window === 'undefined') {
    // 服务器端（SSR/API routes）
    return process.env.SERVER_API_URL || 'http://api:8000';
  }
  // 客户端（浏览器）
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

const REQUEST_TIMEOUT = 10000;

// 自定义错误类
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = 'ApiError';
  }
}

// Fetch 请求配置类型
export interface FetchRequestConfig extends RequestInit {
  url?: string;
  timeout?: number;
  params?: Record<string, string>;
  token?: string; // 可选的认证 token
}

// 带超时的 fetch 请求
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = REQUEST_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// API 客户端核心请求方法
async function request<T>(
  endpoint: string,
  config: FetchRequestConfig = {}
): Promise<T> {
  const { timeout = REQUEST_TIMEOUT, params, token: configToken, ...fetchConfig } = config;
  
  // 构建 URL - 动态获取 base URL
  const url = new URL(endpoint, getApiBaseUrl());
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  // 设置默认 headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // 合并自定义 headers
  if (fetchConfig.headers) {
    const customHeaders = new Headers(fetchConfig.headers);
    customHeaders.forEach((value, key) => {
      headers[key] = value;
    });
  }

  // 添加认证 token
  // 优先使用配置中传入的 token，否则从 localStorage 读取
  const token = configToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetchWithTimeout(
      url.toString(),
      {
        ...fetchConfig,
        headers,
      },
      timeout
    );

    // 处理 401 未授权错误
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        // 可以在这里添加重定向到登录页面的逻辑
        // window.location.href = '/login';
      }
    }

    // 如果响应不成功，抛出错误
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      throw new ApiError(response.status, response.statusText, errorData);
    }

    // 处理空响应
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      return (text ? text : null) as T;
    }

    return await response.json();
  } catch (error) {
    // 重新抛出 ApiError
    if (error instanceof ApiError) {
      throw error;
    }
    // 处理其他错误（网络错误、超时等）
    throw error;
  }
}

// 导出便捷方法
export const apiClient = {
  get: <T>(url: string, config?: FetchRequestConfig) =>
    request<T>(url, { ...config, method: 'GET' }),
  
  post: <T>(url: string, data?: any, config?: FetchRequestConfig) =>
    request<T>(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  put: <T>(url: string, data?: any, config?: FetchRequestConfig) =>
    request<T>(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  patch: <T>(url: string, data?: any, config?: FetchRequestConfig) =>
    request<T>(url, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  delete: <T>(url: string, config?: FetchRequestConfig) =>
    request<T>(url, { ...config, method: 'DELETE' }),
  
  request,
};

// 类型定义
export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  date_joined: string;
}

export interface UserCreate {
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  password: string;
  password_retype: string;
}

export interface UserChangePassword {
  old_password: string;
  new_password: string;
}

export interface TokenObtainPair {
  access: string;
  refresh: string;
}

export interface TokenRefresh {
  access: string;
}

// API 服务类
export class ApiService {
  // 认证相关
  static async login(credentials: { username: string; password: string }): Promise<TokenObtainPair> {
    return apiClient.post<TokenObtainPair>('/api/token/', credentials);
  }

  static async refreshToken(refresh: string): Promise<TokenRefresh> {
    return apiClient.post<TokenRefresh>('/api/token/refresh/', { refresh });
  }

  // 用户相关
  static async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/api/users/me/');
  }

  static async createUser(userData: UserCreate): Promise<User> {
    return apiClient.post<User>('/api/users/', userData);
  }

  static async updateUser(userData: Partial<User>): Promise<User> {
    return apiClient.put<User>('/api/users/me/', userData);
  }

  static async partialUpdateUser(userData: Partial<User>): Promise<User> {
    return apiClient.patch<User>('/api/users/me/', userData);
  }

  static async changePassword(passwordData: UserChangePassword): Promise<void> {
    await apiClient.post<void>('/api/users/change-password/', passwordData);
  }

  static async deleteAccount(): Promise<void> {
    await apiClient.delete<void>('/api/users/delete-account/');
  }

  // 通用请求方法
  static async request<T>(endpoint: string, config?: FetchRequestConfig): Promise<T> {
    return apiClient.request<T>(endpoint, config);
  }
}
