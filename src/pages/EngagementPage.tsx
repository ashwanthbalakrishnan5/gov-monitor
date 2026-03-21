import { useRef, useState, useMemo, useEffect } from 'react'
import {
  motion,
  useInView,
  useReducedMotion,
} from 'framer-motion'
import {
  Award,
  Flame,
  Share2,
  Trophy,
  Star,
  BookOpen,
  Users,
  Shield,
  Zap,
  CheckCircle2,
  TrendingUp,
  Eye,
} from 'lucide-react'
import { getProfile } from '@/lib/profile'
import { calculateCompleteness } from '@/lib/completeness'
import { recordPageVisit } from '@/lib/engagement'

const DISMISSED_KEY = 'legisly-dismissed-ids'
const SAVED_KEY = 'legisly-saved-ids'
const STREAK_KEY = 'legisly-streak'
const VISITS_KEY = 'legisly-page-visits'

interface StreakData {
  currentStreak: number
  lastVisitDate: string
}

function getStreak(): StreakData {
  try {
    const raw = localStorage.getItem(STREAK_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { currentStreak: 1, lastVisitDate: new Date().toISOString().split('T')[0] }
}

function updateStreak(): StreakData {
  const today = new Date().toISOString().split('T')[0]
  const existing = getStreak()

  if (existing.lastVisitDate === today) return existing

  const lastDate = new Date(existing.lastVisitDate)
  const todayDate = new Date(today)
  const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

  const updated: StreakData = {
    currentStreak: diffDays === 1 ? existing.currentStreak + 1 : 1,
    lastVisitDate: today,
  }

  try { localStorage.setItem(STREAK_KEY, JSON.stringify(updated)) } catch { /* ignore */ }
  return updated
}

function getPageVisits(): Set<string> {
  try {
    const raw = localStorage.getItem(VISITS_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

// ── Compute real engagement stats ──
function useEngagementStats() {
  return useMemo(() => {
    const dismissed = loadArray(DISMISSED_KEY)
    const saved = loadArray(SAVED_KEY)
    const profile = getProfile()
    const completeness = profile ? calculateCompleteness(profile) : 0
    const streak = updateStreak()
    const visits = getPageVisits()

    // Count unique categories from cached alerts
    const alertCategories = new Set<string>()
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('legisly-alerts-')) {
        try {
          const cached = JSON.parse(localStorage.getItem(key) ?? '[]')
          for (const alert of cached) {
            if (alert.category) alertCategories.add(alert.category)
          }
        } catch { /* ignore */ }
      }
    }

    const alertsViewed = dismissed.length + saved.length
    const alertsSaved = saved.length

    return {
      alertsViewed,
      alertsSaved,
      completeness,
      streak: streak.currentStreak,
      visitedPages: visits,
      categoriesRead: alertCategories.size,
      hasProfile: !!profile,
      visitedReps: visits.has('representatives'),
    }
  }, [])
}

function loadArray(key: string): string[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

// ── Badge definitions with real conditions ──
interface BadgeDef {
  id: string
  title: string
  description: string
  icon: typeof Award
  gradient: string
  glowColor: string
  check: (stats: ReturnType<typeof useEngagementStats>) => boolean
  progress?: (stats: ReturnType<typeof useEngagementStats>) => string
}

const BADGE_DEFS: BadgeDef[] = [
  {
    id: 'first-alert',
    title: 'First Alert',
    description: 'Viewed your first personalized alert',
    icon: Zap,
    gradient: 'from-amber-400 to-orange-500',
    glowColor: 'rgba(245,158,11,0.3)',
    check: (s) => s.alertsViewed >= 1,
    progress: (s) => s.alertsViewed >= 1 ? 'Earned' : '0/1 alerts viewed',
  },
  {
    id: 'profile-complete',
    title: 'Full Profile',
    description: 'Completed 100% of your profile',
    icon: Shield,
    gradient: 'from-emerald-400 to-cyan-500',
    glowColor: 'rgba(16,185,129,0.3)',
    check: (s) => s.completeness >= 100,
    progress: (s) => s.completeness >= 100 ? 'Earned' : `${s.completeness}% complete`,
  },
  {
    id: 'bookworm',
    title: 'Bookworm',
    description: 'Saved 5+ alerts for later reading',
    icon: BookOpen,
    gradient: 'from-blue-400 to-indigo-500',
    glowColor: 'rgba(99,102,241,0.3)',
    check: (s) => s.alertsSaved >= 5,
    progress: (s) => s.alertsSaved >= 5 ? 'Earned' : `${s.alertsSaved}/5 saved`,
  },
  {
    id: 'informed',
    title: 'Informed Citizen',
    description: 'Viewed alerts from 4+ categories',
    icon: Star,
    gradient: 'from-violet-400 to-purple-500',
    glowColor: 'rgba(139,92,246,0.3)',
    check: (s) => s.categoriesRead >= 4,
    progress: (s) => s.categoriesRead >= 4 ? 'Earned' : `${s.categoriesRead}/4 categories`,
  },
  {
    id: 'connector',
    title: 'Connector',
    description: 'Visited the Representatives page',
    icon: Users,
    gradient: 'from-rose-400 to-pink-500',
    glowColor: 'rgba(244,63,94,0.3)',
    check: (s) => s.visitedReps,
  },
  {
    id: 'explorer',
    title: 'Explorer',
    description: 'Visited 5+ different pages',
    icon: Eye,
    gradient: 'from-cyan-400 to-blue-500',
    glowColor: 'rgba(6,182,212,0.3)',
    check: (s) => s.visitedPages.size >= 5,
    progress: (s) => s.visitedPages.size >= 5 ? 'Earned' : `${s.visitedPages.size}/5 pages`,
  },
  {
    id: 'streak-3',
    title: '3-Day Streak',
    description: 'Checked alerts 3 days in a row',
    icon: Flame,
    gradient: 'from-red-400 to-orange-500',
    glowColor: 'rgba(239,68,68,0.3)',
    check: (s) => s.streak >= 3,
    progress: (s) => s.streak >= 3 ? 'Earned' : `${s.streak}/3 day streak`,
  },
  {
    id: 'curator',
    title: 'Curator',
    description: 'Reviewed and dismissed 10+ alerts',
    icon: TrendingUp,
    gradient: 'from-indigo-400 to-violet-500',
    glowColor: 'rgba(99,102,241,0.3)',
    check: (s) => s.alertsViewed >= 10,
    progress: (s) => s.alertsViewed >= 10 ? 'Earned' : `${s.alertsViewed}/10 reviewed`,
  },
]

// ── ScoreRing ──
function ScoreRing({ score, maxScore, label }: { score: number; maxScore: number; label?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const prefersReducedMotion = useReducedMotion()
  const size = 168
  const strokeWidth = 10
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / maxScore) * circumference
  const pct = Math.round((score / maxScore) * 100)

  const color = pct >= 70 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#6366F1'

  return (
    <div ref={ref} className="relative" style={{ width: size, height: size }}>
      {/* Glow behind ring */}
      <motion.div
        className="absolute inset-4 rounded-full blur-2xl"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.15, backgroundColor: color } : undefined}
        transition={{ duration: 1, delay: 0.5 }}
      />

      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={isInView ? { strokeDashoffset: offset } : undefined}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 1.5, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] }
          }
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-bold text-[var(--foreground)]"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isInView ? { opacity: 1, scale: 1 } : undefined}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 200, damping: 15, delay: 0.5 }
          }
        >
          {score}
        </motion.span>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)]">
          {label ?? `of ${maxScore}`}
        </span>
      </div>
    </div>
  )
}

