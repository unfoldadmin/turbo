import { deleteAccountAction } from '@/actions/delete-account-action'
import DeleteAccountForm from '@/components/forms/delete-account-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Delete account - Turbo'
}

const DeleteAccount = async () => {
  return <DeleteAccountForm onSubmitHandler={deleteAccountAction} />
}

export default DeleteAccount
