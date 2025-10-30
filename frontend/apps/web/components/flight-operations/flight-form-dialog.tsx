"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@frontend/ui/components/ui/dialog"
import { Button } from "@frontend/ui/components/ui/button"
import { Input } from "@frontend/ui/components/ui/input"
import { Label } from "@frontend/ui/components/ui/label"
import { Textarea } from "@frontend/ui/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@frontend/ui/components/ui/select"
import { Checkbox } from "@frontend/ui/components/ui/checkbox"
import type { Flight } from "./types"

function calculateGroundTime(arrivalTime: string, departureTime: string): string {
  if (!arrivalTime || !departureTime) return "N/A"

  const [arrHour, arrMin] = arrivalTime.split(':').map(Number)
  const [depHour, depMin] = departureTime.split(':').map(Number)

  let totalMinutes = (depHour * 60 + depMin) - (arrHour * 60 + arrMin)

  // Handle overnight case (departure is next day)
  if (totalMinutes < 0) {
    totalMinutes += 24 * 60 // Add 24 hours
  }

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) {
    return `${minutes}m`
  }
  return `${hours}h ${minutes}m`
}

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
    scheduledDate: new Date().toISOString().split('T')[0], // Default to today
  })
  const [arrivalTime, setArrivalTime] = useState("")
  const [departureTime, setDepartureTime] = useState("")

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        scheduledDate: initialData.scheduledDate || new Date().toISOString().split('T')[0]
      })
      // Initialize arrival and departure times from initial data
      if (initialData.type === "arrival" || initialData.type === "quick_turn" || initialData.type === "overnight" || initialData.type === "long_term") {
        setArrivalTime(initialData.scheduledTime || "")
      }
      if (initialData.type === "departure" || initialData.type === "quick_turn" || initialData.type === "overnight" || initialData.type === "long_term") {
        setDepartureTime(initialData.scheduledTime || "")
      }
    } else {
      setFormData({
        type: "arrival",
        status: "scheduled",
        services: [],
        source: "manual",
        scheduledDate: new Date().toISOString().split('T')[0],
      })
      setArrivalTime("")
      setDepartureTime("")
    }
  }, [initialData, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Determine which time to use as scheduledTime based on flight type
    let scheduledTime = ""
    if (formData.type === "arrival" || formData.type === "quick_turn" || formData.type === "overnight" || formData.type === "long_term") {
      scheduledTime = arrivalTime
    } else if (formData.type === "departure") {
      scheduledTime = departureTime
    }

    const flight: Flight = {
      id: initialData?.id || `manual-${Date.now()}`,
      tailNumber: formData.tailNumber || "",
      aircraftType: formData.aircraftType || "",
      type: formData.type as Flight["type"],
      status: formData.status as Flight["status"],
      scheduledTime,
      scheduledDate: formData.scheduledDate,
      actualTime: formData.actualTime,
      origin: formData.origin,
      destination: formData.destination,
      pilot: formData.pilot,
      services: formData.services || [],
      notes: formData.notes,
      source: "manual",
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
                  <SelectItem value="quick_turn">Quick Turn</SelectItem>
                  <SelectItem value="overnight">Overnight</SelectItem>
                  <SelectItem value="long_term">Long Term</SelectItem>
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

          <div className="space-y-2">
            <Label htmlFor="scheduledDate" className="text-card-foreground">
              Date *
            </Label>
            <Input
              id="scheduledDate"
              type="date"
              value={formData.scheduledDate || ""}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              required
              className="bg-background border-border text-foreground"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-card-foreground">Ground Time (24hr) *</Label>
            <div className="rounded-lg border border-border p-4 bg-muted/20 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="arrivalTime" className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-success"></span>
                    Arrival Time
                  </Label>
                  <Input
                    id="arrivalTime"
                    type="time"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    disabled={formData.type === "departure"}
                    required={formData.type === "arrival" || formData.type === "quick_turn" || formData.type === "overnight" || formData.type === "long_term"}
                    className="bg-background border-border text-foreground disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departureTime" className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-accent"></span>
                    Departure Time
                  </Label>
                  <Input
                    id="departureTime"
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    disabled={formData.type === "arrival"}
                    required={formData.type === "departure" || formData.type === "quick_turn" || formData.type === "overnight" || formData.type === "long_term"}
                    className="bg-background border-border text-foreground disabled:opacity-50"
                  />
                </div>
              </div>

              {arrivalTime && departureTime && (
                <div className="text-sm text-muted-foreground text-center pt-2 border-t border-border">
                  Ground time: {calculateGroundTime(arrivalTime, departureTime)}
                </div>
              )}
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
