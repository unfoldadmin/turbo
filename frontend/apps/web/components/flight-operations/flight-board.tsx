"use client"

import { useMemo } from "react"
import { FlightList } from "./flight-list"
import type { Flight, FlightFilters as FilterType } from "./types"

interface FlightBoardProps {
  mode: "split" | "arrivals" | "departures"
  theme: "dark" | "light"
  flights: Flight[]
  onAddFlight: (flight: Flight) => void
  onEditFlight: (flight: Flight) => void
  onDeleteFlight: (id: string) => void
  filters: FilterType
}

export function FlightBoard({ mode, theme, flights, onEditFlight, onDeleteFlight, filters }: FlightBoardProps) {
  const filteredFlights = useMemo(() => {
    return flights.filter((flight) => {
      // Filter by search
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          flight.tailNumber.toLowerCase().includes(searchLower) ||
          flight.aircraftType.toLowerCase().includes(searchLower) ||
          flight.origin?.toLowerCase().includes(searchLower) ||
          flight.destination?.toLowerCase().includes(searchLower) ||
          flight.pilot?.toLowerCase().includes(searchLower)

        if (!matchesSearch) return false
      }

      // Filter by status
      if (filters.status !== "all" && flight.status !== filters.status) {
        return false
      }

      // Filter by services
      if (filters.services.length > 0) {
        const hasAllServices = filters.services.every((service) => flight.services.includes(service))
        if (!hasAllServices) return false
      }

      return true
    })
  }, [filters, flights])

  // Arrivals: Show arrival and quick_turn flights
  const arrivals = filteredFlights.filter((f) =>
    f.type === "arrival" || f.type === "quick_turn" || f.type === "overnight" || f.type === "long_term"
  )
  // Departures: Show departure and quick_turn flights
  const departures = filteredFlights.filter((f) =>
    f.type === "departure" || f.type === "quick_turn" || f.type === "overnight" || f.type === "long_term"
  )

  return (
    <div className="space-y-6">
      {mode === "split" ? (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="w-2 h-2 rounded-full bg-success" />
              <h2 className="text-2xl font-bold text-foreground">Arrivals</h2>
              <span className="text-sm text-muted-foreground">({arrivals.length})</span>
            </div>
            <FlightList
              flights={arrivals}
              type="arrival"
              theme={theme}
              onEditFlight={onEditFlight}
              onDeleteFlight={onDeleteFlight}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <h2 className="text-2xl font-bold text-foreground">Departures</h2>
              <span className="text-sm text-muted-foreground">({departures.length})</span>
            </div>
            <FlightList
              flights={departures}
              type="departure"
              theme={theme}
              onEditFlight={onEditFlight}
              onDeleteFlight={onDeleteFlight}
            />
          </div>
        </div>
      ) : mode === "arrivals" ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="w-2 h-2 rounded-full bg-success" />
            <h2 className="text-2xl font-bold text-foreground">Arrivals</h2>
            <span className="text-sm text-muted-foreground">({arrivals.length})</span>
          </div>
          <FlightList
            flights={arrivals}
            type="arrival"
            theme={theme}
            onEditFlight={onEditFlight}
            onDeleteFlight={onDeleteFlight}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <h2 className="text-2xl font-bold text-foreground">Departures</h2>
            <span className="text-sm text-muted-foreground">({departures.length})</span>
          </div>
          <FlightList
            flights={departures}
            type="departure"
            theme={theme}
            onEditFlight={onEditFlight}
            onDeleteFlight={onDeleteFlight}
          />
        </div>
      )}
    </div>
  )
}
