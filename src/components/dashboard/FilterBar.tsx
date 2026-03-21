import { motion, useReducedMotion } from 'framer-motion'
import {
  Globe,
  Home,
  Briefcase,
  Receipt,
  GraduationCap,
  Heart,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LegalCategory } from '@/types/legal-change'
import type { Severity } from '@/types/alert'

interface FilterBarProps {
  severityFilter: 'all' | Severity
  categoryFilter: string
  onSeverityChange: (severity: 'all' | Severity) => void
  onCategoryChange: (category: string) => void
}

const SEVERITY_OPTIONS: { value: 'all' | Severity; label: string; color?: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'high', label: 'High', color: '#DC2626' },
  { value: 'medium', label: 'Medium', color: '#D97706' },
  { value: 'low', label: 'Low', color: '#2563EB' },
]

const CATEGORY_OPTIONS: {
  value: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}[] = [
  { value: 'all', label: 'All', icon: Globe, color: '#1A2B4A' },
  { value: 'immigration', label: 'Immigration', icon: Globe, color: '#7C3AED' },
  { value: 'housing', label: 'Housing', icon: Home, color: '#059669' },
  { value: 'employment', label: 'Employment', icon: Briefcase, color: '#2563EB' },
  { value: 'taxation', label: 'Tax', icon: Receipt, color: '#D97706' },
  { value: 'education', label: 'Education', icon: GraduationCap, color: '#DB2777' },
  { value: 'healthcare', label: 'Healthcare', icon: Heart, color: '#DC2626' },
]

export function FilterBar({
  severityFilter,
  categoryFilter,
  onSeverityChange,
  onCategoryChange,
}: FilterBarProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div
      className={cn(
        'sticky top-14 z-40 w-full',
        'backdrop-blur-xl bg-white/75 border-b border-black/[0.06]'
      )}
    >
      <div className="mx-auto max-w-3xl px-4">
        {/* Scrollable container with fade edges */}
        <div
          className="relative overflow-x-auto py-3 scrollbar-none"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, black 16px, black calc(100% - 16px), transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 16px, black calc(100% - 16px), transparent 100%)',
          }}
        >
          <div className="flex items-center gap-2 min-w-max px-1">
            {/* Severity pills */}
            {SEVERITY_OPTIONS.map((opt) => {
              const isActive = severityFilter === opt.value
              return (
                <motion.button
                  key={`sev-${opt.value}`}
                  layout={!prefersReducedMotion}
                  onClick={() => onSeverityChange(opt.value)}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
                  className={cn(
                    'relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer min-h-[32px]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1',
                    isActive
                      ? 'text-white'
                      : 'border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]'
                  )}
                  style={
                    isActive
                      ? {
                          backgroundColor:
                            opt.value === 'all' ? 'var(--primary)' : opt.color,
                        }
                      : undefined
                  }
                >
                  {opt.color && opt.value !== 'all' && !isActive && (
                    <span
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: opt.color }}
                    />
                  )}
                  <span className="font-mono text-[11px] uppercase tracking-wider">
                    {opt.label}
                  </span>
                </motion.button>
              )
            })}

            {/* Divider */}
            <div className="mx-1.5 h-5 w-px bg-[var(--border-strong)]" />

            {/* Category pills */}
            {CATEGORY_OPTIONS.map((opt) => {
              const isActive = categoryFilter === opt.value
              const Icon = opt.icon
              return (
                <motion.button
                  key={`cat-${opt.value}`}
                  layout={!prefersReducedMotion}
                  onClick={() => onCategoryChange(opt.value as LegalCategory | 'all')}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
                  className={cn(
                    'relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer min-h-[32px]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1',
                    isActive
                      ? 'text-white'
                      : 'border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]'
                  )}
                  style={
                    isActive
                      ? { backgroundColor: opt.color }
                      : undefined
                  }
                >
                  {opt.value !== 'all' && (
                    <span
                      className="flex-shrink-0"
                      style={!isActive ? { color: opt.color } : undefined}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <span className="font-mono text-[11px] uppercase tracking-wider">
                    {opt.label}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Hide scrollbar */}
      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
