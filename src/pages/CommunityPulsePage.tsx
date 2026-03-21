import { useRef, useState } from 'react'
import {
  motion,
  useInView,
  useReducedMotion,
} from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  MessageSquare,
  ChevronDown,
} from 'lucide-react'
import { mockPulseData, type PulseEntry } from '@/data/mock-pulse'

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

const SENTIMENT_COLORS = {
  concerned: '#EF4444',
  neutral: '#94A3B8',
  supportive: '#10B981',
}

function AnimatedBar({
  value,
  color,
  delay = 0,
  label,
}: {
  value: number
  color: string
  delay?: number
  label: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const prefersReducedMotion = useReducedMotion()

  return (
    <div ref={ref} className="flex items-center gap-3">
      <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)] w-20 text-right flex-shrink-0">
        {label}
      </span>
      <div className="flex-1 h-7 rounded-full bg-[var(--muted)] overflow-hidden relative">
        <motion.div
          className="h-full rounded-full relative"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={isInView ? { width: `${value}%` } : { width: 0 }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.8, delay, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] }
          }
        >
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-mono font-bold text-white drop-shadow-sm">
            {value}%
          </span>
        </motion.div>
      </div>
    </div>
  )
}

function SentimentRing({
  sentiment,
  size = 100,
}: {
  sentiment: PulseEntry['sentiment']
  size?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const prefersReducedMotion = useReducedMotion()

  const radius = (size - 10) / 2
  const circumference = 2 * Math.PI * radius

  const segments = [
    { key: 'concerned', value: sentiment.concerned, color: SENTIMENT_COLORS.concerned },
    { key: 'neutral', value: sentiment.neutral, color: SENTIMENT_COLORS.neutral },
    { key: 'supportive', value: sentiment.supportive, color: SENTIMENT_COLORS.supportive },
  ]

  let cumulativeOffset = 0

  return (
    <div ref={ref} className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={8}
        />
        {segments.map((seg) => {
          const segLength = (seg.value / 100) * circumference
          const rotation = (cumulativeOffset / 100) * 360
          cumulativeOffset += seg.value

          return (
            <motion.circle
              key={seg.key}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={8}
              strokeLinecap="butt"
              strokeDasharray={`${segLength} ${circumference - segLength}`}
              style={{ transformOrigin: 'center', rotate: `${rotation}deg` }}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 0.6, delay: 0.3 }
              }
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-[var(--foreground)]">
          {sentiment.concerned}%
        </span>
        <span className="text-[9px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
          Concerned
        </span>
      </div>
    </div>
  )
}

function DemographicBreakdown({ demographics }: { demographics: PulseEntry['demographics'] }) {
  return (
    <div className="space-y-3">
      <h4 className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)]">
        Breakdown by Group
      </h4>
      {demographics.map((demo, i) => (
        <div key={demo.label}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-[var(--foreground)]">{demo.label}</span>
            <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
              {demo.concerned}% concerned
            </span>
          </div>
          <div className="flex h-2.5 rounded-full overflow-hidden bg-[var(--muted)]">
            <AnimatedSegment value={demo.concerned} color={SENTIMENT_COLORS.concerned} delay={i * 0.1} />
            <AnimatedSegment value={demo.neutral} color={SENTIMENT_COLORS.neutral} delay={i * 0.1 + 0.05} />
            <AnimatedSegment value={demo.supportive} color={SENTIMENT_COLORS.supportive} delay={i * 0.1 + 0.1} />
          </div>
        </div>
      ))}
    </div>
  )
}

function AnimatedSegment({ value, color, delay }: { value: number; color: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      className="h-full"
      style={{ backgroundColor: color }}
      initial={{ width: 0 }}
      animate={isInView ? { width: `${value}%` } : { width: 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.6, delay, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] }
      }
    />
  )
}

