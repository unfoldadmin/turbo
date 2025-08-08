'use client'

import type React from 'react'

export function FormHeader({
  title,
  description
}: {
  title: string
  description?: string
}) {
  return (
    <>
      <h1 className="text-xl font-medium text-gray-700">{title}</h1>

      {description && <p className="mt-1 text-gray-500">{description}</p>}

      <hr className="my-8" />
    </>
  )
}
