import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { HardDrive, Eye, Scale, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMouseSpotlight } from '@/hooks/use-mouse-spotlight'

const TRUST_ITEMS = [
  {
    title: 'Your data stays on YOUR device',
    description:
      'All profile data lives in your browser. Nothing stored on servers. Zero tracking, zero data sales.',
    icon: HardDrive,
    span: 'row-span-2' as const,
    featured: true,
  },
  {
    title: 'Every alert shows WHY',
    description:
      'Full transparency on why each change was matched to you.',
    icon: Eye,
    span: '' as const,
    featured: false,
  },
  {
    title: 'Not legal advice. Always.',
    description:
      "We inform, we don't advise. Always consult a professional.",
    icon: Scale,
    span: '' as const,
    featured: false,
  },
  {
    title: 'Source links on everything',
    description:
      'Every alert links directly to official government documents.',
    icon: ExternalLink,
    span: '' as const,
    featured: false,
  },
]

// -------------------------------------------------------------------
// Bento card with spotlight effect
// -------------------------------------------------------------------
function BentoCard({
  item,
}: {
  item: (typeof TRUST_ITEMS)[number]
  index: number
}) {
  const { mousePos, isHovered, handlers } = useMouseSpotlight()
  const prefersReducedMotion = useReducedMotion()
  const Icon = item.icon

  return (
    <div
      {...handlers}
      className={cn(
        'group relative rounded-xl overflow-hidden h-full',
        'transition-all duration-300',
        item.featured ? 'p-8 lg:p-10' : 'p-6 lg:p-8'
      )}
      style={{
        background: 'rgba(255,255,255,0.60)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: isHovered
          ? '0 12px 32px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.05)'
          : '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
        transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
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

      <div className="relative z-20 flex flex-col h-full">
        {/* Icon */}
        <div className="mb-4">
          <div
            className={cn(
              'inline-flex items-center justify-center rounded-lg',
              item.featured ? 'p-3' : 'p-2.5'
            )}
            style={{
              backgroundColor: 'rgba(196,112,62,0.08)',
            }}
          >
            <Icon
              className={cn(item.featured ? 'h-6 w-6' : 'h-5 w-5')}
              style={{ color: 'var(--accent)' }}
            />
          </div>
        </div>

        {/* Title */}
        <h3
          className={cn(
            'font-semibold text-[var(--foreground)]',
            item.featured ? 'text-xl' : 'text-base'
          )}
        >
          {item.title}
        </h3>

        {/* Description */}
        <p
          className={cn(
            'mt-2 leading-relaxed text-[var(--muted-foreground)]',
            item.featured ? 'text-sm' : 'text-sm'
          )}
        >
          {item.description}
        </p>

        {/* Featured card: extra visual indicator */}
        {item.featured && (
          <div className="mt-auto pt-6">
            <div
              className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider"
              style={{ color: 'var(--accent)' }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Privacy first
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// -------------------------------------------------------------------
// TrustGrid component with asymmetric bento layout
// -------------------------------------------------------------------
export function TrustGrid() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' })
  const prefersReducedMotion = useReducedMotion()

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-24 lg:py-32"
      style={{ background: 'var(--background)' }}
    >
      {/* Top separator */}
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
          className="mb-14 lg:mb-16"
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
            Built on trust
          </h2>
          <div
            className="mt-3 h-[2px] w-12 rounded-full"
            style={{ backgroundColor: 'var(--accent)' }}
          />
        </motion.div>

        {/* Asymmetric bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(160px,auto)] gap-5 lg:gap-6">
          {/* Card 0: Featured - tall, takes 2 rows on desktop */}
          <motion.div
            className="sm:row-span-2"
            initial={
              prefersReducedMotion ? undefined : { opacity: 0, y: 20 }
            }
            animate={isInView ? { opacity: 1, y: 0 } : undefined}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    type: 'spring',
                    stiffness: 200,
                    damping: 22,
                    delay: 0.15,
                  }
            }
          >
            <BentoCard item={TRUST_ITEMS[0]} index={0} />
          </motion.div>

          {/* Card 1: Top right */}
          <motion.div
            initial={
              prefersReducedMotion ? undefined : { opacity: 0, y: 20 }
            }
            animate={isInView ? { opacity: 1, y: 0 } : undefined}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    type: 'spring',
                    stiffness: 200,
                    damping: 22,
                    delay: 0.25,
                  }
            }
          >
            <BentoCard item={TRUST_ITEMS[1]} index={1} />
          </motion.div>

          {/* Card 2: Middle right */}
          <motion.div
            initial={
              prefersReducedMotion ? undefined : { opacity: 0, y: 20 }
            }
            animate={isInView ? { opacity: 1, y: 0 } : undefined}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    type: 'spring',
                    stiffness: 200,
                    damping: 22,
                    delay: 0.35,
                  }
            }
          >
            <BentoCard item={TRUST_ITEMS[2]} index={2} />
          </motion.div>

          {/* Card 3: Bottom right - spans 2 cols on lg */}
          <motion.div
            className="lg:col-span-2"
            initial={
              prefersReducedMotion ? undefined : { opacity: 0, y: 20 }
            }
            animate={isInView ? { opacity: 1, y: 0 } : undefined}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    type: 'spring',
                    stiffness: 200,
                    damping: 22,
                    delay: 0.45,
                  }
            }
          >
            <BentoCard item={TRUST_ITEMS[3]} index={3} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
