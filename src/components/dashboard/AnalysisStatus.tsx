import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface AnalysisStatusProps {
  isVisible: boolean
}

export function AnalysisStatus({ isVisible }: AnalysisStatusProps) {
  const [dots, setDots] = useState('.')
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (!isVisible) return
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === '...') return '.'
        return prev + '.'
      })
    }, 500)
    return () => clearInterval(interval)
  }, [isVisible])

  if (!isVisible) return null

  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-3xl px-4 mb-6"
    >
      <div
        className="rounded-xl px-5 py-4 flex items-center gap-3"
        style={{
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        {/* Animated pulse indicator */}
        <div className="relative flex-shrink-0">
          <span
            className="block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: 'var(--accent)' }}
          />
          <span
            className="absolute inset-0 h-2.5 w-2.5 rounded-full animate-ping"
            style={{ backgroundColor: 'var(--accent)', opacity: 0.4 }}
          />
        </div>

        {/* Status text */}
        <span className="text-sm text-[var(--foreground)]">
          Analyzing how recent changes affect you
          <span className="inline-block w-6 text-left font-mono">{dots}</span>
        </span>
      </div>
    </motion.div>
  )
}
