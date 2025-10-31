'use client'

import { Badge } from '@frontend/ui/components/ui/badge'
import { Button } from '@frontend/ui/components/ui/button'
import { Input } from '@frontend/ui/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@frontend/ui/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@frontend/ui/components/ui/select'
import {
  Calendar,
  Filter,
  LayoutGrid,
  PlaneLanding,
  PlaneTakeoff,
  Plus,
  Search,
  X
} from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { FlightFilters } from './types'

interface CompactToolbarProps {
  view: string
  mode?: string
  theme: 'dark' | 'light'
  onViewChange: (view: string) => void
  onModeChange?: (mode: string) => void
  onThemeChange?: (theme: string) => void
  filters: FlightFilters
  onFiltersChange: (filters: FlightFilters) => void
  onAddFlight?: () => void
}

const serviceOptions = [
  { value: 'fuel', label: 'Fuel' },
  { value: 'hangar', label: 'Hangar' },
  { value: 'catering', label: 'Catering' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'ground_transport', label: 'Ground Transport' }
]

export function CompactToolbar({
  view,
  onViewChange,
  filters,
  onFiltersChange,
  onAddFlight,
  theme
}: CompactToolbarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Add keyboard shortcut: "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if not already focused on an input/textarea
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const toggleService = (service: string) => {
    const newServices = filters.services.includes(service)
      ? filters.services.filter((s) => s !== service)
      : [...filters.services, service]
    onFiltersChange({ ...filters, services: newServices })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      dateRange: 'today',
      services: []
    })
  }

  const hasActiveFilters =
    filters.search || filters.status !== 'all' || filters.services.length > 0
  const activeFilterCount = [
    filters.search ? 1 : 0,
    filters.status !== 'all' ? 1 : 0,
    filters.services.length
  ].reduce((a, b) => a + b, 0)

  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center gap-1">
        <Button
          variant={view === 'split' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('split')}
          className="h-9 px-3"
          title="Split View"
        >
          <LayoutGrid className="w-4 h-4" />
        </Button>
        <Button
          variant={view === 'calendar' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('calendar')}
          className="h-9 px-3"
          title="Calendar View"
        >
          <Calendar className="w-4 h-4" />
        </Button>
        <Button
          variant={view === 'arrivals' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('arrivals')}
          className="h-9 px-3"
          title="Arrivals Only"
        >
          <PlaneLanding className="w-4 h-4" />
        </Button>
        <Button
          variant={view === 'departures' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('departures')}
          className="h-9 px-3"
          title="Departures Only"
        >
          <PlaneTakeoff className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-1 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={searchInputRef}
            placeholder="Search flights..."
            value={filters.search}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            className="pl-9 pr-10 h-9 bg-background border-border text-foreground"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex items-center justify-center h-5 px-1.5 rounded border border-border bg-muted/50 text-[10px] font-medium text-muted-foreground">
            /
          </kbd>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 relative bg-transparent text-foreground"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">Filter Options</h4>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-7 text-xs"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Status
                  </label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      onFiltersChange({ ...filters, status: value as any })
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="en-route">En Route</SelectItem>
                      <SelectItem value="arrived">Arrived</SelectItem>
                      <SelectItem value="departed">Departed</SelectItem>
                      <SelectItem value="delayed">Delayed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Date Range
                  </label>
                  <Select
                    value={filters.dateRange}
                    onValueChange={(value) =>
                      onFiltersChange({ ...filters, dateRange: value as any })
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="tomorrow">Tomorrow</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="all">All Dates</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Required Services
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {serviceOptions.map((service) => (
                      <Badge
                        key={service.value}
                        variant={
                          filters.services.includes(service.value)
                            ? 'default'
                            : 'outline'
                        }
                        className="cursor-pointer"
                        onClick={() => toggleService(service.value)}
                      >
                        {service.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Button onClick={onAddFlight} size="sm" className="h-9">
        <Plus className="w-4 h-4 mr-2" />
        Add Flight
      </Button>
    </div>
  )
}
