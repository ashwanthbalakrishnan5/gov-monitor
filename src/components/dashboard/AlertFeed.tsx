import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { SearchX, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { AlertCard } from './AlertCard'
import type { PersonalizedAlert } from '@/types/alert'

interface AlertFeedProps {
  alerts: PersonalizedAlert[]
  onDismiss: (id: string) => void
  onSave: (id: string) => void
  error?: string | null
  onRetry?: () => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 350,
      damping: 28,
    },
  },
  exit: {
    opacity: 0,
    x: 80,
    transition: {
      duration: 0.25,
      ease: 'easeIn' as const,
    },
  },
}

export function AlertFeed({ alerts, onDismiss, onSave, error, onRetry }: AlertFeedProps) {
  const prefersReducedMotion = useReducedMotion()

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div
          className="rounded-full p-4 mb-4"
          style={{ backgroundColor: 'var(--severity-medium-bg)' }}
        >
          <RefreshCw className="h-6 w-6 text-[var(--severity-medium)]" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--foreground)]">
          Could not personalize your alerts
        </h3>
        <p className="mt-2 text-sm text-[var(--muted-foreground)] max-w-sm">
          We could not analyze how recent changes affect you right now.
          Showing general summaries instead.
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className={cn(
              'mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2',
              'text-sm font-medium text-[var(--accent)]',
              'border border-[var(--accent)]/30',
              'hover:bg-[var(--accent)]/5 transition-colors',
              'cursor-pointer min-h-[44px]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]'
            )}
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        )}
      </div>
    )
  }

  // Empty state
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div
          className="rounded-full p-4 mb-4"
          style={{ backgroundColor: 'var(--muted)' }}
        >
          <SearchX className="h-6 w-6 text-[var(--muted-foreground)]" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--foreground)]">
          No alerts match your current filters
        </h3>
        <p className="mt-2 text-sm text-[var(--muted-foreground)] max-w-sm">
          Try adjusting your filters or{' '}
          <Link
            to="/profile"
            className="text-[var(--accent)] hover:underline font-medium"
          >
            add more to your profile
          </Link>{' '}
          for better matches.
        </p>
      </div>
    )
  }

  // Normal feed
  return (
    <motion.div
      variants={prefersReducedMotion ? undefined : containerVariants}
      initial={prefersReducedMotion ? undefined : 'hidden'}
      animate="visible"
      className="space-y-4"
    >
      <AnimatePresence mode="popLayout">
        {alerts.map((alert) => (
          <motion.div
            key={alert.legalChangeId}
            variants={prefersReducedMotion ? undefined : itemVariants}
            exit={prefersReducedMotion ? undefined : itemVariants.exit}
            layout={!prefersReducedMotion}
          >
            <AlertCard
              alert={alert}
              onDismiss={onDismiss}
              onSave={onSave}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
