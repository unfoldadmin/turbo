import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getFlights } from '@/lib/fbo-api'
import type { Flight } from '@/lib/types'

export const revalidate = 30 // Revalidate every 30 seconds

export default async function FlightsPage() {
  const session = await getServerSession(authOptions)
  let flights: Flight[] = []
  let error = null

  try {
    flights = await getFlights({ today: true, session })
  } catch (err) {
    console.error('Failed to fetch flights:', err)
    error = 'Failed to load flight data. Please try again later.'
  }

  // Group flights by status
  const scheduledFlights = flights.filter((f) => f.flight_status === 'scheduled')
  const arrivedFlights = flights.filter((f) => f.flight_status === 'arrived')
  const departedFlights = flights.filter((f) => f.flight_status === 'departed')

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'arrived':
        return 'bg-green-100 text-green-800'
      case 'departed':
        return 'bg-gray-100 text-gray-800'
      case 'delayed':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Flights</h1>
          <p className="mt-2 text-sm text-gray-600">
            Today's flight schedule and status
          </p>
        </div>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
          Add Flight
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-lg bg-white shadow p-6">
          <div className="text-sm font-medium text-gray-500">Scheduled</div>
          <div className="mt-2 text-3xl font-bold text-blue-600">
            {scheduledFlights.length}
          </div>
          <div className="mt-2 text-xs text-gray-600">Awaiting arrival</div>
        </div>

        <div className="rounded-lg bg-white shadow p-6">
          <div className="text-sm font-medium text-gray-500">Arrived</div>
          <div className="mt-2 text-3xl font-bold text-green-600">
            {arrivedFlights.length}
          </div>
          <div className="mt-2 text-xs text-gray-600">On ground</div>
        </div>

        <div className="rounded-lg bg-white shadow p-6">
          <div className="text-sm font-medium text-gray-500">Departed</div>
          <div className="mt-2 text-3xl font-bold text-gray-600">
            {departedFlights.length}
          </div>
          <div className="mt-2 text-xs text-gray-600">Completed</div>
        </div>
      </div>

      {/* Flights Table */}
      <div className="rounded-lg bg-white shadow">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Today's Schedule ({flights.length} flights)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Flight #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aircraft
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Arrival
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Departure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {flights.map((flight) => (
                <tr key={flight.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {flight.flight_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {flight.aircraft_display || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {flight.gate_display || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {flight.destination || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTime(flight.arrival_time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTime(flight.departure_time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(
                        flight.flight_status
                      )}`}
                    >
                      {flight.flight_status.charAt(0).toUpperCase() +
                        flight.flight_status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-4">
                      Edit
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {flights.length === 0 && !error && (
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
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No flights scheduled
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding a new flight to the schedule.
          </p>
          <div className="mt-6">
            <button className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
              Add First Flight
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
