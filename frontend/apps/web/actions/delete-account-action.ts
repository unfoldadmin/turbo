'use server'

import { apiClient } from '@/lib/api-client'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import type { z } from 'zod'
import { deleteAccountFormSchema } from '@/lib/validation'

export type DeleteAccountFormSchema = z.infer<typeof deleteAccountFormSchema>

export async function deleteAccountAction(
  data: DeleteAccountFormSchema
): Promise<boolean> {
  try {
    // 获取当前用户的会话以获取 token
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return false
    }

    // 调用 API 删除账户，传递 token
    await apiClient.delete('/api/users/delete-account/', {
      token: session.accessToken
    })

    return true
  } catch (error: any) {
    console.error('Failed to delete account:', error)
    return false
  }
}

