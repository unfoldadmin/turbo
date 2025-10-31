'use client'

import type {
  FuelTankRequest,
  FuelTankWithLatestReading
} from '@frontend/types/api'
import { FuelTypeEnum } from '@frontend/types/api'
import { Button } from '@frontend/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@frontend/ui/components/ui/dialog'
import { Input } from '@frontend/ui/components/ui/input'
import { Label } from '@frontend/ui/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@frontend/ui/components/ui/select'
import { useEffect, useState } from 'react'

interface TankFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tank?: FuelTankWithLatestReading | null
  onSubmit: (data: FuelTankRequest) => Promise<void>
}

export function TankFormDialog({
  open,
  onOpenChange,
  tank,
  onSubmit
}: TankFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FuelTankRequest>({
    tank_id: '',
    tank_name: '',
    fuel_type: FuelTypeEnum.JET_A,
    capacity_gallons: '',
    min_level_inches: '',
    max_level_inches: '',
    usable_min_inches: '',
    usable_max_inches: ''
  })

  useEffect(() => {
    if (tank) {
      setFormData({
        tank_id: tank.tank_id,
        tank_name: tank.tank_name,
        fuel_type: tank.fuel_type,
        capacity_gallons: tank.capacity_gallons,
        min_level_inches: tank.min_level_inches,
        max_level_inches: tank.max_level_inches,
        usable_min_inches: tank.usable_min_inches,
        usable_max_inches: tank.usable_max_inches
      })
    } else {
      setFormData({
        tank_id: '',
        tank_name: '',
        fuel_type: FuelTypeEnum.JET_A,
        capacity_gallons: '',
        min_level_inches: '',
        max_level_inches: '',
        usable_min_inches: '',
        usable_max_inches: ''
      })
    }
  }, [tank, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(formData)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save tank:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{tank ? 'Edit Tank' : 'Create Tank'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tank_id">Tank ID *</Label>
              <Input
                id="tank_id"
                value={formData.tank_id}
                onChange={(e) =>
                  setFormData({ ...formData, tank_id: e.target.value })
                }
                required
                placeholder="e.g., TANK-1"
                disabled={!!tank}
              />
              {tank && (
                <p className="text-xs text-muted-foreground">
                  Tank ID cannot be changed
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tank_name">Tank Name *</Label>
              <Input
                id="tank_name"
                value={formData.tank_name}
                onChange={(e) =>
                  setFormData({ ...formData, tank_name: e.target.value })
                }
                required
                placeholder="e.g., Jet A Main"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fuel_type">Fuel Type *</Label>
            <Select
              value={formData.fuel_type}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  fuel_type: value as FuelTypeEnum
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select fuel type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={FuelTypeEnum.JET_A}>Jet A</SelectItem>
                <SelectItem value={FuelTypeEnum.AVGAS}>Avgas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity_gallons">Capacity (Gallons) *</Label>
            <Input
              id="capacity_gallons"
              type="number"
              step="0.01"
              value={formData.capacity_gallons}
              onChange={(e) =>
                setFormData({ ...formData, capacity_gallons: e.target.value })
              }
              required
              placeholder="0.00"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_level_inches">Min Level (inches) *</Label>
              <Input
                id="min_level_inches"
                type="number"
                step="0.01"
                value={formData.min_level_inches}
                onChange={(e) =>
                  setFormData({ ...formData, min_level_inches: e.target.value })
                }
                required
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_level_inches">Max Level (inches) *</Label>
              <Input
                id="max_level_inches"
                type="number"
                step="0.01"
                value={formData.max_level_inches}
                onChange={(e) =>
                  setFormData({ ...formData, max_level_inches: e.target.value })
                }
                required
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="usable_min_inches">Usable Min (inches) *</Label>
              <Input
                id="usable_min_inches"
                type="number"
                step="0.01"
                value={formData.usable_min_inches}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    usable_min_inches: e.target.value
                  })
                }
                required
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="usable_max_inches">Usable Max (inches) *</Label>
              <Input
                id="usable_max_inches"
                type="number"
                step="0.01"
                value={formData.usable_max_inches}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    usable_max_inches: e.target.value
                  })
                }
                required
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : tank ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
