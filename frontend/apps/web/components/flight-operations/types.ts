import type { FlightList } from '@frontend/types/api'
import { FlightStatusEnum } from '@frontend/types/api'

// Component types (from v0)
export type FlightType =
  | 'arrival'
  | 'departure'
  | 'quick_turn'
  | 'overnight'
  | 'long_term'

export type FlightStatus =
  | 'scheduled'
  | 'en-route'
  | 'arrived'
  | 'departed'
  | 'delayed'
  | 'cancelled'

export type FlightSource =
  | 'qt'
  | 'front-desk'
  | 'line-department'
  | 'google-calendar'

// Flight interface - fields ordered to match database schema
export interface Flight {
  // Core identification
  id: string
  tailNumber: string // aircraft_id (FK to aircraft.tail_number)
  aircraftType: string // derived from aircraft table
  callSign?: string // call_sign

  // Timing (direct from database - no derived fields)
  arrivalTime?: string // arrival_time (ISO timestamp)
  departureTime: string // departure_time (ISO timestamp, NOT NULL)

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
  duration: number // calculated from arrival_time and departure_time (min 45 minutes)

  // Source tracking (always present, defaults to line-department and admin user)
  source: FlightSource // created_by_source (NOT NULL, default: 'line-department')
  createdBy: {
    // derived from created_by_id (NOT NULL, default: 1 = admin)
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
  status: FlightStatus | 'all'
  dateRange: 'today' | 'tomorrow' | 'week' | 'all'
  services: string[]
}

// Map backend flight status to component status
function mapFlightStatus(status?: FlightStatusEnum): FlightStatus {
  switch (status) {
    case FlightStatusEnum.SCHEDULED:
      return 'scheduled'
    case FlightStatusEnum.ARRIVED:
      return 'arrived'
    case FlightStatusEnum.DEPARTED:
      return 'departed'
    case FlightStatusEnum.DELAYED:
      return 'delayed'
    case FlightStatusEnum.CANCELLED:
      return 'cancelled'
    default:
      return 'scheduled'
  }
}

// Map component status back to backend status
export function mapStatusToBackend(status: FlightStatus): FlightStatusEnum {
  switch (status) {
    case 'scheduled':
      return FlightStatusEnum.SCHEDULED
    case 'en-route':
      return FlightStatusEnum.SCHEDULED // Backend doesn't have en-route, use scheduled
    case 'arrived':
      return FlightStatusEnum.ARRIVED
    case 'departed':
      return FlightStatusEnum.DEPARTED
    case 'delayed':
      return FlightStatusEnum.DELAYED
    case 'cancelled':
      return FlightStatusEnum.CANCELLED
  }
}

// Calculate duration in minutes from arrival and departure times
function calculateDuration(
  arrivalTime?: string,
  departureTime?: string
): number {
  if (arrivalTime && departureTime) {
    const arrival = new Date(arrivalTime)
    const departure = new Date(departureTime)
    const durationMs = departure.getTime() - arrival.getTime()
    const durationMinutes = Math.floor(durationMs / (1000 * 60))
    return Math.max(45, durationMinutes) // Minimum 45 minutes
  }
  return 45 // Default 45 minutes for single-time flights
}

// Convert backend API flight to component flight
export function apiFlightToComponentFlight(apiFlight: FlightList): Flight {
  // Determine flight type based on which times are set
  const hasArrival = !!apiFlight.arrival_time
  const hasDeparture = !!apiFlight.departure_time

  let type: FlightType
  if (hasArrival && hasDeparture) {
    // Has both times - it's a quick turn
    type = 'quick_turn'
  } else if (hasArrival) {
    type = 'arrival'
  } else {
    type = 'departure'
  }

  // Calculate duration from arrival and departure times
  const duration = calculateDuration(
    apiFlight.arrival_time,
    apiFlight.departure_time
  )

  // Extract creator info (always present, defaults to admin if not provided)
  const createdByInitials = (apiFlight as any).created_by_initials || 'ADM'
  const createdByName = (apiFlight as any).created_by_name || 'Admin'
  const createdByDept = (apiFlight as any).created_by_department || 'System'

  const createdBy = {
    initials: createdByInitials,
    name: createdByName,
    department: createdByDept
  }

  return {
    id: String(apiFlight.id),
    type,
    tailNumber: apiFlight.aircraft || '',
    aircraftType: (apiFlight as any).aircraft_type_display || '',
    arrivalTime: apiFlight.arrival_time,
    departureTime: apiFlight.departure_time!,
    origin:
      apiFlight.origin || (hasArrival ? apiFlight.destination : undefined),
    destination: apiFlight.destination,
    status: mapFlightStatus(apiFlight.flight_status),
    contactName: (apiFlight as any).contact_name || undefined,
    contactNotes: (apiFlight as any).contact_notes || undefined,
    passengers: (apiFlight as any).passenger_count || undefined,
    services: (apiFlight as any).services || [],
    notes: (apiFlight as any).notes || undefined,
    duration, // Calculated from arrival and departure times
    source: ((apiFlight as any).created_by_source as FlightSource) || 'qt',
    createdBy,
    createdAt: apiFlight.created_at,
    updatedAt: (apiFlight as any).modified_at || apiFlight.created_at
  }
}

// Convert component flight to backend create/update request
export function componentFlightToApiRequest(
  flight: Partial<Flight>
): Record<string, any> {
  const result: Record<string, any> = {}

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

  // Pass through arrival_time and departure_time directly
  if (flight.arrivalTime !== undefined) {
    result.arrival_time = flight.arrivalTime
  }

  if (flight.departureTime !== undefined) {
    result.departure_time = flight.departureTime
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
  Object.keys(result).forEach((key) => {
    if (result[key] === undefined || result[key] === null) {
      delete result[key]
    }
  })

  return result
}
