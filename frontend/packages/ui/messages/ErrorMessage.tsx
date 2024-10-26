'use client'

import type React from 'react'
import type { PropsWithChildren } from 'react'

const ErrorMessage: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="mb-6 rounded bg-red-100 px-4 py-3 text-red-700">
      {children}
    </div>
  )
}

export default ErrorMessage
