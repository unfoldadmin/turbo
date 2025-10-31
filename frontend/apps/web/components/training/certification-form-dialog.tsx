'use client'

import type {
  Fueler,
  FuelerTraining,
  FuelerTrainingRequest,
  Training
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
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { getApiClient } from '../../lib/api'

interface CertificationFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  certification?: FuelerTraining | null
  onSubmit: (data: FuelerTrainingRequest) => Promise<void>
}

export function CertificationFormDialog({
  open,
  onOpenChange,
  certification,
  onSubmit
}: CertificationFormDialogProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [fuelers, setFuelers] = useState<Fueler[]>([])
  const [trainings, setTrainings] = useState<Training[]>([])
  const [formData, setFormData] = useState<FuelerTrainingRequest>({
    fueler: 0,
    training: 0,
    completed_date: '',
    expiry_date: '',
    certified_by: null
  })

  // Fetch fuelers and training types when dialog opens
  useEffect(() => {
    if (open && session) {
      fetchDropdownData()
    }
  }, [open, session])

  const fetchDropdownData = async () => {
    try {
      const client = await getApiClient(session)
      const [fuelersResponse, trainingsResponse] = await Promise.all([
        client.fuelers.fuelersList(),
        client.trainings.trainingsList()
      ])
      setFuelers(fuelersResponse.results || [])
      setTrainings(trainingsResponse.results || [])
    } catch (err) {
      console.error('Failed to fetch dropdown data:', err)
    }
  }

  useEffect(() => {
    if (certification) {
      setFormData({
        fueler: certification.fueler,
        training: certification.training,
        completed_date: certification.completed_date,
        expiry_date: certification.expiry_date,
        certified_by: certification.certified_by
      })
    } else {
      setFormData({
        fueler: 0,
        training: 0,
        completed_date: '',
        expiry_date: '',
        certified_by: null
      })
    }
  }, [certification, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(formData)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save certification:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {certification ? 'Edit Certification' : 'Create Certification'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fueler">Fueler *</Label>
            <Select
              value={formData.fueler.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, fueler: Number.parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a fueler" />
              </SelectTrigger>
              <SelectContent>
                {fuelers.map((fueler) => (
                  <SelectItem key={fueler.id} value={fueler.id.toString()}>
                    {fueler.fueler_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="training">Training Type *</Label>
            <Select
              value={formData.training.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, training: Number.parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select training type" />
              </SelectTrigger>
              <SelectContent>
                {trainings.map((training) => (
                  <SelectItem key={training.id} value={training.id.toString()}>
                    {training.training_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="completed_date">Completed Date *</Label>
              <Input
                id="completed_date"
                type="date"
                value={formData.completed_date}
                onChange={(e) =>
                  setFormData({ ...formData, completed_date: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiry_date">Expiry Date *</Label>
              <Input
                id="expiry_date"
                type="date"
                value={formData.expiry_date}
                onChange={(e) =>
                  setFormData({ ...formData, expiry_date: e.target.value })
                }
                required
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
            <Button
              type="submit"
              disabled={
                loading || formData.fueler === 0 || formData.training === 0
              }
            >
              {loading ? 'Saving...' : certification ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
