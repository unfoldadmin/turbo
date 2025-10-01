import type { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { ApiService } from './api-client'

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
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login'
  },
  callbacks: {
    session: async ({ session, token }) => {
      // 检查 token 是否有必要的字段
      if (!token.access || !token.refresh) {
        return session
      }

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
    jwt: async ({ token, user, trigger }) => {
      // 首次登录时，user 对象包含从 authorize 返回的数据
      if (user) {
        token.username = user.username
        token.access = (user as any).access
        token.refresh = (user as any).refresh
        return token
      }

      // 后续请求时，检查 access token 是否过期并刷新
      if (token.access && token.refresh) {
        const decoded = decodeToken(token.access)

        // 如果 access token 过期，尝试刷新
        if (Date.now() / 1000 > decoded.exp) {
          try {
            const res = await ApiService.refreshToken(token.refresh)
            token.access = res.access
          } catch (error) {
            // 刷新失败，返回原 token（session callback 会处理过期）
            console.error('Failed to refresh token:', error)
          }
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
          return null
        }

        try {
          const res = await ApiService.login({
            username: credentials.username,
            password: credentials.password
          })

          return {
            id: decodeToken(res.access).user_id,
            username: credentials.username,
            access: res.access,
            refresh: res.refresh
          }
        } catch (error) {
          return null
        }
      }
    })
  ]
}

export { authOptions }
