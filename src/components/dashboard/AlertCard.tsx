import { useState, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  ChevronDown,
  ExternalLink,
  X,
  Bookmark,
  AlertTriangle,
  AlertCircle,
  Info,
  Globe,
  Home,
  Briefcase,
  Receipt,
  GraduationCap,
  Heart,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PersonalizedAlert } from '@/types/alert'

interface AlertCardProps {
  alert: PersonalizedAlert
  onDismiss: (id: string) => void
  onSave: (id: string) => void
}

// Category config - using raw hex values for inline style calculations
const CATEGORY_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }
> = {
  immigration: { label: 'IMMIGRATION', color: '#7C3AED', bgColor: '#7C3AED15', icon: Globe },
  housing: { label: 'HOUSING', color: '#059669', bgColor: '#05966915', icon: Home },
  employment: { label: 'EMPLOYMENT', color: '#2563EB', bgColor: '#2563EB15', icon: Briefcase },
  taxation: { label: 'TAX', color: '#D97706', bgColor: '#D9770615', icon: Receipt },
  education: { label: 'EDUCATION', color: '#DB2777', bgColor: '#DB277715', icon: GraduationCap },
  healthcare: { label: 'HEALTHCARE', color: '#DC2626', bgColor: '#DC262615', icon: Heart },
  consumer: { label: 'CONSUMER', color: '#1A2B4A', bgColor: '#1A2B4A15', icon: ShieldCheck },
  business: { label: 'BUSINESS', color: '#2563EB', bgColor: '#2563EB15', icon: Briefcase },
  transportation: { label: 'TRANSPORT', color: '#EA580C', bgColor: '#EA580C15', icon: Globe },
}

