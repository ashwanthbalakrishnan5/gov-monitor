import { cn } from '@/lib/utils'

export function SkeletonCard() {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl',
        'bg-white/80 backdrop-blur-sm',
        'border border-black/[0.05]',
        'p-5'
      )}
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
      }}
      aria-hidden="true"
    >
      {/* Severity bar placeholder */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--border)]" />

      {/* Shimmer overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="skeleton-shimmer absolute inset-0" />
      </div>

      {/* Header row: badge placeholders */}
      <div className="flex items-center gap-2">
        <div className="h-5 w-24 rounded-full bg-[var(--muted)] animate-pulse" />
        <div className="h-5 w-14 rounded-full bg-[var(--muted)] animate-pulse" />
        <div className="ml-auto h-4 w-20 rounded bg-[var(--muted)] animate-pulse" />
      </div>

      {/* Title placeholder */}
      <div className="mt-4 h-5 w-[85%] rounded bg-[var(--muted)] animate-pulse" />

      {/* Summary lines */}
      <div className="mt-3 space-y-2">
        <div className="h-4 w-full rounded bg-[var(--muted)] animate-pulse" />
        <div className="h-4 w-[70%] rounded bg-[var(--muted)] animate-pulse" />
        <div className="h-4 w-[40%] rounded bg-[var(--muted)] animate-pulse" />
      </div>

      {/* Footer placeholder */}
      <div className="mt-5 pt-3 border-t border-[var(--border)] flex items-center justify-between">
        <div className="h-3 w-40 rounded bg-[var(--muted)] animate-pulse" />
        <div className="flex gap-2">
          <div className="h-7 w-16 rounded-lg bg-[var(--muted)] animate-pulse" />
          <div className="h-7 w-14 rounded-lg bg-[var(--muted)] animate-pulse" />
        </div>
      </div>

      <style>{`
        .skeleton-shimmer {
          background: linear-gradient(
            115deg,
            transparent 25%,
            rgba(255, 255, 255, 0.4) 37%,
            rgba(255, 255, 255, 0.6) 50%,
            rgba(255, 255, 255, 0.4) 63%,
            transparent 75%
          );
          background-size: 400% 100%;
          animation: shimmerSweep 2s ease-in-out infinite;
        }
        @keyframes shimmerSweep {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}

export function SkeletonCards({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
