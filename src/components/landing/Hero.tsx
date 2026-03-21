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
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/Logo'

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

  // 3D tilt
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

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    setIsHovered(false)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  return (
    <motion.div
      className="relative w-full max-w-[380px] cursor-default"
      style={
        prefersReducedMotion
          ? undefined
          : {
              rotateX,
              rotateY,
              transformStyle: 'preserve-3d',
            }
      }
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-xl w-full',
          'bg-white/80 backdrop-blur-sm',
          'border border-black/[0.05]',
          'transition-shadow duration-300'
        )}
        style={{
          boxShadow: isHovered
            ? '0 20px 60px rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.08)'
            : '0 8px 32px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.06)',
        }}
      >
        {/* Spotlight overlay */}
        {isHovered && !prefersReducedMotion && (
          <div
            className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
            style={{
              background: `radial-gradient(350px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(196,112,62,0.10), transparent 45%)`,
            }}
          />
        )}

        {/* Top accent gradient bar */}
        <div
          className="h-[3px] w-full"
          style={{
            background: 'linear-gradient(90deg, #7C3AED, #DC2626)',
          }}
        />

        <div className="px-6 pt-5 pb-6">
          {/* Category label */}
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
            Immigration · High Priority
          </span>

          {/* Title */}
          <h3
            className="mt-3 font-display text-[22px] text-[var(--foreground)]"
            style={{ lineHeight: 1.2, letterSpacing: '-0.01em' }}
          >
            H-1B Weighted Selection Final Rule
          </h3>

          {/* Personal impact as editorial pull-quote */}
          <blockquote
            className="mt-4 pl-4 text-[13px] leading-relaxed text-[var(--muted-foreground)]"
            style={{ borderLeft: '2px solid #DC2626' }}
          >
            As an F-1 student on OPT, the new weighted selection process
            directly affects your path to H-1B work authorization.
          </blockquote>

          {/* Matched trait tags */}
          <div className="mt-5 flex items-center gap-2">
            {['F-1 visa', 'OPT', 'STEM'].map((tag) => (
              <span
                key={tag}
                className="rounded-full px-2.5 py-1 text-[10px] font-mono tracking-wide"
                style={{
                  background: 'var(--muted)',
                  color: 'var(--muted-foreground)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Reflection/glow beneath the card */}
      <div
        className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 w-[85%] h-12 rounded-full blur-2xl"
        style={{
          background:
            'radial-gradient(ellipse, rgba(196,112,62,0.15) 0%, transparent 70%)',
          opacity: isHovered ? 1 : 0.5,
          transition: 'opacity 0.3s',
        }}
      />
    </motion.div>
  )
}

// -------------------------------------------------------------------
// Hero heading lines (staggered reveal)
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

  return (
    <section
      ref={sectionRef}
      className="relative min-h-dvh w-full overflow-hidden"
      style={{ background: 'var(--background)' }}
    >
      {/* ========== BACKGROUND LAYERS ========== */}

      {/* Animated mesh gradient - more dramatic */}
      <div className="pointer-events-none absolute inset-0 hero-mesh-gradient" />

      {/* Floating translucent orbs - increased opacity */}
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 700,
          height: 700,
          top: '-18%',
          right: '-10%',
          background:
            'radial-gradient(circle, rgba(196,112,62,0.14) 0%, transparent 70%)',
          animation: 'heroOrb1 25s ease-in-out infinite',
        }}
      />
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 600,
          height: 600,
          bottom: '-15%',
          left: '-10%',
          background:
            'radial-gradient(circle, rgba(26,43,74,0.12) 0%, transparent 70%)',
          animation: 'heroOrb2 30s ease-in-out infinite',
        }}
      />
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 400,
          height: 400,
          top: '30%',
          left: '50%',
          background:
            'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',
          animation: 'heroOrb3 22s ease-in-out infinite',
        }}
      />

      {/* Dot grid overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, var(--border) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.35,
        }}
      />

      {/* ========== TOP BAR ========== */}
      <div className="absolute top-0 left-0 right-0 z-20 mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo size="sm" />
          <Link
            to="/onboarding"
            className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors min-h-[44px] flex items-center"
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
            {/* Heading with staggered line reveal */}
            <motion.h1
              className="font-display text-[var(--foreground)]"
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                letterSpacing: '-0.02em',
                lineHeight: 1.08,
              }}
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: stagger },
                },
              }}
            >
              {HEADING_LINES.map((line, i) => (
                <motion.span
                  key={i}
                  className={cn('block', line.italic && 'italic')}
                  variants={{
                    hidden: prefersReducedMotion
                      ? {}
                      : { opacity: 0, y: 18, filter: 'blur(8px)' },
                    visible: {
                      opacity: 1,
                      y: 0,
                      filter: 'blur(0px)',
                    },
                  }}
                  transition={lineTransition}
                >
                  {line.text}
                </motion.span>
              ))}

              {/* Spacer + tagline */}
              <motion.span
                className="block mt-4 text-[var(--accent)]"
                variants={{
                  hidden: prefersReducedMotion
                    ? {}
                    : { opacity: 0, y: 18, filter: 'blur(8px)' },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                  },
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
                  : {
                      type: 'spring',
                      stiffness: 200,
                      damping: 20,
                      delay: 0.7,
                    }
              }
            >
              <Link
                to="/onboarding"
                className={cn(
                  'group relative inline-flex items-center gap-2 overflow-hidden',
                  'rounded-lg px-8 py-4 text-base font-semibold text-white',
                  'transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2',
                  'min-h-[48px]'
                )}
                style={{
                  background: 'linear-gradient(135deg, var(--accent), #B05E2E)',
                  boxShadow: '0 4px 20px rgba(196,112,62,0.3)',
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

            {/* Stat counters - FIXED: grid layout with consistent structure */}
            <motion.div
              className="mt-10 grid grid-cols-3 gap-6 max-w-md"
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : {
                      type: 'spring',
                      stiffness: 200,
                      damping: 20,
                      delay: 0.9,
                    }
              }
            >
              <div className="flex flex-col">
                <span className="font-mono text-2xl font-medium text-[var(--foreground)]">
                  <AnimatedCounter value={15} />+
                </span>
                <span className="font-mono text-[11px] text-[var(--muted-foreground)] tracking-wide uppercase mt-1">
                  changes tracked
                </span>
              </div>

              <div className="flex flex-col">
                <span className="font-mono text-2xl font-medium text-[var(--foreground)]">
                  <AnimatedCounter value={9} />
                </span>
                <span className="font-mono text-[11px] text-[var(--muted-foreground)] tracking-wide uppercase mt-1">
                  categories
                </span>
              </div>

              <div className="flex flex-col">
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                  </span>
                  <span className="font-mono text-sm font-medium text-[var(--accent)]">
                    Live
                  </span>
                </span>
                <span className="font-mono text-[11px] text-[var(--muted-foreground)] tracking-wide uppercase mt-1">
                  AI powered
                </span>
              </div>
            </motion.div>
          </div>

          {/* ===== RIGHT COLUMN: Card preview with 3D tilt ===== */}
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
                : {
                    type: 'spring',
                    stiffness: 120,
                    damping: 20,
                    delay: 0.5,
                  }
            }
          >
            <HeroAlertPreview />
          </motion.div>
        </div>
      </div>

      {/* ========== CSS ANIMATIONS ========== */}
      <style>{`
        .hero-mesh-gradient {
          background:
            radial-gradient(ellipse 80% 60% at 25% 15%, rgba(26,43,74,0.10) 0%, transparent 55%),
            radial-gradient(ellipse 60% 50% at 75% 35%, rgba(196,112,62,0.09) 0%, transparent 50%),
            radial-gradient(ellipse 70% 50% at 50% 85%, rgba(124,58,237,0.06) 0%, transparent 50%);
          animation: heroMeshShift 20s ease-in-out infinite;
        }

        @keyframes heroMeshShift {
          0%, 100% {
            background:
              radial-gradient(ellipse 80% 60% at 25% 15%, rgba(26,43,74,0.10) 0%, transparent 55%),
              radial-gradient(ellipse 60% 50% at 75% 35%, rgba(196,112,62,0.09) 0%, transparent 50%),
              radial-gradient(ellipse 70% 50% at 50% 85%, rgba(124,58,237,0.06) 0%, transparent 50%);
          }
          33% {
            background:
              radial-gradient(ellipse 70% 65% at 35% 25%, rgba(26,43,74,0.12) 0%, transparent 55%),
              radial-gradient(ellipse 65% 55% at 65% 45%, rgba(196,112,62,0.10) 0%, transparent 50%),
              radial-gradient(ellipse 60% 45% at 40% 75%, rgba(124,58,237,0.05) 0%, transparent 50%);
          }
          66% {
            background:
              radial-gradient(ellipse 85% 55% at 20% 20%, rgba(26,43,74,0.09) 0%, transparent 55%),
              radial-gradient(ellipse 55% 60% at 80% 30%, rgba(196,112,62,0.12) 0%, transparent 50%),
              radial-gradient(ellipse 75% 55% at 55% 80%, rgba(124,58,237,0.07) 0%, transparent 50%);
          }
        }

        @keyframes heroOrb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-35px, 25px) scale(1.06); }
          66% { transform: translate(25px, -18px) scale(0.96); }
        }
        @keyframes heroOrb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -25px) scale(1.04); }
          66% { transform: translate(-20px, 30px) scale(0.97); }
        }
        @keyframes heroOrb3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, -30px) scale(1.07); }
          66% { transform: translate(35px, 18px) scale(0.94); }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-mesh-gradient { animation: none !important; }
          [style*="animation: heroOrb"] { animation: none !important; }
        }
      `}</style>
    </section>
  )
}
