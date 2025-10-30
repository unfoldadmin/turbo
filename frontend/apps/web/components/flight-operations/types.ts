import type { FlightList } from "@frontend/types/api"
import { FlightStatusEnum } from "@frontend/types/api"

// Component types (from v0)
export type FlightType = "arrival" | "departure" | "quick_turn" | "overnight" | "long_term"

export type FlightStatus = "scheduled" | "en-route" | "arrived" | "departed" | "delayed" | "cancelled"

export type FlightSource = "qt" | "front-desk" | "line-department" | "google-calendar"

// Flight interface - fields ordered to match database schema
export interface Flight {
  // Core identification
  id: string
  tailNumber: string // aircraft_id (FK to aircraft.tail_number)
  aircraftType: string // derived from aircraft table
  callSign?: string // call_sign

  // Timing
  arrivalTime?: string // arrival_time
  departureTime?: string // departure_time
  scheduledTime: string // computed from arrival_time or departure_time based on type
  scheduledDate?: string // ISO date string (YYYY-MM-DD), extracted from times
  actualTime?: string // not yet in backend

  // Flight details
  type: FlightType // derived from arrival_time and departure_time presence
  status: FlightStatus // flight_status
  origin?: string // origin
  destination?: string // destination

  // Contact information
  contactName?: string // contact_name
  contactNotes?: string // contact_notes

  // Services and logistics
  services: string[] // services (jsonb)
  fuelOrderNotes?: string // fuel_order_notes
  passengers?: number // passenger_count
  notes?: string // notes

  // Location and metadata
  locationId?: number // location_id

  // Source tracking (always present, defaults to line-department and admin user)
  source: FlightSource // created_by_source (NOT NULL, default: 'line-department')
  createdBy: { // derived from created_by_id (NOT NULL, default: 1 = admin)
    initials: string
    name: string
    department: string
  }

  // Timestamps
  createdAt: string // created_at
  updatedAt: string // modified_at
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

  // Extract creator info (always present, defaults to admin if not provided)
  const createdByInitials = (apiFlight as any).created_by_initials || "ADM"
  const createdByName = (apiFlight as any).created_by_name || "Admin"
  const createdByDept = (apiFlight as any).created_by_department || "System"

  const createdBy = {
    initials: createdByInitials,
    name: createdByName,
    department: createdByDept
  }

  return {
    id: String(apiFlight.id),
    type,
    tailNumber: apiFlight.aircraft || "",
    aircraftType: (apiFlight as any).aircraft_type_display || "",
    origin: apiFlight.origin || (hasArrival ? apiFlight.destination : undefined),
    destination: apiFlight.destination,
    scheduledTime,
    scheduledDate,
    actualTime: undefined, // Could be added to backend model
    status: mapFlightStatus(apiFlight.flight_status),
    contactName: (apiFlight as any).contact_name || undefined,
    contactNotes: (apiFlight as any).contact_notes || undefined,
    passengers: (apiFlight as any).passenger_count || undefined,
    services: (apiFlight as any).services || [],
    notes: (apiFlight as any).notes || undefined,
    source: ((apiFlight as any).created_by_source as FlightSource) || "qt",
    createdBy,
    createdAt: apiFlight.created_at,
    updatedAt: (apiFlight as any).modified_at || apiFlight.created_at,
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

  // IMPORTANT: Don't modify flight_number or aircraft on updates
  // Only include these for creates, and use tailNumber as aircraft FK
  if (flight.tailNumber !== undefined) {
    // For backend, aircraft field expects tail_number as FK
    result.aircraft = flight.tailNumber
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
        // Use the scheduled time as arrival and departure (can be edited separately)
        result.arrival_time = datetime
        result.departure_time = datetime
        break
    }
  }

  if (flight.status !== undefined) {
    result.flight_status = mapStatusToBackend(flight.status)
  }

  if (flight.contactName !== undefined) {
    result.contact_name = flight.contactName
  }

  if (flight.contactNotes !== undefined) {
    result.contact_notes = flight.contactNotes
  }

  if (flight.passengers !== undefined) {
    result.passenger_count = flight.passengers
  }

  if (flight.services !== undefined) {
    result.services = flight.services
  }

  if (flight.notes !== undefined) {
    result.notes = flight.notes
  }

  if (flight.source !== undefined) {
    result.created_by_source = flight.source
  }

  // Only include call_sign if explicitly provided (for creates)
  // Don't send it on updates as it might conflict with existing data
  if (flight.id && flight.id.startsWith('manual-')) {
    // This is a new flight, set call_sign
    result.call_sign = `MAN-${Date.now()}`
  }

  // Filter out any undefined/null values
  Object.keys(result).forEach(key => {
    if (result[key] === undefined || result[key] === null) {
      delete result[key]
    }
  })

  return result
}