// ── BadgeCard ──
interface BadgeCardProps {
  badge: BadgeDef
  earned: boolean
  progress?: string
  index: number
}

function BadgeCard({ badge, earned, progress, index }: BadgeCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const prefersReducedMotion = useReducedMotion()
  const Icon = badge.icon

  return (
    <motion.div
      ref={ref}
      initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : undefined}
      transition={{ type: 'spring', stiffness: 200, damping: 20, delay: index * 0.06 }}
      className={`glass-panel rounded-2xl p-4 text-center relative overflow-hidden transition-all duration-300 ${earned ? 'hover:shadow-lg' : 'opacity-40'}`}
      style={{
        boxShadow: earned ? 'var(--elevation-1)' : 'none',
      }}
    >
      {earned && (
        <div className="absolute top-2 right-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
        </div>
      )}
      <div
        className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${earned ? `bg-gradient-to-br ${badge.gradient}` : 'bg-[var(--muted)]'}`}
        style={earned ? { boxShadow: `0 4px 20px ${badge.glowColor}` } : undefined}
      >
        <Icon className={`h-6 w-6 ${earned ? 'text-white' : 'text-[var(--muted-foreground)]'}`} />
      </div>
      <h3 className="text-sm font-semibold text-[var(--foreground)]">{badge.title}</h3>
      <p className="text-[10px] text-[var(--muted-foreground)] mt-1 leading-relaxed">{badge.description}</p>
      {!earned && progress && (
        <div className="mt-2 text-[9px] font-mono uppercase tracking-wider text-indigo-400/70">
          {progress}
        </div>
      )}
    </motion.div>
  )
}

// ── ShareCard ──
function ShareCard({ score }: { score: number }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const shareData = {
      title: 'My Legisly Civic Engagement Score',
      text: `I scored ${score}/100 on civic engagement with Legisly. Tracking legal changes that affect me.`,
      url: window.location.origin,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch { /* User cancelled */ }
    } else {
      await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <motion.div
      className="glass-panel rounded-2xl overflow-hidden"
      style={{ boxShadow: 'var(--elevation-2)' }}
    >
      {/* Gradient header */}
      <div className="h-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #F43F5E)' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <Trophy className="h-10 w-10 text-white/30" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-8" style={{ background: 'linear-gradient(transparent, var(--card))' }} />
      </div>

      <div className="p-5 -mt-4 relative">
        <h3 className="text-base font-semibold text-[var(--foreground)] mb-1">
          Share Your Engagement
        </h3>
        <p className="text-xs text-[var(--muted-foreground)] mb-4">
          Let others know you are staying informed about legal changes that affect your community.
        </p>

        <button
          type="button"
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white transition-all cursor-pointer min-h-[44px]"
          style={{
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
          }}
        >
          {copied ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Copied to clipboard!
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" />
              Share Score Card
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
}

// ── Activity log ──
function ActivityLog({ stats }: { stats: ReturnType<typeof useEngagementStats> }) {
  const activities = useMemo(() => {
    const items: { icon: typeof Award; label: string; color: string; time: string }[] = []

    if (stats.hasProfile) {
      items.push({ icon: Shield, label: 'Profile created', color: '#10B981', time: 'Completed' })
    }
    if (stats.alertsViewed > 0) {
      items.push({ icon: Eye, label: `${stats.alertsViewed} alerts reviewed`, color: '#F59E0B', time: 'Active' })
    }
    if (stats.alertsSaved > 0) {
      items.push({ icon: BookOpen, label: `${stats.alertsSaved} alerts saved`, color: '#6366F1', time: 'Active' })
    }
    if (stats.visitedReps) {
      items.push({ icon: Users, label: 'Representatives explored', color: '#F43F5E', time: 'Visited' })
    }
    if (stats.streak > 1) {
      items.push({ icon: Flame, label: `${stats.streak}-day streak active`, color: '#EF4444', time: 'Today' })
    }
    if (stats.categoriesRead > 0) {
      items.push({ icon: Star, label: `${stats.categoriesRead} categories explored`, color: '#8B5CF6', time: 'Active' })
    }

    return items
  }, [stats])

  if (activities.length === 0) return null

  return (
    <div className="space-y-2">
      {activities.map((act, i) => {
        const Icon = act.icon
        return (
          <motion.div
            key={act.label}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            className="flex items-center gap-3 glass-panel rounded-xl px-4 py-3"
          >
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${act.color}15` }}>
              <Icon className="h-3.5 w-3.5" style={{ color: act.color }} />
            </div>
            <span className="flex-1 text-sm text-[var(--foreground)]">{act.label}</span>
            <span className="text-[10px] font-mono text-[var(--muted-foreground)]">{act.time}</span>
          </motion.div>
        )
      })}
    </div>
  )
}

