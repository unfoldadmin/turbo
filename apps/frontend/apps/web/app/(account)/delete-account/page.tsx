import { deleteAccountAction } from '@/actions/delete-account-action'
import { DeleteAccountForm } from '@/components/forms/delete-account-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Delete account - Turbo'
}

export default function DeleteAccount() {
  return <DeleteAccountForm onSubmitHandler={deleteAccountAction} />
}
