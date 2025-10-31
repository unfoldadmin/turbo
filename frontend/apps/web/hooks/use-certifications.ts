'use client'

import type { FuelerTraining, FuelerTrainingRequest } from '@frontend/types/api'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'
import { getApiClient } from '../lib/api'

export function useCertifications() {
  const { data: session } = useSession()
  const [certifications, setCertifications] = useState<FuelerTraining[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCertifications = useCallback(async () => {
    if (!session) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const client = await getApiClient(session)

      const response =
        await client.fuelerCertifications.fuelerCertificationsList()
      setCertifications(response.results || [])
    } catch (err) {
      console.error('Failed to fetch certifications:', err)
      setError(
        err instanceof Error ? err : new Error('Failed to fetch certifications')
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session) {
      fetchCertifications()
    } else {
      setLoading(false)
    }
  }, [session, fetchCertifications])

  const createCertification = useCallback(
    async (certification: FuelerTrainingRequest) => {
      const client = await getApiClient(session)
      const newCertification =
        await client.fuelerCertifications.fuelerCertificationsCreate(
          certification
        )
      setCertifications((prev) => [newCertification, ...prev])
      return newCertification
    },
    [session]
  )

  const updateCertification = useCallback(
    async (id: number, updates: FuelerTrainingRequest) => {
      const client = await getApiClient(session)
      const updatedCertification =
        await client.fuelerCertifications.fuelerCertificationsPartialUpdate(
          id,
          updates
        )
      setCertifications((prev) =>
        prev.map((c) => (c.id === id ? updatedCertification : c))
      )
      return updatedCertification
    },
    [session]
  )

  const deleteCertification = useCallback(
    async (id: number) => {
      const client = await getApiClient(session)
      await client.fuelerCertifications.fuelerCertificationsDestroy(id)
      setCertifications((prev) => prev.filter((c) => c.id !== id))
    },
    [session]
  )

  const refetch = useCallback(() => {
    fetchCertifications()
  }, [fetchCertifications])

  return {
    certifications,
    loading,
    error,
    createCertification,
    updateCertification,
    deleteCertification,
    refetch
  }
}
