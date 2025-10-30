"use client"

import { Badge } from "@frontend/ui/components/ui/badge"
import { Card } from "@frontend/ui/components/ui/card"
import { Button } from "@frontend/ui/components/ui/button"
import {
  Plane,
  Clock,
  MapPin,
  User,
  Fuel,
  Warehouse,
  UtensilsCrossed,
  Wrench,
  Car,
  AlertCircle,
  Pencil,
  Trash2,
} from "lucide-react"
import { cn } from "@frontend/ui/lib/utils"
import { useState } from "react"
import { FlightFormDialog } from "./flight-form-dialog"
import type { Flight } from "./types"

interface FlightCardProps {
  flight: Flight
  theme: "dark" | "light"
  onEdit: (flight: Flight) => void
  onDelete: (id: string) => void
}

const statusConfig = {
  scheduled: { label: "Scheduled", color: "bg-muted text-muted-foreground" },
  "en-route": { label: "En Route", color: "bg-accent text-accent-foreground" },
  arrived: { label: "Arrived", color: "bg-success text-success-foreground" },
  departed: { label: "Departed", color: "bg-accent text-accent-foreground" },
  delayed: { label: "Delayed", color: "bg-warning text-warning-foreground" },
  cancelled: { label: "Cancelled", color: "bg-destructive text-destructive-foreground" },
}

const serviceIcons = {
  fuel: Fuel,
  hangar: Warehouse,
  catering: UtensilsCrossed,
  maintenance: Wrench,
  ground_transport: Car,
}

export function FlightCard({ flight, theme, onEdit, onDelete }: FlightCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const status = statusConfig[flight.status]
  const isArrival = flight.type === "arrival"

  return (
    <>
      <Card className="bg-card border-border hover:bg-card/90 p-4 transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Plane className={cn("w-5 h-5", isArrival ? "text-success" : "text-accent")} />
                <span className="text-xl font-bold font-mono text-foreground">{flight.tailNumber}</span>
              </div>
              <span className="text-muted-foreground">{flight.aircraftType}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {isArrival ? (
                  <>
                    From <span className="font-semibold text-foreground">{flight.origin}</span>
                  </>
                ) : (
                  <>
                    To <span className="font-semibold text-foreground">{flight.destination}</span>
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{isArrival ? "ETA" : "ETD"}:</span>
                <span className="font-semibold font-mono text-foreground">{flight.scheduledTime}</span>
              </div>
              {flight.actualTime && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Actual:</span>
                  <span className="font-semibold text-success font-mono">{flight.actualTime}</span>
                </div>
              )}
            </div>

            {flight.pilot && (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Pilot:</span>
                <span className="text-foreground">{flight.pilot}</span>
              </div>
            )}

            {flight.services.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {flight.services.map((service) => {
                  const Icon = serviceIcons[service as keyof typeof serviceIcons]
                  return (
                    <div
                      key={service}
                      className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted border-border border"
                    >
                      {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground" />}
                      <span className="text-xs capitalize text-muted-foreground">{service.replace("_", " ")}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {flight.notes && (
              <div className="flex items-start gap-2 text-sm p-2 rounded border bg-warning/10 border-warning/20">
                <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                <span className="text-foreground">{flight.notes}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge className={cn("font-semibold", status.color)}>{status.label}</Badge>
            {flight.source && (
              <span className="text-xs uppercase tracking-wide text-muted-foreground">{flight.source}</span>
            )}
            <div className="flex gap-1 mt-2">
              <Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(true)} className="h-8 w-8">
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(flight.id)}
                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <FlightFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={onEdit}
        initialData={flight}
        theme={theme}
      />
    </>
  )
}
