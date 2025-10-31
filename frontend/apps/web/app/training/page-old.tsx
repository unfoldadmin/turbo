import { authOptions } from '@/lib/auth'
import { getCertifications, getFuelers } from '@/lib/fbo-api'
import type { Fueler, FuelerTraining } from '@/lib/types'
import { ErrorMessage } from '@frontend/ui/messages/error-message'
import { getServerSession } from 'next-auth'

export const revalidate = 60 // Revalidate every minute

export default async function TrainingPage() {
  const session = await getServerSession(authOptions)
  let certifications: FuelerTraining[] = []
  let fuelers: Fueler[] = []
  let error = null

  try {
    ;[certifications, fuelers] = await Promise.all([
      getCertifications({ session }),
      getFuelers(session)
    ])
  } catch (err) {
    console.error('Failed to fetch training data:', err)
    error = 'Failed to load training data. Please try again later.'
  }

  // Group certifications by expiry status
  const expiredCerts = certifications.filter(
    (c) => c.expiry_status === 'expired'
  )
  const criticalCerts = certifications.filter(
    (c) => c.expiry_status === 'critical'
  )
  const warningCerts = certifications.filter(
    (c) => c.expiry_status === 'warning'
  )
  const cautionCerts = certifications.filter(
    (c) => c.expiry_status === 'caution'
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'expired':
        return 'bg-red-100 text-red-800 ring-1 ring-red-600/20'
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'caution':
        return 'bg-orange-100 text-orange-800'
      case 'valid':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Training Management
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Track fueler certifications and training status
          </p>
        </div>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
          Add Certification
        </button>
      </div>

      {/* Error Message */}
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {/* Alert Summary */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
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
                {expiredCerts.length}
              </div>
              <div className="text-sm text-red-700">Expired</div>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-red-50 px-4 py-5 shadow-sm border-2 border-red-200">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-red-600 p-3">
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
              <div className="text-2xl font-bold text-red-900">
                {criticalCerts.length}
              </div>
              <div className="text-sm text-red-700">1 Day</div>
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
                {warningCerts.length}
              </div>
              <div className="text-sm text-yellow-700">3 Days</div>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-orange-50 px-4 py-5 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-orange-500 p-3">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-orange-900">
                {cautionCerts.length}
              </div>
              <div className="text-sm text-orange-700">7 Days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Certifications Table */}
      <div className="rounded-lg bg-white shadow">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            All Certifications ({certifications.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fueler
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Training
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Left
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certified By
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {certifications.map((cert) => (
                <tr
                  key={cert.id}
                  className={`hover:bg-gray-50 ${
                    cert.expiry_status === 'expired' ? 'bg-red-50' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {cert.fueler_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cert.training_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(cert.completed_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(cert.expiry_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`font-semibold ${
                        cert.days_until_expiry < 0
                          ? 'text-red-600'
                          : cert.days_until_expiry <= 3
                            ? 'text-red-600'
                            : cert.days_until_expiry <= 7
                              ? 'text-yellow-600'
                              : 'text-gray-900'
                      }`}
                    >
                      {cert.days_until_expiry < 0
                        ? `${Math.abs(cert.days_until_expiry)} days ago`
                        : `${cert.days_until_expiry} days`}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(
                        cert.expiry_status
                      )}`}
                    >
                      {cert.expiry_status.charAt(0).toUpperCase() +
                        cert.expiry_status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cert.certified_by_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">
                      Renew
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {certifications.length === 0 && !error && (
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No certifications found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding fueler certifications.
          </p>
        </div>
      )}
    </div>
  )
}
