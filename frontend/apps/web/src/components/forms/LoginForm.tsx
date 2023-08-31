'use client'

import { signIn } from 'next-auth/react'
import TextField from '@frontend/ui/forms/TextField'
import SubmitField from '@frontend/ui/forms/SubmitField'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginFormSchema } from '@/lib/validation'
import { useSearchParams } from 'next/navigation'
import FormHeader from '@frontend/ui/forms/FormHeader'
import FormFooter from '@frontend/ui/forms/FormFooter'
import ErrorMessage from '@frontend/ui/messages/ErrorMessage'

type LoginFormSchema = z.infer<typeof loginFormSchema>

const LoginForm: React.FC = () => {
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
    <>
      <FormHeader
        title="Welcome back to Turbo"
        description="Get an access to internal application"
      />

      {search.has('error') && search.get('error') === 'CredentialsSignin' && (
        <ErrorMessage>Provided account does not exists.</ErrorMessage>
      )}

      <form
        method="post"
        action="/api/auth/callback/credentials"
        onSubmit={onSubmitHandler}
      >
        <TextField
          type="text"
          register={register('username')}
          formState={formState}
          label="Username"
          placeholder="Email address or username"
        />

        <TextField
          type="password"
          register={register('password', { required: true })}
          formState={formState}
          label="Password"
          placeholder="Enter your password"
        />

        <SubmitField>Sign in</SubmitField>
      </form>

      <FormFooter
        cta="Don't have an account?"
        link="/register"
        title="Sign up"
      />
    </>
  )
}

export default LoginForm