// ── Main Page ──
export function EngagementPage() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-30px' })
  const prefersReducedMotion = useReducedMotion()

  // Record this page visit
  useEffect(() => {
    recordPageVisit('engagement')
  }, [])

  const stats = useEngagementStats()

  const badges = useMemo(() =>
    BADGE_DEFS.map((def) => ({
      ...def,
      earned: def.check(stats),
      progressText: def.progress?.(stats),
    })),
    [stats]
  )

  const earnedCount = badges.filter((b) => b.earned).length
  const score = Math.round((earnedCount / badges.length) * 100)

  return (
    <div ref={sectionRef} className="px-4 pt-6 pb-8 sm:px-8 lg:px-12 max-w-4xl">
      {/* Page header */}
      <motion.div
        className="mb-8"
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : undefined}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-rose-500">
            <Award className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">
            Civic Engagement
          </h1>
        </div>
        <p className="text-sm text-[var(--muted-foreground)] max-w-lg">
          Your engagement is tracked in real-time based on how you interact with alerts, pages, and your profile.
        </p>
      </motion.div>

      {/* Score + stats row */}
      <motion.div
        className="flex flex-col sm:flex-row items-center gap-6 mb-10"
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : undefined}
        transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.1 }}
      >
        <ScoreRing score={score} maxScore={100} label="civic score" />

        <div className="flex-1 grid grid-cols-3 gap-3 w-full sm:w-auto">
          <div className="glass-panel rounded-xl p-4 text-center" style={{ boxShadow: 'var(--elevation-1)' }}>
            <div className="text-2xl font-bold text-[var(--foreground)]">{earnedCount}</div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)] mt-1">
              Badges
            </div>
          </div>
          <div className="glass-panel rounded-xl p-4 text-center" style={{ boxShadow: 'var(--elevation-1)' }}>
            <div className="flex items-center justify-center gap-1">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-bold text-[var(--foreground)]">{stats.streak}</span>
            </div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)] mt-1">
              Day Streak
            </div>
          </div>
          <div className="glass-panel rounded-xl p-4 text-center" style={{ boxShadow: 'var(--elevation-1)' }}>
            <div className="text-2xl font-bold text-indigo-400">
              {badges.length - earnedCount}
            </div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)] mt-1">
              To Earn
            </div>
          </div>
        </div>
      </motion.div>

      {/* Badges grid */}
      <motion.div
        className="mb-8"
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : undefined}
        transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.15 }}
      >
        <h2 className="text-sm font-mono uppercase tracking-widest text-[var(--muted-foreground)] mb-4">
          Badges ({earnedCount}/{badges.length})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {badges.map((badge, i) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              earned={badge.earned}
              progress={badge.progressText}
              index={i}
            />
          ))}
        </div>
      </motion.div>

      {/* Activity log */}
      <motion.div
        className="mb-8"
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : undefined}
        transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.2 }}
      >
        <h2 className="text-sm font-mono uppercase tracking-widest text-[var(--muted-foreground)] mb-4">
          Your Activity
        </h2>
        <ActivityLog stats={stats} />
      </motion.div>

      {/* Share card */}
      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : undefined}
        transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.25 }}
      >
        <h2 className="text-sm font-mono uppercase tracking-widest text-[var(--muted-foreground)] mb-4">
          Share Your Progress
        </h2>
        <ShareCard score={score} />
      </motion.div>
    </div>
  )
}
