'use client'

import type { Aircraft } from '@frontend/types/api'
import { Button } from '@frontend/ui/components/ui/button'
import { Input } from '@frontend/ui/components/ui/input'
import { Label } from '@frontend/ui/components/ui/label'
import { cn } from '@frontend/ui/lib/utils'
import { Check, Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface TailNumberAutocompleteProps {
  value: string
  onChange: (tailNumber: string, aircraftType?: string) => void
  aircraft: Aircraft[]
  onCreateNew: (tailNumber: string) => void
  className?: string
  disabled?: boolean
}

export function TailNumberAutocomplete({
  value,
  onChange,
  aircraft,
  onCreateNew,
  className,
  disabled
}: TailNumberAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value)
  const [isOpen, setIsOpen] = useState(false)
  const [filteredAircraft, setFilteredAircraft] = useState<Aircraft[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    if (inputValue) {
      const filtered = aircraft.filter((a) =>
        a.tail_number.toLowerCase().includes(inputValue.toLowerCase())
      )
      setFilteredAircraft(filtered)
      setIsOpen(filtered.length > 0 || inputValue.length > 0)
    } else {
      setFilteredAircraft(aircraft)
      setIsOpen(false)
    }
  }, [inputValue, aircraft])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase()
    setInputValue(newValue)
    onChange(newValue)
  }

  const handleSelectAircraft = (selectedAircraft: Aircraft) => {
    setInputValue(selectedAircraft.tail_number)
    const displayType =
      (selectedAircraft as any).aircraft_type_display ||
      (selectedAircraft as any).aircraft_type ||
      'Unknown'
    onChange(selectedAircraft.tail_number, displayType)
    setIsOpen(false)
  }

  const handleCreateNew = () => {
    if (inputValue) {
      onCreateNew(inputValue)
      setIsOpen(false)
    }
  }

  const exactMatch = aircraft.find(
    (a) => a.tail_number.toLowerCase() === inputValue.toLowerCase()
  )
  const showCreateButton =
    inputValue && !exactMatch && filteredAircraft.length === 0

  return (
    <div className={cn('relative', className)}>
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder="e.g., N12345"
        disabled={disabled}
      />

      {isOpen && (filteredAircraft.length > 0 || showCreateButton) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredAircraft.map((a) => (
            <button
              key={a.tail_number}
              onClick={() => handleSelectAircraft(a)}
              className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground flex items-center justify-between text-sm"
            >
              <div>
                <div className="font-semibold">{a.tail_number}</div>
                <div className="text-xs text-muted-foreground">
                  {(a as any).aircraft_type_display ||
                    a.aircraft_type ||
                    'Unknown'}
                </div>
              </div>
              {inputValue.toLowerCase() === a.tail_number.toLowerCase() && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </button>
          ))}

          {showCreateButton && (
            <button
              onClick={handleCreateNew}
              className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2 text-sm border-t border-border"
            >
              <Plus className="w-4 h-4" />
              <span>
                Add new aircraft: <strong>{inputValue}</strong>
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
