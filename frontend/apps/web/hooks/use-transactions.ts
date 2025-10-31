'use client'

import type {
  FuelTransactionCreateRequest,
  FuelTransactionDetail,
  FuelTransactionList,
  FuelTransactionListRequest
} from '@frontend/types/api'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'
import { getApiClient } from '../lib/api'

export function useTransactions() {
  const { data: session } = useSession()
  const [transactions, setTransactions] = useState<FuelTransactionList[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchTransactions = useCallback(async () => {
    if (!session) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const client = await getApiClient(session)

      const response = await client.transactions.transactionsList()
      setTransactions(response.results || [])
    } catch (err) {
      console.error('Failed to fetch transactions:', err)
      setError(
        err instanceof Error ? err : new Error('Failed to fetch transactions')
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session) {
      fetchTransactions()
    } else {
      setLoading(false)
    }
  }, [session, fetchTransactions])

  const createTransaction = useCallback(
    async (transaction: FuelTransactionCreateRequest) => {
      const client = await getApiClient(session)
      const newTransaction =
        await client.transactions.transactionsCreate(transaction)
      setTransactions((prev) => [...prev, newTransaction])
      return newTransaction
    },
    [session]
  )

  const updateTransaction = useCallback(
    async (id: number, updates: FuelTransactionListRequest) => {
      const client = await getApiClient(session)
      const updatedTransaction =
        await client.transactions.transactionsPartialUpdate(id, updates)
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? updatedTransaction : t))
      )
      return updatedTransaction
    },
    [session]
  )

  const deleteTransaction = useCallback(
    async (id: number) => {
      const client = await getApiClient(session)
      await client.transactions.transactionsDestroy(id)
      setTransactions((prev) => prev.filter((t) => t.id !== id))
    },
    [session]
  )

  const refetch = useCallback(() => {
    fetchTransactions()
  }, [fetchTransactions])

  return {
    transactions,
    loading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refetch
  }
}
