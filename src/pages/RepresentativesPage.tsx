import { useRef, useState, useEffect } from 'react'
import {
  motion,
  useInView,
  useReducedMotion,
} from 'framer-motion'
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockRepresentatives, type Representative, type VoteRecord } from '@/data/mock-representatives'
import { recordPageVisit } from '@/lib/engagement'

const PARTY_COLORS: Record<string, string> = {
  D: '#2563EB',
  R: '#DC2626',
  I: '#7C3AED',
}

const CATEGORY_COLORS: Record<string, string> = {
  immigration: '#7C3AED',
  housing: '#059669',
  employment: '#2563EB',
  taxation: '#D97706',
  education: '#DB2777',
  healthcare: '#DC2626',
}

function AlignmentRing({ score, size = 56 }: { score: number; size?: number }) {
  const radius = (size - 6) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color =
    score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={4}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold" style={{ color }}>
          {score}%
        </span>
      </div>
    </div>
  )
}

function VoteItem({ vote }: { vote: VoteRecord }) {
  const catColor = CATEGORY_COLORS[vote.category] || '#6B6560'

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[var(--border)] last:border-0">
      <div
        className={cn(
          'flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0',
          vote.vote === 'yea' ? 'bg-emerald-500/10' : vote.vote === 'nay' ? 'bg-red-500/10' : 'bg-gray-500/10'
        )}
      >
        {vote.vote === 'yea' ? (
          <ThumbsUp className="h-3.5 w-3.5 text-emerald-400" />
        ) : vote.vote === 'nay' ? (
          <ThumbsDown className="h-3.5 w-3.5 text-red-400" />
        ) : (
          <Minus className="h-3.5 w-3.5 text-white/40" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--foreground)] truncate">
          {vote.billTitle}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: catColor }}
          />
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
            {vote.category}
          </span>
          <span className="text-[10px] text-[var(--muted-foreground)]">
            {new Date(vote.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
      <span
        className={cn(
          'text-[10px] font-mono font-medium uppercase tracking-wider px-2 py-0.5 rounded-full',
          vote.alignedWithUser
            ? 'bg-emerald-500/10 text-emerald-400'
            : 'bg-red-500/10 text-red-400'
        )}
      >
        {vote.alignedWithUser ? 'Aligned' : 'Opposed'}
      </span>
    </div>
  )
}

function RepresentativeCard({ rep }: { rep: Representative }) {
  const [expanded, setExpanded] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const partyColor = PARTY_COLORS[rep.party] || '#6B6560'

  return (
    <motion.div
      layout={!prefersReducedMotion}
      className="glass-panel rounded-2xl overflow-hidden transition-shadow duration-300 hover:shadow-[var(--elevation-3)]"
      style={{ boxShadow: 'var(--elevation-1)' }}
    >
      {/* Party color bar */}
      <div className="h-[3px] w-full" style={{ background: partyColor }} />

      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          {/* Avatar placeholder */}
          <div
            className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-white text-lg font-bold"
            style={{ background: `linear-gradient(135deg, ${partyColor}, ${partyColor}aa)` }}
          >
            {rep.name.split(' ').map(n => n[0]).join('')}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-[var(--foreground)] truncate">
                {rep.name}
              </h3>
              <span
                className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-full text-white"
                style={{ backgroundColor: partyColor }}
              >
                {rep.party}
              </span>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              {rep.title}{rep.district ? ` (${rep.district})` : ''}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
                {rep.level} · {rep.chamber}
              </span>
            </div>
          </div>

          {/* Alignment ring */}
          <AlignmentRing score={rep.alignmentScore} />
        </div>

        {/* Contact buttons */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <a
            href={`tel:${rep.phone}`}
            className="flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-medium text-[var(--foreground)] border border-[var(--border)] hover:border-indigo-500/50 hover:bg-indigo-500/[0.04] transition-all min-h-[44px]"
          >
            <Phone className="h-3.5 w-3.5 text-indigo-500" />
            Call
          </a>
          <a
            href={`mailto:${rep.email}`}
            className="flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-medium text-[var(--foreground)] border border-[var(--border)] hover:border-violet-500/50 hover:bg-violet-500/[0.04] transition-all min-h-[44px]"
          >
            <Mail className="h-3.5 w-3.5 text-violet-500" />
            Email
          </a>
          <a
            href={`https://${rep.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-medium text-[var(--foreground)] border border-[var(--border)] hover:border-cyan-500/50 hover:bg-cyan-500/[0.04] transition-all min-h-[44px]"
          >
            <Globe className="h-3.5 w-3.5 text-cyan-500" />
            Website
          </a>
        </div>

        {/* Office address */}
        <div className="mt-3 flex items-start gap-2 text-xs text-[var(--muted-foreground)]">
          <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          <span>{rep.office}</span>
        </div>

        {/* Committees */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {rep.committees.map((c) => (
            <span
              key={c}
              className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)]"
            >
              {c}
            </span>
          ))}
        </div>

        {/* Expand voting record */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-4 flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer min-h-[28px]"
        >
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-3.5 w-3.5" />
          </motion.span>
          <span className="font-mono text-[10px] uppercase tracking-widest">
            {expanded ? 'Hide' : 'Voting'} record ({rep.votingRecord.length})
          </span>
        </button>

        {expanded && (
          <motion.div
            initial={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="mt-2 overflow-hidden"
          >
            <div className="rounded-xl border border-[var(--border)] p-3">
              {rep.votingRecord.map((vote) => (
                <VoteItem key={vote.billId} vote={vote} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export function RepresentativesPage() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-50px' })
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => { recordPageVisit('representatives') }, [])

  const federalReps = mockRepresentatives.filter((r) => r.level === 'federal')
  const stateReps = mockRepresentatives.filter((r) => r.level === 'state')

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
          <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500">
            <Users className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">
            Your Representatives
          </h1>
        </div>
        <p className="text-sm text-[var(--muted-foreground)] max-w-lg">
          Based on your Arizona location. Alignment scores show how their voting record matches issues that affect you.
        </p>
      </motion.div>

      {/* Federal */}
      <motion.div
        className="mb-8"
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : undefined}
        transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.1 }}
      >
        <h2 className="text-sm font-mono uppercase tracking-widest text-[var(--muted-foreground)] mb-4">
          Federal Representatives
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {federalReps.map((rep) => (
            <RepresentativeCard key={rep.id} rep={rep} />
          ))}
        </div>
      </motion.div>

      {/* State */}
      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : undefined}
        transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.2 }}
      >
        <h2 className="text-sm font-mono uppercase tracking-widest text-[var(--muted-foreground)] mb-4">
          State Representatives
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {stateReps.map((rep) => (
            <RepresentativeCard key={rep.id} rep={rep} />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
