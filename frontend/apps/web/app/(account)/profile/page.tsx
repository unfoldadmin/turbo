import { ProfileForm } from '@/components/forms/profile-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Profile - Turbo'
}

export default function Profile() {
  return <ProfileForm />
}
