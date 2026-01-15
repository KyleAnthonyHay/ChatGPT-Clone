'use client'

import { useMemo } from 'react'
import { motion, useInView } from 'motion/react'
import { useRef } from 'react'

interface ShimmeringTextProps {
  text: string
  duration?: number
  delay?: number
  repeat?: boolean
  repeatDelay?: number
  className?: string
  startOnView?: boolean
  once?: boolean
  inViewMargin?: string
  spread?: number
  color?: string
  shimmerColor?: string
}

export function ShimmeringText({
  text,
  duration = 2,
  delay = 0,
  repeat = true,
  repeatDelay = 0.5,
  className = '',
  startOnView = true,
  once = false,
  spread = 2,
  color = '#9ca3af',
  shimmerColor = '#ffffff',
}: ShimmeringTextProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once })

  const shouldAnimate = startOnView ? isInView : true

  const dynamicSpread = useMemo(() => {
    return Math.min(text.length * spread, 100)
  }, [text, spread])

  return (
    <motion.span
      ref={ref}
      className={`inline-block bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage: `linear-gradient(
          90deg,
          ${color} 0%,
          ${color} 40%,
          ${shimmerColor} 50%,
          ${color} 60%,
          ${color} 100%
        )`,
        backgroundSize: `${dynamicSpread * 3}% 100%`,
      }}
      initial={{ backgroundPosition: '100% center' }}
      animate={
        shouldAnimate
          ? { backgroundPosition: ['100% center', '-100% center'] }
          : { backgroundPosition: '100% center' }
      }
      transition={{
        duration,
        delay,
        repeat: repeat ? Infinity : 0,
        repeatDelay,
        ease: 'linear',
      }}
    >
      {text}
    </motion.span>
  )
}
