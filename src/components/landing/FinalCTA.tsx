import { useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getProfile } from '@/lib/profile'

export function FinalCTA() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' })
  const prefersReducedMotion = useReducedMotion()
  const ctaTarget = useMemo(() => getProfile() ? '/dashboard' : '/onboarding', [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-28 lg:py-36 overflow-hidden"
      style={{ background: 'var(--surface-dark)' }}
    >
      {/* Dramatic gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-r from-indigo-500/[0.08] via-violet-500/[0.1] to-rose-500/[0.08] rounded-full blur-[120px]" />
      </div>

      {/* Mesh grid */}
      <div className="pointer-events-none absolute inset-0 mesh-grid" />

      {/* Top separator */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-full max-w-5xl"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-5 sm:px-6 lg:px-8 text-center">
        {/* Floating badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-8"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 150, damping: 20 }
          }
        >
          <Sparkles className="h-3 w-3 text-amber-400" />
          <span className="text-xs text-white/50 tracking-wide">
            Takes less than 2 minutes
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          className="font-display text-gradient-hero"
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 3rem)',
            letterSpacing: '-0.02em',
            lineHeight: 1.12,
          }}
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 150, damping: 20, delay: 0.1 }
          }
        >
          Ready to know what affects YOUR life?
        </motion.h2>

        {/* CTA Button */}
        <motion.div
          className="mt-10"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : undefined}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 180, damping: 20, delay: 0.2 }
          }
        >
          <Link
            to={ctaTarget}
            className={cn(
              'group relative inline-flex items-center gap-2.5 overflow-hidden',
              'rounded-xl px-10 py-5 text-lg font-semibold text-white',
              'transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-dark)]',
              'min-h-[52px]'
            )}
            style={{
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #A855F7)',
              boxShadow: '0 4px 24px rgba(99,102,241,0.4), 0 0 80px rgba(139,92,246,0.15)',
            }}
          >
            <span
              className={cn(
                'absolute inset-0 -translate-x-full',
                'bg-gradient-to-r from-transparent via-white/25 to-transparent',
                'transition-transform duration-700 ease-in-out',
                'group-hover:translate-x-full'
              )}
            />
            <span className="relative z-10 flex items-center gap-2.5">
              Get Started
              <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </Link>
        </motion.div>

        {/* Trust subtext */}
        <motion.p
          className="mt-6 text-sm text-white/40"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 180, damping: 20, delay: 0.35 }
          }
        >
          No account needed. No data leaves your device.
        </motion.p>
      </div>

      {/* Disclaimer footer */}
      <div className="relative z-10 mx-auto max-w-3xl px-5 sm:px-6 lg:px-8 mt-20">
        <div
          className="pt-6 text-center"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-xs text-white/30 leading-relaxed max-w-xl mx-auto">
            Legisly provides informational summaries of legal and policy changes. This is not legal
            advice. Always consult a qualified attorney for legal guidance specific to your situation.
          </p>
        </div>
      </div>
    </section>
  )
}
