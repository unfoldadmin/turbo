import { profileAction } from '@/actions/profileAction'
import ProfileForm from '@/components/forms/ProfileForm'
import { getApiClient } from '@/lib/api'
import { authOptions } from '@/lib/auth'
import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'

export const metadata: Metadata = {
  title: 'Profile - Turbo'
}

const Profile = async () => {
  const session = await getServerSession(authOptions)
  const apiClient = await getApiClient(session)

  return (
    <ProfileForm
      currentUser={apiClient.users.usersMeRetrieve()}
      onSubmitHandler={profileAction}
    />
  )
}

export default Profile
