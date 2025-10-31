'use client'

import { Button } from '@frontend/ui/components/ui/button'
import { Moon, Sun } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Flight Ops', href: '/' },
  { name: 'Fuel Dispatch', href: '/dispatch' },
  { name: 'Fuel Farm', href: '/fuel-farm' },
  { name: 'Equipment', href: '/equipment' },
  { name: 'Line Schedule', href: '/line-schedule' },
  { name: 'Training', href: '/training' }
]

interface NavigationProps {
  theme?: 'dark' | 'light'
  onThemeChange?: (theme: 'dark' | 'light') => void
}

export function Navigation({ theme = 'dark', onThemeChange }: NavigationProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <nav className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-12 items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-lg font-bold text-foreground">
              FBO Manager
            </Link>
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>
          <div className="flex items-center space-x-3">
            {onThemeChange && (
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  onThemeChange(theme === 'dark' ? 'light' : 'dark')
                }
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-yellow-400" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => signOut()}
              className="text-foreground"
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
