'use server'

import { getApiClient } from '@/lib/api'
import { authOptions } from '@/lib/auth'
import type { changePasswordFormSchema } from '@/lib/validation'
import { ApiError, type UserChangePasswordError } from '@frontend/types/api'
import { getServerSession } from 'next-auth'
import type { z } from 'zod'

export type ChangePasswordFormSchema = z.infer<typeof changePasswordFormSchema>

export async function changePasswordAction(
  data: ChangePasswordFormSchema
): Promise<UserChangePasswordError | boolean> {
  const session = await getServerSession(authOptions)

  try {
    const apiClient = await getApiClient(session)

    await apiClient.users.usersChangePasswordCreate({
      password: data.password,
      password_new: data.passwordNew,
      password_retype: data.passwordRetype
    })

    return true
  } catch (error) {
    if (error instanceof ApiError) {
      return error.body as UserChangePasswordError
    }
  }

  return false
}
