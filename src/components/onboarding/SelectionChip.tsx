import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SelectionChipProps {
  label: string
  selected: boolean
  onClick: () => void
  accentColor?: string
}

export function SelectionChip({
  label,
  selected,
  onClick,
  accentColor = '#C4703E',
}: SelectionChipProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      layout
      transition={{
        layout: { type: 'spring', stiffness: 400, damping: 20 },
        scale: { duration: 0.1 },
      }}
      className={cn(
        'relative inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors duration-200 cursor-pointer select-none',
        'min-h-[44px]',
        selected
          ? 'text-white border-transparent'
          : 'border-[var(--border)] text-[var(--foreground)] hover:border-[var(--border-strong)] hover:bg-[var(--muted)]'
      )}
      style={
        selected
          ? { backgroundColor: accentColor, borderColor: accentColor }
          : undefined
      }
    >
      <span>{label}</span>
      <motion.svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className="shrink-0"
        initial={false}
        animate={{
          width: selected ? 16 : 0,
          opacity: selected ? 1 : 0,
        }}
        transition={{
          width: { type: 'spring', stiffness: 400, damping: 20 },
          opacity: { duration: 0.15 },
        }}
      >
        <motion.path
          d="M3 8.5L6.5 12L13 4"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: selected ? 1 : 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        />
      </motion.svg>
    </motion.button>
  )
}
