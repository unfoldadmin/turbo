import { LoginForm } from '@/components/forms/login-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - Turbo'
}

export default function Login() {
  return <LoginForm />
}
