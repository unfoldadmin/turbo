'use client'

import { useTheme } from '@/components/navigation-wrapper'
import { CertificationFormDialog } from '@/components/training/certification-form-dialog'
import { useCertifications } from '@/hooks/use-certifications'
import type { FuelerTraining, FuelerTrainingRequest } from '@frontend/types/api'
import { Badge } from '@frontend/ui/components/ui/badge'
import { Button } from '@frontend/ui/components/ui/button'
import { Card } from '@frontend/ui/components/ui/card'
import { ErrorMessage } from '@frontend/ui/messages/error-message'
import { SuccessMessage } from '@frontend/ui/messages/success-message'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function TrainingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { theme } = useTheme()
  const {
    certifications,
    loading,
    error,
    createCertification,
    updateCertification,
    deleteCertification,
    refetch
  } = useCertifications()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCertification, setEditingCertification] =
    useState<FuelerTraining | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const handleCreateCertification = async (data: FuelerTrainingRequest) => {
    try {
      await createCertification(data)
      setSuccessMessage('Certification created successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setErrorMessage('Failed to create certification')
      setTimeout(() => setErrorMessage(''), 3000)
      throw err
    }
  }

  const handleEditCertification = (certification: FuelerTraining) => {
    setEditingCertification(certification)
    setDialogOpen(true)
  }

  const handleUpdateCertification = async (data: FuelerTrainingRequest) => {
    if (!editingCertification) return
    try {
      await updateCertification(editingCertification.id, data)
      setSuccessMessage('Certification updated successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
      setEditingCertification(null)
    } catch (err) {
      setErrorMessage('Failed to update certification')
      setTimeout(() => setErrorMessage(''), 3000)
      throw err
    }
  }

  const handleDeleteCertification = async (id: number) => {
    if (!confirm('Are you sure you want to delete this certification?')) return
    try {
      await deleteCertification(id)
      setSuccessMessage('Certification deleted successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setErrorMessage('Failed to delete certification')
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }

  const handleOpenDialog = () => {
    setEditingCertification(null)
    setDialogOpen(true)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-muted-foreground">
          Loading training data...
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  const expiredCerts = certifications.filter(
    (c: any) => c.expiry_status === 'expired'
  )
  const criticalCerts = certifications.filter(
    (c: any) => c.expiry_status === 'critical'
  )
  const warningCerts = certifications.filter(
    (c: any) => c.expiry_status === 'warning'
  )
  const cautionCerts = certifications.filter(
    (c: any) => c.expiry_status === 'caution'
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'expired':
        return 'bg-destructive/10 text-destructive border-destructive/20'
      case 'critical':
        return 'bg-destructive/10 text-destructive border-destructive/20'
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/20'
      case 'caution':
        return 'bg-warning/10 text-warning-foreground border-warning/20'
      case 'valid':
        return 'bg-success/10 text-success border-success/20'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Training Management
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track fueler certifications and training status
          </p>
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleOpenDialog}
        >
          Add Certification
        </Button>
      </div>

      {successMessage && <SuccessMessage message={successMessage} />}
      {errorMessage && <ErrorMessage message={errorMessage} />}
      {error && (
        <Card className="bg-destructive/10 border-destructive/20 p-4">
          <p className="text-sm text-destructive">
            Failed to load training data
          </p>
        </Card>
      )}

      <CertificationFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        certification={editingCertification}
        onSubmit={
          editingCertification
            ? handleUpdateCertification
            : handleCreateCertification
        }
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <Card className="p-6 bg-destructive/10 border-destructive/20">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-destructive p-3">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-destructive">
                {expiredCerts.length}
              </div>
              <div className="text-sm text-muted-foreground">Expired</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-destructive/10 border-destructive/20 border-2">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-destructive p-3">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-destructive">
                {criticalCerts.length}
              </div>
              <div className="text-sm text-muted-foreground">1 Day</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-warning/10 border-warning/20">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-warning p-3">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-warning">
                {warningCerts.length}
              </div>
              <div className="text-sm text-muted-foreground">3 Days</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-warning/10 border-warning/20">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-warning p-3">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-warning">
                {cautionCerts.length}
              </div>
              <div className="text-sm text-muted-foreground">7 Days</div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <div className="px-6 py-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            All Certifications ({certifications.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Fueler
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Training
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Completed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Days Left
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Certified By
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {certifications.map((cert: any) => (
                <tr
                  key={cert.id}
                  className={`hover:bg-muted/10 ${cert.expiry_status === 'expired' ? 'bg-destructive/5' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {cert.fueler_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {cert.training_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {formatDate(cert.completed_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {formatDate(cert.expiry_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`font-semibold ${cert.days_until_expiry < 0 ? 'text-destructive' : cert.days_until_expiry <= 3 ? 'text-destructive' : cert.days_until_expiry <= 7 ? 'text-warning' : 'text-foreground'}`}
                    >
                      {cert.days_until_expiry < 0
                        ? `${Math.abs(cert.days_until_expiry)} days ago`
                        : `${cert.days_until_expiry} days`}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getStatusBadge(cert.expiry_status)}>
                      {cert.expiry_status.charAt(0).toUpperCase() +
                        cert.expiry_status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {cert.certified_by_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/80"
                      onClick={() => handleEditCertification(cert)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive/80"
                      onClick={() => handleDeleteCertification(cert.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {certifications.length === 0 && !error && (
          <div className="p-8 text-center">
            <div className="text-muted-foreground">
              No certifications found. Add certifications to get started.
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
