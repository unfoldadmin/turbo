'use client'

import { useTheme } from '@/components/navigation-wrapper'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function EquipmentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { theme } = useTheme()
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchEquipment()
    }
  }, [status])

  const fetchEquipment = async () => {
    try {
      setLoading(true)
      // TODO: Implement API call when backend migrations are run
      setEquipment([])
    } catch (err) {
      console.error('Failed to fetch equipment:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-muted-foreground">
          Loading equipment...
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Equipment</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage ground support equipment inventory
          </p>
        </div>
        <button className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
          Add Equipment
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-card px-4 py-5 shadow-sm border border-border">
          <div className="text-sm font-medium text-muted-foreground">
            Total Equipment
          </div>
          <div className="mt-2 text-3xl font-bold text-foreground">
            {equipment.length}
          </div>
        </div>
        <div className="rounded-lg bg-card px-4 py-5 shadow-sm border border-border">
          <div className="text-sm font-medium text-muted-foreground">
            Available
          </div>
          <div className="mt-2 text-3xl font-bold text-success">
            {equipment.filter((e: any) => e.status === 'available').length}
          </div>
        </div>
        <div className="rounded-lg bg-card px-4 py-5 shadow-sm border border-border">
          <div className="text-sm font-medium text-muted-foreground">
            Maintenance
          </div>
          <div className="mt-2 text-3xl font-bold text-warning">
            {equipment.filter((e: any) => e.status === 'maintenance').length}
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-card shadow border border-border">
        <div className="px-6 py-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Equipment Inventory
          </h2>
        </div>
        <div className="p-8 text-center">
          <div className="text-muted-foreground">
            Equipment module coming soon. Backend models created, pending
            database migrations.
          </div>
        </div>
      </div>
    </div>
  )
}
