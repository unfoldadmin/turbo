'use client'

import { Badge } from '@frontend/ui/components/ui/badge'
import { Button } from '@frontend/ui/components/ui/button'
import { Card } from '@frontend/ui/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@frontend/ui/components/ui/dropdown-menu'
import { Input } from '@frontend/ui/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@frontend/ui/components/ui/tooltip'
import { cn } from '@frontend/ui/lib/utils'
import {
  AlertCircle,
  ArrowLeftRight,
  Car,
  Check,
  Clock,
  Coffee as CoffeeIcon,
  Droplet,
  Fuel as FuelIcon,
  MapPin,
  Pencil,
  Plane,
  Plus,
  Snowflake,
  Trash2,
  User,
  Users,
  UtensilsCrossed,
  Warehouse,
  Wind,
  X,
  Zap
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { FlightFormDialog } from './flight-form-dialog'
import type { Flight } from './types'

// Calculate time remaining until a timestamp
function getTimeRemaining(timestamp: string): {
  text: string
  isUrgent: boolean
} {
  const now = new Date()
  const target = new Date(timestamp)
  const diffMs = target.getTime() - now.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffMinutes < 0) {
    return { text: '', isUrgent: false } // Past events don't show countdown
  }

  if (diffMinutes < 60) {
    return { text: `in ${diffMinutes}m`, isUrgent: true }
  }

  const diffHours = Math.floor(diffMinutes / 60)
  const remainingMinutes = diffMinutes % 60

  if (diffHours < 24) {
    return { text: `in ${diffHours}h ${remainingMinutes}m`, isUrgent: false }
  }

  const diffDays = Math.floor(diffHours / 24)
  return { text: `in ${diffDays}d`, isUrgent: false }
}

interface FlightCardProps {
  flight: Flight
  theme: 'dark' | 'light'
  onEdit: (flight: Flight) => void
  onDelete: (id: string) => void
  isLinked?: boolean
  linkColor?: string
  isHovered?: boolean
  onHover?: (id: string | null) => void
}

const statusConfig = {
  scheduled: {
    label: 'Scheduled',
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
  },
  'en-route': {
    label: 'En Route',
    color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
  },
  arrived: {
    label: 'Arrived',
    color: 'bg-green-500/10 text-green-500 border-green-500/20'
  },
  departed: {
    label: 'Departed',
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
  },
  delayed: {
    label: 'Delayed',
    color: 'bg-orange-500/10 text-orange-500 border-orange-500/20'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-500/10 text-red-500 border-red-500/20'
  }
}

const serviceConfig = {
  fuel: {
    label: 'Fuel',
    icon: FuelIcon,
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
  },
  hangar: {
    label: 'Hangar',
    icon: Warehouse,
    color: 'bg-slate-500/10 text-slate-500 border-slate-500/20'
  },
  catering: {
    label: 'Catering',
    icon: UtensilsCrossed,
    color: 'bg-green-500/10 text-green-500 border-green-500/20'
  },
  gpu: {
    label: 'GPU',
    icon: Zap,
    color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
  },
  lav: {
    label: 'Lav',
    icon: Droplet,
    color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
  },
  oxygen: {
    label: 'Oxygen',
    icon: Wind,
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
  },
  courtesy_car: {
    label: 'Courtesy Car',
    icon: Car,
    color: 'bg-orange-500/10 text-orange-500 border-orange-500/20'
  },
  rental_car: {
    label: 'Rental Car',
    icon: Car,
    color: 'bg-rose-500/10 text-rose-500 border-rose-500/20'
  },
  passengers: {
    label: 'Passengers',
    icon: Users,
    color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
  },
  coffee: {
    label: 'Coffee',
    icon: CoffeeIcon,
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
  },
  ice: {
    label: 'Ice',
    icon: Snowflake,
    color: 'bg-sky-500/10 text-sky-500 border-sky-500/20'
  },
  dishes: {
    label: 'Dishes',
    icon: UtensilsCrossed,
    color: 'bg-teal-500/10 text-teal-500 border-teal-500/20'
  }
}

const availableServices = Object.keys(serviceConfig) as Array<
  keyof typeof serviceConfig
>

