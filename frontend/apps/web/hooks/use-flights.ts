"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect, useCallback } from "react"
import { getApiClient } from "../lib/api"
import {
  apiFlightToComponentFlight,
  componentFlightToApiRequest,
  type Flight,
} from "../components/flight-operations/types"

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
    if (!session) return

    try {
      setLoading(true)
      setError(null)
      const client = await getApiClient(session)

      const response = await client.flights.flightsList()
      const convertedFlights = (response.results || []).map(apiFlightToComponentFlight)
      setFlights(convertedFlights)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch flights"))
    } finally {
      setLoading(false)
    }
  }, [params?.today, params?.startDate, params?.endDate])

  useEffect(() => {
    if (session) {
      fetchFlights()
    }
  }, [session, fetchFlights])

  const createFlight = useCallback(async (flight: Partial<Flight>) => {
    const client = await getApiClient(session)
    const requestData = componentFlightToApiRequest(flight)
    const apiFlight = await client.flights.flightsCreate(requestData)
    const newFlight = apiFlightToComponentFlight(apiFlight)
    setFlights(prev => [...prev, newFlight])
    return newFlight
  }, [session])

  const updateFlight = useCallback(async (id: string, updates: Partial<Flight>) => {
    console.log("useFlights.updateFlight called", { id, updates })
    const client = await getApiClient(session)
    const requestData = componentFlightToApiRequest(updates)
    console.log("API request data:", requestData)
    const apiFlight = await client.flights.flightsPartialUpdate(Number(id), requestData)
    console.log("API response:", apiFlight)
    const updatedFlight = apiFlightToComponentFlight(apiFlight)
    setFlights(prev => prev.map(f => f.id === id ? updatedFlight : f))
    return updatedFlight
  }, [session])

  const deleteFlight = useCallback(async (id: string) => {
    const client = await getApiClient(session)
    await client.flights.flightsDestroy(Number(id))
    setFlights(prev => prev.filter(f => f.id !== id))
  }, [session])

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
