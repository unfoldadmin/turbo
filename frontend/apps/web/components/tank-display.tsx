'use client'

import type { FuelTank } from '@/lib/types'

interface TankDisplayProps {
  tank: FuelTank
}

export function TankDisplay({ tank }: TankDisplayProps) {
  const percentage = tank.current_level_percentage || 0
  const level = tank.latest_reading?.level || 0

  // Color based on status
  const getStatusColor = () => {
    switch (tank.status) {
      case 'critical':
        return 'bg-red-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'good':
        return 'bg-green-500'
      default:
        return 'bg-gray-300'
    }
  }

  const getStatusBadge = () => {
    switch (tank.status) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'good':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formattedDate = tank.latest_reading?.recorded_at
    ? new Date(tank.latest_reading.recorded_at).toLocaleString()
    : 'No data'

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="px-6 py-5">
        {/* Tank Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {tank.tank_name}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {tank.fuel_type === 'jet_a' ? 'Jet A' : 'Avgas'} •{' '}
              {tank.capacity_gallons.toLocaleString()} gal capacity
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusBadge()}`}
          >
            {tank.status.charAt(0).toUpperCase() + tank.status.slice(1)}
          </span>
        </div>

        {/* Visual Tank Display */}
        <div className="mt-6">
          <div className="relative h-64 w-full rounded-lg border-2 border-gray-300 bg-gray-50">
            {/* Filled portion */}
            <div
              className={`absolute bottom-0 left-0 right-0 rounded-b-lg ${getStatusColor()} transition-all duration-500`}
              style={{ height: `${percentage}%` }}
            >
              {/* Level indicator */}
              <div className="absolute top-0 left-0 right-0 flex items-center justify-center py-2">
                <span className="text-sm font-bold text-white drop-shadow-lg">
                  {percentage.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Percentage label (when tank is empty/low) */}
            {percentage < 20 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-400">
                  {percentage.toFixed(1)}%
                </span>
              </div>
            )}

            {/* Measurement markers */}
            <div className="absolute left-0 top-0 bottom-0 w-full pointer-events-none">
              {[75, 50, 25].map((mark) => (
                <div
                  key={mark}
                  className="absolute left-0 right-0 border-t border-dashed border-gray-300"
                  style={{ top: `${100 - mark}%` }}
                >
                  <span className="absolute -left-12 -top-2 text-xs text-gray-500">
                    {mark}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tank Details */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="font-medium text-gray-500">Current Level</dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">
              {level.toFixed(2)}"
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Usable Range</dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">
              {tank.usable_min_inches}" - {tank.usable_max_inches}"
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="font-medium text-gray-500">Last Updated</dt>
            <dd className="mt-1 text-sm text-gray-900">{formattedDate}</dd>
          </div>
        </div>
      </div>
    </div>
  )
}
