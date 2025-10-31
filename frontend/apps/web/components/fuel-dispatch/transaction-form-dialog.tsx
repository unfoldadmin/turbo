'use client'

import type {
  FuelTransactionCreateRequest,
  FuelTransactionDetail,
  ProgressEnum
} from '@frontend/types/api'
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
import { useFlights } from '../../hooks/use-flights'

interface TransactionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: FuelTransactionDetail | null
  onSubmit: (data: FuelTransactionCreateRequest) => Promise<void>
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  transaction,
  onSubmit
}: TransactionFormDialogProps) {
  const { flights } = useFlights()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FuelTransactionCreateRequest>({
    ticket_number: '',
    flight: null,
    quantity_gallons: '',
    quantity_lbs: '',
    density: '',
    charge_flags: null
  })

  useEffect(() => {
    if (transaction) {
      setFormData({
        ticket_number: transaction.ticket_number,
        flight: transaction.flight,
        quantity_gallons: transaction.quantity_gallons,
        quantity_lbs: transaction.quantity_lbs,
        density: transaction.density,
        charge_flags: transaction.charge_flags
      })
    } else {
      setFormData({
        ticket_number: '',
        flight: null,
        quantity_gallons: '',
        quantity_lbs: '',
        density: '',
        charge_flags: null
      })
    }
  }, [transaction, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(formData)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save transaction:', error)
    } finally {
      setLoading(false)
    }
  }

  // Auto-calculate density when gallons and lbs are provided
  useEffect(() => {
    if (formData.quantity_gallons && formData.quantity_lbs) {
      const gallons = Number.parseFloat(formData.quantity_gallons)
      const lbs = Number.parseFloat(formData.quantity_lbs)
      if (!isNaN(gallons) && !isNaN(lbs) && gallons > 0) {
        const calculatedDensity = (lbs / gallons).toFixed(4)
        if (formData.density !== calculatedDensity) {
          setFormData((prev) => ({ ...prev, density: calculatedDensity }))
        }
      }
    }
  }, [formData.quantity_gallons, formData.quantity_lbs])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Edit Transaction' : 'Create Transaction'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ticket_number">Ticket Number *</Label>
            <Input
              id="ticket_number"
              value={formData.ticket_number}
              onChange={(e) =>
                setFormData({ ...formData, ticket_number: e.target.value })
              }
              required
              placeholder="Enter ticket number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="flight">Flight (Optional)</Label>
            <Select
              value={formData.flight?.toString() || 'none'}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  flight: value === 'none' ? null : Number.parseInt(value)
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a flight" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No flight assigned</SelectItem>
                {flights.map((flight) => (
                  <SelectItem key={flight.id} value={flight.id}>
                    {flight.callsign} - {flight.aircraftType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity_gallons">Quantity (Gallons) *</Label>
              <Input
                id="quantity_gallons"
                type="number"
                step="0.01"
                value={formData.quantity_gallons}
                onChange={(e) =>
                  setFormData({ ...formData, quantity_gallons: e.target.value })
                }
                required
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity_lbs">Quantity (Lbs) *</Label>
              <Input
                id="quantity_lbs"
                type="number"
                step="0.01"
                value={formData.quantity_lbs}
                onChange={(e) =>
                  setFormData({ ...formData, quantity_lbs: e.target.value })
                }
                required
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="density">Density (lbs/gal)</Label>
            <Input
              id="density"
              type="number"
              step="0.0001"
              value={formData.density}
              onChange={(e) =>
                setFormData({ ...formData, density: e.target.value })
              }
              placeholder="Auto-calculated"
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              Density is automatically calculated from gallons and lbs
            </p>
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
              {loading ? 'Saving...' : transaction ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
