'use client'

import type { Aircraft, AircraftRequest } from '@frontend/types/api'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'
import { getApiClient } from '../lib/api'

export function useAircraft() {
  const { data: session } = useSession()
  const [aircraft, setAircraft] = useState<Aircraft[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAircraft = useCallback(async () => {
    if (!session) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const client = await getApiClient(session)

      const response = await client.aircraft.aircraftList()
      setAircraft(response.results || [])
    } catch (err) {
      console.error('Failed to fetch aircraft:', err)
      setError(
        err instanceof Error ? err : new Error('Failed to fetch aircraft')
      )
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    if (session) {
      fetchAircraft()
    } else {
      setLoading(false)
    }
  }, [session, fetchAircraft])

  const createAircraft = useCallback(
    async (
      tailNumber: string,
      aircraftTypeDisplay: string,
      aircraftTypeIcao?: string
    ) => {
      const client = await getApiClient(session)
      const newAircraft = await client.aircraft.aircraftCreate({
        tail_number: tailNumber,
        aircraft_type_display: aircraftTypeDisplay,
        aircraft_type_icao: aircraftTypeIcao || 'UNKN',
        airline_icao: '',
        fleet_id: ''
      })
      setAircraft((prev) => [...prev, newAircraft])
      return newAircraft
    },
    [session]
  )

  const updateAircraft = useCallback(
    async (
      tailNumber: string,
      aircraftTypeDisplay: string,
      aircraftTypeIcao?: string
    ) => {
      const client = await getApiClient(session)
      const updatedAircraft = await client.aircraft.aircraftPartialUpdate(
        tailNumber,
        {
          tail_number: tailNumber,
          aircraft_type_display: aircraftTypeDisplay,
          aircraft_type_icao: aircraftTypeIcao,
          airline_icao: '',
          fleet_id: ''
        }
      )
      setAircraft((prev) =>
        prev.map((a) => (a.tail_number === tailNumber ? updatedAircraft : a))
      )
      return updatedAircraft
    },
    [session]
  )

  const deleteAircraft = useCallback(
    async (tailNumber: string) => {
      const client = await getApiClient(session)
      await client.aircraft.aircraftDestroy(tailNumber)
      setAircraft((prev) => prev.filter((a) => a.tail_number !== tailNumber))
    },
    [session]
  )

  const findByTailNumber = useCallback(
    (tailNumber: string) => {
      return aircraft.find(
        (a) => a.tail_number.toLowerCase() === tailNumber.toLowerCase()
      )
    },
    [aircraft]
  )

  const refetch = useCallback(() => {
    fetchAircraft()
  }, [fetchAircraft])

  return {
    aircraft,
    loading,
    error,
    createAircraft,
    updateAircraft,
    deleteAircraft,
    findByTailNumber,
    refetch
  }
}
