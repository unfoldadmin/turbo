'use client'

import type { changePasswordAction } from '@/actions/change-password-action'
import { changePasswordFormSchema } from '@/lib/validation'
import { FormHeader } from '@frontend/ui/forms/form-header'
import { SubmitField } from '@frontend/ui/forms/submit-field'
import { TextField } from '@frontend/ui/forms/text-field'
import { ErrorMessage } from '@frontend/ui/messages/error-message'
import { SuccessMessage } from '@frontend/ui/messages/success-message'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'

export type ChangePasswordFormSchema = z.infer<typeof changePasswordFormSchema>

export function ChangePaswordForm({
  onSubmitHandler
}: {
  onSubmitHandler: typeof changePasswordAction
}) {
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    content: string | string[]
  } | null>(null)

  const { formState, handleSubmit, register, reset } =
    useForm<ChangePasswordFormSchema>({
      resolver: zodResolver(changePasswordFormSchema),
      shouldUseNativeValidation: false,
      defaultValues: {
        password: '',
        passwordNew: '',
        passwordRetype: ''
      }
    })

  return (
    <>
      <FormHeader
        title="Set new account password"
        description="Change sign in access password"
      />

      {message?.type === 'success' && (
        <SuccessMessage>{message.content}</SuccessMessage>
      )}

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
        autoComplete="off"
        onSubmit={handleSubmit(async (data) => {
          setMessage(null)

          const res = await onSubmitHandler(data)

          if (res === true) {
            reset()
            setMessage({
              type: 'success',
              content: 'Password has been successfully changed'
            })
          } else if (res && typeof res === 'object') {
            // 收集所有错误消息
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
          type="password"
          register={register('password')}
          label="Current password"
          formState={formState}
          autoComplete="current-password"
        />

        <TextField
          type="password"
          register={register('passwordNew')}
          label="New password"
          formState={formState}
          autoComplete="new-password"
        />

        <TextField
          type="password"
          register={register('passwordRetype')}
          label="Retype password"
          formState={formState}
          autoComplete="new-password"
        />

        <SubmitField isLoading={formState.isSubmitting}>
          Change password
        </SubmitField>
      </form>
    </>
  )
}
