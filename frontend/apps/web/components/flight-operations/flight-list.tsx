import { FlightCard } from './flight-card'
import type { Flight } from './types'

interface FlightListProps {
  flights: Flight[]
  type: 'arrival' | 'departure'
  theme: 'dark' | 'light'
  onEditFlight: (flight: Flight) => void
  onDeleteFlight: (id: string) => void
  linkedFlightIds?: Set<string>
  flightLinkColors?: Map<string, string>
  hoveredFlightId?: string | null
  onFlightHover?: (id: string | null) => void
}

export function FlightList({
  flights,
  type,
  theme,
  onEditFlight,
  onDeleteFlight,
  linkedFlightIds,
  flightLinkColors,
  hoveredFlightId,
  onFlightHover
}: FlightListProps) {
  if (flights.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No {type === 'arrival' ? 'arrivals' : 'departures'} found
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {flights.map((flight) => {
        const isLinked = linkedFlightIds?.has(flight.id) || false
        const linkColor = flightLinkColors?.get(flight.id)
        const isHovered = hoveredFlightId === flight.id

        return (
          <FlightCard
            key={flight.id}
            flight={flight}
            theme={theme}
            onEdit={onEditFlight}
            onDelete={onDeleteFlight}
            isLinked={isLinked}
            linkColor={linkColor}
            isHovered={isHovered}
            onHover={onFlightHover}
          />
        )
      })}
    </div>
  )
}
