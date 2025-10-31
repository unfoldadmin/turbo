/**
 * FBO Manager Type Definitions
 */

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: 'admin' | 'user'
  phone_number: string
  employee_id: string
  is_active_fueler: boolean
}

export interface FuelTank {
  tank_id: string
  tank_name: string
  fuel_type: 'jet_a' | 'avgas'
  capacity_gallons: number
  usable_min_inches: number
  usable_max_inches: number
  latest_reading?: {
    level: number
    recorded_at: string
  }
  current_level_percentage?: number
  status: 'critical' | 'warning' | 'good' | 'unknown'
}

export interface TankLevelReading {
  id: number
  tank_id: string
  level: number
  recorded_at: string
  created_at: string
}

export interface Aircraft {
  tail_number: string
  aircraft_type: string
  airline_icao: string
  fleet_id: string
}

export interface TerminalGate {
  id: number
  terminal_id: string
  terminal_num: string
  gate_number: string
  location_id: string
  display_order: number
  display_name: string
}

export interface Flight {
  id: number
  flight_number: string
  aircraft: string | null
  aircraft_display?: string
  gate: number | null
  gate_display?: string
  arrival_time: string | null
  departure_time: string
  flight_status: 'scheduled' | 'arrived' | 'departed' | 'cancelled' | 'delayed'
  destination: string
  created_at: string
}

export interface Fueler {
  id: number
  user: number
  username: string
  email: string
  fueler_name: string
  handheld_name: string
  status: 'active' | 'inactive'
}

export interface Training {
  id: number
  training_name: string
  description: string
  validity_period_days: number
  aircraft_type: string | null
}

export interface FuelerTraining {
  id: number
  fueler: number
  fueler_name: string
  training: number
  training_name: string
  completed_date: string
  expiry_date: string
  certified_by: number | null
  certified_by_name: string
  days_until_expiry: number
  expiry_status:
    | 'expired'
    | 'critical'
    | 'warning'
    | 'caution'
    | 'valid'
    | 'unknown'
}

export interface FuelTransaction {
  id: number
  ticket_number: string
  flight: number | null
  flight_number?: string
  quantity_gallons: number
  quantity_lbs: number
  progress: 'started' | 'in_progress' | 'completed'
  assigned_fuelers: string[]
  qt_sync_status: 'pending' | 'synced' | 'failed'
  created_at: string
}

export interface FuelerAssignment {
  id: number
  fueler: number
  fueler_name: string
  assigned_at: string
}
