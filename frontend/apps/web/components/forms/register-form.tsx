'use client'

import { ApiError } from '@/lib/api-client'
import { useRegister } from '@/lib/hooks/useAuth'
import { registerFormSchema } from '@/lib/validation'
import { FormFooter } from '@frontend/ui/forms/form-footer'
import { FormHeader } from '@frontend/ui/forms/form-header'
import { SubmitField } from '@frontend/ui/forms/submit-field'
import { TextField } from '@frontend/ui/forms/text-field'
import { ErrorMessage } from '@frontend/ui/messages/error-message'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'

export type RegisterFormSchema = z.infer<typeof registerFormSchema>

export function RegisterForm() {
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    content: string | string[]
  } | null>(null)

  const { formState, handleSubmit, register } = useForm<RegisterFormSchema>({
    resolver: zodResolver(registerFormSchema)
  })

  const registerMutation = useRegister()

  return (
    <>
      <FormHeader
        title="Create new account in Turbo"
        description="Get an access to internal application"
      />

      {message?.type === 'error' && (
        <ErrorMessage>
          {Array.isArray(message.content) ? (
            <ul className="list-disc list-inside">
              {message.content.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </ul>
          ) : (
            message.content
          )}
        </ErrorMessage>
      )}

      <form
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit(async (data) => {
          setMessage(null)

          try {
            await registerMutation.mutateAsync({
              username: data.username,
              email: data.email,
              first_name: data.firstName,
              last_name: data.lastName,
              password: data.password,
              password_retype: data.passwordRetype
            })

            // 注册成功后跳转到登录页面
            signIn()
          } catch (error: any) {
            // 处理错误 - fetch API 使用 ApiError
            if (error instanceof ApiError && error.data) {
              const errors: string[] = []
              for (const [field, messages] of Object.entries(error.data)) {
                if (Array.isArray(messages)) {
                  errors.push(...messages)
                } else {
                  errors.push(String(messages))
                }
              }
              setMessage({
                type: 'error',
                content: errors
              })
            }
          }
        })}
      >
        <TextField
          type="text"
          register={register('username')}
          formState={formState}
          label="Username"
          placeholder="Unique username"
          autoComplete="username"
        />

        <TextField
          type="text"
          register={register('email')}
          formState={formState}
          label="Email"
          placeholder="Your email address"
          autoComplete="email"
        />

        <TextField
          type="text"
          register={register('firstName')}
          formState={formState}
          label="First name"
          placeholder="Your first name (optional)"
          autoComplete="given-name"
        />

        <TextField
          type="text"
          register={register('lastName')}
          formState={formState}
          label="Last name"
          placeholder="Your last name (optional)"
          autoComplete="family-name"
        />

        <TextField
          type="password"
          register={register('password')}
          formState={formState}
          label="Password"
          placeholder="Your new password"
          autoComplete="new-password"
        />

        <TextField
          type="password"
          register={register('passwordRetype')}
          formState={formState}
          label="Retype password"
          placeholder="Verify password"
          autoComplete="new-password"
        />

        <SubmitField isLoading={registerMutation.isPending}>
          {registerMutation.isPending ? 'Creating account...' : 'Sign up'}
        </SubmitField>
      </form>

      <FormFooter
        cta="Already have an account?"
        link="/login"
        title="Sign in"
      />
    </>
  )
}
