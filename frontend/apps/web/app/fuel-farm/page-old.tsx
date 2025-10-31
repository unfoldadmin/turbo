import { TankDisplay } from '@/components/tank-display'
import { authOptions } from '@/lib/auth'
import { getFuelTanks } from '@/lib/fbo-api'
import type { FuelTank } from '@/lib/types'
import { ErrorMessage } from '@frontend/ui/messages/error-message'
import { getServerSession } from 'next-auth'

export const revalidate = 30 // Revalidate every 30 seconds

export default async function FuelFarmPage() {
  const session = await getServerSession(authOptions)
  let tanks: FuelTank[] = []
  let error = null

  try {
    tanks = await getFuelTanks(session)
  } catch (err) {
    console.error('Failed to fetch fuel tanks:', err)
    error = 'Failed to load fuel tank data. Please try again later.'
  }

  // Group tanks by fuel type
  const jetATanks = tanks.filter((t) => t.fuel_type === 'jet_a')
  const avgasTanks = tanks.filter((t) => t.fuel_type === 'avgas')

  // Calculate summary stats
  const criticalCount = tanks.filter((t) => t.status === 'critical').length
  const warningCount = tanks.filter((t) => t.status === 'warning').length
  const goodCount = tanks.filter((t) => t.status === 'good').length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fuel Farm</h1>
          <p className="mt-2 text-sm text-gray-600">
            Real-time monitoring of all fuel tanks • Updates every 30 seconds
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Total Tanks</div>
          <div className="text-3xl font-bold text-gray-900">{tanks.length}</div>
        </div>
      </div>

      {/* Error Message */}
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {/* Status Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-green-50 px-4 py-5 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-green-500 p-3">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-green-900">
                {goodCount}
              </div>
              <div className="text-sm text-green-700">Good Status</div>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-yellow-50 px-4 py-5 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-yellow-500 p-3">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-yellow-900">
                {warningCount}
              </div>
              <div className="text-sm text-yellow-700">Warning</div>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-red-50 px-4 py-5 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-red-500 p-3">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-red-900">
                {criticalCount}
              </div>
              <div className="text-sm text-red-700">Critical</div>
            </div>
          </div>
        </div>
      </div>

      {/* Jet A Tanks */}
      {jetATanks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Jet A Tanks ({jetATanks.length})
          </h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {jetATanks.map((tank) => (
              <TankDisplay key={tank.tank_id} tank={tank} />
            ))}
          </div>
        </div>
      )}

      {/* Avgas Tanks */}
      {avgasTanks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Avgas Tanks ({avgasTanks.length})
          </h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {avgasTanks.map((tank) => (
              <TankDisplay key={tank.tank_id} tank={tank} />
            ))}
          </div>
        </div>
      )}

      {/* No Tanks Message */}
      {tanks.length === 0 && !error && (
        <div className="rounded-md bg-blue-50 p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No tanks found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Run the seed command to create fuel tanks.
          </p>
        </div>
      )}
    </div>
  )
}
