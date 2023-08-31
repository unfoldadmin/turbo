'use server'

import { z } from 'zod'
import { registerFormSchema } from '@/lib/validation'
import { ApiError, UserCreateError } from '@frontend/types/api'
import { getApiClient } from '@/lib/api'

export type RegisterFormSchema = z.infer<typeof registerFormSchema>

export type RegisterAction = (
  data: RegisterFormSchema
) => Promise<UserCreateError | boolean>

const registerAction: RegisterAction = async (data) => {
  try {
    const apiClient = await getApiClient()

    apiClient.users.usersCreate({
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

export { registerAction }
