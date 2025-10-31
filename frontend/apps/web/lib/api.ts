import { ApiClient } from '@frontend/types/api'
import type { Session } from 'next-auth'

export async function getApiClient(session?: Session | null) {
  // Determine if we're running on server (Next.js) or client (browser)
  const isServer = typeof window === 'undefined'

  // Server-side: use Docker service name
  // Client-side: use localhost
  const baseUrl = isServer
    ? process.env.API_URL || 'http://api:8000'
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  return new ApiClient({
    BASE: baseUrl,
    HEADERS: {
      ...(session && {
        Authorization: `Bearer ${session.accessToken}`
      })
    }
  })
}
