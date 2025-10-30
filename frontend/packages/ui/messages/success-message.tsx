'use client'

import type React from 'react'
import type { PropsWithChildren } from 'react'

export function SuccessMessage({ children }: PropsWithChildren) {
  return (
    <div className="mb-6 rounded bg-green-500/10 border border-green-500/30 px-4 py-3 text-green-500">
      {children}
    </div>
  )
}
