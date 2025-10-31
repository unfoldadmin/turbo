'use client'

import type { TankLevelReading } from '@frontend/types/api'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'
import { getApiClient } from '../lib/api'

export function useTankReadings() {
  const { data: session } = useSession()
  const [readings, setReadings] = useState<TankLevelReading[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchReadings = useCallback(async () => {
    if (!session) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const client = await getApiClient(session)

      const response = await client.tankReadings.tankReadingsList()
      setReadings(response.results || [])
    } catch (err) {
      console.error('Failed to fetch tank readings:', err)
      setError(
        err instanceof Error ? err : new Error('Failed to fetch tank readings')
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session) {
      fetchReadings()
    } else {
      setLoading(false)
    }
  }, [session, fetchReadings])

  const createReading = useCallback(
    async (tankId: string, levelInches: number) => {
      const client = await getApiClient(session)
      // Note: The API expects level_gallons but we're storing inches
      // This will need backend adjustment to accept inches or convert
      const newReading = await client.tankReadings.tankReadingsCreate({
        tank_id: tankId,
        level: levelInches.toString()
      })
      setReadings((prev) => [newReading, ...prev])
      return newReading
    },
    [session]
  )

  const refetch = useCallback(() => {
    fetchReadings()
  }, [fetchReadings])

  return {
    readings,
    loading,
    error,
    createReading,
    refetch
  }
}
