'use client'

import { memo } from 'react'
import { Streamdown } from 'streamdown'
import type { ComponentProps } from 'react'

type ResponseProps = ComponentProps<typeof Streamdown>

export const Response = memo(function Response({
  children,
  className = '',
  ...props
}: ResponseProps) {
  return (
    <Streamdown
      className={`prose prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 ${className}`}
      {...props}
    >
      {children}
    </Streamdown>
  )
})
