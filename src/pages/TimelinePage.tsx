import { useRef, useState } from 'react'
import {
  motion,
  useInView,
  useReducedMotion,
} from 'framer-motion'
import {
  Calendar,
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { legalChanges } from '@/data/legal-changes/index'

interface TimelineEvent {
  id: string
  title: string
  category: string
  severity: 'high' | 'medium' | 'low'
  dateEffective: string
  summary: string
  impact: string
}

const SEVERITY_CONFIG: Record<string, { color: string; icon: typeof AlertTriangle; gradient: string }> = {
  high: { color: '#DC2626', icon: AlertTriangle, gradient: 'from-red-500 to-rose-500' },
  medium: { color: '#D97706', icon: AlertCircle, gradient: 'from-amber-500 to-orange-500' },
  low: { color: '#2563EB', icon: Info, gradient: 'from-blue-500 to-indigo-500' },
}

const CATEGORY_COLORS: Record<string, string> = {
  immigration: '#7C3AED',
  housing: '#059669',
  employment: '#2563EB',
  taxation: '#D97706',
  education: '#DB2777',
  healthcare: '#DC2626',
  consumer: '#94A3B8',
  business: '#2563EB',
  transportation: '#EA580C',
}

// Generate timeline events from legal changes
function generateTimelineEvents(): TimelineEvent[] {
  const severities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low']
  const impacts = [
    'This directly affects your current status and requires action within 30 days.',
    'Monitor this change closely as it may impact your financial situation.',
    'New requirements may apply to your situation starting on the effective date.',
    'Changes to eligibility criteria could affect your access to benefits.',
    'Updated regulations may change how your employer handles your documentation.',
  ]

  return legalChanges
    .filter((c) => c.dateEffective)
    .map((change, i) => ({
      id: change.id,
      title: change.title,
      category: change.category,
      severity: severities[i % 3],
      dateEffective: change.dateEffective!,
      summary: change.genericSummary,
      impact: impacts[i % impacts.length],
    }))
    .sort((a, b) => new Date(a.dateEffective).getTime() - new Date(b.dateEffective).getTime())
}

function TimelineCard({ event, index }: { event: TimelineEvent; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const sev = SEVERITY_CONFIG[event.severity] || SEVERITY_CONFIG.low
  const SevIcon = sev.icon
  const catColor = CATEGORY_COLORS[event.category] || '#6B6560'
  const isLeft = index % 2 === 0

  const dateStr = new Date(event.dateEffective).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const now = new Date()
  const effectiveDate = new Date(event.dateEffective)
  const daysUntil = Math.ceil((effectiveDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const isPast = daysUntil < 0
  const isImminent = daysUntil >= 0 && daysUntil <= 30

  return (
    <div ref={ref} className="relative flex items-center w-full mb-8 md:mb-12">
      {/* Center line node */}
      <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 z-10">
        <motion.div
          initial={prefersReducedMotion ? undefined : { scale: 0 }}
          animate={isInView ? { scale: 1 } : undefined}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center border-4 border-[#0A0A0F]',
            isPast ? 'bg-white/[0.12]' : ''
          )}
          style={
            isPast
              ? undefined
              : {
                  background: `linear-gradient(135deg, ${sev.color}, ${sev.color}cc)`,
                  boxShadow: `0 0 20px ${sev.color}40`,
                }
          }
        >
          <SevIcon className="h-3.5 w-3.5 text-white" />
        </motion.div>
      </div>

      {/* Card */}
      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, x: isLeft ? -30 : 30 }}
        animate={isInView ? { opacity: 1, x: 0 } : undefined}
        transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.15 }}
        className={cn(
          'ml-14 md:ml-0 w-[calc(100%-3.5rem)] md:w-[calc(50%-2.5rem)]',
          isLeft ? 'md:mr-auto' : 'md:ml-auto'
        )}
      >
        <div
          className={cn(
            'glass-panel rounded-2xl p-4 sm:p-5 cursor-pointer transition-all duration-200',
            isImminent && 'ring-1 ring-amber-400/30'
          )}
          style={{ boxShadow: 'var(--elevation-1)' }}
          onClick={() => setExpanded(!expanded)}
        >
          {/* Date badge */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-[var(--muted-foreground)]" />
              <span className="font-mono text-[11px] font-medium text-[var(--muted-foreground)]">
                {dateStr}
              </span>
            </div>
            <span
              className={cn(
                'text-[10px] font-mono font-medium px-2 py-0.5 rounded-full',
                isPast
                  ? 'bg-white/[0.08] text-white/60'
                  : isImminent
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'bg-indigo-500/15 text-indigo-400'
              )}
            >
              {isPast
                ? 'In effect'
                : daysUntil === 0
                  ? 'Today'
                  : `${daysUntil} days`}
            </span>
          </div>

          {/* Category + severity */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: catColor }}
            />
            <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">
              {event.category}
            </span>
            <span
              className="font-mono text-[10px] uppercase tracking-widest font-medium"
              style={{ color: sev.color }}
            >
              {event.severity}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-[var(--foreground)] leading-snug">
            {event.title}
          </h3>

          {/* Expand toggle */}
          <button
            type="button"
            className="mt-2 flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
          >
            <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="h-3 w-3" />
            </motion.span>
            {expanded ? 'Less' : 'Impact'}
          </button>

          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-[var(--border)]">
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  {event.summary}
                </p>
                <div
                  className="mt-2 rounded-lg p-3 text-xs leading-relaxed"
                  style={{
                    backgroundColor: `${sev.color}08`,
                    borderLeft: `2px solid ${sev.color}`,
                    color: 'var(--foreground)',
                  }}
                >
                  {event.impact}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export function TimelinePage() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-30px' })
  const prefersReducedMotion = useReducedMotion()

  const events = generateTimelineEvents()

  return (
    <div ref={sectionRef} className="px-4 pt-6 pb-8 sm:px-8 lg:px-12 max-w-5xl">
      {/* Page header */}
      <motion.div
        className="mb-10"
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : undefined}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">
            Impact Timeline
          </h1>
        </div>
        <p className="text-sm text-[var(--muted-foreground)] max-w-lg">
          See when legal changes take effect and how they cascade over the coming months.
        </p>
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        {/* Center vertical line */}
        <div
          className="absolute left-[1.95rem] md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-[2px]"
          style={{ background: 'linear-gradient(180deg, #6366F1, #8B5CF6, #F43F5E, var(--border))' }}
        />

        {events.map((event, i) => (
          <TimelineCard key={event.id} event={event} index={i} />
        ))}
      </div>
    </div>
  )
}
