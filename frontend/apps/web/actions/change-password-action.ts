'use server'

import { apiClient } from '@/lib/api-client'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import type { z } from 'zod'
import { changePasswordFormSchema } from '@/lib/validation'

export type ChangePasswordFormSchema = z.infer<typeof changePasswordFormSchema>

export async function changePasswordAction(
  data: ChangePasswordFormSchema
): Promise<true | { [key: string]: string[] }> {
  try {
    // 获取当前用户的会话以获取 token
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return {
        password: ['Authentication required']
      }
    }

    // 调用 API 修改密码，传递 token
    await apiClient.post(
      '/api/users/change-password/',
      {
        password: data.password,
        password_new: data.passwordNew,
        password_retype: data.passwordRetype
      },
      {
        token: session.accessToken
      }
    )

    return true
  } catch (error: any) {
    // 处理 API 错误
    if (error.data && typeof error.data === 'object') {
      return error.data
    }
    
    return {
      password: ['Failed to change password']
    }
  }
}

