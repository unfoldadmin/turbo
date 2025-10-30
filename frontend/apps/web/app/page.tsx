"use client"
import { FlightBoard } from "@frontend/ui/components/flight-board"
import { CalendarWeekView } from "@frontend/ui/components/calendar-week-view"
import { CompactToolbar } from "@frontend/ui/components/compact-toolbar"
import { FlightFormDialog } from "@frontend/ui/components/flight-form-dialog"
import { useState } from "react"
import { Sun, Moon } from "lucide-react"
import { Button } from "@frontend/ui/components/ui/button"
import { mockFlights } from "@frontend/ui/lib/mock-data"
import type { Flight, FlightFilters } from "@frontend/ui/lib/types"

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [flights, setFlights] = useState<Flight[]>(mockFlights)
  const [view, setView] = useState("split")
  const [filters, setFilters] = useState<FlightFilters>({
    search: "",
    status: "all",
    dateRange: "today",
    services: [],
  })
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const handleAddFlight = (flight: Flight) => {
    setFlights([...flights, flight])
  }

  const handleEditFlight = (updatedFlight: Flight) => {
    setFlights(flights.map((f) => (f.id === updatedFlight.id ? updatedFlight : f)))
  }

  const handleDeleteFlight = (id: string) => {
    setFlights(flights.filter((f) => f.id !== id))
  }

  return (
    <div className={theme === "dark" ? "dark" : ""}>
      <main className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <header className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-foreground">Flight Operations Board</h1>
              <p className="text-muted-foreground">Real-time arrivals and departures tracking</p>
            </div>
            <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </header>

          <CompactToolbar
            view={view}
            onViewChange={setView}
            filters={filters}
            onFiltersChange={setFilters}
            onAddFlight={() => setIsAddDialogOpen(true)}
            theme={theme}
          />

          <div className="mt-6">
            {view === "split" && (
              <FlightBoard
                mode="split"
                theme={theme}
                flights={flights}
                onAddFlight={handleAddFlight}
                onEditFlight={handleEditFlight}
                onDeleteFlight={handleDeleteFlight}
                filters={filters}
              />
            )}
            {view === "calendar" && (
              <CalendarWeekView
                theme={theme}
                flights={flights}
                onAddFlight={handleAddFlight}
                onEditFlight={handleEditFlight}
                onDeleteFlight={handleDeleteFlight}
                filters={filters}
              />
            )}
            {view === "arrivals" && (
              <FlightBoard
                mode="arrivals"
                theme={theme}
                flights={flights}
                onAddFlight={handleAddFlight}
                onEditFlight={handleEditFlight}
                onDeleteFlight={handleDeleteFlight}
                filters={filters}
              />
            )}
            {view === "departures" && (
              <FlightBoard
                mode="departures"
                theme={theme}
                flights={flights}
                onAddFlight={handleAddFlight}
                onEditFlight={handleEditFlight}
                onDeleteFlight={handleDeleteFlight}
                filters={filters}
              />
            )}
          </div>

          <FlightFormDialog
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onSubmit={handleAddFlight}
            theme={theme}
          />
        </div>
      </main>
    </div>
  )
}
