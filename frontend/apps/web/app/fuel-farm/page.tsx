'use client'

import { TankFormDialog } from '@/components/fuel-farm/tank-form-dialog'
import { TankVisualCard } from '@/components/fuel-farm/tank-visual-card'
import { useTheme } from '@/components/navigation-wrapper'
import { useTankReadings } from '@/hooks/use-tank-readings'
import { useTanks } from '@/hooks/use-tanks'
import type {
  FuelTankRequest,
  FuelTankWithLatestReading
} from '@frontend/types/api'
import { Badge } from '@frontend/ui/components/ui/badge'
import { Button } from '@frontend/ui/components/ui/button'
import { Card } from '@frontend/ui/components/ui/card'
import { ErrorMessage } from '@frontend/ui/messages/error-message'
import { SuccessMessage } from '@frontend/ui/messages/success-message'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function FuelFarmPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { theme } = useTheme()
  const { tanks, loading, error, createTank, updateTank, deleteTank, refetch } =
    useTanks()
  const { createReading } = useTankReadings()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTank, setEditingTank] =
    useState<FuelTankWithLatestReading | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const handleUpdateLevel = async (tankId: string, level: number) => {
    try {
      await createReading(tankId, level)
      setSuccessMessage(`${tankId} updated to ${level.toFixed(1)}"`)
      setTimeout(() => setSuccessMessage(''), 3000)
      // Refetch tanks to get updated readings
      await refetch()
    } catch (err) {
      setErrorMessage(`Failed to update ${tankId}`)
      setTimeout(() => setErrorMessage(''), 3000)
      throw err
    }
  }

  const handleCreateTank = async (data: FuelTankRequest) => {
    try {
      await createTank(data)
      setSuccessMessage('Tank created successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setErrorMessage('Failed to create tank')
      setTimeout(() => setErrorMessage(''), 3000)
      throw err
    }
  }

  const handleEditTank = (tank: FuelTankWithLatestReading) => {
    setEditingTank(tank)
    setDialogOpen(true)
  }

  const handleUpdateTank = async (data: FuelTankRequest) => {
    if (!editingTank) return
    try {
      await updateTank(editingTank.id, data)
      setSuccessMessage('Tank updated successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
      setEditingTank(null)
    } catch (err) {
      setErrorMessage('Failed to update tank')
      setTimeout(() => setErrorMessage(''), 3000)
      throw err
    }
  }

  const handleDeleteTank = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tank?')) return
    try {
      await deleteTank(id)
      setSuccessMessage('Tank deleted successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setErrorMessage('Failed to delete tank')
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }

  const handleOpenDialog = () => {
    setEditingTank(null)
    setDialogOpen(true)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-muted-foreground">
          Loading fuel farm...
        </div>
      </div>
    )
  }

  const getTankStatus = (
    tank: FuelTankWithLatestReading
  ): 'good' | 'warning' | 'critical' => {
    if (!tank.latest_reading) return 'warning'
    const level = Number.parseFloat(tank.latest_reading.level)
    const usableMin = Number.parseFloat(tank.usable_min_inches)
    const usableMax = Number.parseFloat(tank.usable_max_inches)
    const capacity = Number.parseFloat(tank.capacity_gallons)

    const percentFull = (level / usableMax) * 100

    if (percentFull < 20) return 'critical'
    if (percentFull < 40) return 'warning'
    return 'good'
  }

  if (status === 'unauthenticated') {
    return null
  }

  // Sort tanks: T1-T6 first, then T7 (outside containment)
  const sortedTanks = [...tanks].sort((a, b) => {
    const aNum = Number.parseInt(a.tank_id.replace('T', ''))
    const bNum = Number.parseInt(b.tank_id.replace('T', ''))
    return aNum - bNum
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            ⛽ Fuel Farm Levels
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Real-time tank level monitoring
          </p>
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleOpenDialog}
        >
          New Tank
        </Button>
      </div>

      {successMessage && <SuccessMessage message={successMessage} />}
      {errorMessage && <ErrorMessage message={errorMessage} />}
      {error && (
        <Card className="bg-destructive/10 border-destructive/20 p-4">
          <p className="text-sm text-destructive">
            Failed to load fuel tank data
          </p>
        </Card>
      )}

      <TankFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tank={editingTank}
        onSubmit={editingTank ? handleUpdateTank : handleCreateTank}
      />

      {/* Horizontal Scrollable Tank Container */}
      <div className="relative">
        <div className="flex gap-5 overflow-x-auto pb-4 px-2 scroll-smooth snap-x snap-proximity">
          {sortedTanks.map((tank, index) => (
            <div
              key={tank.tank_id}
              className="flex gap-5 items-center snap-start"
            >
              {/* Add visual divider before T7 */}
              {tank.tank_id === 'T7' && index > 0 && (
                <div className="flex-shrink-0 w-1 h-48 bg-gradient-to-b from-transparent via-yellow-400 to-transparent rounded" />
              )}
              <div className="flex-shrink-0 w-44">
                <TankVisualCard tank={tank} onUpdateLevel={handleUpdateLevel} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {tanks.length === 0 && !error && (
        <Card className="p-8 text-center bg-card border-border">
          <div className="text-muted-foreground">
            No tanks found. Create a tank to get started.
          </div>
        </Card>
      )}
    </div>
  )
}
