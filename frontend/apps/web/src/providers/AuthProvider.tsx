'use client'

import { SessionProvider } from 'next-auth/react'
import { PropsWithChildren } from 'react'

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  return <SessionProvider>{children}</SessionProvider>
}
