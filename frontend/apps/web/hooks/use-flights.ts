'use client'

import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'
import {
  type Flight,
  apiFlightToComponentFlight,
  componentFlightToApiRequest
} from '../components/flight-operations/types'
import { getApiClient } from '../lib/api'

export function useFlights(params?: {
  today?: boolean
  startDate?: string
  endDate?: string
}) {
  const { data: session } = useSession()
  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchFlights = useCallback(async () => {
    if (!session) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const client = await getApiClient(session)

      // Build query params for date filtering
      const queryParams: Record<string, string> = {}

      if (params?.startDate || params?.endDate) {
        if (params.startDate) queryParams.start_date = params.startDate
        if (params.endDate) queryParams.end_date = params.endDate
      }
      // If no params, don't add any date filtering - will return all flights

      // Use the raw HTTP request to support custom date filtering
      const response = await (client.flights as any).httpRequest.request({
        method: 'GET',
        url: '/api/flights/',
        query: Object.keys(queryParams).length > 0 ? queryParams : undefined
      })
      const convertedFlights = (response.results || []).map(
        apiFlightToComponentFlight
      )
      setFlights(convertedFlights)
    } catch (err) {
      console.error('Failed to fetch flights:', err)
      setError(
        err instanceof Error ? err : new Error('Failed to fetch flights')
      )
    } finally {
      setLoading(false)
    }
  }, [session, params?.startDate, params?.endDate])

  useEffect(() => {
    if (session) {
      fetchFlights()
    } else {
      setLoading(false)
    }
  }, [session, fetchFlights])

  const createFlight = useCallback(
    async (flight: Partial<Flight>) => {
      const client = await getApiClient(session)
      const requestData = componentFlightToApiRequest(flight)
      const apiFlight = await client.flights.flightsCreate(requestData)
      const newFlight = apiFlightToComponentFlight(apiFlight)
      setFlights((prev) => [...prev, newFlight])
      return newFlight
    },
    [session]
  )

  const updateFlight = useCallback(
    async (id: string, updates: Partial<Flight>) => {
      console.log('useFlights.updateFlight called', { id, updates })
      const client = await getApiClient(session)
      const requestData = componentFlightToApiRequest(updates)
      console.log('API request data:', requestData)
      const apiFlight = await client.flights.flightsPartialUpdate(
        Number(id),
        requestData
      )
      console.log('API response:', apiFlight)
      const updatedFlight = apiFlightToComponentFlight(apiFlight)
      setFlights((prev) => prev.map((f) => (f.id === id ? updatedFlight : f)))
      return updatedFlight
    },
    [session]
  )

  const deleteFlight = useCallback(
    async (id: string) => {
      const client = await getApiClient(session)
      await client.flights.flightsDestroy(Number(id))
      setFlights((prev) => prev.filter((f) => f.id !== id))
    },
    [session]
  )

  const refetch = useCallback(() => {
    fetchFlights()
  }, [fetchFlights])

  return {
    flights,
    loading,
    error,
    createFlight,
    updateFlight,
    deleteFlight,
    refetch
  }
}
