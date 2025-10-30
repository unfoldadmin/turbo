"use client"

import type React from "react"

import { useMemo, useRef, useState, useEffect } from "react"
import { Button } from "./ui/button"
import type { FlightFilters as FilterType, Flight } from "@/lib/types"
import { ChevronLeft, ChevronRight, PlaneLanding, PlaneTakeoff, Pencil } from "lucide-react"

interface CalendarWeekViewProps {
  theme: "dark" | "light"
  flights: Flight[]
  onEditFlight: (flight: Flight) => void
  onDeleteFlight: (id: string) => void
  filters: FilterType
}

export function CalendarWeekView({ theme, flights, onEditFlight, filters }: CalendarWeekViewProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [weekOffset, setWeekOffset] = useState(0) // 0 = current week, -1 = last week, 1 = next week, etc.

  const [draggedFlight, setDraggedFlight] = useState<Flight | null>(null)
  const [dragStartY, setDragStartY] = useState(0)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartTime, setDragStartTime] = useState("")
  const [dragStartDate, setDragStartDate] = useState("")

  const [resizingFlight, setResizingFlight] = useState<{ flight: Flight; handle: "top" | "bottom" } | null>(null)
  const [resizeStartY, setResizeStartY] = useState(0)
  const [resizeStartDuration, setResizeStartDuration] = useState(0)
  const [resizeStartTime, setResizeStartTime] = useState("")

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
    window.addEventListener("mouseup", handleGlobalMouseUp)
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp)
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
    for (let hour = 6; hour <= 23; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`)
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
          flight.pilot?.toLowerCase().includes(searchLower)

        if (!matchesSearch) return false
      }

      if (filters.status !== "all" && flight.status !== filters.status) {
        return false
      }

      if (filters.services.length > 0) {
        const hasAllServices = filters.services.every((service) => flight.services.includes(service))
        if (!hasAllServices) return false
      }

      return true
    })
  }, [filters, flights])

  const getStatusColor = (status: Flight["status"]) => {
    switch (status) {
      case "arrived":
        return theme === "dark"
          ? "bg-green-600/20 border-green-500 text-green-300"
          : "bg-green-100 border-green-600 text-green-900"
      case "departed":
        return theme === "dark"
          ? "bg-cyan-600/20 border-cyan-500 text-cyan-300"
          : "bg-cyan-100 border-cyan-600 text-cyan-900"
      case "en-route":
        return theme === "dark" ? "bg-sky-600/20 border-sky-500 text-sky-300" : "bg-sky-100 border-sky-600 text-sky-900"
      case "scheduled":
        return theme === "dark"
          ? "bg-slate-600/20 border-slate-500 text-slate-300"
          : "bg-slate-100 border-slate-600 text-slate-900"
      case "delayed":
        return theme === "dark"
          ? "bg-yellow-600/20 border-yellow-500 text-yellow-300"
          : "bg-yellow-100 border-yellow-600 text-yellow-900"
      case "cancelled":
        return theme === "dark" ? "bg-red-600/20 border-red-500 text-red-300" : "bg-red-100 border-red-600 text-red-900"
    }
  }

  const getFlightPosition = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number)
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
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
  }

  const getDayIndexFromPosition = (clientX: number) => {
    if (!scrollContainerRef.current) return 0
    const rect = scrollContainerRef.current.getBoundingClientRect()
    const relativeX = clientX - rect.left + scrollContainerRef.current.scrollLeft
    const timeColumnWidth = 80
    const dayColumnWidth = (scrollContainerRef.current.scrollWidth - timeColumnWidth) / 7
    const dayIndex = Math.floor((relativeX - timeColumnWidth) / dayColumnWidth)
    return Math.max(0, Math.min(6, dayIndex))
  }

  const handleFlightDragStart = (e: React.MouseEvent, flight: Flight) => {
    e.stopPropagation()
    setDraggedFlight(flight)
    setDragStartY(e.clientY)
    setDragStartX(e.clientX)
    setDragStartTime(flight.scheduledTime)
    setDragStartDate(flight.scheduledDate || new Date().toISOString().split("T")[0])
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
    const newDateString = newDate.toISOString().split("T")[0]

    onEditFlight({
      ...draggedFlight,
      scheduledTime: newTime,
      scheduledDate: newDateString,
    })
  }

  const handleFlightDragEnd = () => {
    setDraggedFlight(null)
  }

  const handleResizeStart = (e: React.MouseEvent, flight: Flight, handle: "top" | "bottom") => {
    e.stopPropagation()
    setResizingFlight({ flight, handle })
    setResizeStartY(e.clientY)
    setResizeStartDuration(flight.duration || 60)
    setResizeStartTime(flight.scheduledTime)
  }

  const handleResizeMove = (e: React.MouseEvent) => {
    if (!resizingFlight) return
    e.preventDefault()

    const deltaY = e.clientY - resizeStartY
    const pixelsPerMinute = 80 / 60
    const deltaMinutes = snapToQuarterHour(deltaY / pixelsPerMinute)

    const { flight, handle } = resizingFlight

    if (handle === "bottom") {
      const newDuration = Math.max(45, resizeStartDuration + deltaMinutes)
      onEditFlight({ ...flight, duration: newDuration })
    } else {
      // When resizing from top, adjust start time and duration to keep bottom fixed
      const proposedDuration = resizeStartDuration - deltaMinutes
      const newDuration = Math.max(45, proposedDuration)

      // Calculate how much we can actually move the start time
      const actualDurationChange = resizeStartDuration - newDuration

      const [hours, minutes] = resizeStartTime.split(":").map(Number)
      const startMinutes = hours * 60 + minutes
      const newStartMinutes = startMinutes + actualDurationChange

      const newHours = Math.floor(newStartMinutes / 60)
      const newMins = newStartMinutes % 60
      const newTime = `${newHours.toString().padStart(2, "0")}:${newMins.toString().padStart(2, "0")}`

      onEditFlight({ ...flight, scheduledTime: newTime, duration: newDuration })
    }
  }

  const handleResizeEnd = () => {
    setResizingFlight(null)
  }

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (draggedFlight) {
        handleFlightDragMove(e as any)
      }
      if (resizingFlight) {
        handleResizeMove(e as any)
      }
    }

    const handleGlobalMouseUpForDrag = () => {
      if (draggedFlight) handleFlightDragEnd()
      if (resizingFlight) handleResizeEnd()
    }

    window.addEventListener("mousemove", handleGlobalMouseMove)
    window.addEventListener("mouseup", handleGlobalMouseUpForDrag)

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove)
      window.removeEventListener("mouseup", handleGlobalMouseUpForDrag)
    }
  }, [draggedFlight, resizingFlight, dragStartY, dragStartTime])

  return (
    <div className="space-y-6">
      <div
        className={`rounded-lg border overflow-hidden ${theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-300"}`}
      >
        <div
          className={`flex items-center justify-between p-4 border-b ${theme === "dark" ? "border-slate-800" : "border-slate-300"}`}
        >
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
            onClick={() => setWeekOffset(weekOffset - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Week
          </Button>
          <h3 className="text-lg font-semibold text-foreground">
            {weekDays[0].toLocaleDateString("en-US", { month: "long", day: "numeric" })} -{" "}
            {weekDays[6].toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground"
            onClick={() => setWeekOffset(weekOffset + 1)}
          >
            Next Week
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div
          ref={scrollContainerRef}
          className={`overflow-x-auto ${isDragging ? "cursor-grabbing" : "cursor-grab"} select-none`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <div className="min-w-[1400px]">
            <div
              className={`grid grid-cols-[80px_repeat(7,1fr)] border-b ${theme === "dark" ? "border-slate-800" : "border-slate-300"}`}
            >
              <div className={`p-4 border-r ${theme === "dark" ? "border-slate-800" : "border-slate-300"}`} />
              {weekDays.map((day, index) => (
                <div
                  key={index}
                  className={`p-4 text-center border-r last:border-r-0 ${theme === "dark" ? "border-slate-800" : "border-slate-300"}`}
                >
                  <div className="text-sm text-muted-foreground">
                    {day.toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div className="text-lg font-semibold text-foreground">
                    {day.toLocaleDateString("en-US", { day: "numeric" })}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-[80px_repeat(7,1fr)]">
              <div className={`border-r ${theme === "dark" ? "border-slate-800" : "border-slate-300"}`}>
                {timeSlots.map((time) => (
                  <div
                    key={time}
                    className={`h-20 p-2 border-b text-xs text-muted-foreground ${theme === "dark" ? "border-slate-800" : "border-slate-300"}`}
                  >
                    {time}
                  </div>
                ))}
              </div>

              {weekDays.map((day, dayIndex) => {
                const dayString = day.toISOString().split("T")[0]
                const dayFlights = filteredFlights.filter((flight) => {
                  const flightDate = flight.scheduledDate || new Date().toISOString().split("T")[0]
                  return flightDate === dayString
                })

                return (
                  <div
                    key={dayIndex}
                    className={`relative border-r last:border-r-0 ${theme === "dark" ? "border-slate-800" : "border-slate-300"}`}
                  >
                    {timeSlots.map((time, slotIndex) => (
                      <div
                        key={time}
                        className={`h-20 border-b ${theme === "dark" ? "border-slate-800" : "border-slate-300"} ${slotIndex % 2 === 0 ? (theme === "dark" ? "bg-slate-900/30" : "bg-slate-50") : ""}`}
                      />
                    ))}

                    <div className="absolute inset-0 p-1 pointer-events-none">
                      {dayFlights.map((flight) => {
                        const topPosition = getFlightPosition(flight.scheduledTime)
                        const duration = flight.duration || 60
                        const pixelsPerMinute = 80 / 60
                        const height = duration * pixelsPerMinute

                        return (
                          <div
                            key={flight.id}
                            className={`absolute left-1 right-1 rounded border p-2 pointer-events-auto cursor-move group ${getStatusColor(flight.status)}`}
                            style={{
                              top: `${topPosition}px`,
                              height: `${height}px`,
                              zIndex: draggedFlight?.id === flight.id ? 50 : 10,
                            }}
                            onMouseDown={(e) => handleFlightDragStart(e, flight)}
                          >
                            <div
                              className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 bg-current/30 hover:bg-current/50 transition-all"
                              onMouseDown={(e) => handleResizeStart(e, flight, "top")}
                            />
                            <div
                              className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 bg-current/30 hover:bg-current/50 transition-all"
                              onMouseDown={(e) => handleResizeStart(e, flight, "bottom")}
                            />

                            <div className="flex items-start gap-2 h-full">
                              {flight.type === "arrival" ? (
                                <PlaneLanding className="w-3 h-3 flex-shrink-0 mt-0.5" />
                              ) : (
                                <PlaneTakeoff className="w-3 h-3 flex-shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-xs truncate">{flight.tailNumber}</div>
                                <div className="text-[10px] opacity-80 truncate">{flight.aircraftType}</div>
                                <div className="text-[10px] opacity-70 truncate">
                                  {flight.type === "arrival" ? flight.origin : flight.destination}
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onEditFlight(flight)
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
    </div>
  )
}
