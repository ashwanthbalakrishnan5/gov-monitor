import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { UserCircle, Search, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMouseSpotlight } from '@/hooks/use-mouse-spotlight'

const STEPS = [
  {
    number: '01',
    title: 'Tell us about you',
    description:
      'Quick profile setup with just 3 required fields. Your data stays in your browser.',
    icon: UserCircle,
  },
  {
    number: '02',
    title: 'We track changes',
    description:
      '15+ real legal changes from federal, state, and local sources, verified.',
    icon: Search,
  },
  {
    number: '03',
    title: 'Get personalized alerts',
    description:
      'AI analysis of how each change affects you, with action items.',
    icon: Bell,
  },
]

// -------------------------------------------------------------------
// Card with mouse-following spotlight
// -------------------------------------------------------------------
function StepCard({
  step,
}: {
  step: (typeof STEPS)[number]
}) {
  const { mousePos, isHovered, handlers } = useMouseSpotlight()
  const Icon = step.icon
  const prefersReducedMotion = useReducedMotion()

  return (
    <div
      {...handlers}
      className={cn(
        'group relative rounded-xl p-6 lg:p-8 h-full',
        'transition-all duration-300',
        'hover:scale-[1.02]'
      )}
      style={{
        background: 'rgba(255,255,255,0.60)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: isHovered
          ? '0 12px 32px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.05)'
          : '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        borderColor: isHovered ? 'rgba(196,112,62,0.15)' : 'rgba(0,0,0,0.06)',
      }}
    >
      {/* Spotlight overlay */}
      {isHovered && !prefersReducedMotion && (
        <div
          className="pointer-events-none absolute inset-0 z-10 rounded-xl transition-opacity duration-300"
          style={{
            background: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, rgba(196,112,62,0.07), transparent 40%)`,
          }}
        />
      )}

      {/* Step number */}
      <span
        className="font-mono text-4xl font-medium"
        style={{ color: 'var(--accent)', opacity: 0.2 }}
      >
        {step.number}
      </span>

      {/* Icon */}
      <div className="mt-4 mb-4">
        <Icon className="h-7 w-7" style={{ color: 'var(--accent)' }} />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-[var(--foreground)]">
        {step.title}
      </h3>

      {/* Description */}
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
        {step.description}
      </p>
    </div>
  )
}

// -------------------------------------------------------------------
// Animated beam connector between cards
// -------------------------------------------------------------------
function AnimatedBeam() {
  return (
    <div className="hidden md:flex items-center justify-center w-12 lg:w-16 relative self-center">
      <div className="relative w-full h-[2px] overflow-hidden">
        {/* Static line */}
        <div
          className="absolute inset-0"
          style={{ background: 'var(--border-strong)' }}
        />
        {/* Animated pulse */}
        <div
          className="absolute inset-y-0 w-12 animate-beam-pulse"
          style={{
            background:
              'linear-gradient(90deg, transparent, var(--accent), transparent)',
          }}
        />
      </div>
      {/* Arrow tip */}
      <svg
        className="absolute -right-1 h-3 w-3"
        viewBox="0 0 12 12"
        fill="none"
        style={{ color: 'var(--accent)' }}
      >
        <path
          d="M2 2L8 6L2 10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.5"
        />
      </svg>
    </div>
  )
}

// -------------------------------------------------------------------
// HowItWorks component
// -------------------------------------------------------------------
export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' })
  const prefersReducedMotion = useReducedMotion()

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-24 lg:py-32"
      style={{ background: 'var(--background)' }}
    >
      {/* Subtle top separator */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-full max-w-5xl"
        style={{
          background:
            'linear-gradient(90deg, transparent, var(--border-strong), transparent)',
        }}
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Section heading */}
        <motion.div
          className="mb-16 lg:mb-20"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 200, damping: 22 }
          }
        >
          <h2
            className="text-2xl sm:text-3xl font-semibold text-[var(--foreground)]"
            style={{ letterSpacing: '-0.01em', lineHeight: 1.2 }}
          >
            How it works
          </h2>
          <div
            className="mt-3 h-[2px] w-12 rounded-full"
            style={{ backgroundColor: 'var(--accent)' }}
          />
        </motion.div>

        {/* Steps with beams - equal height via auto-rows-fr on wrapper */}
        <div className="flex flex-col md:flex-row gap-6 lg:gap-0 items-stretch">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className="flex items-stretch flex-1 md:contents"
            >
              <motion.div
                className="relative z-10 flex-1"
                initial={
                  prefersReducedMotion ? undefined : { opacity: 0, y: 24 }
                }
                animate={isInView ? { opacity: 1, y: 0 } : undefined}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : {
                        type: 'spring',
                        stiffness: 200,
                        damping: 22,
                        delay: i * 0.15 + 0.2,
                      }
                }
              >
                <StepCard step={step} />
              </motion.div>
              {i < STEPS.length - 1 && (
                <motion.div
                  initial={
                    prefersReducedMotion ? undefined : { opacity: 0, scale: 0 }
                  }
                  animate={
                    isInView ? { opacity: 1, scale: 1 } : undefined
                  }
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { delay: 0.6 + i * 0.15, duration: 0.4 }
                  }
                >
                  <AnimatedBeam />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Beam animation keyframes */}
      <style>{`
        @keyframes beam-pulse {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        .animate-beam-pulse {
          animation: beam-pulse 2.5s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-beam-pulse { animation: none !important; }
        }
      `}</style>
    </section>
  )
}
