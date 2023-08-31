'use client'

import React from 'react'
import { PropsWithChildren } from 'react'

const SuccessMessage: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="mb-6 rounded bg-green-100 px-4 py-3 text-green-700">
      {children}
    </div>
  )
}

export default SuccessMessage
