import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function SkeletonCard() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'glass-panel',
        'p-5'
      )}
      style={{
        boxShadow: 'var(--elevation-1)',
      }}
      aria-hidden="true"
    >
      {/* Severity bar placeholder */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl bg-[var(--border)]" />

      {/* Data-stream shimmer overlay */}
      <div className="shimmer-stream absolute inset-0 pointer-events-none rounded-2xl" />

      {/* Pulsing wave overlay */}
      {!prefersReducedMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
          <motion.div
            className="absolute inset-y-0 w-1/3"
            style={{
              background: 'linear-gradient(90deg, transparent, var(--glass-spotlight), transparent)',
            }}
            animate={{
              x: ['-100%', '400%'],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
              repeatDelay: 0.5,
            }}
          />
        </div>
      )}

      {/* Header row: badge placeholders */}
      <div className="flex items-center gap-2">
        <motion.div
          className="h-5 w-24 rounded-full bg-[var(--muted)]"
          animate={prefersReducedMotion ? {} : { opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="h-5 w-14 rounded-full bg-[var(--muted)]"
          animate={prefersReducedMotion ? {} : { opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />
        <motion.div
          className="ml-auto h-4 w-20 rounded bg-[var(--muted)]"
          animate={prefersReducedMotion ? {} : { opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        />
      </div>

      {/* Title placeholder */}
      <motion.div
        className="mt-4 h-5 w-[85%] rounded bg-[var(--muted)]"
        animate={prefersReducedMotion ? {} : { opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
      />

      {/* Summary lines */}
      <div className="mt-3 space-y-2">
        <motion.div
          className="h-4 w-full rounded bg-[var(--muted)]"
          animate={prefersReducedMotion ? {} : { opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />
        <motion.div
          className="h-4 w-[70%] rounded bg-[var(--muted)]"
          animate={prefersReducedMotion ? {} : { opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.35 }}
        />
        <motion.div
          className="h-4 w-[40%] rounded bg-[var(--muted)]"
          animate={prefersReducedMotion ? {} : { opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
      </div>

      {/* Footer placeholder */}
      <div className="mt-5 pt-3 border-t border-[var(--border)] flex items-center justify-between">
        <motion.div
          className="h-3 w-40 rounded bg-[var(--muted)]"
          animate={prefersReducedMotion ? {} : { opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        />
        <div className="flex gap-2">
          <motion.div
            className="h-7 w-16 rounded-lg bg-[var(--muted)]"
            animate={prefersReducedMotion ? {} : { opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
          />
          <motion.div
            className="h-7 w-14 rounded-lg bg-[var(--muted)]"
            animate={prefersReducedMotion ? {} : { opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          />
        </div>
      </div>
    </div>
  )
}

export function SkeletonCards({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={`skeleton-${i}`}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
            transition={{
              delay: i * 0.08,
              type: 'spring',
              stiffness: 200,
              damping: 22,
            }}
            layout
          >
            <SkeletonCard />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
