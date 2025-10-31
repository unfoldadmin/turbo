'use client'

export default function FlightOperationsDayView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Flight Operations - Day View</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            QT-style day view (Coming Soon)
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Day View - Under Construction
        </h3>
        <p className="text-gray-600 mb-4">
          This will be a QT-style day view showing all flights for the current
          day in a compact format.
        </p>
        <p className="text-sm text-gray-500">
          See TODO.md for development roadmap
        </p>
      </div>
    </div>
  )
}
