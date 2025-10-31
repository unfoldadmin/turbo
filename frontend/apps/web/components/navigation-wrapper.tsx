'use client'

import { usePathname } from 'next/navigation'
import { createContext, useContext, useEffect, useState } from 'react'
import { Navigation } from './navigation'

const ThemeContext = createContext<{
  theme: 'dark' | 'light'
  setTheme: (theme: 'dark' | 'light') => void
}>({
  theme: 'dark',
  setTheme: () => {}
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
    setMounted(true)
  }, [])

  // Save theme to localStorage when it changes
  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  // Hide navigation on auth pages
  const isAuthPage =
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/signup') ||
    pathname?.startsWith('/forgot-password')

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleThemeChange }}>
      <main
        className={theme === 'dark' ? 'dark' : ''}
        style={{ visibility: mounted ? 'visible' : 'hidden' }}
      >
        <div className="min-h-screen bg-background">
          {!isAuthPage && (
            <Navigation theme={theme} onThemeChange={handleThemeChange} />
          )}
          <div
            className={
              isAuthPage ? '' : 'mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8'
            }
          >
            {children}
          </div>
        </div>
      </main>
    </ThemeContext.Provider>
  )
}
