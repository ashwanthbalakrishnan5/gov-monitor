import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  showWordmark?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: { icon: 24, text: 'text-base' },
  md: { icon: 28, text: 'text-lg' },
  lg: { icon: 36, text: 'text-2xl' },
}

export function Logo({ className, showWordmark = true, size = 'md' }: LogoProps) {
  const s = SIZES[size]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Icon mark */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <rect width="32" height="32" rx="7" fill="#1A2B4A" />
        <rect x="9" y="6" width="4.5" height="20" rx="1.5" fill="#FAFAF9" />
        <rect x="9" y="21.5" width="14" height="4.5" rx="1.5" fill="#C4703E" />
      </svg>

      {/* Wordmark */}
      {showWordmark && (
        <span
          className={cn(
            'font-display tracking-tight text-[var(--foreground)]',
            s.text
          )}
        >
          Legisly
        </span>
      )}
    </div>
  )
}
