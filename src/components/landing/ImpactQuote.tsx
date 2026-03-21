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
// Animated number counter that counts up from 0
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
// Word-by-word reveal for quote text
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
      style={{ background: 'var(--background)' }}
    >
      {/* Subtle background accent */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(196,112,62,0.04) 0%, transparent 60%)',
        }}
      />

      {/* Background texture pattern */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, var(--border) 0.5px, transparent 0.5px)',
          backgroundSize: '24px 24px',
          opacity: 0.2,
        }}
      />

      <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
        <motion.div
          className="relative pl-6 sm:pl-8 lg:pl-10"
          style={prefersReducedMotion ? undefined : { y: parallaxY }}
        >
          {/* Accent vertical pull-quote marker */}
          <motion.div
            className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full origin-top"
            style={{ backgroundColor: 'var(--accent)', opacity: 0.6 }}
            initial={prefersReducedMotion ? undefined : { scaleY: 0 }}
            animate={isInView ? { scaleY: 1 } : undefined}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }
            }
          />

          {/* Quote text with word-by-word reveal */}
          <blockquote>
            <p
              className="font-display italic text-[var(--foreground)]"
              style={{
                fontSize: 'clamp(1.5rem, 3.5vw, 2.75rem)',
                letterSpacing: '-0.02em',
                lineHeight: 1.25,
              }}
            >
              {/* Animated number inline */}
              <motion.span
                className="inline-block not-italic tabular-nums"
                style={{ color: 'var(--accent)' }}
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

          {/* Citation */}
          <motion.cite
            className="block mt-8 not-italic"
            initial={
              prefersReducedMotion ? undefined : { opacity: 0, y: 10 }
            }
            animate={isInView ? { opacity: 1, y: 0 } : undefined}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    type: 'spring',
                    stiffness: 120,
                    damping: 20,
                    delay: 1.2,
                  }
            }
          >
            <span className="font-mono text-xs text-[var(--muted-foreground)] uppercase tracking-[0.08em]">
              Real data from the Arizona healthcare marketplace
            </span>
          </motion.cite>
        </motion.div>
      </div>
    </section>
  )
}
