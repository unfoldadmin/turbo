import { registerAction } from '@/actions/registerAction'
import RegisterForm from '@/components/forms/RegisterForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register - Turbo'
}

const Register = () => {
  return <RegisterForm onSubmitHandler={registerAction} />
}

export default Register
