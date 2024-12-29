import LoginForm from '@/components/forms/login-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - Turbo'
}

const Login = async () => {
  return <LoginForm />
}

export default Login
