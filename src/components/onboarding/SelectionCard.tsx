import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SelectionCardProps {
  label: string
  description?: string
  selected: boolean
  onClick: () => void
  accentColor?: string
}

export function SelectionCard({
  label,
  description,
  selected,
  onClick,
  accentColor = '#C4703E',
}: SelectionCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      animate={{
        y: selected ? -1 : 0,
      }}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative flex flex-col items-start rounded-xl border p-4 text-left transition-all duration-200 cursor-pointer min-h-[44px]',
        selected
          ? 'shadow-sm'
          : 'border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--muted)]/40'
      )}
      style={
        selected
          ? {
              borderColor: accentColor,
              background: `linear-gradient(to top, ${accentColor}08, transparent)`,
            }
          : undefined
      }
    >
      {/* Selected indicator dot */}
      <motion.div
        className="absolute top-3 right-3 rounded-full"
        initial={false}
        animate={{
          scale: selected ? 1 : 0,
          opacity: selected ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        style={{
          width: 10,
          height: 10,
          backgroundColor: accentColor,
        }}
      />

      <span
        className={cn(
          'text-sm font-medium transition-colors duration-200',
          selected ? 'text-[var(--foreground)]' : 'text-[var(--foreground)]'
        )}
      >
        {label}
      </span>
      {description && (
        <span className="mt-0.5 text-xs text-[var(--muted-foreground)]">
          {description}
        </span>
      )}
    </motion.button>
  )
}
