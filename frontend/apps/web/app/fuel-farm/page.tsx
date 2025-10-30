"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useTheme } from "@/components/navigation-wrapper"
import { Button } from "@frontend/ui/components/ui/button"
import { Card } from "@frontend/ui/components/ui/card"

export default function FuelFarmPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { theme } = useTheme()
  const [tanks, setTanks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTanks()
    }
  }, [status])

  const fetchTanks = async () => {
    try {
      setLoading(true)
      // TODO: Implement API call
      setTanks([])
    } catch (err) {
      console.error("Failed to fetch fuel tanks:", err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-muted-foreground">Loading fuel farm...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  const jetATanks = tanks.filter((t: any) => t.fuel_type === 'jet_a')
  const avgasTanks = tanks.filter((t: any) => t.fuel_type === 'avgas')
  const criticalCount = tanks.filter((t: any) => t.status === 'critical').length
  const warningCount = tanks.filter((t: any) => t.status === 'warning').length
  const goodCount = tanks.filter((t: any) => t.status === 'good').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fuel Farm</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Real-time monitoring of all fuel tanks
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Total Tanks</div>
          <div className="text-3xl font-bold text-foreground">{tanks.length}</div>
        </div>
      </div>

      {error && (
        <Card className="bg-destructive/10 border-destructive/20 p-4">
          <p className="text-sm text-destructive">Failed to load fuel tank data</p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-6 bg-success/10 border-success/20">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-success p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-success">{goodCount}</div>
              <div className="text-sm text-muted-foreground">Good Status</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-warning/10 border-warning/20">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-warning p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-warning">{warningCount}</div>
              <div className="text-sm text-muted-foreground">Warning</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-destructive/10 border-destructive/20">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-destructive p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-destructive">{criticalCount}</div>
              <div className="text-sm text-muted-foreground">Critical</div>
            </div>
          </div>
        </Card>
      </div>

      {jetATanks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Jet A Tanks ({jetATanks.length})
          </h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {jetATanks.map((tank: any) => (
              <Card key={tank.tank_id} className="p-4 bg-card border-border">
                <div className="text-sm font-medium text-muted-foreground">
                  {tank.tank_name}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {avgasTanks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Avgas Tanks ({avgasTanks.length})
          </h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {avgasTanks.map((tank: any) => (
              <Card key={tank.tank_id} className="p-4 bg-card border-border">
                <div className="text-sm font-medium text-muted-foreground">
                  {tank.tank_name}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tanks.length === 0 && !error && (
        <Card className="p-8 text-center bg-card border-border">
          <div className="text-muted-foreground">
            No tanks found. Run the seed command to create fuel tanks.
          </div>
        </Card>
      )}
    </div>
  )
}
