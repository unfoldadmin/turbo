'use server'

import { getApiClient } from '@/lib/api'
import type { registerFormSchema } from '@/lib/validation'
import { ApiError, type UserCreateError } from '@frontend/types/api'
import type { z } from 'zod'

export type RegisterFormSchema = z.infer<typeof registerFormSchema>

export async function registerAction(
  data: RegisterFormSchema
): Promise<UserCreateError | boolean> {
  try {
    const apiClient = await getApiClient()

    await apiClient.users.usersCreate({
      username: data.username,
      password: data.password,
      password_retype: data.passwordRetype
    })

    return true
  } catch (error) {
    if (error instanceof ApiError) {
      return error.body as UserCreateError
    }
  }

  return false
}
