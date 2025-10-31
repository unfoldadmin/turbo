'use client'

import { loginFormSchema } from '@/lib/validation'
import { Button } from '@frontend/ui/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@frontend/ui/components/ui/card'
import { Input } from '@frontend/ui/components/ui/input'
import { Label } from '@frontend/ui/components/ui/label'
import { ErrorMessage } from '@frontend/ui/messages/error-message'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plane } from 'lucide-react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'

type LoginFormSchema = z.infer<typeof loginFormSchema>

export function LoginForm() {
  const search = useSearchParams()

  const { register, handleSubmit, formState } = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema)
  })

  const onSubmitHandler = handleSubmit((data) => {
    signIn('credentials', {
      username: data.username,
      password: data.password,
      callbackUrl: '/'
    })
  })

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Plane className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-card-foreground">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to access your flight operations dashboard
          </CardDescription>
        </CardHeader>

        {search.has('error') && search.get('error') === 'CredentialsSignin' && (
          <div className="px-6">
            <ErrorMessage>Provided account does not exist.</ErrorMessage>
          </div>
        )}

        <form onSubmit={onSubmitHandler}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-card-foreground">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Email address or username"
                {...register('username')}
                className="bg-background border-border text-foreground"
              />
              {formState.errors.username && (
                <p className="text-sm text-destructive">
                  {formState.errors.username.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-card-foreground">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register('password')}
                className="bg-background border-border text-foreground"
              />
              {formState.errors.password && (
                <p className="text-sm text-destructive">
                  {formState.errors.password.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-6">
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Sign In
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Quick Dev Login
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() =>
                  signIn('credentials', {
                    username: 'admin',
                    password: 'admin',
                    callbackUrl: '/'
                  })
                }
              >
                Log in as Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() =>
                  signIn('credentials', {
                    username: 'user',
                    password: 'user',
                    callbackUrl: '/'
                  })
                }
              >
                Log in as User
              </Button>
            </div>

            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
