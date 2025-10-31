'use client'

import { CalendarWeekView } from '@/components/flight-operations/calendar-week-view'
import { CompactToolbar } from '@/components/flight-operations/compact-toolbar'
import { FlightBoard } from '@/components/flight-operations/flight-board'
import { FlightFormDialog } from '@/components/flight-operations/flight-form-dialog'
import type {
  Flight,
  FlightFilters
} from '@/components/flight-operations/types'
import { useTheme } from '@/components/navigation-wrapper'
import { useFlights } from '@/hooks/use-flights'
import { ErrorMessage } from '@frontend/ui/messages/error-message'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function FlightOperationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [view, setView] = useState<
    'split' | 'calendar' | 'arrivals' | 'departures'
  >('split')

  // Calculate date range based on view
  const dateParams =
    view === 'calendar'
      ? (() => {
          const today = new Date()
          const startDate = new Date(today)
          startDate.setDate(today.getDate() - 14) // 2 weeks back
          const endDate = new Date(today)
          endDate.setDate(today.getDate() + 14) // 2 weeks forward
          return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
          }
        })()
      : undefined // Don't filter by date for split view - show all flights

  const { flights, loading, error, createFlight, updateFlight, deleteFlight } =
    useFlights(dateParams)
  const { theme } = useTheme()
  const [filters, setFilters] = useState<FlightFilters>({
    search: '',
    status: 'all',
    dateRange: 'today',
    services: []
  })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Load view preference from localStorage on mount
  useEffect(() => {
    const savedView = localStorage.getItem('flightViewPreference')
    if (
      savedView === 'split' ||
      savedView === 'calendar' ||
      savedView === 'arrivals' ||
      savedView === 'departures'
    ) {
      setView(savedView as 'split' | 'calendar' | 'arrivals' | 'departures')
    }
  }, [])

  // Save view preference to localStorage when it changes
  const handleViewChange = (newView: string) => {
    const validView = newView as
      | 'split'
      | 'calendar'
      | 'arrivals'
      | 'departures'
    setView(validView)
    localStorage.setItem('flightViewPreference', validView)
  }

  const handleAddFlight = async (flight: Flight) => {
    try {
      await createFlight(flight)
    } catch (err) {
      console.error('Failed to create flight:', err)
    }
  }

  const handleEditFlight = async (flight: Flight) => {
    console.log('handleEditFlight called with:', flight)
    try {
      console.log('Calling updateFlight API with id:', flight.id)
      const result = await updateFlight(flight.id, flight)
      console.log('Update result:', result)
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

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (status === 'unauthenticated') {
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-muted-foreground">Loading flights...</div>
      </div>
    )
  }

  if (error) {
    return <ErrorMessage>{error.message}</ErrorMessage>
  }

  return (
    <div className="space-y-4">
      <CompactToolbar
        view={view}
        theme={theme}
        onViewChange={handleViewChange}
        onThemeChange={() => {}}
        filters={filters}
        onFiltersChange={setFilters}
        onAddFlight={() => setIsAddDialogOpen(true)}
      />

      {view === 'split' && (
        <FlightBoard
          mode="split"
          theme={theme}
          flights={flights}
          onAddFlight={handleAddFlight}
          onEditFlight={handleEditFlight}
          onDeleteFlight={handleDeleteFlight}
          filters={filters}
        />
      )}
      {view === 'arrivals' && (
        <FlightBoard
          mode="arrivals"
          theme={theme}
          flights={flights}
          onAddFlight={handleAddFlight}
          onEditFlight={handleEditFlight}
          onDeleteFlight={handleDeleteFlight}
          filters={filters}
        />
      )}
      {view === 'departures' && (
        <FlightBoard
          mode="departures"
          theme={theme}
          flights={flights}
          onAddFlight={handleAddFlight}
          onEditFlight={handleEditFlight}
          onDeleteFlight={handleDeleteFlight}
          filters={filters}
        />
      )}
      {view === 'calendar' && (
        <CalendarWeekView
          theme={theme}
          flights={flights}
          onEditFlight={handleEditFlight}
          onDeleteFlight={handleDeleteFlight}
          filters={filters}
        />
      )}

      <FlightFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddFlight}
        theme={theme}
      />
    </div>
  )
}
