'use client'

import type React from 'react'

type FormHeaderProps = {
  title: string
  description?: string
}

const FormHeader: React.FC<FormHeaderProps> = ({ title, description }) => {
  return (
    <>
      <h1 className="text-xl font-medium text-gray-700">{title}</h1>

      {description && <p className="mt-1 text-gray-500">{description}</p>}

      <hr className="my-8" />
    </>
  )
}

export default FormHeader