export function FlightCard({
  flight,
  theme,
  onEdit,
  onDelete,
  isLinked,
  linkColor,
  isHovered,
  onHover
}: FlightCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isEditingServices, setIsEditingServices] = useState(false)
  const [fuelOrder, setFuelOrder] = useState('')
  const [isFueled, setIsFueled] = useState(false)
  const [isWaitAdvise, setIsWaitAdvise] = useState(false)
  const [passengerCount, setPassengerCount] = useState(
    flight.passengers?.toString() || ''
  )
  const [localServices, setLocalServices] = useState<string[]>(flight.services)
  const [localNotes, setLocalNotes] = useState(flight.notes || '')
  const [countdown, setCountdown] = useState<{
    text: string
    isUrgent: boolean
  }>({ text: '', isUrgent: false })

  const status = statusConfig[flight.status]
  const isArrival =
    flight.type === 'arrival' ||
    flight.type === 'quick_turn' ||
    flight.type === 'overnight' ||
    flight.type === 'long_term'
  const isDeparture =
    flight.type === 'departure' ||
    flight.type === 'quick_turn' ||
    flight.type === 'overnight' ||
    flight.type === 'long_term'

  // Update countdown every minute
  useEffect(() => {
    const updateCountdown = () => {
      const primaryTimestamp = isArrival
        ? flight.arrivalTime
        : flight.departureTime
      if (primaryTimestamp) {
        setCountdown(getTimeRemaining(primaryTimestamp))
      }
    }

    updateCountdown() // Initial update
    const interval = setInterval(updateCountdown, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [flight.arrivalTime, flight.departureTime, isArrival])

  const toggleService = (service: string) => {
    setLocalServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    )
  }

  const saveChanges = () => {
    onEdit({
      ...flight,
      services: localServices,
      notes: localNotes,
      passengers: passengerCount ? Number.parseInt(passengerCount) : undefined
    })
    setIsEditingServices(false)
  }

  // Format timestamp for display
  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return ''
    const d = new Date(timestamp)
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const day = d.getDate().toString().padStart(2, '0')
    const hours = d.getHours().toString().padStart(2, '0')
    const minutes = d.getMinutes().toString().padStart(2, '0')
    return `${month}/${day} ${hours}:${minutes}`
  }

  return (
    <>
      <Card
        className={cn(
          'bg-card border-border hover:border-primary/20 transition-all relative',
          isLinked && linkColor && `border-l-4 ${linkColor}`,
          isHovered && 'ring-2 ring-offset-2 ring-primary/50'
        )}
        onMouseEnter={() => onHover?.(flight.id)}
        onMouseLeave={() => onHover?.(null)}
      >
        <div className="p-1.5 space-y-1.5">
          {/* Header with tail number, aircraft type, and status */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Plane
                className={cn(
                  'w-4 h-4',
                  isArrival ? 'text-green-500' : 'text-blue-500'
                )}
              />
              <span className="text-lg font-bold font-mono text-foreground">
                {flight.tailNumber}
              </span>
              {isLinked && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'p-0.5 rounded',
                          linkColor
                            ?.replace('border-l-', 'bg-')
                            .replace('/60', '/20')
                        )}
                      >
                        <ArrowLeftRight
                          className={cn(
                            'w-3 h-3',
                            linkColor
                              ?.replace('border-l-', 'text-')
                              .replace('/60', '')
                          )}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        Linked flight (arrival & departure)
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <span className="text-sm text-muted-foreground">
                {flight.aircraftType}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Badge
                    className={cn(
                      'text-xs font-medium px-2 py-0.5 cursor-pointer hover:opacity-80 transition-opacity',
                      status.color
                    )}
                  >
                    {status.label}
                  </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {(
                    Object.keys(statusConfig) as Array<
                      keyof typeof statusConfig
                    >
                  ).map((statusKey) => (
                    <DropdownMenuItem
                      key={statusKey}
                      onClick={() => {
                        onEdit({
                          ...flight,
                          status: statusKey
                        })
                      }}
                      className="text-xs"
                    >
                      <span
                        className={cn(
                          'inline-block w-2 h-2 rounded-full mr-2',
                          statusConfig[statusKey].color
                        )}
                      />
                      {statusConfig[statusKey].label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Origin/Destination */}
          {isArrival && flight.origin && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">From</span>
              <span className="font-semibold text-foreground">
                {flight.origin}
              </span>
            </div>
          )}
          {isDeparture && flight.destination && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">To</span>
              <span className="font-semibold text-foreground">
                {flight.destination}
              </span>
            </div>
          )}

          {/* Contact Name (optional) */}
          {flight.contactName && (
            <div className="flex items-center gap-2 text-sm">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Contact:</span>
              <span className="text-foreground">{flight.contactName}</span>
            </div>
          )}

          {/* Contact Notes (optional) */}
          {flight.contactNotes && (
            <div className="flex items-start gap-1.5 text-xs p-1.5 rounded border bg-blue-500/10 border-blue-500/20">
              <User className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-foreground">{flight.contactNotes}</span>
            </div>
          )}

          {/* Fuel Section */}
          {localServices.includes('fuel') && (
            <div className="space-y-1.5 pt-1.5 border-t border-border">
              <div className="flex items-center gap-2">
                <FuelIcon className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs font-semibold text-foreground">
                  Fuel Order
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="W/A"
                  value={fuelOrder}
                  onChange={(e) => setFuelOrder(e.target.value)}
                  className="text-xs h-7"
                />
                <Button
                  size="sm"
                  variant={isFueled ? 'default' : 'outline'}
                  onClick={() => setIsFueled(!isFueled)}
                  className="h-7 text-xs"
                >
                  {isFueled ? <Check className="w-3 h-3 mr-1" /> : null}
                  Fueled
                </Button>
                <Button
                  size="sm"
                  variant={isWaitAdvise ? 'secondary' : 'outline'}
                  onClick={() => setIsWaitAdvise(!isWaitAdvise)}
                  className="h-7 text-xs px-2"
                >
                  W/A
                </Button>
              </div>
            </div>
          )}

          {/* Passenger Count Section */}
          {localServices.includes('passengers') && (
            <div className="space-y-1.5 pt-1.5 border-t border-border">
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-xs font-semibold text-foreground">
                  Passengers
                </span>
              </div>
              <Input
                type="number"
                placeholder="Count"
                value={passengerCount}
                onChange={(e) => setPassengerCount(e.target.value)}
                onBlur={saveChanges}
                className="text-xs h-7 w-20"
                min="0"
              />
            </div>
          )}

          {/* Services */}
          {isEditingServices ? (
            <div className="space-y-1.5 pt-1.5 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  Services
                </span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={saveChanges}
                    className="h-6 text-xs px-2"
                  >
                    <Check className="w-3 h-3 mr-0.5" /> Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setLocalServices(flight.services)
                      setIsEditingServices(false)
                    }}
                    className="h-6 text-xs px-2"
                  >
                    <X className="w-3 h-3 mr-0.5" /> Cancel
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {availableServices.map((serviceKey) => {
                  const service = serviceConfig[serviceKey]
                  const Icon = service.icon
                  const isSelected = localServices.includes(serviceKey)
                  return (
                    <button
                      key={serviceKey}
                      onClick={() => toggleService(serviceKey)}
                      className={cn(
                        'flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] border transition-all',
                        isSelected
                          ? service.color
                          : 'bg-muted/30 text-muted-foreground border-border hover:border-primary/40'
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      {service.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <>
              {localServices.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1.5 border-t border-border">
                  {localServices.map((serviceKey) => {
                    const service =
                      serviceConfig[serviceKey as keyof typeof serviceConfig]
                    if (!service) return null
                    const Icon = service.icon
                    return (
                      <div
                        key={serviceKey}
                        className={cn(
                          'flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] border',
                          service.color
                        )}
                      >
                        <Icon className="w-3 h-3" />
                        {service.label}
                      </div>
                    )
                  })}
                  <button
                    onClick={() => setIsEditingServices(true)}
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] border border-dashed border-primary/40 text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                </div>
              )}
              {localServices.length === 0 && (
                <button
                  onClick={() => setIsEditingServices(true)}
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] border border-dashed border-primary/40 text-primary hover:bg-primary/10 transition-colors mt-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Services
                </button>
              )}
            </>
          )}

          {/* Notes */}
          {localNotes && (
            <div className="flex items-start gap-1.5 text-[11px] p-1.5 rounded border bg-yellow-500/10 border-yellow-500/20 mt-1.5">
              <AlertCircle className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
              <span className="text-foreground">{localNotes}</span>
            </div>
          )}

          {/* Time Display with Countdown - Above divider, left of badges */}
          <div className="flex items-center justify-between pt-1.5 border-t border-border">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">
                {isArrival ? 'ETA:' : 'ETD:'}
              </span>
              <span className="font-bold font-mono text-foreground">
                {formatTimestamp(
                  isArrival ? flight.arrivalTime : flight.departureTime
                )}
              </span>
              {countdown.text && (
                <span
                  className={cn(
                    'text-xs font-medium',
                    countdown.isUrgent
                      ? 'text-red-500'
                      : 'text-muted-foreground'
                  )}
                >
                  {countdown.text}
                </span>
              )}
            </div>

            {/* Creator and Source Badges - Right side */}
            <div className="flex items-center gap-1.5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-semibold px-1.5 py-0 cursor-help bg-muted/50 hover:bg-muted"
                    >
                      {flight.createdBy.initials}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      <div className="font-semibold">
                        {flight.createdBy.name}
                      </div>
                      <div className="text-muted-foreground">
                        {flight.createdBy.department}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Badge
                variant="secondary"
                className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0"
              >
                {flight.source === 'qt'
                  ? 'QT'
                  : flight.source === 'front-desk'
                    ? 'FD'
                    : flight.source === 'line-department'
                      ? 'LD'
                      : 'GC'}
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-1 pt-1.5 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
              className="h-6 text-xs flex-1"
            >
              <Pencil className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(flight.id)}
              className="h-6 text-xs text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
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
