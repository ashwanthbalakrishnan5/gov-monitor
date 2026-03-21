import { useRef, useState } from 'react'
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
  MessageSquare,
  Users,
  Shield,
  Zap,
  CheckCircle2,
} from 'lucide-react'

interface Badge {
  id: string
  title: string
  description: string
  icon: typeof Award
  earned: boolean
  gradient: string
  glowColor: string
}

const BADGES: Badge[] = [
  {
    id: 'first-alert',
    title: 'First Alert',
    description: 'Viewed your first personalized alert',
    icon: Zap,
    earned: true,
    gradient: 'from-amber-400 to-orange-500',
    glowColor: 'rgba(245,158,11,0.3)',
  },
  {
    id: 'profile-complete',
    title: 'Full Profile',
    description: 'Completed 100% of your profile',
    icon: Shield,
    earned: true,
    gradient: 'from-emerald-400 to-cyan-500',
    glowColor: 'rgba(16,185,129,0.3)',
  },
  {
    id: 'bookworm',
    title: 'Bookworm',
    description: 'Saved 5+ alerts for later reading',
    icon: BookOpen,
    earned: false,
    gradient: 'from-blue-400 to-indigo-500',
    glowColor: 'rgba(99,102,241,0.3)',
  },
  {
    id: 'informed',
    title: 'Informed Citizen',
    description: 'Read alerts from 5+ categories',
    icon: Star,
    earned: true,
    gradient: 'from-violet-400 to-purple-500',
    glowColor: 'rgba(139,92,246,0.3)',
  },
  {
    id: 'connector',
    title: 'Connector',
    description: 'Viewed your representatives',
    icon: Users,
    earned: true,
    gradient: 'from-rose-400 to-pink-500',
    glowColor: 'rgba(244,63,94,0.3)',
  },
  {
    id: 'conversant',
    title: 'Conversant',
    description: 'Asked 3+ questions to the AI assistant',
    icon: MessageSquare,
    earned: false,
    gradient: 'from-cyan-400 to-blue-500',
    glowColor: 'rgba(6,182,212,0.3)',
  },
  {
    id: 'streak-3',
    title: '3-Day Streak',
    description: 'Checked alerts 3 days in a row',
    icon: Flame,
    earned: true,
    gradient: 'from-red-400 to-orange-500',
    glowColor: 'rgba(239,68,68,0.3)',
  },
  {
    id: 'sharer',
    title: 'Amplifier',
    description: 'Shared an alert card',
    icon: Share2,
    earned: false,
    gradient: 'from-indigo-400 to-violet-500',
    glowColor: 'rgba(99,102,241,0.3)',
  },
]

function ScoreRing({ score, maxScore }: { score: number; maxScore: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const prefersReducedMotion = useReducedMotion()
  const size = 160
  const radius = (size - 14) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / maxScore) * circumference

  const color = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#6366F1'

  return (
    <div ref={ref} className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={10}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={10}
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
          of {maxScore}
        </span>
      </div>
    </div>
  )
}

function BadgeCard({ badge, index }: { badge: Badge; index: number }) {
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
      className={`glass-panel rounded-2xl p-4 text-center relative overflow-hidden transition-shadow duration-300 ${badge.earned ? 'hover:shadow-lg' : 'opacity-50'}`}
      style={{
        boxShadow: badge.earned ? 'var(--elevation-1)' : 'none',
      }}
    >
      {badge.earned && (
        <div className="absolute top-2 right-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
        </div>
      )}
      <div
        className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${badge.earned ? `bg-gradient-to-br ${badge.gradient}` : 'bg-[var(--muted)]'}`}
        style={badge.earned ? { boxShadow: `0 4px 20px ${badge.glowColor}` } : undefined}
      >
        <Icon className={`h-6 w-6 ${badge.earned ? 'text-white' : 'text-[var(--muted-foreground)]'}`} />
      </div>
      <h3 className="text-sm font-semibold text-[var(--foreground)]">{badge.title}</h3>
      <p className="text-[10px] text-[var(--muted-foreground)] mt-1 leading-relaxed">{badge.description}</p>
    </motion.div>
  )
}

function ShareCard() {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const shareData = {
      title: 'My Legisly Civic Engagement Score',
      text: 'I scored 72/100 on civic engagement with Legisly - tracking legal changes that affect me. Check it out!',
      url: window.location.origin,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // User cancelled
      }
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

export function EngagementPage() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-30px' })
  const prefersReducedMotion = useReducedMotion()

  const earnedCount = BADGES.filter((b) => b.earned).length
  const score = Math.round((earnedCount / BADGES.length) * 100)
  const streakDays = 5 // mock

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
            Track your engagement with legal changes, earn badges, and share your civic awareness.
          </p>
        </motion.div>

        {/* Score + stats row */}
        <motion.div
          className="flex flex-col sm:flex-row items-center gap-6 mb-10"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.1 }}
        >
          <ScoreRing score={score} maxScore={100} />

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
                <span className="text-2xl font-bold text-[var(--foreground)]">{streakDays}</span>
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)] mt-1">
                Day Streak
              </div>
            </div>
            <div className="glass-panel rounded-xl p-4 text-center" style={{ boxShadow: 'var(--elevation-1)' }}>
              <div className="text-2xl font-bold text-indigo-400">
                {BADGES.length - earnedCount}
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
            Badges ({earnedCount}/{BADGES.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BADGES.map((badge, i) => (
              <BadgeCard key={badge.id} badge={badge} index={i} />
            ))}
          </div>
        </motion.div>

        {/* Share card */}
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.2 }}
        >
          <h2 className="text-sm font-mono uppercase tracking-widest text-[var(--muted-foreground)] mb-4">
            Share Your Progress
          </h2>
          <ShareCard />
        </motion.div>
    </div>
  )
}
