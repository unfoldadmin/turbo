'use client'

import type {
  DeleteAccountFormSchema,
  deleteAccountAction
} from '@/actions/delete-account-action'
import { deleteAccountFormSchema } from '@/lib/validation'
import { FormHeader } from '@frontend/ui/forms/form-header'
import { SubmitField } from '@frontend/ui/forms/submit-field'
import { TextField } from '@frontend/ui/forms/text-field'
import { ErrorMessage } from '@frontend/ui/messages/error-message'
import { zodResolver } from '@hookform/resolvers/zod'
import { signOut, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

export function DeleteAccountForm({
  onSubmitHandler
}: {
  onSubmitHandler: typeof deleteAccountAction
}) {
  const session = useSession()
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    content: string | string[]
  } | null>(null)

  const { formState, handleSubmit, register, reset, setValue } =
    useForm<DeleteAccountFormSchema>({
      resolver: zodResolver(deleteAccountFormSchema),
      defaultValues: {
        username: '',
        usernameCurrent: ''
      }
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
        method="post"
        noValidate
        onSubmit={handleSubmit(async (data) => {
          setMessage(null)

          const res = await onSubmitHandler(data)

          if (res === true) {
            reset()
            signOut()
          } else if (res && typeof res === 'object') {
            const errors: string[] = []
            for (const [field, messages] of Object.entries(res)) {
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
        })}
      >
        <TextField
          type="text"
          register={register('username')}
          label="Username"
          formState={formState}
          autoComplete="off"
        />

        <SubmitField>Delete account</SubmitField>
      </form>
    </>
  )
}
