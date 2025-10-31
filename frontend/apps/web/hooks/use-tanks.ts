'use client'

import type {
  FuelTankRequest,
  FuelTankWithLatestReading
} from '@frontend/types/api'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'
import { getApiClient } from '../lib/api'

export function useTanks() {
  const { data: session } = useSession()
  const [tanks, setTanks] = useState<FuelTankWithLatestReading[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchTanks = useCallback(async () => {
    if (!session) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const client = await getApiClient(session)

      const response = await client.tanks.tanksList()
      setTanks(response.results || [])
    } catch (err) {
      console.error('Failed to fetch tanks:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch tanks'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session) {
      fetchTanks()
    } else {
      setLoading(false)
    }
  }, [session, fetchTanks])

  const createTank = useCallback(
    async (tank: FuelTankRequest) => {
      const client = await getApiClient(session)
      const newTank = await client.tanks.tanksCreate(tank)
      // Refetch to get the tank with latest reading
      await fetchTanks()
      return newTank
    },
    [session, fetchTanks]
  )

  const updateTank = useCallback(
    async (id: number, updates: FuelTankRequest) => {
      const client = await getApiClient(session)
      const updatedTank = await client.tanks.tanksPartialUpdate(id, updates)
      // Refetch to get the tank with latest reading
      await fetchTanks()
      return updatedTank
    },
    [session, fetchTanks]
  )

  const deleteTank = useCallback(
    async (id: number) => {
      const client = await getApiClient(session)
      await client.tanks.tanksDestroy(id)
      setTanks((prev) => prev.filter((t) => t.id !== id))
    },
    [session]
  )

  const refetch = useCallback(() => {
    fetchTanks()
  }, [fetchTanks])

  return {
    tanks,
    loading,
    error,
    createTank,
    updateTank,
    deleteTank,
    refetch
  }
}
