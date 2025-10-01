'use client'

import { ApiError } from '@/lib/api-client'
import { useCurrentUser, usePartialUpdateUser } from '@/lib/hooks/useAuth'
import { profileFormSchema } from '@/lib/validation'
import { FormHeader } from '@frontend/ui/forms/form-header'
import { SubmitField } from '@frontend/ui/forms/submit-field'
import { TextField } from '@frontend/ui/forms/text-field'
import { ErrorMessage } from '@frontend/ui/messages/error-message'
import { SuccessMessage } from '@frontend/ui/messages/success-message'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'

export type ProfileFormSchema = z.infer<typeof profileFormSchema>

export function ProfileForm() {
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    content: string | string[]
  } | null>(null)
  const { data: currentUser, isLoading: userLoading } = useCurrentUser()
  const updateUserMutation = usePartialUpdateUser()

  const { formState, handleSubmit, register, reset } =
    useForm<ProfileFormSchema>({
      resolver: zodResolver(profileFormSchema),
      defaultValues: {
        firstName: currentUser?.first_name || '',
        lastName: currentUser?.last_name || ''
      }
    })

  // 当用户数据加载完成后，重置表单
  React.useEffect(() => {
    if (currentUser) {
      reset({
        firstName: currentUser.first_name || '',
        lastName: currentUser.last_name || ''
      })
    }
  }, [currentUser, reset])

  if (userLoading) {
    return <div>Loading...</div>
  }

  return (
    <>
      <FormHeader
        title="Update you profile information"
        description="Change your account data"
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
        noValidate
        onSubmit={handleSubmit(async (data) => {
          setMessage(null)

          try {
            await updateUserMutation.mutateAsync({
              first_name: data.firstName,
              last_name: data.lastName
            })

            setMessage({
              type: 'success',
              content: 'Profile has been succesfully updated'
            })
          } catch (error: any) {
            if (error instanceof ApiError && error.data) {
              const errors: string[] = []
              for (const [field, messages] of Object.entries(error.data)) {
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
          }
        })}
      >
        <TextField
          type="text"
          register={register('firstName')}
          label="First name"
          formState={formState}
          autoComplete="given-name"
        />

        <TextField
          type="text"
          register={register('lastName')}
          label="Last name"
          formState={formState}
          autoComplete="family-name"
        />

        <SubmitField disabled={updateUserMutation.isPending}>
          {updateUserMutation.isPending ? 'Updating...' : 'Update profile'}
        </SubmitField>
      </form>
    </>
  )
}
