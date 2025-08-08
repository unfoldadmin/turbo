'use client'

import type React from 'react'
import { twMerge } from 'tailwind-merge'

export function SubmitField({
  children,
  isLoading
}: React.PropsWithChildren<{
  isLoading?: boolean
}>) {
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