const SEVERITY_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string; lightBg: string; icon: React.ComponentType<{ className?: string }> }
> = {
  high: { label: 'HIGH', color: '#DC2626', bgColor: '#DC262612', lightBg: '#FEF2F2', icon: AlertTriangle },
  medium: { label: 'MEDIUM', color: '#D97706', bgColor: '#D9770612', lightBg: '#FFFBEB', icon: AlertCircle },
  low: { label: 'LOW', color: '#2563EB', bgColor: '#2563EB12', lightBg: '#EFF6FF', icon: Info },
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

export function AlertCard({ alert, onDismiss, onSave }: AlertCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [summaryTruncated, setSummaryTruncated] = useState(true)
  const prefersReducedMotion = useReducedMotion()

  const cat = CATEGORY_CONFIG[alert.category] ?? CATEGORY_CONFIG.consumer
  const sev = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.low
  const CatIcon = cat.icon
  const SevIcon = sev.icon

  const summaryIsLong = alert.summary.length > 180

  const toggleExpand = useCallback(() => {
    setExpanded((prev) => !prev)
  }, [])

  const handleDismiss = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onDismiss(alert.legalChangeId)
    },
    [onDismiss, alert.legalChangeId]
  )

  const handleSave = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onSave(alert.legalChangeId)
    },
    [onSave, alert.legalChangeId]
  )

  const springTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 350, damping: 28 }

  return (
    <motion.article
      layout={!prefersReducedMotion}
      className={cn(
        'group relative overflow-hidden rounded-xl',
        'bg-white/80 backdrop-blur-sm',
        'border border-black/[0.05]',
        'transition-shadow duration-200',
        'cursor-pointer'
      )}
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
      }}
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              y: -2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
            }
      }
      transition={springTransition}
      onClick={toggleExpand}
      role="article"
      aria-label={`${alert.severity} severity alert: ${alert.title}`}
    >
      {/* Severity bar - left edge */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        initial={prefersReducedMotion ? undefined : { scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }
        }
        style={{
          backgroundColor: sev.color,
          transformOrigin: 'top',
        }}
      />

      {/* High severity pulse glow on hover */}
      {alert.severity === 'high' && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            backgroundColor: sev.color,
            boxShadow: `0 0 8px 2px ${sev.color}40`,
          }}
        />
      )}

      {/* Card content */}
      <div className="pl-5 pr-5 pt-5 pb-4">
        {/* Header row: badges + date */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category badge */}
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5"
            style={{
              backgroundColor: cat.bgColor,
              color: cat.color,
            }}
          >
            <CatIcon className="h-3 w-3" />
            <span className="font-mono text-[10px] font-medium uppercase tracking-widest">
              {cat.label}
            </span>
          </span>

          {/* Severity badge */}
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5"
            style={{
              backgroundColor: sev.bgColor,
              color: sev.color,
            }}
          >
            <SevIcon className="h-3 w-3" />
            <span className="font-mono text-[10px] font-medium uppercase tracking-widest">
              {sev.label}
            </span>
          </span>

          {/* Saved indicator */}
          {alert.savedForLater && (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)]">
              <Bookmark className="h-3 w-3" />
              <span className="font-mono text-[10px] font-medium uppercase tracking-widest">
                SAVED
              </span>
            </span>
          )}

          {/* Date - pushed to right */}
          <span className="ml-auto font-mono text-[11px] text-[var(--muted-foreground)] tracking-wide">
            {formatDate(alert.datePublished)}
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-3 text-[18px] font-semibold leading-snug text-[var(--foreground)]">
          {alert.title}
        </h3>

        {/* Summary */}
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
          {summaryIsLong && summaryTruncated
            ? alert.summary.slice(0, 180) + '...'
            : alert.summary}
          {summaryIsLong && summaryTruncated && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setSummaryTruncated(false)
              }}
              className="ml-1 text-[var(--accent)] hover:underline cursor-pointer text-sm font-medium"
            >
              read more
            </button>
          )}
        </p>

        {/* Expandable sections */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 300, damping: 28 }
              }
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-4">
                {/* How This Affects You */}
                {alert.personalImpact && (
                  <div
                    className="rounded-lg p-4"
                    style={{ backgroundColor: sev.lightBg }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex-shrink-0" style={{ color: sev.color }}>
                        <SevIcon className="h-4 w-4" />
                      </span>
                      <span
                        className="font-mono text-[11px] font-medium uppercase tracking-widest"
                        style={{ color: sev.color }}
                      >
                        How this affects you
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-[var(--foreground)]">
                      {alert.personalImpact}
                    </p>
                  </div>
                )}

                {/* Action Items */}
                {alert.actionItems && alert.actionItems.length > 0 && (
                  <div className="rounded-lg border border-[var(--border)] p-4">
                    <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-[var(--foreground)]">
                      Action items
                    </span>
                    <ul className="mt-2.5 space-y-2">
                      {alert.actionItems.map((item, i) => (
                        <li key={i} className="flex gap-2 text-sm">
                          <span
                            className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: sev.color }}
                          />
                          <div className="flex-1">
                            <span className="text-[var(--foreground)] leading-relaxed">
                              {item.action}
                            </span>
                            {item.deadline && (
                              <span className="ml-1.5 font-mono text-[11px] text-[var(--muted-foreground)] tracking-wide">
                                by {item.deadline}
                              </span>
                            )}
                            {item.contactInfo && (
                              <span className="block mt-0.5 text-xs text-[var(--muted-foreground)]">
                                {item.contactInfo}
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expand toggle indicator */}
        <button
          type="button"
          onClick={toggleExpand}
          className="mt-3 flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer min-h-[28px]"
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse details' : 'Expand details'}
        >
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </motion.span>
          <span className="font-mono text-[10px] uppercase tracking-widest">
            {expanded ? 'Less' : 'Details'}
          </span>
        </button>

        {/* Footer: matching transparency + actions */}
        <div className="mt-3 pt-3 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Left side: matching info */}
          <div className="flex-1 min-w-0 space-y-1">
            {/* Matched because */}
            {alert.matchedBecause && alert.matchedBecause.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                <span className="font-mono text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider">
                  Matched:
                </span>
                {alert.matchedBecause.map((tag, i) => (
                  <span key={i}>
                    <span className="font-mono text-[10px] text-[var(--foreground)]/70 tracking-wide">
                      {tag}
                    </span>
                    {i < alert.matchedBecause.length - 1 && (
                      <span className="font-mono text-[10px] text-[var(--muted-foreground)] mx-0.5">
                        +
                      </span>
                    )}
                  </span>
                ))}
              </div>
            )}

            {/* Confidence + source */}
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="font-mono text-[10px] uppercase tracking-wider"
                style={{
                  color:
                    alert.confidence === 'high'
                      ? '#059669'
                      : alert.confidence === 'medium'
                        ? 'var(--severity-medium)'
                        : 'var(--muted-foreground)',
                }}
              >
                {alert.confidence} confidence
              </span>
              {alert.sourceUrl && (
                <a
                  href={alert.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 font-mono text-[10px] text-[var(--accent)] hover:underline uppercase tracking-wider min-h-[28px]"
                >
                  Source
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

          {/* Right side: action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleDismiss}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5',
                'text-xs font-medium text-[var(--muted-foreground)]',
                'border border-[var(--border)]',
                'hover:bg-[var(--muted)] hover:text-[var(--foreground)]',
                'transition-colors duration-150 cursor-pointer min-h-[34px]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]'
              )}
              aria-label="Dismiss alert"
            >
              <X className="h-3.5 w-3.5" />
              <span>Dismiss</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5',
                'text-xs font-medium',
                'transition-colors duration-150 cursor-pointer min-h-[34px]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                alert.savedForLater
                  ? 'bg-[var(--accent)] text-white'
                  : 'border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
              )}
              aria-label={alert.savedForLater ? 'Unsave alert' : 'Save for later'}
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span>{alert.savedForLater ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
