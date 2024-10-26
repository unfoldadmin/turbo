import { deleteAccountAction } from '@/actions/deleteAccountAction'
import DeleteAccountForm from '@/components/forms/DeleteAccountForm'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Delete account - Turbo'
}

const DeleteAccount = async () => {
  return <DeleteAccountForm onSubmitHandler={deleteAccountAction} />
}

export default DeleteAccount
