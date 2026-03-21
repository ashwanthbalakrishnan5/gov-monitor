import { useRef, useEffect, useState } from 'react'
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from 'framer-motion'

// -------------------------------------------------------------------
// Animated number counter
// -------------------------------------------------------------------
function AnimatedNumber({
  target,
  suffix = '',
  isInView,
}: {
  target: number
  suffix?: string
  isInView: boolean
}) {
  const prefersReducedMotion = useReducedMotion()
  const [display, setDisplay] = useState(0)
  const motionVal = useMotionValue(0)
  const springVal = useSpring(motionVal, { stiffness: 50, damping: 20 })

  useEffect(() => {
    if (!isInView) return
    if (prefersReducedMotion) {
      setDisplay(target)
      return
    }
    motionVal.set(target)
    const unsub = springVal.on('change', (v) => {
      setDisplay(Math.round(v))
    })
    return unsub
  }, [isInView, target, prefersReducedMotion, motionVal, springVal])

  return (
    <span>
      {display.toLocaleString()}
      {suffix}
    </span>
  )
}

// -------------------------------------------------------------------
// Word-by-word reveal
// -------------------------------------------------------------------
function WordReveal({
  text,
  isInView,
  className,
  delay = 0,
}: {
  text: string
  isInView: boolean
  className?: string
  delay?: number
}) {
  const prefersReducedMotion = useReducedMotion()
  const words = text.split(' ')

  if (prefersReducedMotion) {
    return <span className={className}>{text}</span>
  }

  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
          animate={
            isInView
              ? { opacity: 1, y: 0, filter: 'blur(0px)' }
              : undefined
          }
          transition={{
            type: 'spring',
            stiffness: 120,
            damping: 18,
            delay: delay + i * 0.04,
          }}
        >
          {word}
          {i < words.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </span>
  )
}

// -------------------------------------------------------------------
// ImpactQuote component
// -------------------------------------------------------------------
export function ImpactQuote() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })
  const prefersReducedMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const parallaxY = useTransform(scrollYProgress, [0, 1], [30, -30])

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-24 lg:py-32 overflow-hidden"
      style={{ background: 'var(--surface-dark)' }}
    >
      {/* Colorful gradient accent */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-indigo-500/[0.06] via-violet-500/[0.08] to-rose-500/[0.06] rounded-full blur-[100px]" />
      </div>

      {/* Mesh grid */}
      <div className="pointer-events-none absolute inset-0 mesh-grid" />

      <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
        <motion.div
          className="relative pl-6 sm:pl-8 lg:pl-10"
          style={prefersReducedMotion ? undefined : { y: parallaxY }}
        >
          {/* Gradient accent bar */}
          <motion.div
            className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full origin-top"
            style={{
              background: 'linear-gradient(180deg, #6366F1, #F43F5E, #F59E0B)',
              opacity: 0.7,
            }}
            initial={prefersReducedMotion ? undefined : { scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : undefined}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }
            }
          />

          <blockquote>
            <p
              className="font-display italic text-white/85"
              style={{
                fontSize: 'clamp(1.5rem, 3.5vw, 2.75rem)',
                letterSpacing: '-0.02em',
                lineHeight: 1.25,
              }}
            >
              <motion.span
                className="inline-block not-italic tabular-nums text-gradient-vivid"
                initial={
                  prefersReducedMotion ? undefined : { opacity: 0, scale: 0.8 }
                }
                animate={
                  isInView ? { opacity: 1, scale: 1 } : undefined
                }
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 100, damping: 15 }
                }
              >
                <AnimatedNumber
                  target={125000}
                  suffix="+"
                  isInView={isInView}
                />
              </motion.span>{' '}
              <WordReveal
                text="Arizonans may lose health insurance in 2026 due to ACA subsidy expiration."
                isInView={isInView}
                delay={0.3}
              />
              <span className="block mt-3">
                <WordReveal
                  text="Would you have known?"
                  isInView={isInView}
                  delay={0.9}
                />
              </span>
            </p>
          </blockquote>

          <motion.cite
            className="block mt-8 not-italic"
            initial={
              prefersReducedMotion ? undefined : { opacity: 0, y: 10 }
            }
            animate={isInView ? { opacity: 1, y: 0 } : undefined}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 120, damping: 20, delay: 1.2 }
            }
          >
            <span className="font-mono text-xs text-white/40 uppercase tracking-[0.08em]">
              Real data from the Arizona healthcare marketplace
            </span>
          </motion.cite>
        </motion.div>
      </div>
    </section>
  )
}
