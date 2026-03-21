import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FinalCTA() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' })
  const prefersReducedMotion = useReducedMotion()

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-28 lg:py-36 overflow-hidden"
    >
      {/* Gradient background accent */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 80% 50% at 50% 60%, rgba(26,43,74,0.04) 0%, transparent 60%)',
            'radial-gradient(ellipse 60% 40% at 50% 40%, rgba(196,112,62,0.04) 0%, transparent 50%)',
          ].join(', '),
        }}
      />

      {/* Top separator */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-full max-w-5xl"
        style={{ background: 'linear-gradient(90deg, transparent, var(--border-strong), transparent)' }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-5 sm:px-6 lg:px-8 text-center">
        {/* Heading */}
        <motion.h2
          className="font-display text-[var(--foreground)]"
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
              : { type: 'spring', stiffness: 150, damping: 20 }
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
              : { type: 'spring', stiffness: 180, damping: 20, delay: 0.15 }
          }
        >
          <Link
            to="/onboarding"
            className={cn(
              'group relative inline-flex items-center gap-2.5 overflow-hidden',
              'rounded-xl px-10 py-5 text-lg font-semibold text-white',
              'transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
              'min-h-[52px]'
            )}
            style={{
              background: 'linear-gradient(135deg, var(--accent), #B05E2E)',
              boxShadow: '0 4px 16px rgba(196,112,62,0.25)',
            }}
          >
            {/* Shimmer sweep */}
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
          className="mt-6 text-sm text-[var(--muted-foreground)]"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 180, damping: 20, delay: 0.3 }
          }
        >
          No account needed. No data leaves your device.
        </motion.p>
      </div>

      {/* Disclaimer footer */}
      <div className="relative z-10 mx-auto max-w-3xl px-5 sm:px-6 lg:px-8 mt-20">
        <div
          className="pt-6 text-center"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed max-w-xl mx-auto">
            Legisly provides informational summaries of legal and policy changes. This is not legal
            advice. Always consult a qualified attorney for legal guidance specific to your situation.
          </p>
        </div>
      </div>
    </section>
  )
}
