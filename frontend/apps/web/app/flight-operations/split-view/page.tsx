'use client'

import { FlightBoard } from '@/components/flight-operations/flight-board'
import type {
  Flight,
  FlightFilters
} from '@/components/flight-operations/types'
import { useFlights } from '@/hooks/use-flights'
import { useState } from 'react'

export default function SplitViewPage() {
  const { flights, loading, error, createFlight, updateFlight, deleteFlight } =
    useFlights({ today: true })
  const [filters, setFilters] = useState<FlightFilters>({
    search: '',
    status: 'all',
    dateRange: 'today',
    services: []
  })

  const handleEditFlight = async (flight: Flight) => {
    try {
      await updateFlight(flight.id, flight)
    } catch (err) {
      console.error('Failed to update flight:', err)
    }
  }

  const handleDeleteFlight = async (id: string) => {
    try {
      await deleteFlight(id)
    } catch (err) {
      console.error('Failed to delete flight:', err)
    }
  }

  const handleAddFlight = async (flight: Flight) => {
    try {
      await createFlight(flight)
    } catch (err) {
      console.error('Failed to create flight:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">Loading...</div>
    )
  }

  if (error) {
    return <div className="text-red-600">Error: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Flight Operations - Split View</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Arrivals and Departures side by side
        </p>
      </div>

      <FlightBoard
        mode="split"
        theme="light"
        flights={flights}
        onAddFlight={handleAddFlight}
        onEditFlight={handleEditFlight}
        onDeleteFlight={handleDeleteFlight}
        filters={filters}
      />
    </div>
  )
}
