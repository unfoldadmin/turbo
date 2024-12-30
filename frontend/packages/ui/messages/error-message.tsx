'use client'

import type React from 'react'
import type { PropsWithChildren } from 'react'

export function ErrorMessage({ children }: PropsWithChildren) {
  return (
    <div className="mb-6 rounded bg-red-100 px-4 py-3 text-red-700">
      {children}
    </div>
  )
}
