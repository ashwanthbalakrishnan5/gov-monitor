import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { SearchX, RefreshCw, Filter } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { AlertCard } from './AlertCard'
import type { PersonalizedAlert } from '@/types/alert'

interface AlertFeedProps {
  alerts: PersonalizedAlert[]
  totalUnfilteredCount: number
  onDismiss: (id: string) => void
  onSave: (id: string) => void
  onChatAbout?: (alert: PersonalizedAlert) => void
  error?: string | null
  onRetry?: () => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 280,
      damping: 26,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: {
      duration: 0.15,
      ease: 'easeIn' as const,
    },
  },
}

export function AlertFeed({ alerts, totalUnfilteredCount, onDismiss, onSave, onChatAbout, error, onRetry }: AlertFeedProps) {
  const prefersReducedMotion = useReducedMotion()

  // Accordion: only one card expanded at a time, first card expanded by default
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const initialExpandDone = useRef(false)

  // Default expand first card when alerts first arrive (once only)
  useEffect(() => {
    if (alerts.length > 0 && !initialExpandDone.current) {
      initialExpandDone.current = true
      setExpandedId(alerts[0].legalChangeId)
    }
  }, [alerts])

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }, [])

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div
          className="glass-panel rounded-2xl p-4 mb-4"
          style={{ boxShadow: 'var(--elevation-2)' }}
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
              'mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2',
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
    const hasAlertsButFiltered = totalUnfilteredCount > 0

    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div
          className="glass-panel rounded-2xl p-4 mb-4"
          style={{ boxShadow: 'var(--elevation-2)' }}
        >
          {hasAlertsButFiltered ? (
            <Filter className="h-6 w-6 text-[var(--muted-foreground)]" />
          ) : (
            <SearchX className="h-6 w-6 text-[var(--muted-foreground)]" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-[var(--foreground)]">
          {hasAlertsButFiltered
            ? 'No alerts match your current filters'
            : 'No relevant alerts found'}
        </h3>
        <p className="mt-2 text-sm text-[var(--muted-foreground)] max-w-sm">
          {hasAlertsButFiltered ? (
            <>
              You have {totalUnfilteredCount} alert{totalUnfilteredCount !== 1 && 's'}, but
              none match your current filters. Try adjusting your filters to see more.
            </>
          ) : (
            <>
              No recent legal changes matched your profile. Try{' '}
              <Link
                to="/profile"
                className="text-[var(--accent)] hover:underline font-medium"
              >
                adding more to your profile
              </Link>{' '}
              for better matches.
            </>
          )}
        </p>
      </div>
    )
  }

  // Normal feed - intelligence briefing layout
  return (
    <motion.div
      variants={prefersReducedMotion ? undefined : containerVariants}
      initial={prefersReducedMotion ? undefined : 'hidden'}
      animate="visible"
      className="space-y-5"
    >
      {/* Alert count header */}
      <motion.div
        variants={prefersReducedMotion ? undefined : itemVariants}
        className="flex items-baseline gap-2 px-1"
      >
        <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-[var(--muted-foreground)]">
          {alerts.length} alert{alerts.length !== 1 ? 's' : ''} for you
        </span>
        {alerts.length !== totalUnfilteredCount && (
          <span className="font-mono text-[10px] text-[var(--muted-foreground)]/60 tracking-wide">
            of {totalUnfilteredCount} total
          </span>
        )}
      </motion.div>
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
              expanded={expandedId === alert.legalChangeId}
              onToggleExpand={handleToggleExpand}
              onDismiss={onDismiss}
              onSave={onSave}
              onChatAbout={onChatAbout}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
