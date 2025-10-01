import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiService, type User, type UserCreate, type UserChangePassword, type TokenObtainPair, apiClient } from '../api-client';
import { useSession } from 'next-auth/react';

// Query Keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

// 获取当前用户
export function useCurrentUser() {
  const { data: session } = useSession();
  const token = session?.accessToken as string | undefined;

  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => {
      if (token) {
        return apiClient.get<User>('/api/users/me/', { token });
      }
      return ApiService.getCurrentUser();
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!token, // 只在有 token 时执行
  });
}

// 登录
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) => 
      ApiService.login(credentials),
    onSuccess: (data: TokenObtainPair) => {
      // 保存 token 到 localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.access);
        localStorage.setItem('refreshToken', data.refresh);
      }
      
      // 使当前用户查询失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
}

// 注册
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: UserCreate) => ApiService.createUser(userData),
    onSuccess: () => {
      // 注册成功后可以自动登录或显示成功消息
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
}

// 更新用户信息
export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const token = session?.accessToken as string | undefined;

  return useMutation({
    mutationFn: (userData: Partial<User>) => {
      if (token) {
        return apiClient.put<User>('/api/users/me/', userData, { token });
      }
      return ApiService.updateUser(userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
}

// 部分更新用户信息
export function usePartialUpdateUser() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const token = session?.accessToken as string | undefined;

  return useMutation({
    mutationFn: (userData: Partial<User>) => {
      if (token) {
        return apiClient.patch<User>('/api/users/me/', userData, { token });
      }
      return ApiService.partialUpdateUser(userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
}

// 修改密码
export function useChangePassword() {
  const { data: session } = useSession();
  const token = session?.accessToken as string | undefined;

  return useMutation({
    mutationFn: (passwordData: UserChangePassword) => {
      if (token) {
        return apiClient.post<void>('/api/users/change-password/', passwordData, { token });
      }
      return ApiService.changePassword(passwordData);
    },
  });
}

// 删除账户
export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const token = session?.accessToken as string | undefined;

  return useMutation({
    mutationFn: () => {
      if (token) {
        return apiClient.delete<void>('/api/users/delete-account/', { token });
      }
      return ApiService.deleteAccount();
    },
    onSuccess: () => {
      // 清除所有缓存数据
      queryClient.clear();
      
      // 清除本地存储
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    },
  });
}

// 登出
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // 清除本地存储
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    },
    onSuccess: () => {
      // 清除所有缓存数据
      queryClient.clear();
    },
  });
}

