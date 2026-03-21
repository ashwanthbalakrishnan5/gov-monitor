import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  motion,
  useInView,
  useReducedMotion,
  useMotionValue,
  useTransform,
  useSpring,
} from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/Logo'

// -------------------------------------------------------------------
// Floating geometric shape for background
// -------------------------------------------------------------------
function FloatingShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = 'from-indigo-500/[0.15]',
}: {
  className?: string
  delay?: number
  width?: number
  height?: number
  rotate?: number
  gradient?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -150, rotate: rotate - 15 }}
      animate={{ opacity: 1, y: 0, rotate }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn('absolute', className)}
    >
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ width, height }}
        className="relative"
      >
        <div
          className={cn(
            'absolute inset-0 rounded-full',
            'bg-gradient-to-r to-transparent',
            gradient,
            'backdrop-blur-[2px] border border-white/[0.08]',
            'shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]',
            'after:absolute after:inset-0 after:rounded-full',
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15),transparent_70%)]"
          )}
        />
      </motion.div>
    </motion.div>
  )
}

// -------------------------------------------------------------------
// Animated counter hook
// -------------------------------------------------------------------
function AnimatedCounter({
  value,
  duration = 2,
}: {
  value: number
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const prefersReducedMotion = useReducedMotion()

  const motionVal = useMotionValue(0)
  const springVal = useSpring(motionVal, {
    stiffness: 80,
    damping: 20,
    duration: duration,
  })
  const rounded = useTransform(springVal, (v) => Math.round(v))

  if (isInView) {
    motionVal.set(value)
  }

  if (prefersReducedMotion) {
    return <span ref={ref}>{value}</span>
  }

  return <motion.span ref={ref}>{rounded}</motion.span>
}

// -------------------------------------------------------------------
// 3D Interactive Alert Card with mouse-following tilt + spotlight
// -------------------------------------------------------------------
function HeroAlertPreview() {
  const prefersReducedMotion = useReducedMotion()

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 })
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 })
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['8deg', '-8deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-8deg', '8deg'])

  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const xPct = (e.clientX - rect.left) / rect.width - 0.5
    const yPct = (e.clientY - rect.top) / rect.height - 0.5
    x.set(xPct)
    y.set(yPct)
    setSpotlightPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <motion.div
      className="relative w-full max-w-[400px] cursor-default"
      style={
        prefersReducedMotion
          ? undefined
          : { rotateX, rotateY, transformStyle: 'preserve-3d' }
      }
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); setIsHovered(false) }}
      onMouseEnter={() => setIsHovered(true)}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl w-full',
          'bg-white/[0.05] backdrop-blur-xl',
          'border border-white/[0.1]',
          'transition-all duration-300'
        )}
        style={{
          boxShadow: isHovered
            ? '0 20px 60px rgba(99,102,241,0.2), 0 8px 20px rgba(0,0,0,0.3)'
            : '0 8px 32px rgba(0,0,0,0.3), 0 0 60px rgba(99,102,241,0.08)',
        }}
      >
        {/* Spotlight overlay */}
        {isHovered && !prefersReducedMotion && (
          <div
            className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
            style={{
              background: `radial-gradient(350px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(139,92,246,0.15), transparent 45%)`,
            }}
          />
        )}

        {/* Top gradient accent bar */}
        <div
          className="h-[3px] w-full"
          style={{
            background: 'linear-gradient(90deg, #6366F1, #8B5CF6, #F43F5E, #F59E0B)',
          }}
        />

        <div className="px-6 pt-5 pb-6">
          {/* Category label */}
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-white/50">
            Immigration · High Priority
          </span>

          {/* Title */}
          <h3
            className="mt-3 font-display text-[22px] text-white/90"
            style={{ lineHeight: 1.2, letterSpacing: '-0.01em' }}
          >
            H-1B Weighted Selection Final Rule
          </h3>

          {/* Personal impact */}
          <blockquote
            className="mt-4 pl-4 text-[13px] leading-relaxed text-white/50"
            style={{ borderLeft: '2px solid #F43F5E' }}
          >
            As an F-1 student on OPT, the new weighted selection process
            directly affects your path to H-1B work authorization.
          </blockquote>

          {/* Matched trait tags */}
          <div className="mt-5 flex items-center gap-2">
            {['F-1 visa', 'OPT', 'STEM'].map((tag) => (
              <span
                key={tag}
                className="rounded-full px-2.5 py-1 text-[10px] font-mono tracking-wide bg-white/[0.06] text-white/60 border border-white/[0.08]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Glow beneath the card */}
      <div
        className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 w-[80%] h-16 rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.25) 0%, transparent 70%)',
          opacity: isHovered ? 1 : 0.6,
          transition: 'opacity 0.3s',
        }}
      />
    </motion.div>
  )
}

// -------------------------------------------------------------------
// Heading lines (staggered reveal)
// -------------------------------------------------------------------
const HEADING_LINES = [
  { text: 'The gap between', italic: false },
  { text: '\u201Ca law was passed\u201D and', italic: true },
  { text: '\u201Cyou understood it\u201D', italic: true },
  { text: 'is massive.', italic: false },
]
const TAGLINE = 'Legisly closes it.'

