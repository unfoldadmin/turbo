import { FlightCard } from "./flight-card"
import type { Flight } from "@/lib/types"

interface FlightListProps {
  flights: Flight[]
  type: "arrival" | "departure"
  theme: "dark" | "light"
  onEditFlight: (flight: Flight) => void
  onDeleteFlight: (id: string) => void
}

export function FlightList({ flights, type, theme, onEditFlight, onDeleteFlight }: FlightListProps) {
  if (flights.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No {type === "arrival" ? "arrivals" : "departures"} found
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {flights.map((flight) => (
        <FlightCard key={flight.id} flight={flight} theme={theme} onEdit={onEditFlight} onDelete={onDeleteFlight} />
      ))}
    </div>
  )
}