function PulseCard({ entry, index }: { entry: PulseEntry; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })

  const catColor = CATEGORY_COLORS[entry.category] || '#6B6560'
  const TrendIcon = entry.trending === 'up' ? TrendingUp : entry.trending === 'down' ? TrendingDown : Minus
  const trendColor = entry.trending === 'up' ? '#EF4444' : entry.trending === 'down' ? '#10B981' : '#94A3B8'

  return (
    <motion.div
      ref={ref}
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{ type: 'spring', stiffness: 200, damping: 22, delay: index * 0.08 }}
      className="glass-panel rounded-2xl overflow-hidden"
      style={{ boxShadow: 'var(--elevation-1)' }}
    >
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <SentimentRing sentiment={entry.sentiment} size={80} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: catColor }}
              />
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">
                {entry.category}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] leading-snug mb-2">
              {entry.title}
            </h3>

            {/* Stats row */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Users className="h-3 w-3 text-[var(--muted-foreground)]" />
                <span className="text-[11px] font-mono text-[var(--muted-foreground)]">
                  {entry.totalResponses.toLocaleString()} responses
                </span>
              </div>
              <div className="flex items-center gap-1">
                <TrendIcon className="h-3 w-3" style={{ color: trendColor }} />
                <span
                  className="text-[11px] font-mono font-medium"
                  style={{ color: trendColor }}
                >
                  {entry.weeklyChange > 0 ? '+' : ''}{entry.weeklyChange}% this week
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sentiment bars */}
        <div className="mt-4 space-y-2">
          <AnimatedBar
            value={entry.sentiment.concerned}
            color={SENTIMENT_COLORS.concerned}
            delay={0.2}
            label="Concerned"
          />
          <AnimatedBar
            value={entry.sentiment.neutral}
            color={SENTIMENT_COLORS.neutral}
            delay={0.3}
            label="Neutral"
          />
          <AnimatedBar
            value={entry.sentiment.supportive}
            color={SENTIMENT_COLORS.supportive}
            delay={0.4}
            label="Supportive"
          />
        </div>

        {/* Top concern */}
        <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-red-500/[0.08] border border-red-500/10">
          <MessageSquare className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-[var(--foreground)] leading-relaxed">
            <span className="font-medium">Top concern:</span>{' '}
            {entry.topConcern}
          </p>
        </div>

        {/* Expand demographics */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer min-h-[28px]"
        >
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-3 w-3" />
          </motion.span>
          {expanded ? 'Hide' : 'Show'} demographics
        </button>

        {expanded && (
          <motion.div
            initial={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-[var(--border)]">
              <DemographicBreakdown demographics={entry.demographics} />
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-4">
              {Object.entries(SENTIMENT_COLORS).map(([key, color]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
                    {key}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export function CommunityPulsePage() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-30px' })
  const prefersReducedMotion = useReducedMotion()

  // Aggregate stats
  const totalResponses = mockPulseData.reduce((sum, e) => sum + e.totalResponses, 0)
  const avgConcern = Math.round(
    mockPulseData.reduce((sum, e) => sum + e.sentiment.concerned, 0) / mockPulseData.length
  )
  const trendingUp = mockPulseData.filter((e) => e.trending === 'up').length

  return (
    <div ref={sectionRef} className="px-4 pt-6 pb-8 sm:px-8 lg:px-12 max-w-5xl">
      {/* Page header */}
      <motion.div
        className="mb-8"
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : undefined}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-r from-red-500 to-emerald-500">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">
            Community Pulse
          </h1>
        </div>
        <p className="text-sm text-[var(--muted-foreground)] max-w-lg">
          How people like you feel about upcoming legal changes. Aggregated, anonymous sentiment data.
        </p>
      </motion.div>

      {/* Summary cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8"
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : undefined}
        transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.1 }}
      >
        <div className="glass-panel rounded-xl p-4 text-center" style={{ boxShadow: 'var(--elevation-1)' }}>
          <div className="text-2xl font-bold text-[var(--foreground)]">
            {totalResponses.toLocaleString()}
          </div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)] mt-1">
            Total Responses
          </div>
        </div>
        <div className="glass-panel rounded-xl p-4 text-center" style={{ boxShadow: 'var(--elevation-1)' }}>
          <div className="text-2xl font-bold" style={{ color: SENTIMENT_COLORS.concerned }}>
            {avgConcern}%
          </div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)] mt-1">
            Avg. Concern Level
          </div>
        </div>
        <div className="glass-panel rounded-xl p-4 text-center" style={{ boxShadow: 'var(--elevation-1)' }}>
          <div className="text-2xl font-bold text-[var(--foreground)]">
            {trendingUp}/{mockPulseData.length}
          </div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)] mt-1">
            Trending Up
          </div>
        </div>
      </motion.div>

      {/* Pulse cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {mockPulseData.map((entry, i) => (
          <PulseCard key={entry.legalChangeId} entry={entry} index={i} />
        ))}
      </div>

      {/* Disclaimer */}
      <motion.p
        className="mt-8 text-center text-[10px] font-mono tracking-wider text-[var(--muted-foreground)] max-w-md mx-auto"
        initial={prefersReducedMotion ? undefined : { opacity: 0 }}
        animate={isInView ? { opacity: 1 } : undefined}
        transition={{ delay: 0.8 }}
      >
        Sentiment data is simulated for demonstration purposes.
        In production, data would be aggregated anonymously from user feedback.
      </motion.p>
    </div>
  )
}
