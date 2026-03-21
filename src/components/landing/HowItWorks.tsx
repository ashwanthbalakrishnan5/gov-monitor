import { useRef, useState } from 'react'
import {
  motion,
  useInView,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'
import { UserCircle, Search, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  {
    number: '01',
    title: 'Tell us about you',
    description:
      'Quick profile setup with just 3 required fields. Your data is never stored on our servers.',
    icon: UserCircle,
    gradient: 'from-indigo-500 to-cyan-400',
    glowColor: 'rgba(99, 102, 241, 0.3)',
  },
  {
    number: '02',
    title: 'We track changes',
    description:
      '15+ real legal changes from federal, state, and local sources, verified.',
    icon: Search,
    gradient: 'from-violet-500 to-purple-400',
    glowColor: 'rgba(139, 92, 246, 0.3)',
  },
  {
    number: '03',
    title: 'Get personalized alerts',
    description:
      'AI analysis of how each change affects you, with action items.',
    icon: Bell,
    gradient: 'from-rose-500 to-amber-400',
    glowColor: 'rgba(244, 63, 94, 0.3)',
  },
]

// -------------------------------------------------------------------
// Card with 3D tilt + gradient border glow
// -------------------------------------------------------------------
function StepCard({
  step,
}: {
  step: (typeof STEPS)[number]
}) {
  const prefersReducedMotion = useReducedMotion()
  const cardRef = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const mouseXSpring = useSpring(mouseX, { stiffness: 200, damping: 20 })
  const mouseYSpring = useSpring(mouseY, { stiffness: 200, damping: 20 })
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['6deg', '-6deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-6deg', '6deg'])

  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const Icon = step.icon

  const handleMouseMove = (e: React.MouseEvent) => {
    if (prefersReducedMotion || !cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
    setSpotlightPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div style={{ perspective: 1000 }}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          mouseX.set(0)
          mouseY.set(0)
        }}
        className={cn(
          'group relative rounded-2xl h-full overflow-hidden',
          'bg-white/[0.03] backdrop-blur-sm',
          'border border-white/[0.08]',
          'transition-all duration-300',
        )}
        style={
          prefersReducedMotion
            ? {
                boxShadow: isHovered
                  ? `0 20px 40px ${step.glowColor}`
                  : '0 4px 16px rgba(0,0,0,0.2)',
                transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
              }
            : {
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d' as const,
                boxShadow: isHovered
                  ? `0 20px 40px ${step.glowColor}`
                  : '0 4px 16px rgba(0,0,0,0.2)',
                borderColor: isHovered ? 'rgba(255,255,255,0.15)' : undefined,
              }
        }
      >
        {/* Top gradient line */}
        <div className={cn('h-[2px] w-full bg-gradient-to-r', step.gradient)} />

        {/* Spotlight overlay */}
        {isHovered && !prefersReducedMotion && (
          <div
            className="pointer-events-none absolute inset-0 z-10 rounded-2xl transition-opacity duration-300"
            style={{
              background: `radial-gradient(400px circle at ${spotlightPos.x}px ${spotlightPos.y}px, ${step.glowColor.replace('0.3', '0.08')}, transparent 40%)`,
            }}
          />
        )}

        <div className="relative z-20 p-6 lg:p-8">
          {/* Step number */}
          <span className={cn(
            'font-mono text-5xl font-bold bg-gradient-to-r bg-clip-text',
            step.gradient
          )} style={{ WebkitTextFillColor: 'transparent', opacity: 0.25 }}>
            {step.number}
          </span>

          {/* Icon */}
          <div className="mt-4 mb-4">
            <div className={cn(
              'inline-flex items-center justify-center rounded-xl p-2.5 bg-gradient-to-r',
              step.gradient
            )}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-white/90">
            {step.title}
          </h3>

          {/* Description */}
          <p className="mt-2 text-sm leading-relaxed text-white/50">
            {step.description}
          </p>
        </div>
      </motion.div>
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
        <div className="absolute inset-0 bg-white/10" />
        <div
          className="absolute inset-y-0 w-12 animate-beam-pulse"
          style={{
            background: 'linear-gradient(90deg, transparent, #8B5CF6, transparent)',
          }}
        />
      </div>
      <svg
        className="absolute -right-1 h-3 w-3 text-violet-400"
        viewBox="0 0 12 12"
        fill="none"
      >
        <path
          d="M2 2L8 6L2 10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
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
      style={{ background: 'var(--surface-dark)' }}
    >
      {/* Subtle aurora bleed from hero */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/[0.04] rounded-full blur-[120px]" />
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

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
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
            className="text-2xl sm:text-3xl font-semibold text-white/90"
            style={{ letterSpacing: '-0.01em', lineHeight: 1.2 }}
          >
            How it works
          </h2>
          <div
            className="mt-3 h-[2px] w-12 rounded-full"
            style={{ background: 'linear-gradient(90deg, #6366F1, #8B5CF6)' }}
          />
        </motion.div>

        {/* Steps with beams */}
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
                  animate={isInView ? { opacity: 1, scale: 1 } : undefined}
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
