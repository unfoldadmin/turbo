import { RegisterForm } from '@/components/forms/register-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register - Turbo'
}

export default function Register() {
  return <RegisterForm />
}
