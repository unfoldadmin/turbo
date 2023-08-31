'use server'

import { z } from 'zod'
import { profileFormSchema } from '@/lib/validation'
import { ApiError, UserCurrentError } from '@frontend/types/api'
import { getApiClient } from '@/lib/api'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export type ProfileFormSchema = z.infer<typeof profileFormSchema>

export type ProfileAction = (
  data: ProfileFormSchema
) => Promise<boolean | UserCurrentError>

const profileAction: ProfileAction = async (data) => {
  const session = await getServerSession(authOptions)

  try {
    const apiClient = await getApiClient(session)

    apiClient.users.usersMePartialUpdate({
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

export { profileAction }
