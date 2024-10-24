'use client'

import type React from 'react'
import { twMerge } from 'tailwind-merge'

type SubmitFieldProps = {
  isLoading?: boolean
}

const SubmitField: React.FC<React.PropsWithChildren<SubmitFieldProps>> = ({
  children,
  isLoading
}) => {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className={twMerge(
        'block h-10 w-full rounded bg-purple-600 font-medium text-white',
        isLoading && 'bg-purple-400'
      )}
    >
      {children}
    </button>
  )
}

export default SubmitField
