'use client'

import type { Equipment } from '@frontend/types/api'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'
import { getApiClient } from '../lib/api'

export function useEquipment() {
  const { data: session } = useSession()
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchEquipment = useCallback(async () => {
    if (!session) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const client = await getApiClient(session)

      // Note: Adjust this endpoint based on actual API
      const response = await client.admin.equipmentList()
      setEquipment(response.results || [])
    } catch (err) {
      console.error('Failed to fetch equipment:', err)
      setError(
        err instanceof Error ? err : new Error('Failed to fetch equipment')
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session) {
      fetchEquipment()
    } else {
      setLoading(false)
    }
  }, [session, fetchEquipment])

  const createEquipment = useCallback(
    async (equipmentData: any) => {
      const client = await getApiClient(session)
      const newEquipment = await client.admin.equipmentCreate(equipmentData)
      setEquipment((prev) => [...prev, newEquipment])
      return newEquipment
    },
    [session]
  )

  const updateEquipment = useCallback(
    async (id: number, updates: any) => {
      const client = await getApiClient(session)
      const updatedEquipment = await client.admin.equipmentPartialUpdate(
        id,
        updates
      )
      setEquipment((prev) =>
        prev.map((e) => (e.id === id ? updatedEquipment : e))
      )
      return updatedEquipment
    },
    [session]
  )

  const deleteEquipment = useCallback(
    async (id: number) => {
      const client = await getApiClient(session)
      await client.admin.equipmentDestroy(id)
      setEquipment((prev) => prev.filter((e) => e.id !== id))
    },
    [session]
  )

  const refetch = useCallback(() => {
    fetchEquipment()
  }, [fetchEquipment])

  return {
    equipment,
    loading,
    error,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    refetch
  }
}
