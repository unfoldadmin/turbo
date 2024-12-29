import { registerAction } from '@/actions/register-action'
import RegisterForm from '@/components/forms/register-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register - Turbo'
}

const Register = () => {
  return <RegisterForm onSubmitHandler={registerAction} />
}

export default Register
