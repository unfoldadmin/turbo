import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: number
    username: string
  }

  interface Session {
    refreshToken: string
    accessToken: string
    user: User
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    username: string
    access: string
    refresh: string
  }
}
