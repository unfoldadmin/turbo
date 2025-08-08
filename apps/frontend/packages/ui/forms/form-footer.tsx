'use client'

import Link from 'next/link'
import type React from 'react'

export function FormFooter({
  cta,
  link,
  title
}: {
  cta: string
  link: string
  title: string
}) {
  const actionLink = (
    <Link
      href={link}
      className="font-medium text-gray-700 underline decoration-gray-400 underline-offset-4"
    >
      {title}
    </Link>
  )

  return (
    <p className="mt-6 text-center text-gray-500">
      {cta} {actionLink}
    </p>
  )
}
