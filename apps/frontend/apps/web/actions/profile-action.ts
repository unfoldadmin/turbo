'use server'

import { getApiClient } from '@/lib/api'
import { authOptions } from '@/lib/auth'
import type { profileFormSchema } from '@/lib/validation'
import { ApiError, type UserCurrentError } from '@frontend/types/api'
import { getServerSession } from 'next-auth'
import type { z } from 'zod'

export type ProfileFormSchema = z.infer<typeof profileFormSchema>

export async function profileAction(
  data: ProfileFormSchema
): Promise<boolean | UserCurrentError> {
  const session = await getServerSession(authOptions)

  try {
    const apiClient = await getApiClient(session)

    await apiClient.users.usersMePartialUpdate({
      first_name: data.firstName,
      last_name: data.lastName
    })

    return true
  } catch (error) {
    if (error instanceof ApiError) {
      return error.body as UserCurrentError
    }
  }

  return false
}
