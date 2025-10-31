'use client'

import type React from 'react'

import { Button } from '@frontend/ui/components/ui/button'
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  PlaneLanding,
  PlaneTakeoff,
  Plus
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FlightFormDialog } from './flight-form-dialog'
import type { FlightFilters as FilterType, Flight } from './types'

interface CalendarWeekViewProps {
  theme: 'dark' | 'light'
  flights: Flight[]
  onEditFlight: (flight: Flight) => void
  onDeleteFlight: (id: string) => void
  filters: FilterType
}

// Helper to get the primary timestamp for a flight (arrival for arrivals, departure for departures)
function getPrimaryTimestamp(flight: Flight): string {
  if (flight.type === 'departure') {
    return flight.departureTime
  }
  return flight.arrivalTime || flight.departureTime
}

// Helper to extract date from timestamp in YYYY-MM-DD format (local timezone)
function getDateFromTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Helper to extract time from timestamp in HH:mm format (local timezone)
function getTimeFromTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export function CalendarWeekView({
  theme,
  flights,
  onEditFlight,
  filters
}: CalendarWeekViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [weekOffset, setWeekOffset] = useState(0) // 0 = current week, -1 = last week, 1 = next week, etc.
  const MIN_WEEK_OFFSET = -2 // Can go back 2 weeks
  const MAX_WEEK_OFFSET = 2 // Can go forward 2 weeks

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null)

  const [draggedFlight, setDraggedFlight] = useState<Flight | null>(null)
  const [dragStartY, setDragStartY] = useState(0)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartTime, setDragStartTime] = useState('')
  const [dragStartDate, setDragStartDate] = useState('')
  const [tempDragTime, setTempDragTime] = useState('')
  const [tempDragDate, setTempDragDate] = useState('')

  // Removed resize functionality since we no longer have duration field

  const [hoveredSlot, setHoveredSlot] = useState<{
    day: string
    time: string
  } | null>(null)
  const [showAddButton, setShowAddButton] = useState(false)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 2
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false)
    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [])

  const weekDays = useMemo(() => {
    const days = []
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() + weekOffset * 7)

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      days.push(date)
    }
    return days
  }, [weekOffset])

  const timeSlots = useMemo(() => {
    const slots = []
    for (let hour = 0; hour <= 23; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
    }
    return slots
  }, [])

  const filteredFlights = useMemo(() => {
    return flights.filter((flight) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          flight.tailNumber.toLowerCase().includes(searchLower) ||
          flight.aircraftType.toLowerCase().includes(searchLower) ||
          flight.origin?.toLowerCase().includes(searchLower) ||
          flight.destination?.toLowerCase().includes(searchLower) ||
          flight.contactName?.toLowerCase().includes(searchLower)

        if (!matchesSearch) return false
      }

      if (filters.status !== 'all' && flight.status !== filters.status) {
        return false
      }

      if (filters.services.length > 0) {
        const hasAllServices = filters.services.every((service) =>
          flight.services.includes(service)
        )
        if (!hasAllServices) return false
      }

      return true
    })
  }, [filters, flights])

  const getStatusColor = (status: Flight['status']) => {
    switch (status) {
      case 'arrived':
        return theme === 'dark'
          ? 'bg-green-600/20 border-green-500 text-green-300'
          : 'bg-green-100 border-green-600 text-green-900'
      case 'departed':
        return theme === 'dark'
          ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300'
          : 'bg-cyan-100 border-cyan-600 text-cyan-900'
      case 'en-route':
        return theme === 'dark'
          ? 'bg-sky-600/20 border-sky-500 text-sky-300'
          : 'bg-sky-100 border-sky-600 text-sky-900'
      case 'scheduled':
        return theme === 'dark'
          ? 'bg-slate-600/20 border-slate-500 text-slate-300'
          : 'bg-slate-100 border-slate-600 text-slate-900'
      case 'delayed':
        return theme === 'dark'
          ? 'bg-yellow-600/20 border-yellow-500 text-yellow-300'
          : 'bg-yellow-100 border-yellow-600 text-yellow-900'
      case 'cancelled':
        return theme === 'dark'
          ? 'bg-red-600/20 border-red-500 text-red-300'
          : 'bg-red-100 border-red-600 text-red-900'
    }
  }

  const getFlightPosition = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes
    const startMinutes = 6 * 60
    const pixelsPerMinute = 80 / 60
    return (totalMinutes - startMinutes) * pixelsPerMinute
  }

  const snapToQuarterHour = (minutes: number) => {
    return Math.round(minutes / 15) * 15
  }

  const getTimeFromPosition = (yPosition: number) => {
    const pixelsPerMinute = 80 / 60
    const minutesFromStart = yPosition / pixelsPerMinute
    const totalMinutes = 6 * 60 + snapToQuarterHour(minutesFromStart)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  const getDayIndexFromPosition = (clientX: number) => {
    if (!scrollContainerRef.current) return 0
    const rect = scrollContainerRef.current.getBoundingClientRect()
    const relativeX =
      clientX - rect.left + scrollContainerRef.current.scrollLeft
    const timeColumnWidth = 80
    const dayColumnWidth =
      (scrollContainerRef.current.scrollWidth - timeColumnWidth) / 7
    const dayIndex = Math.floor((relativeX - timeColumnWidth) / dayColumnWidth)
    return Math.max(0, Math.min(6, dayIndex))
  }

  const handleFlightDragStart = (e: React.MouseEvent, flight: Flight) => {
    e.stopPropagation()
    setDraggedFlight(flight)
    setDragStartY(e.clientY)
    setDragStartX(e.clientX)

    // Extract time and date from the primary timestamp
    const primaryTimestamp = getPrimaryTimestamp(flight)
    const startTime = getTimeFromTimestamp(primaryTimestamp)
    const startDate = getDateFromTimestamp(primaryTimestamp)

    setDragStartTime(startTime)
    setDragStartDate(startDate)
    setTempDragTime(startTime)
    setTempDragDate(startDate)
  }

  const handleFlightDragMove = (e: React.MouseEvent) => {
    if (!draggedFlight || !scrollContainerRef.current) return
    e.preventDefault()

    const deltaY = e.clientY - dragStartY
    const currentPosition = getFlightPosition(dragStartTime)
    const newPosition = Math.max(0, currentPosition + deltaY)
    const newTime = getTimeFromPosition(newPosition)

    const newDayIndex = getDayIndexFromPosition(e.clientX)
    const originalDayIndex = getDayIndexFromPosition(dragStartX)
    const dayDelta = newDayIndex - originalDayIndex

    const originalDate = new Date(dragStartDate)
    const newDate = new Date(originalDate)
    newDate.setDate(originalDate.getDate() + dayDelta)
    const newDateString = newDate.toISOString().split('T')[0]

    // Store temporary position for rendering, don't save to DB yet
    setTempDragTime(newTime)
    setTempDragDate(newDateString)
  }

  const handleFlightDragEnd = () => {
    console.log('handleFlightDragEnd called', {
      draggedFlight,
      tempDragTime,
      dragStartTime,
      tempDragDate,
      dragStartDate,
      changed: tempDragTime !== dragStartTime || tempDragDate !== dragStartDate
    })

    if (
      draggedFlight &&
      (tempDragTime !== dragStartTime || tempDragDate !== dragStartDate)
    ) {
      // Only save to DB if position actually changed
      // Construct new timestamp from date and time
      const newTimestamp = `${tempDragDate}T${tempDragTime}:00`

      const updatedFlight = {
        ...draggedFlight
      }

      // Update the appropriate timestamp based on flight type
      if (
        draggedFlight.type === 'arrival' ||
        draggedFlight.type === 'quick_turn'
      ) {
        updatedFlight.arrivalTime = newTimestamp
      }
      if (
        draggedFlight.type === 'departure' ||
        draggedFlight.type === 'quick_turn'
      ) {
        updatedFlight.departureTime = newTimestamp
      }

      console.log('Calling onEditFlight with:', updatedFlight)
      console.log('onEditFlight function:', onEditFlight)

      try {
        onEditFlight(updatedFlight)
        console.log('onEditFlight call completed (not awaited)')
      } catch (error) {
        console.error('Error calling onEditFlight:', error)
      }
    }
    setDraggedFlight(null)
    setTempDragTime('')
    setTempDragDate('')
  }

  // Resize handlers removed - no longer needed without duration field

  const handleSlotHover = (day: string, time: string) => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }

    setHoveredSlot({ day, time })
    setShowAddButton(false)

    // Show + button after 200ms
    hoverTimeoutRef.current = setTimeout(() => {
      setShowAddButton(true)
    }, 200)
  }

  const handleSlotLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    setHoveredSlot(null)
    setShowAddButton(false)
  }

  const handleCreateFlightAtSlot = (
    day: string,
    time: string,
    type: 'arrival' | 'departure'
  ) => {
    // Create a new flight object with the clicked time and date
    const timestamp = `${day}T${time}:00`

    const newFlight: Partial<Flight> = {
      type,
      tailNumber: '',
      aircraftType: '',
      status: 'scheduled'
    }

    // Set the appropriate timestamp based on type
    if (type === 'arrival') {
      newFlight.arrivalTime = timestamp
      // For arrivals, we still need a departure_time (required by DB), set it 45 min after arrival
      const arrivalDate = new Date(timestamp)
      arrivalDate.setMinutes(arrivalDate.getMinutes() + 45)
      newFlight.departureTime = arrivalDate.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:mm
    } else {
      newFlight.departureTime = timestamp
    }

    // Open the edit dialog with this new flight
    setEditingFlight(newFlight as Flight)
    setEditDialogOpen(true)
    handleSlotLeave()
  }

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (draggedFlight) {
        handleFlightDragMove(e as any)
      }
    }

    const handleGlobalMouseUpForDrag = () => {
      if (draggedFlight) handleFlightDragEnd()
    }

    window.addEventListener('mousemove', handleGlobalMouseMove)
    window.addEventListener('mouseup', handleGlobalMouseUpForDrag)

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove)
      window.removeEventListener('mouseup', handleGlobalMouseUpForDrag)
    }
  }, [
    draggedFlight,
    dragStartY,
    dragStartTime,
    dragStartX,
    dragStartDate,
    tempDragTime,
    tempDragDate,
    onEditFlight
  ])

  return (
    <div className="space-y-6">
      <div
        className={`rounded-lg border overflow-hidden ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-300'}`}
      >
        <div
          className={`flex items-center justify-between p-4 border-b ${theme === 'dark' ? 'border-slate-800' : 'border-slate-300'}`}
        >
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
            onClick={() =>
              setWeekOffset(Math.max(MIN_WEEK_OFFSET, weekOffset - 1))
            }
            disabled={weekOffset <= MIN_WEEK_OFFSET}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Week
          </Button>
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold text-foreground">
              {weekDays[0].toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric'
              })}{' '}
              -{' '}
              {weekDays[6].toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </h3>
            {weekOffset !== 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary"
                onClick={() => setWeekOffset(0)}
              >
                Back to Current Week
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
            onClick={() =>
              setWeekOffset(Math.min(MAX_WEEK_OFFSET, weekOffset + 1))
            }
            disabled={weekOffset >= MAX_WEEK_OFFSET}
          >
            Next Week
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div
          ref={scrollContainerRef}
          className={`overflow-x-auto ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <div className="min-w-[1400px]">
            <div
              className={`grid grid-cols-[80px_repeat(7,1fr)] border-b ${theme === 'dark' ? 'border-slate-800' : 'border-slate-300'}`}
            >
              <div
                className={`p-4 border-r ${theme === 'dark' ? 'border-slate-800' : 'border-slate-300'}`}
              />
              {weekDays.map((day, index) => (
                <div
                  key={index}
                  className={`p-4 text-center border-r last:border-r-0 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-300'}`}
                >
                  <div className="text-sm text-muted-foreground">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-lg font-semibold text-foreground">
                    {day.toLocaleDateString('en-US', { day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-[80px_repeat(7,1fr)]">
              <div
                className={`border-r ${theme === 'dark' ? 'border-slate-800' : 'border-slate-300'}`}
              >
                {timeSlots.map((time) => (
                  <div
                    key={time}
                    className={`h-20 p-2 border-b text-xs text-muted-foreground ${theme === 'dark' ? 'border-slate-800' : 'border-slate-300'}`}
                  >
                    {time}
                  </div>
                ))}
              </div>

              {weekDays.map((day, dayIndex) => {
                // Get day string in local timezone to match flight dates
                const year = day.getFullYear()
                const month = String(day.getMonth() + 1).padStart(2, '0')
                const dayNum = String(day.getDate()).padStart(2, '0')
                const dayString = `${year}-${month}-${dayNum}`

                const dayFlights = filteredFlights.filter((flight) => {
                  // If this flight is being dragged, use the temp drag date, otherwise extract from timestamp
                  const flightDate =
                    draggedFlight?.id === flight.id
                      ? tempDragDate
                      : getDateFromTimestamp(getPrimaryTimestamp(flight))

                  return flightDate === dayString
                })

                return (
                  <div
                    key={dayIndex}
                    className={`relative border-r last:border-r-0 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-300'}`}
                  >
                    {timeSlots.map((time, slotIndex) => {
                      const isHovered =
                        hoveredSlot?.day === dayString &&
                        hoveredSlot?.time === time
                      return (
                        <div
                          key={time}
                          className={`h-20 border-b relative ${theme === 'dark' ? 'border-slate-800' : 'border-slate-300'} ${slotIndex % 2 === 0 ? (theme === 'dark' ? 'bg-slate-900/30' : 'bg-slate-50') : ''}`}
                          onMouseEnter={() => handleSlotHover(dayString, time)}
                          onMouseLeave={handleSlotLeave}
                        >
                          {isHovered && showAddButton && (
                            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-primary/10 z-20 pointer-events-auto">
                              <button
                                onClick={() =>
                                  handleCreateFlightAtSlot(
                                    dayString,
                                    time,
                                    'arrival'
                                  )
                                }
                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                                title="Add Arrival"
                              >
                                <PlaneLanding className="w-3 h-3" />
                                <Plus className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() =>
                                  handleCreateFlightAtSlot(
                                    dayString,
                                    time,
                                    'departure'
                                  )
                                }
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors"
                                title="Add Departure"
                              >
                                <PlaneTakeoff className="w-3 h-3" />
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}

                    <div className="absolute inset-0 p-1 pointer-events-none">
                      {dayFlights.map((flight) => {
                        // Use temp values during drag, otherwise use actual values
                        const isDragging = draggedFlight?.id === flight.id

                        const displayTime = isDragging
                          ? tempDragTime
                          : getTimeFromTimestamp(getPrimaryTimestamp(flight))

                        const topPosition = getFlightPosition(displayTime)
                        const pixelsPerMinute = 80 / 60
                        const height =
                          Math.max(45, flight.duration) * pixelsPerMinute // Use calculated duration with 45 min minimum

                        return (
                          <div
                            key={flight.id}
                            className={`absolute left-1 right-1 rounded border p-2 pointer-events-auto cursor-move group ${getStatusColor(flight.status)}`}
                            style={{
                              top: `${topPosition}px`,
                              height: `${height}px`,
                              zIndex: isDragging ? 50 : 10
                            }}
                            onMouseDown={(e) =>
                              handleFlightDragStart(e, flight)
                            }
                          >
                            <div className="flex items-start gap-2 h-full">
                              {flight.type === 'arrival' ? (
                                <PlaneLanding className="w-3 h-3 flex-shrink-0 mt-0.5" />
                              ) : (
                                <PlaneTakeoff className="w-3 h-3 flex-shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-xs truncate">
                                  {flight.tailNumber}
                                </div>
                                <div className="text-[10px] opacity-80 truncate">
                                  {flight.aircraftType}
                                </div>
                                <div className="text-[10px] opacity-70 truncate">
                                  {flight.type === 'arrival'
                                    ? flight.origin
                                    : flight.destination}
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditingFlight(flight)
                                  setEditDialogOpen(true)
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/10 rounded transition-opacity"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {editingFlight && (
        <FlightFormDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSubmit={(updatedFlight) => {
            onEditFlight(updatedFlight)
            setEditDialogOpen(false)
          }}
          initialData={editingFlight}
          theme={theme}
        />
      )}
    </div>
  )
}
