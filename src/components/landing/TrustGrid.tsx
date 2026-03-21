import { useRef, useState } from 'react'
import {
  motion,
  useInView,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'
import { HardDrive, Eye, Scale, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

const TRUST_ITEMS = [
  {
    title: 'No accounts. No databases.',
    description:
      'Your profile lives in your browser. Sent securely for analysis, never stored on our servers. Zero tracking, zero data sales.',
    icon: HardDrive,
    span: 'row-span-2' as const,
    featured: true,
    gradient: 'from-indigo-500 to-violet-500',
    glowColor: 'rgba(99, 102, 241, 0.25)',
  },
  {
    title: 'Every alert shows WHY',
    description:
      'Full transparency on why each change was matched to you.',
    icon: Eye,
    span: '' as const,
    featured: false,
    gradient: 'from-cyan-500 to-emerald-500',
    glowColor: 'rgba(6, 182, 212, 0.25)',
  },
  {
    title: 'Not legal advice. Always.',
    description:
      "We inform, we don't advise. Always consult a professional.",
    icon: Scale,
    span: '' as const,
    featured: false,
    gradient: 'from-rose-500 to-pink-500',
    glowColor: 'rgba(244, 63, 94, 0.25)',
  },
  {
    title: 'Source links on everything',
    description:
      'Every alert links directly to official government documents.',
    icon: ExternalLink,
    span: '' as const,
    featured: false,
    gradient: 'from-amber-500 to-orange-500',
    glowColor: 'rgba(245, 158, 11, 0.25)',
  },
]

// -------------------------------------------------------------------
// Bento card with 3D tilt + gradient accents
// -------------------------------------------------------------------
function BentoCard({
  item,
}: {
  item: (typeof TRUST_ITEMS)[number]
  index: number
}) {
  const prefersReducedMotion = useReducedMotion()
  const cardRef = useRef<HTMLDivElement>(null)
  const Icon = item.icon

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const mouseXSpring = useSpring(mouseX, { stiffness: 200, damping: 20 })
  const mouseYSpring = useSpring(mouseY, { stiffness: 200, damping: 20 })
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['4deg', '-4deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-4deg', '4deg'])

  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

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
          'group relative rounded-2xl overflow-hidden h-full',
          'bg-white/[0.03] backdrop-blur-sm',
          'border border-white/[0.08]',
          'transition-all duration-300',
          item.featured ? 'p-8 lg:p-10' : 'p-6 lg:p-8'
        )}
        style={
          prefersReducedMotion
            ? {
                boxShadow: isHovered
                  ? `0 16px 40px ${item.glowColor}`
                  : '0 4px 16px rgba(0,0,0,0.2)',
                transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
              }
            : {
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d' as const,
                boxShadow: isHovered
                  ? `0 16px 40px ${item.glowColor}`
                  : '0 4px 16px rgba(0,0,0,0.2)',
                borderColor: isHovered ? 'rgba(255,255,255,0.12)' : undefined,
              }
        }
      >
        {/* Spotlight overlay */}
        {isHovered && !prefersReducedMotion && (
          <div
            className="pointer-events-none absolute inset-0 z-10 rounded-2xl transition-opacity duration-300"
            style={{
              background: `radial-gradient(500px circle at ${spotlightPos.x}px ${spotlightPos.y}px, ${item.glowColor.replace('0.25', '0.08')}, transparent 40%)`,
            }}
          />
        )}

        <div className="relative z-20 flex flex-col h-full">
          {/* Icon with gradient background */}
          <div className="mb-4">
            <div
              className={cn(
                'inline-flex items-center justify-center rounded-xl bg-gradient-to-r',
                item.featured ? 'p-3' : 'p-2.5',
                item.gradient,
              )}
            >
              <Icon className={cn(item.featured ? 'h-6 w-6' : 'h-5 w-5', 'text-white')} />
            </div>
          </div>

          {/* Title */}
          <h3
            className={cn(
              'font-semibold text-white/90',
              item.featured ? 'text-xl' : 'text-base'
            )}
          >
            {item.title}
          </h3>

          {/* Description */}
          <p className="mt-2 text-sm leading-relaxed text-white/50">
            {item.description}
          </p>

          {/* Featured card: extra indicator */}
          {item.featured && (
            <div className="mt-auto pt-6">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                Privacy first
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// -------------------------------------------------------------------
// TrustGrid
// -------------------------------------------------------------------
export function TrustGrid() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' })
  const prefersReducedMotion = useReducedMotion()

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-24 lg:py-32"
      style={{ background: 'var(--surface-dark)' }}
    >
      {/* Aurora glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-violet-500/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-cyan-500/[0.03] rounded-full blur-[100px]" />
      </div>

      {/* Mesh grid */}
      <div className="pointer-events-none absolute inset-0 mesh-grid" />

      {/* Top separator */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-full max-w-5xl"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.25), transparent)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
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
            className="text-2xl sm:text-3xl font-semibold text-white/90"
            style={{ letterSpacing: '-0.01em', lineHeight: 1.2 }}
          >
            Built on trust
          </h2>
          <div
            className="mt-3 h-[2px] w-12 rounded-full"
            style={{ background: 'linear-gradient(90deg, #06B6D4, #10B981)' }}
          />
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(160px,auto)] gap-5 lg:gap-6">
          {TRUST_ITEMS.map((item, i) => (
            <motion.div
              key={item.title}
              className={cn(
                i === 0 && 'sm:row-span-2',
                i === 3 && 'lg:col-span-2',
              )}
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : undefined}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : {
                      type: 'spring',
                      stiffness: 200,
                      damping: 22,
                      delay: 0.15 + i * 0.1,
                    }
              }
            >
              <BentoCard item={item} index={i} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
