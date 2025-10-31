import { authOptions } from '@/lib/auth'
import { getFuelTransactions, getFuelers } from '@/lib/fbo-api'
import type { FuelTransaction, Fueler } from '@/lib/types'
import { ErrorMessage } from '@frontend/ui/messages/error-message'
import { getServerSession } from 'next-auth'
import Link from 'next/link'

export const revalidate = 15 // Revalidate every 15 seconds

export default async function DispatchPage() {
  const session = await getServerSession(authOptions)
  let transactions: FuelTransaction[] = []
  let fuelers: Fueler[] = []
  let error = null

  try {
    ;[transactions, fuelers] = await Promise.all([
      getFuelTransactions({ session }),
      getFuelers(session)
    ])
  } catch (err) {
    console.error('Failed to fetch dispatch data:', err)
    error = 'Failed to load dispatch data. Please try again later.'
  }

  // Group transactions by status
  const unassignedTx = transactions.filter(
    (t) => t.assigned_fuelers.length === 0
  )
  const inProgressTx = transactions.filter((t) => t.progress === 'in_progress')
  const completedTx = transactions.filter((t) => t.progress === 'completed')

  const getProgressBadge = (progress: string) => {
    switch (progress) {
      case 'started':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSyncBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      case 'synced':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fuel Dispatch</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage fuel transactions and fueler assignments
          </p>
        </div>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
          New Transaction
        </button>
      </div>

      {/* Error Message */}
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-lg bg-white shadow p-6">
          <div className="text-sm font-medium text-gray-500">Unassigned</div>
          <div className="mt-2 text-3xl font-bold text-yellow-600">
            {unassignedTx.length}
          </div>
          <div className="mt-2 text-xs text-gray-600">
            Needs fueler assignment
          </div>
        </div>

        <div className="rounded-lg bg-white shadow p-6">
          <div className="text-sm font-medium text-gray-500">In Progress</div>
          <div className="mt-2 text-3xl font-bold text-blue-600">
            {inProgressTx.length}
          </div>
          <div className="mt-2 text-xs text-gray-600">Currently fueling</div>
        </div>

        <div className="rounded-lg bg-white shadow p-6">
          <div className="text-sm font-medium text-gray-500">
            Completed Today
          </div>
          <div className="mt-2 text-3xl font-bold text-green-600">
            {completedTx.length}
          </div>
          <div className="mt-2 text-xs text-gray-600">
            Finished transactions
          </div>
        </div>
      </div>

      {/* Active Fuelers */}
      <div className="rounded-lg bg-white shadow">
        <div className="px-6 py-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Active Fuelers (
            {fuelers.filter((f) => f.status === 'active').length})
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {fuelers
              .filter((f) => f.status === 'active')
              .map((fueler) => (
                <div
                  key={fueler.id}
                  className="rounded-lg border border-gray-200 p-3 hover:border-blue-500 hover:shadow-sm transition-all"
                >
                  <div className="text-sm font-medium text-gray-900">
                    {fueler.fueler_name}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {fueler.handheld_name || 'No handheld'}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-lg bg-white shadow">
        <div className="px-6 py-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Transactions
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Flight
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  QT Sync
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.ticket_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.flight_number || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.quantity_gallons.toLocaleString()} gal
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getProgressBadge(
                        transaction.progress
                      )}`}
                    >
                      {transaction.progress.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.assigned_fuelers.length > 0 ? (
                      <div className="flex flex-col space-y-1">
                        {transaction.assigned_fuelers.map((name, idx) => (
                          <span key={idx} className="text-xs">
                            {name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-yellow-600 font-medium">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getSyncBadge(
                        transaction.qt_sync_status
                      )}`}
                    >
                      {transaction.qt_sync_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">
                      Assign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {transactions.length === 0 && !error && (
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No transactions
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new fuel transaction.
          </p>
        </div>
      )}
    </div>
  )
}
