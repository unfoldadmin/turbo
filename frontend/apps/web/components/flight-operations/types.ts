import type { FlightList } from "@frontend/types/api"
import { FlightStatusEnum } from "@frontend/types/api"

// Component types (from v0)
export type FlightType = "arrival" | "departure" | "quick_turn" | "overnight" | "long_term"

export type FlightStatus = "scheduled" | "en-route" | "arrived" | "departed" | "delayed" | "cancelled"

export type FlightSource = "qt" | "calendar" | "manual"

export interface Flight {
  id: string
  type: FlightType
  tailNumber: string
  aircraftType: string
  origin?: string
  destination?: string
  scheduledTime: string
  scheduledDate?: string // ISO date string (YYYY-MM-DD)
  duration?: number // Duration in minutes
  actualTime?: string
  status: FlightStatus
  pilot?: string
  passengers?: number
  services: string[]
  notes?: string
  source: FlightSource
  createdAt: string
  updatedAt: string
}

export interface FlightFilters {
  search: string
  status: FlightStatus | "all"
  dateRange: "today" | "tomorrow" | "week" | "all"
  services: string[]
}

// Map backend flight status to component status
function mapFlightStatus(status?: FlightStatusEnum): FlightStatus {
  switch (status) {
    case FlightStatusEnum.SCHEDULED: return "scheduled"
    case FlightStatusEnum.ARRIVED: return "arrived"
    case FlightStatusEnum.DEPARTED: return "departed"
    case FlightStatusEnum.DELAYED: return "delayed"
    case FlightStatusEnum.CANCELLED: return "cancelled"
    default: return "scheduled"
  }
}

// Map component status back to backend status
export function mapStatusToBackend(status: FlightStatus): FlightStatusEnum {
  switch (status) {
    case "scheduled": return FlightStatusEnum.SCHEDULED
    case "en-route": return FlightStatusEnum.SCHEDULED // Backend doesn't have en-route, use scheduled
    case "arrived": return FlightStatusEnum.ARRIVED
    case "departed": return FlightStatusEnum.DEPARTED
    case "delayed": return FlightStatusEnum.DELAYED
    case "cancelled": return FlightStatusEnum.CANCELLED
  }
}

// Convert backend API flight to component flight
export function apiFlightToComponentFlight(apiFlight: FlightList): Flight {
  // Determine flight type based on which times are set
  const hasArrival = !!apiFlight.arrival_time
  const hasDeparture = !!apiFlight.departure_time

  let type: FlightType
  if (hasArrival && hasDeparture) {
    // Has both times - it's a quick turn
    type = "quick_turn"
  } else if (hasArrival) {
    type = "arrival"
  } else {
    type = "departure"
  }

  // Use the primary scheduled time based on type
  const scheduledTimeStr = type === "departure" ? apiFlight.departure_time : apiFlight.arrival_time
  const scheduledDate = scheduledTimeStr ? new Date(scheduledTimeStr).toISOString().split("T")[0] : undefined
  const scheduledTime = scheduledTimeStr ? new Date(scheduledTimeStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) : ""

  return {
    id: String(apiFlight.id),
    type,
    tailNumber: apiFlight.aircraft_display || apiFlight.aircraft || "",
    aircraftType: apiFlight.aircraft_display || apiFlight.aircraft || "",
    origin: hasArrival ? apiFlight.destination : undefined,
    destination: hasDeparture ? apiFlight.destination : undefined,
    scheduledTime,
    scheduledDate,
    duration: undefined, // Not provided by backend
    actualTime: undefined, // Could be added to backend model
    status: mapFlightStatus(apiFlight.flight_status),
    pilot: undefined, // Not provided by backend
    passengers: undefined, // Not provided by backend
    services: [], // Not provided by backend - would need to add relation
    notes: undefined, // Not provided by backend
    source: "qt", // Default to qt for now
    createdAt: apiFlight.created_at,
    updatedAt: apiFlight.created_at, // Backend doesn't have updated_at
  }
}

// Convert component flight to backend create/update request
export function componentFlightToApiRequest(flight: Partial<Flight>): Record<string, any> {
  const result: Record<string, any> = {}

  // Combine scheduledDate and scheduledTime into ISO string
  let datetime: string | undefined
  if (flight.scheduledDate && flight.scheduledTime) {
    datetime = `${flight.scheduledDate}T${flight.scheduledTime}:00`
  }

  // Only include fields that are actually set
  // Note: flight.tailNumber is the aircraft tail number, not flight_number
  // For updates, we typically don't change flight_number, so only set it for creates
  if (flight.tailNumber !== undefined) {
    result.flight_number = flight.tailNumber
  }

  // Aircraft field - set to null since we don't have aircraft ID mapping yet
  if ('tailNumber' in flight) {
    result.aircraft = null
  }

  if (flight.destination !== undefined) {
    result.destination = flight.destination
  }

  if (flight.origin !== undefined) {
    result.origin = flight.origin
  }

  // Set arrival_time and/or departure_time based on flight type
  if (datetime) {
    switch (flight.type) {
      case "arrival":
        result.arrival_time = datetime
        result.departure_time = null
        break
      case "departure":
        result.departure_time = datetime
        result.arrival_time = null
        break
      case "quick_turn":
      case "overnight":
      case "long_term":
        // For these types, both times should be set
        // For now, use the scheduled time as arrival and calculate departure
        result.arrival_time = datetime
        // TODO: Calculate departure time based on duration or user input
        result.departure_time = datetime
        break
    }
  }

  if (flight.status !== undefined) {
    result.flight_status = mapStatusToBackend(flight.status)
  }

  return result
}
