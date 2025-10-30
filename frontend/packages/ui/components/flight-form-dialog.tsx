"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { Flight } from "@/lib/types"

interface FlightFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (flight: Flight) => void
  initialData?: Flight
  theme: "dark" | "light"
}

export function FlightFormDialog({ open, onOpenChange, onSubmit, initialData, theme }: FlightFormDialogProps) {
  const [formData, setFormData] = useState<Partial<Flight>>({
    type: "arrival",
    status: "scheduled",
    services: [],
    source: "manual",
  })

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      setFormData({
        type: "arrival",
        status: "scheduled",
        services: [],
        source: "manual",
      })
    }
  }, [initialData, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const flight: Flight = {
      id: initialData?.id || `manual-${Date.now()}`,
      tailNumber: formData.tailNumber || "",
      aircraftType: formData.aircraftType || "",
      type: formData.type as "arrival" | "departure",
      status: formData.status as Flight["status"],
      scheduledTime: formData.scheduledTime || "",
      actualTime: formData.actualTime,
      origin: formData.origin,
      destination: formData.destination,
      pilot: formData.pilot,
      services: formData.services || [],
      notes: formData.notes,
      source: "manual",
    }
    onSubmit(flight)
    onOpenChange(false)
  }

  const services = ["fuel", "hangar", "catering", "maintenance", "ground_transport"]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">{initialData ? "Edit Flight" : "Add New Flight"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tailNumber" className="text-card-foreground">
                Tail Number *
              </Label>
              <Input
                id="tailNumber"
                value={formData.tailNumber || ""}
                onChange={(e) => setFormData({ ...formData, tailNumber: e.target.value })}
                required
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aircraftType" className="text-card-foreground">
                Aircraft Type *
              </Label>
              <Input
                id="aircraftType"
                value={formData.aircraftType || ""}
                onChange={(e) => setFormData({ ...formData, aircraftType: e.target.value })}
                required
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-card-foreground">
                Type *
              </Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border text-foreground">
                  <SelectItem value="arrival">Arrival</SelectItem>
                  <SelectItem value="departure">Departure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-card-foreground">
                Status *
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
              >
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-border text-foreground">
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="en-route">En Route</SelectItem>
                  <SelectItem value="arrived">Arrived</SelectItem>
                  <SelectItem value="departed">Departed</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledTime" className="text-card-foreground">
                Scheduled Time *
              </Label>
              <Input
                id="scheduledTime"
                type="time"
                value={formData.scheduledTime || ""}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                required
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actualTime" className="text-card-foreground">
                Actual Time
              </Label>
              <Input
                id="actualTime"
                type="time"
                value={formData.actualTime || ""}
                onChange={(e) => setFormData({ ...formData, actualTime: e.target.value })}
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin" className="text-card-foreground">
                Origin
              </Label>
              <Input
                id="origin"
                value={formData.origin || ""}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                placeholder="ICAO code"
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination" className="text-card-foreground">
                Destination
              </Label>
              <Input
                id="destination"
                value={formData.destination || ""}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                placeholder="ICAO code"
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pilot" className="text-card-foreground">
              Pilot
            </Label>
            <Input
              id="pilot"
              value={formData.pilot || ""}
              onChange={(e) => setFormData({ ...formData, pilot: e.target.value })}
              className="bg-background border-border text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-card-foreground">Services</Label>
            <div className="grid grid-cols-2 gap-3">
              {services.map((service) => (
                <div key={service} className="flex items-center space-x-2">
                  <Checkbox
                    id={service}
                    checked={formData.services?.includes(service)}
                    onCheckedChange={(checked) => {
                      const newServices = checked
                        ? [...(formData.services || []), service]
                        : (formData.services || []).filter((s) => s !== service)
                      setFormData({ ...formData, services: newServices })
                    }}
                  />
                  <label htmlFor={service} className={`text-sm capitalize cursor-pointer text-card-foreground`}>
                    {service.replace("_", " ")}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-card-foreground">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="bg-background border-border text-foreground"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {initialData ? "Update Flight" : "Add Flight"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
