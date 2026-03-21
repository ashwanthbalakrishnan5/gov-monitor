import { motion } from 'framer-motion'

const staggerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    },
  }),
}

interface StepFieldProps {
  index: number
  label: string
  helperText?: string
  children: React.ReactNode
}

export function StepField({ index, label, helperText, children }: StepFieldProps) {
  return (
    <motion.div
      custom={index}
      variants={staggerVariants}
      initial="hidden"
      animate="visible"
    >
      <label className="mb-2.5 block text-[13px] font-medium uppercase tracking-widest text-[var(--muted-foreground)]">
        {label}
      </label>
      {children}
      {helperText && (
        <p className="mt-1.5 text-xs text-[var(--muted-foreground)]/70">
          {helperText}
        </p>
      )}
    </motion.div>
  )
}
