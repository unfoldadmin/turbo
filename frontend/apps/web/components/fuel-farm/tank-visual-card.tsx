'use client'

import type { FuelTankWithLatestReading } from '@frontend/types/api'
import { Badge } from '@frontend/ui/components/ui/badge'
import { Button } from '@frontend/ui/components/ui/button'
import { Card } from '@frontend/ui/components/ui/card'
import { Input } from '@frontend/ui/components/ui/input'
import { cn } from '@frontend/ui/lib/utils'
import { useState } from 'react'

interface TankVisualCardProps {
  tank: FuelTankWithLatestReading
  onUpdateLevel: (tankId: string, level: number) => Promise<void>
}

export function TankVisualCard({ tank, onUpdateLevel }: TankVisualCardProps) {
  const [inputValue, setInputValue] = useState('')
  const [updating, setUpdating] = useState(false)

  const currentLevel = tank.latest_reading
    ? Number.parseFloat(tank.latest_reading.level)
    : 0
  const maxLevel = Number.parseFloat(tank.usable_max_inches)
  const minLevel = Number.parseFloat(tank.usable_min_inches)
  const percentage = Math.round((currentLevel / maxLevel) * 100)
  const levelHeight = (currentLevel / maxLevel) * 100

  const isAvgas = tank.fuel_type === 'avgas'
  const isT7 = tank.tank_id === 'T7'

  // Parse foot-inch notation (5'7") or regular numbers
  const parseFootInchToInches = (input: string): number => {
    const footInchMatch = input.match(/^(\d+(?:\.\d+)?)'(\d+(?:\.\d+)?)"?$/)
    if (footInchMatch) {
      const feet = Number.parseFloat(footInchMatch[1])
      const inches = Number.parseFloat(footInchMatch[2])
      return feet * 12 + inches
    }

    const feetOnlyMatch = input.match(/^(\d+(?:\.\d+)?)'$/)
    if (feetOnlyMatch) {
      return Number.parseFloat(feetOnlyMatch[1]) * 12
    }

    return Number.parseFloat(input)
  }

  const handleUpdate = async () => {
    if (!inputValue.trim()) return

    const level = parseFootInchToInches(inputValue.trim())
    if (isNaN(level) || level < minLevel || level > maxLevel) {
      alert(`Level must be between ${minLevel}" and ${maxLevel}"`)
      return
    }

    setUpdating(true)
    try {
      await onUpdateLevel(tank.tank_id, level)
      setInputValue('')
    } catch (error) {
      console.error('Failed to update tank level:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUpdate()
    }
  }

  const formatLastUpdated = (isoString?: string) => {
    if (!isoString) return 'Never'
    const date = new Date(isoString)
    return date.toLocaleString()
  }

  return (
    <Card
      className={cn(
        'bg-white/95 backdrop-blur-sm hover:shadow-lg transition-all',
        isT7 && 'bg-yellow-50/98 border-2 border-yellow-400'
      )}
    >
      <div className="p-4 text-center space-y-4">
        {/* Header */}
        <div>
          <div className="text-2xl font-bold text-gray-800">{tank.tank_id}</div>
          <Badge
            className={cn(
              'mt-1 text-xs',
              isAvgas
                ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                : 'bg-cyan-100 text-cyan-800 border-cyan-300'
            )}
          >
            {isAvgas ? 'Avgas' : 'Jet A'}
          </Badge>
        </div>

        {/* Visual Tank */}
        <div className="relative w-20 h-48 mx-auto bg-gray-100 border-3 border-gray-300 rounded-lg overflow-hidden">
          {/* Fuel Level */}
          <div
            className={cn(
              'absolute bottom-0 left-0 right-0 transition-all duration-700 rounded-b-lg',
              isAvgas
                ? 'bg-gradient-to-t from-orange-500 to-yellow-400 shadow-[0_-2px_10px_rgba(255,193,7,0.3)]'
                : 'bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-[0_-2px_10px_rgba(23,162,184,0.3)]'
            )}
            style={{ height: `${Math.min(levelHeight, 100)}%` }}
          />

          {/* Level Markers */}
          <div className="absolute left-0 top-0 h-full w-full pointer-events-none">
            {[...Array(9)].map((_, i) => {
              const position = i * 12.5 + '%'
              const isMajor = i % 2 === 0
              return (
                <div
                  key={i}
                  className={cn(
                    'absolute left-0 bg-gray-600',
                    isMajor ? 'w-3 h-0.5' : 'w-2 h-px'
                  )}
                  style={{ top: position }}
                />
              )
            })}
          </div>
        </div>

        {/* Level Info */}
        <div>
          <div className="text-3xl font-bold text-gray-800">
            {currentLevel.toFixed(1)}"
          </div>
          <div className="text-sm text-gray-600">
            {percentage}% ({maxLevel}" max)
          </div>
        </div>

        {/* Update Section */}
        <div className="space-y-2 pt-3 border-t border-gray-200">
          <Input
            type="text"
            placeholder="Level (inches)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="text-center text-sm"
            disabled={updating}
          />
          <Button
            onClick={handleUpdate}
            disabled={updating || !inputValue.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            {updating ? 'Updating...' : 'Update'}
          </Button>
          <div className="text-xs text-gray-500">
            Updated: {formatLastUpdated(tank.latest_reading?.recorded_at)}
          </div>
        </div>
      </div>
    </Card>
  )
}
