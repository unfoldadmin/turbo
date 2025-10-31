import { ApiError } from '@frontend/types/api'
import type { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getApiClient } from './api'

function decodeToken(token: string): {
  token_type: string
  exp: number
  iat: number
  jti: string
  user_id: number
} {
  return JSON.parse(atob(token.split('.')[1]))
}

const authOptions: AuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days (matches refresh token lifetime)
  },
  pages: {
    signIn: '/login'
  },
  callbacks: {
    session: async ({ session, token }) => {
      const access = decodeToken(token.access)
      const refresh = decodeToken(token.refresh)

      if (Date.now() / 1000 > access.exp && Date.now() / 1000 > refresh.exp) {
        return Promise.reject({
          error: new Error('Refresh token expired')
        })
      }

      session.user = {
        id: access.user_id,
        username: token.username
      }

      session.refreshToken = token.refresh
      session.accessToken = token.access

      return session
    },
    jwt: async ({ token, user }) => {
      if (user?.username) {
        return { ...token, ...user }
      }

      // Refresh token only if access token is expired (with 5 min buffer)
      const accessToken = decodeToken(token.access)
      const nowSeconds = Date.now() / 1000
      const bufferSeconds = 5 * 60 // 5 minutes before expiry

      if (nowSeconds > accessToken.exp - bufferSeconds) {
        try {
          const apiClient = await getApiClient()
          const res = await apiClient.auth.authRefreshCreate({
            refresh: token.refresh
          })

          token.access = res.access
          // Update refresh token if it was rotated
          if (res.refresh) {
            token.refresh = res.refresh
          }
        } catch (error) {
          console.error('NextAuth: Token refresh failed', error)
          // Return the token as-is to let the session callback handle expiry
          return token
        }
      }

      return token
    }
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: {
          label: 'Email',
          type: 'text'
        },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (credentials === undefined) {
          console.log('NextAuth: credentials undefined')
          return null
        }

        try {
          console.log('NextAuth: calling auth token API')
          const apiClient = await getApiClient()
          const res = await apiClient.auth.authTokenCreate({
            username: credentials.username,
            password: credentials.password
          })

          console.log('NextAuth: got tokens from API', {
            hasAccess: !!res.access,
            hasRefresh: !!res.refresh
          })

          const decoded = decodeToken(res.access)
          console.log('NextAuth: decoded token', { userId: decoded.user_id })

          const result = {
            id: String(decoded.user_id),
            username: credentials.username,
            access: res.access,
            refresh: res.refresh
          }

          console.log('NextAuth: returning user object', {
            id: result.id,
            username: result.username
          })
          return result
        } catch (error) {
          console.error('NextAuth: auth error', error)
          if (error instanceof ApiError) {
            console.error('NextAuth: API error', error.status, error.body)
            return null
          }
          console.error('NextAuth: unknown error', error)
        }

        return null
      }
    })
  ]
}

export { authOptions }
