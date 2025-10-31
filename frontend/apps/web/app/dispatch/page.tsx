'use client'

import { TransactionFormDialog } from '@/components/fuel-dispatch/transaction-form-dialog'
import { useTheme } from '@/components/navigation-wrapper'
import { useTransactions } from '@/hooks/use-transactions'
import { getApiClient } from '@/lib/api'
import type {
  FuelTransactionCreateRequest,
  FuelTransactionDetail
} from '@frontend/types/api'
import { Badge } from '@frontend/ui/components/ui/badge'
import { Button } from '@frontend/ui/components/ui/button'
import { Card } from '@frontend/ui/components/ui/card'
import { ErrorMessage } from '@frontend/ui/messages/error-message'
import { SuccessMessage } from '@frontend/ui/messages/success-message'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function FuelDispatchPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { theme } = useTheme()
  const {
    transactions,
    loading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refetch
  } = useTransactions()
  const [fuelers, setFuelers] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] =
    useState<FuelTransactionDetail | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchFuelers()
    }
  }, [status])

  const fetchFuelers = async () => {
    try {
      const client = await getApiClient(session)
      const response = await client.fuelers.fuelersList()
      setFuelers(response.results || [])
    } catch (err) {
      console.error('Failed to fetch fuelers:', err)
    }
  }

  const handleCreateTransaction = async (
    data: FuelTransactionCreateRequest
  ) => {
    try {
      await createTransaction(data)
      setSuccessMessage('Transaction created successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setErrorMessage('Failed to create transaction')
      setTimeout(() => setErrorMessage(''), 3000)
      throw err
    }
  }

  const handleEditTransaction = (transaction: FuelTransactionDetail) => {
    setEditingTransaction(transaction)
    setDialogOpen(true)
  }

  const handleUpdateTransaction = async (
    data: FuelTransactionCreateRequest
  ) => {
    if (!editingTransaction) return
    try {
      await updateTransaction(editingTransaction.id, data)
      setSuccessMessage('Transaction updated successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
      setEditingTransaction(null)
    } catch (err) {
      setErrorMessage('Failed to update transaction')
      setTimeout(() => setErrorMessage(''), 3000)
      throw err
    }
  }

  const handleDeleteTransaction = async (id: number) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return
    try {
      await deleteTransaction(id)
      setSuccessMessage('Transaction deleted successfully')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setErrorMessage('Failed to delete transaction')
      setTimeout(() => setErrorMessage(''), 3000)
    }
  }

  const handleOpenDialog = () => {
    setEditingTransaction(null)
    setDialogOpen(true)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  const unassignedTx = transactions.filter(
    (t: any) => !t.fueler_assignments || t.fueler_assignments.length === 0
  )
  const inProgressTx = transactions.filter(
    (t: any) => t.progress === 'in_progress'
  )
  const completedTx = transactions.filter(
    (t: any) => t.progress === 'completed'
  )

  const getProgressBadge = (progress: string) => {
    switch (progress) {
      case 'started':
        return 'bg-warning/10 text-warning border-warning/20'
      case 'in_progress':
        return 'bg-accent/10 text-accent-foreground border-accent/20'
      case 'completed':
        return 'bg-success/10 text-success border-success/20'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  const getSyncBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-muted text-muted-foreground border-border'
      case 'synced':
        return 'bg-success/10 text-success border-success/20'
      case 'failed':
        return 'bg-destructive/10 text-destructive border-destructive/20'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fuel Dispatch</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage fuel transactions and fueler assignments
          </p>
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={handleOpenDialog}
        >
          New Transaction
        </Button>
      </div>

      {successMessage && <SuccessMessage message={successMessage} />}
      {errorMessage && <ErrorMessage message={errorMessage} />}
      {error && (
        <Card className="bg-destructive/10 border-destructive/20 p-4">
          <p className="text-sm text-destructive">
            Failed to load dispatch data
          </p>
        </Card>
      )}

      <TransactionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transaction={editingTransaction}
        onSubmit={
          editingTransaction ? handleUpdateTransaction : handleCreateTransaction
        }
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card className="p-6 bg-card border-border">
          <div className="text-sm font-medium text-muted-foreground">
            Unassigned
          </div>
          <div className="mt-2 text-3xl font-bold text-warning">
            {unassignedTx.length}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Needs fueler assignment
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="text-sm font-medium text-muted-foreground">
            In Progress
          </div>
          <div className="mt-2 text-3xl font-bold text-accent">
            {inProgressTx.length}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Currently fueling
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="text-sm font-medium text-muted-foreground">
            Completed Today
          </div>
          <div className="mt-2 text-3xl font-bold text-success">
            {completedTx.length}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Finished transactions
          </div>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <div className="px-6 py-5">
          <h2 className="text-lg font-semibold text-foreground">
            Active Fuelers (
            {fuelers.filter((f: any) => f.status === 'active').length})
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {fuelers
              .filter((f: any) => f.status === 'active')
              .map((fueler: any) => (
                <Card
                  key={fueler.id}
                  className="p-3 bg-muted/20 border-border hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer"
                >
                  <div className="text-sm font-medium text-foreground">
                    {fueler.fueler_name}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {fueler.handheld_name || 'No handheld'}
                  </div>
                </Card>
              ))}
          </div>
        </div>
      </Card>

      <Card className="bg-card border-border">
        <div className="px-6 py-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Recent Transactions
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Ticket #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Flight
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  QT Sync
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {transactions.map((transaction: any) => (
                <tr key={transaction.id} className="hover:bg-muted/10">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {transaction.ticket_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {transaction.flight_details?.callsign || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {Number.parseFloat(
                      transaction.quantity_gallons
                    ).toLocaleString()}{' '}
                    gal
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getProgressBadge(transaction.progress)}>
                      {transaction.progress?.replace('_', ' ') || 'started'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {transaction.fueler_assignments?.length > 0 ? (
                      <div className="flex flex-col space-y-1">
                        {transaction.fueler_assignments.map(
                          (assignment: any, idx: number) => (
                            <span key={idx} className="text-xs">
                              {assignment.fueler_name || 'Unknown'}
                            </span>
                          )
                        )}
                      </div>
                    ) : (
                      <span className="text-warning font-medium">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getSyncBadge(transaction.qt_sync_status)}>
                      {transaction.qt_sync_status || 'pending'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/80"
                      onClick={() => handleEditTransaction(transaction)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive/80"
                      onClick={() => handleDeleteTransaction(transaction.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {transactions.length === 0 && !error && (
          <div className="p-8 text-center">
            <div className="text-muted-foreground">
              No transactions yet. Create one to get started.
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
