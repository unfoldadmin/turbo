'use client'

import { useState, createContext, useContext } from 'react'
import { usePathname } from 'next/navigation'
import { Navigation } from './navigation'

const ThemeContext = createContext<{
  theme: 'dark' | 'light'
  setTheme: (theme: 'dark' | 'light') => void
}>({
  theme: 'dark',
  setTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const pathname = usePathname()

  // Hide navigation on auth pages
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/signup') || pathname?.startsWith('/forgot-password')

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <main className={theme === 'dark' ? 'dark' : ''}>
        <div className="min-h-screen bg-background">
          {!isAuthPage && <Navigation theme={theme} onThemeChange={setTheme} />}
          <div className={isAuthPage ? '' : 'mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8'}>
            {children}
          </div>
        </div>
      </main>
    </ThemeContext.Provider>
  )
}
