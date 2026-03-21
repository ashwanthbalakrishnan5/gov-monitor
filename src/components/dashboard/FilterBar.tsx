import {
  Globe,
  Home,
  Briefcase,
  Receipt,
  GraduationCap,
  Heart,
  ShieldCheck,
  Bookmark,
  Car,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LegalCategory } from '@/types/legal-change'
import type { Severity } from '@/types/alert'

interface FilterBarProps {
  severityFilter: 'all' | Severity
  categoryFilter: string
  savedOnly: boolean
  onSeverityChange: (severity: 'all' | Severity) => void
  onCategoryChange: (category: string) => void
  onSavedOnlyChange: (saved: boolean) => void
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
  { value: 'all', label: 'All', icon: Globe, color: '#94A3B8' },
  { value: 'immigration', label: 'Immigration', icon: Globe, color: '#7C3AED' },
  { value: 'housing', label: 'Housing', icon: Home, color: '#059669' },
  { value: 'employment', label: 'Employment', icon: Briefcase, color: '#2563EB' },
  { value: 'taxation', label: 'Tax', icon: Receipt, color: '#D97706' },
  { value: 'education', label: 'Education', icon: GraduationCap, color: '#DB2777' },
  { value: 'healthcare', label: 'Healthcare', icon: Heart, color: '#DC2626' },
  { value: 'business', label: 'Business', icon: Briefcase, color: '#2563EB' },
  { value: 'consumer', label: 'Consumer', icon: ShieldCheck, color: '#94A3B8' },
  { value: 'transportation', label: 'Transport', icon: Car, color: '#EA580C' },
]

export function FilterBar({
  severityFilter,
  categoryFilter,
  savedOnly,
  onSeverityChange,
  onCategoryChange,
  onSavedOnlyChange,
}: FilterBarProps) {
  return (
    <div className="w-full">
      <div>
        <div
          className="relative overflow-x-auto py-3 scrollbar-none"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, black 16px, black calc(100% - 16px), transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 16px, black calc(100% - 16px), transparent 100%)',
          }}
        >
          <div className="flex items-center gap-2 min-w-max px-1">
            {/* Saved toggle */}
            <button
              onClick={() => onSavedOnlyChange(!savedOnly)}
              className={cn(
                'relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer min-h-[44px]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1',
                savedOnly
                  ? 'text-white shadow-[0_2px_8px_rgba(196,112,62,0.25)]'
                  : 'border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
              )}
              style={savedOnly ? { backgroundColor: 'var(--accent)' } : undefined}
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span className="font-mono text-[11px] uppercase tracking-wider">
                Saved
              </span>
            </button>

            {/* Divider */}
            <div className="mx-1 h-5 w-px bg-[var(--border-strong)]" />

            {/* Severity pills */}
            {SEVERITY_OPTIONS.map((opt) => {
              const isActive = severityFilter === opt.value
              return (
                <button
                  key={`sev-${opt.value}`}
                  onClick={() => onSeverityChange(opt.value)}
                  className={cn(
                    'relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer min-h-[44px]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1',
                    isActive
                      ? 'text-white'
                      : 'border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]'
                  )}
                  style={
                    isActive
                      ? {
                          backgroundColor:
                            opt.value === 'all' ? 'var(--accent)' : opt.color,
                          boxShadow: opt.color ? `0 2px 8px ${opt.color}30` : undefined,
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
                </button>
              )
            })}

            {/* Divider */}
            <div className="mx-1.5 h-5 w-px bg-[var(--border-strong)]" />

            {/* Category pills */}
            {CATEGORY_OPTIONS.map((opt) => {
              const isActive = categoryFilter === opt.value
              const Icon = opt.icon
              return (
                <button
                  key={`cat-${opt.value}`}
                  onClick={() => onCategoryChange(opt.value as LegalCategory | 'all')}
                  className={cn(
                    'relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer min-h-[44px]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1',
                    isActive
                      ? 'text-white'
                      : 'border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]'
                  )}
                  style={
                    isActive
                      ? {
                          backgroundColor: opt.color,
                          boxShadow: `0 2px 8px ${opt.color}30`,
                        }
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
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
