import { authOptions } from '@/lib/auth'
import {
  getCertifications,
  getFlights,
  getFuelTanks,
  getFuelTransactions
} from '@/lib/fbo-api'
import { getServerSession } from 'next-auth'
import Link from 'next/link'

async function getDashboardData(session: any) {
  try {
    const [tanks, flights, transactions, certifications] = await Promise.all([
      getFuelTanks(session),
      getFlights({ today: true, session }),
      getFuelTransactions({ unassigned: true, session }),
      getCertifications({ status: 'expiring_soon', days: 7, session })
    ])

    return { tanks, flights, transactions, certifications }
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
    return {
      tanks: [],
      flights: [],
      transactions: [],
      certifications: []
    }
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const { tanks, flights, transactions, certifications } =
    await getDashboardData(session)

  // Calculate metrics
  const criticalTanks = tanks.filter((t: any) => t.status === 'critical').length
  const warningTanks = tanks.filter((t: any) => t.status === 'warning').length
  const todaysFlights = flights.length
  const unassignedTransactions = transactions.length
  const expiringCertifications = certifications.length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Fuel Tanks Status */}
        <Link
          href="/fuel-farm"
          className="overflow-hidden rounded-lg bg-white shadow hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Fuel Tanks
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {tanks.length}
                  </dd>
                  <dd className="mt-1 flex items-center text-sm">
                    {criticalTanks > 0 && (
                      <span className="text-red-600 font-medium">
                        {criticalTanks} Critical
                      </span>
                    )}
                    {warningTanks > 0 && (
                      <span
                        className={`${criticalTanks > 0 ? 'ml-2' : ''} text-yellow-600 font-medium`}
                      >
                        {warningTanks} Warning
                      </span>
                    )}
                    {criticalTanks === 0 && warningTanks === 0 && (
                      <span className="text-green-600 font-medium">
                        All Good
                      </span>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        {/* Today's Flights */}
        <Link
          href="/flights"
          className="overflow-hidden rounded-lg bg-white shadow hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-indigo-600"
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
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Today's Flights
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {todaysFlights}
                  </dd>
                  <dd className="mt-1 text-sm text-gray-600">
                    Active schedule
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        {/* Unassigned Transactions */}
        <Link
          href="/dispatch"
          className="overflow-hidden rounded-lg bg-white shadow hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Pending Dispatch
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {unassignedTransactions}
                  </dd>
                  <dd className="mt-1 text-sm text-gray-600">
                    Needs assignment
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        {/* Expiring Certifications */}
        <Link
          href="/training"
          className="overflow-hidden rounded-lg bg-white shadow hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-red-600"
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
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Expiring Soon
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {expiringCertifications}
                  </dd>
                  <dd className="mt-1 text-sm text-gray-600">Within 7 days</dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg bg-white shadow">
        <div className="px-6 py-5">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link
              href="/dispatch"
              className="rounded-md bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Assign Fuelers
            </Link>
            <Link
              href="/flights"
              className="rounded-md bg-white px-4 py-3 text-center text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              View Flights
            </Link>
            <Link
              href="/fuel-farm"
              className="rounded-md bg-white px-4 py-3 text-center text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Monitor Tanks
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="rounded-lg bg-white shadow">
        <div className="px-6 py-5">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Activity tracking coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
