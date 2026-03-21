import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface AnalysisStatusProps {
  isVisible: boolean
  loaded?: number
  total?: number
}

export function AnalysisStatus({ isVisible, loaded = 0, total = 0 }: AnalysisStatusProps) {
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

  const progressPct = total > 0 ? Math.round((loaded / total) * 100) : 0

  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="mb-6"
    >
      <div
        className="glass-panel rounded-2xl px-5 py-4 flex items-center gap-3"
        style={{ boxShadow: 'var(--elevation-2)' }}
      >
        {/* Animated pulse indicator with glow */}
        <div className="relative flex-shrink-0">
          <span
            className="block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: 'var(--accent)' }}
          />
          <span
            className="absolute inset-0 h-2.5 w-2.5 rounded-full animate-ping"
            style={{ backgroundColor: 'var(--accent)', opacity: 0.4 }}
          />
          {/* Glow ring */}
          {!prefersReducedMotion && (
            <motion.span
              className="absolute -inset-1 rounded-full"
              animate={{
                boxShadow: [
                  '0 0 4px 1px var(--glow-copper)',
                  '0 0 8px 3px var(--glow-copper)',
                  '0 0 4px 1px var(--glow-copper)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </div>

        {/* Status text */}
        <span className="text-sm text-[var(--foreground)]">
          {loaded > 0
            ? `Personalizing your alerts${dots}`
            : `Analyzing how recent changes affect you${dots}`}
        </span>

        {/* Progress bar with wave effect */}
        {total > 0 && (
          <div className="ml-auto flex items-center gap-2.5 flex-shrink-0">
            <span className="font-mono text-[11px] text-[var(--muted-foreground)] tabular-nums tracking-wide">
              {loaded}/{total}
            </span>
            <div className="relative w-16 h-2 rounded-full bg-[var(--muted)] overflow-hidden">
              {/* Progress fill */}
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  backgroundColor: 'var(--accent)',
                }}
                initial={false}
                animate={{ width: `${progressPct}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              />
              {/* Wave shimmer on progress bar */}
              {!prefersReducedMotion && progressPct < 100 && (
                <motion.div
                  className="absolute inset-y-0 w-8 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  }}
                  animate={{ x: ['-32px', '64px'] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
