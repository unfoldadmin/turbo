'use client'

import type {
  DeleteAccountAction,
  DeleteAccountFormSchema
} from '@/actions/deleteAccountAction'
import { deleteAccountFormSchema } from '@/lib/validation'
import FormHeader from '@frontend/ui/forms/FormHeader'
import SubmitField from '@frontend/ui/forms/SubmitField'
import TextField from '@frontend/ui/forms/TextField'
import { zodResolver } from '@hookform/resolvers/zod'
import { signOut, useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

type DeleteAccountProps = {
  onSubmitHandler: DeleteAccountAction
}

const DeleteAccountForm: React.FC<DeleteAccountProps> = ({
  onSubmitHandler
}) => {
  const session = useSession()

  const { formState, handleSubmit, register, reset, setValue } =
    useForm<DeleteAccountFormSchema>({
      resolver: zodResolver(deleteAccountFormSchema)
    })

  useEffect(() => {
    if (session.data?.user.username) {
      setValue('usernameCurrent', session.data?.user.username)
    }
  }, [setValue, session.data?.user.username])

  return (
    <>
      <FormHeader
        title="Delete your account"
        description="After this action all data will be lost"
      />

      <form
        method="post"
        onSubmit={handleSubmit(async (data) => {
          const res = await onSubmitHandler(data)

          if (res) {
            reset()
            signOut()
          }
        })}
      >
        <TextField
          type="text"
          register={register('username')}
          label="Username"
          formState={formState}
        />

        <SubmitField>Delete account</SubmitField>
      </form>
    </>
  )
}

export default DeleteAccountForm
