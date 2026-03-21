import { useState, useCallback } from 'react'
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from 'framer-motion'
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
  MessageCircle,
  FileEdit,
  CalendarDays,
  Users,
  Megaphone,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PersonalizedAlert } from '@/types/alert'

interface AlertCardProps {
  alert: PersonalizedAlert
  expanded: boolean
  onToggleExpand: (id: string) => void
  onDismiss: (id: string) => void
  onSave: (id: string) => void
  onChatAbout?: (alert: PersonalizedAlert, action?: string) => void
}

// Category config
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
  consumer: { label: 'CONSUMER', color: '#94A3B8', bgColor: '#94A3B815', icon: ShieldCheck },
  business: { label: 'BUSINESS', color: '#2563EB', bgColor: '#2563EB15', icon: Briefcase },
  transportation: { label: 'TRANSPORT', color: '#EA580C', bgColor: '#EA580C15', icon: Globe },
}

const SEVERITY_CONFIG: Record<
  string,
  {
    label: string
    color: string
    bgColor: string
    glowClass: string
    icon: React.ComponentType<{ className?: string }>
  }
> = {
  high: {
    label: 'HIGH',
    color: '#DC2626',
    bgColor: '#DC262618',
    glowClass: 'severity-glow-high',
    icon: AlertTriangle,
  },
  medium: {
    label: 'MEDIUM',
    color: '#D97706',
    bgColor: '#D9770618',
    glowClass: 'severity-glow-medium',
    icon: AlertCircle,
  },
  low: {
    label: 'LOW',
    color: '#2563EB',
    bgColor: '#2563EB18',
    glowClass: 'severity-glow-low',
    icon: Info,
  },
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

export function AlertCard({ alert, expanded, onToggleExpand, onDismiss, onSave, onChatAbout }: AlertCardProps) {
  const [summaryTruncated, setSummaryTruncated] = useState(true)
  const prefersReducedMotion = useReducedMotion()

  const cat = CATEGORY_CONFIG[alert.category] ?? CATEGORY_CONFIG.consumer
  const sev = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.low
  const CatIcon = cat.icon
  const SevIcon = sev.icon

  const summaryIsLong = alert.summary.length > 180

  const handleToggle = useCallback(() => {
    onToggleExpand(alert.legalChangeId)
  }, [onToggleExpand, alert.legalChangeId])

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

  return (
    <motion.article
      layout={!prefersReducedMotion}
      className={cn(
        'group relative overflow-hidden rounded-2xl',
        'glass-panel',
        'transition-shadow duration-300',
        'cursor-pointer',
        'hover:' + sev.glowClass
      )}
      style={{ boxShadow: 'var(--elevation-1)' }}
      whileHover={prefersReducedMotion ? undefined : { boxShadow: 'var(--elevation-3)' }}
      onClick={handleToggle}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleToggle()
        }
      }}
      tabIndex={0}
      role="article"
      aria-label={`${alert.severity} severity alert: ${alert.title}`}
    >
      {/* Severity bar - left edge */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
        style={{ backgroundColor: sev.color }}
      />

      {/* Card content */}
      <div className="pl-5 pr-5 pt-5 pb-4 sm:pl-6 sm:pr-6">
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
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-indigo-500/15 text-indigo-400">
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
              className="ml-1 text-indigo-400 hover:underline cursor-pointer text-sm font-medium"
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
                    className="rounded-xl p-4 border"
                    style={{
                      backgroundColor: `${sev.color}10`,
                      borderColor: `${sev.color}20`,
                    }}
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
                  <div className="rounded-xl border border-[var(--border)] p-4">
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

                {/* Action Center */}
                <div className="rounded-xl border border-[var(--border)] p-4">
                  <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-[var(--foreground)]">
                    Action Center
                  </span>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onChatAbout?.(alert)
                      }}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-[var(--foreground)] border border-[var(--border)] hover:border-indigo-500/50 hover:bg-indigo-500/[0.06] transition-all cursor-pointer min-h-[44px]"
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-indigo-400" />
                      Ask AI about this
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onChatAbout?.(alert, 'draft-letter')
                      }}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-[var(--foreground)] border border-[var(--border)] hover:border-violet-500/50 hover:bg-violet-500/[0.06] transition-all cursor-pointer min-h-[44px]"
                    >
                      <FileEdit className="h-3.5 w-3.5 text-violet-400" />
                      Draft a letter
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onChatAbout?.(alert, 'find-hearings')
                      }}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-[var(--foreground)] border border-[var(--border)] hover:border-rose-500/50 hover:bg-rose-500/[0.06] transition-all cursor-pointer min-h-[44px]"
                    >
                      <CalendarDays className="h-3.5 w-3.5 text-rose-400" />
                      Find hearings
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onChatAbout?.(alert, 'public-comment')
                      }}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-[var(--foreground)] border border-[var(--border)] hover:border-amber-500/50 hover:bg-amber-500/[0.06] transition-all cursor-pointer min-h-[44px]"
                    >
                      <Megaphone className="h-3.5 w-3.5 text-amber-400" />
                      Public comment
                    </button>
                  </div>

                  {/* Community Pulse mini-view */}
                  <div className="mt-3 rounded-lg bg-white/[0.04] px-3 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-indigo-400" />
                      <span className="text-[11px] text-[var(--muted-foreground)]">
                        Community pulse
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1">
                        {['bg-rose-400', 'bg-amber-400', 'bg-indigo-400'].map((bg, i) => (
                          <div key={i} className={cn('w-4 h-4 rounded-full border-2 border-[var(--background)]', bg)} />
                        ))}
                      </div>
                      <span className="text-[11px] font-medium text-[var(--foreground)]">
                        {Math.floor(60 + Math.random() * 30)}% concerned
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expand toggle indicator */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            handleToggle()
          }}
          className="mt-3 flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer min-h-[44px]"
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse details' : 'Expand details'}
        >
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </motion.span>
          <span className="font-mono text-[10px] uppercase tracking-widest font-medium">
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
                    <span className="font-mono text-[10px] text-white/70 tracking-wide">
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
                      ? '#10B981'
                      : alert.confidence === 'medium'
                        ? '#D97706'
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
                  className="inline-flex items-center gap-1 font-mono text-[10px] text-indigo-400 hover:underline uppercase tracking-wider min-h-[28px]"
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
                'hover:bg-white/[0.06] hover:text-[var(--foreground)]',
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
                'transition-all duration-150 cursor-pointer min-h-[34px]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                alert.savedForLater
                  ? 'bg-indigo-500 text-white shadow-[0_2px_8px_rgba(99,102,241,0.3)]'
                  : 'border border-[var(--border)] text-[var(--muted-foreground)] hover:border-indigo-500/50 hover:text-indigo-400'
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
