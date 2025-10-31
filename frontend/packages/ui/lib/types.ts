export type FlightType = 'arrival' | 'departure'

export type FlightStatus =
  | 'scheduled'
  | 'en-route'
  | 'arrived'
  | 'departed'
  | 'delayed'
  | 'cancelled'

export type FlightSource = 'qt' | 'calendar' | 'manual'

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
  status: FlightStatus | 'all'
  dateRange: 'today' | 'tomorrow' | 'week' | 'all'
  services: string[]
}
