import type { Session } from 'next-auth'
import { getApiClient } from './api'

/**
 * FBO API Client utilities
 * Provides typed functions for all FBO Manager endpoints
 */

export async function getFuelTanks(session: Session | null) {
  const client = await getApiClient(session)
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/tanks/`,
    {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`
      }
    }
  )
  if (!response.ok) throw new Error('Failed to fetch fuel tanks')
  return response.json()
}

export async function getTankReadings(
  tankId: string,
  days = 7,
  session: Session | null
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/tanks/${tankId}/readings/?days=${days}`,
    {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`
      }
    }
  )
  if (!response.ok) throw new Error('Failed to fetch tank readings')
  return response.json()
}

export async function getFlights(params: {
  today?: boolean
  start_date?: string
  end_date?: string
  session: Session | null
}) {
  const { session, ...queryParams } = params
  const query = new URLSearchParams()
  if (queryParams.today) query.append('today', 'true')
  if (queryParams.start_date) query.append('start_date', queryParams.start_date)
  if (queryParams.end_date) query.append('end_date', queryParams.end_date)

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/flights/?${query}`,
    {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`
      }
    }
  )
  if (!response.ok) throw new Error('Failed to fetch flights')
  return response.json()
}

export async function getFuelTransactions(params: {
  unassigned?: boolean
  progress?: string
  session: Session | null
}) {
  const { session, ...queryParams } = params
  const query = new URLSearchParams()
  if (queryParams.unassigned) query.append('unassigned', 'true')
  if (queryParams.progress) query.append('progress', queryParams.progress)

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/transactions/?${query}`,
    {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`
      }
    }
  )
  if (!response.ok) throw new Error('Failed to fetch fuel transactions')
  return response.json()
}

export async function assignFuelerToTransaction(
  transactionId: number,
  fuelerId: number,
  session: Session | null
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/transactions/${transactionId}/assign_fueler/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.accessToken}`
      },
      body: JSON.stringify({ fueler_id: fuelerId })
    }
  )
  if (!response.ok) throw new Error('Failed to assign fueler')
  return response.json()
}

export async function updateTransactionProgress(
  transactionId: number,
  progress: string,
  session: Session | null
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/transactions/${transactionId}/update_progress/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.accessToken}`
      },
      body: JSON.stringify({ progress })
    }
  )
  if (!response.ok) throw new Error('Failed to update transaction progress')
  return response.json()
}

export async function getFuelers(session: Session | null) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/fuelers/`,
    {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`
      }
    }
  )
  if (!response.ok) throw new Error('Failed to fetch fuelers')
  return response.json()
}

export async function getFuelerCertifications(
  fuelerId: number,
  session: Session | null
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/fuelers/${fuelerId}/certifications/`,
    {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`
      }
    }
  )
  if (!response.ok) throw new Error('Failed to fetch certifications')
  return response.json()
}

export async function getTrainings(session: Session | null) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/trainings/`,
    {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`
      }
    }
  )
  if (!response.ok) throw new Error('Failed to fetch trainings')
  return response.json()
}

export async function getCertifications(params: {
  status?: 'expired' | 'expiring_soon' | 'valid'
  days?: number
  session: Session | null
}) {
  const { session, ...queryParams } = params
  const query = new URLSearchParams()
  if (queryParams.status) query.append('status', queryParams.status)
  if (queryParams.days) query.append('days', queryParams.days.toString())

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/fueler-certifications/?${query}`,
    {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`
      }
    }
  )
  if (!response.ok) throw new Error('Failed to fetch certifications')
  return response.json()
}
