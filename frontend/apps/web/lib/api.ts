import { ApiClient } from '@frontend/types/api'
import type { Session } from 'next-auth'

export async function getApiClient(session?: Session | null) {
  return new ApiClient({
    BASE: process.env.API_URL,
    HEADERS: {
      ...(session && {
        Authorization: `Bearer ${session.accessToken}`
      })
    }
  })
}