// -------------------------------------------------------------------
// Hero component
// -------------------------------------------------------------------
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const prefersReducedMotion = useReducedMotion()

  const lineTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 120, damping: 18 }

  const stagger = prefersReducedMotion ? 0 : 0.15

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
      },
    }),
  }

  return (
    <section
      ref={sectionRef}
      className="relative min-h-dvh w-full overflow-hidden"
      style={{ background: 'var(--surface-dark)' }}
    >
      {/* ========== BACKGROUND LAYERS ========== */}

      {/* Base gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/[0.07] via-transparent to-rose-500/[0.05] blur-3xl" />

      {/* Mesh grid */}
      <div className="pointer-events-none absolute inset-0 mesh-grid" />

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <FloatingShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-indigo-500/[0.12]"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />
        <FloatingShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-rose-500/[0.12]"
          className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
        />
        <FloatingShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-violet-500/[0.12]"
          className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
        />
        <FloatingShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          gradient="from-amber-500/[0.12]"
          className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
        />
        <FloatingShape
          delay={0.7}
          width={150}
          height={40}
          rotate={-25}
          gradient="from-cyan-500/[0.12]"
          className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
        />
      </div>

      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--surface-dark)] via-transparent to-[var(--surface-dark)]/80" />

      {/* ========== TOP BAR ========== */}
      <div className="absolute top-0 left-0 right-0 z-20 mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo size="sm" inverted />
          <Link
            to="/onboarding"
            className="text-sm font-medium text-white/50 hover:text-white transition-colors min-h-[44px] flex items-center"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* ========== CONTENT ========== */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="flex min-h-dvh flex-col lg:flex-row items-center lg:items-center gap-12 lg:gap-16 py-16 lg:py-0">
          {/* ===== LEFT COLUMN: Text ===== */}
          <div className="flex-1 flex flex-col justify-center pt-12 lg:pt-0">
            {/* Badge */}
            <motion.div
              custom={0}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-8 w-fit"
            >
              <Sparkles className="h-3 w-3 text-violet-400" />
              <span className="text-xs text-white/50 tracking-wide">
                AI-Powered Legal Monitoring
              </span>
            </motion.div>

            {/* Heading with staggered line reveal */}
            <motion.h1
              className="font-display"
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                letterSpacing: '-0.02em',
                lineHeight: 1.08,
              }}
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: stagger } },
              }}
            >
              {HEADING_LINES.map((line, i) => (
                <motion.span
                  key={i}
                  className={cn(
                    'block',
                    line.italic && 'italic',
                    i < 3 ? 'text-gradient-hero' : ''
                  )}
                  style={
                    i >= 3 ? { color: 'rgba(255,255,255,0.85)' } : undefined
                  }
                  variants={{
                    hidden: prefersReducedMotion
                      ? {}
                      : { opacity: 0, y: 18, filter: 'blur(8px)' },
                    visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
                  }}
                  transition={lineTransition}
                >
                  {line.text}
                </motion.span>
              ))}

              {/* Tagline with vivid gradient */}
              <motion.span
                className="block mt-4 text-gradient-vivid"
                variants={{
                  hidden: prefersReducedMotion
                    ? {}
                    : { opacity: 0, y: 18, filter: 'blur(8px)' },
                  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
                }}
                transition={lineTransition}
              >
                {TAGLINE}
              </motion.span>
            </motion.h1>

            {/* CTA Button */}
            <motion.div
              className="mt-10"
              initial={
                prefersReducedMotion
                  ? undefined
                  : { opacity: 0, y: 16, scale: 0.95 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 200, damping: 20, delay: 0.7 }
              }
            >
              <Link
                to="/onboarding"
                className={cn(
                  'group relative inline-flex items-center gap-2 overflow-hidden',
                  'rounded-xl px-8 py-4 text-base font-semibold text-white',
                  'transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-dark)]',
                  'min-h-[48px]'
                )}
                style={{
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #A855F7)',
                  boxShadow: '0 4px 24px rgba(99,102,241,0.4), 0 0 60px rgba(139,92,246,0.15)',
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
                <span className="relative z-10 flex items-center gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </Link>
            </motion.div>

            {/* Stat counters */}
            <motion.div
              className="mt-10 grid grid-cols-3 gap-6 max-w-md"
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 200, damping: 20, delay: 0.9 }
              }
            >
              <div className="flex flex-col">
                <span className="font-mono text-2xl font-medium text-white/90">
                  <AnimatedCounter value={15} />+
                </span>
                <span className="font-mono text-[11px] text-white/40 tracking-wide uppercase mt-1">
                  changes tracked
                </span>
              </div>

              <div className="flex flex-col">
                <span className="font-mono text-2xl font-medium text-white/90">
                  <AnimatedCounter value={9} />
                </span>
                <span className="font-mono text-[11px] text-white/40 tracking-wide uppercase mt-1">
                  categories
                </span>
              </div>

              <div className="flex flex-col">
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                  </span>
                  <span className="font-mono text-sm font-medium text-emerald-400">
                    Live
                  </span>
                </span>
                <span className="font-mono text-[11px] text-white/40 tracking-wide uppercase mt-1">
                  AI powered
                </span>
              </div>
            </motion.div>
          </div>

          {/* ===== RIGHT COLUMN: Card preview ===== */}
          <motion.div
            className="flex-shrink-0 w-full lg:w-auto flex justify-center lg:justify-end"
            style={{ perspective: 1200 }}
            initial={
              prefersReducedMotion
                ? undefined
                : { opacity: 0, x: 40, rotateY: -8 }
            }
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 120, damping: 20, delay: 0.5 }
            }
          >
            <HeroAlertPreview />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
