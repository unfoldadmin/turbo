import { z } from 'zod'

const loginFormSchema = z.object({
  username: z
    .string({ required_error: 'Username is required' })
    .min(6, { message: 'Username must be at least 6 characters' }),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters' })
})

const registerFormSchema = z
  .object({
    username: z
      .string({ required_error: 'Username is required' })
      .min(6, { message: 'Username must be at least 6 characters' }),
    email: z
      .string({ required_error: 'Email is required' })
      .email({ message: 'Invalid email address' }),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, { message: 'Password must be at least 6 characters' }),
    passwordRetype: z
      .string({ required_error: 'Please retype your password' })
      .min(6, { message: 'Password must be at least 6 characters' })
  })
  .refine((data) => data.password === data.passwordRetype, {
    message: 'Passwords are not matching',
    path: ['passwordRetype']
  })

const profileFormSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional()
})

const deleteAccountFormSchema = z
  .object({
    username: z
      .string({ required_error: 'Username is required' })
      .min(6, { message: 'Username must be at least 6 characters' }),
    usernameCurrent: z.string().min(6).optional()
  })
  .passthrough()
  .refine((data) => data.username === data.usernameCurrent, {
    message: 'Username is not matching',
    path: ['username']
  })

const changePasswordFormSchema = z
  .object({
    password: z
      .string({ required_error: 'Current password is required' })
      .min(8, { message: 'Current password must be at least 8 characters' }),
    passwordNew: z
      .string({ required_error: 'New password is required' })
      .min(8, { message: 'New password must be at least 8 characters' }),
    passwordRetype: z
      .string({ required_error: 'Please retype your password' })
      .min(8, { message: 'Password must be at least 8 characters' })
  })
  .refine((data) => data.passwordNew !== data.password, {
    message: 'Both new and current passwords are same',
    path: ['passwordNew']
  })
  .refine((data) => data.passwordNew === data.passwordRetype, {
    message: 'Passwords are not matching',
    path: ['passwordRetype']
  })

export {
  changePasswordFormSchema,
  deleteAccountFormSchema,
  loginFormSchema,
  profileFormSchema,
  registerFormSchema
}
