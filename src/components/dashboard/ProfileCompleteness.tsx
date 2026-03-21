import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'

interface ProfileCompletenessProps {
  percentage: number
  size?: number
}

export function ProfileCompleteness({ percentage, size = 36 }: ProfileCompletenessProps) {
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()
  const [displayValue, setDisplayValue] = useState(0)
  const [showTooltip, setShowTooltip] = useState(false)
  const animationRef = useRef<number | null>(null)

  // Get ring color based on percentage
  function getRingColor(pct: number): string {
    if (pct < 40) return 'var(--severity-high)'
    if (pct <= 70) return 'var(--severity-medium)'
    return '#059669' // emerald green
  }

  // Count-up animation
  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(percentage)
      return
    }

    const startTime = performance.now()
    const duration = 1200
    const startValue = 0

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.round(startValue + (percentage - startValue) * eased))

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(tick)
      }
    }

    animationRef.current = requestAnimationFrame(tick)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [percentage, prefersReducedMotion])

  const strokeWidth = 3
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference
  const ringColor = getRingColor(percentage)

  return (
    <div
      className="relative cursor-pointer"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => navigate('/profile')}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') navigate('/profile') }}
      aria-label={`Profile ${percentage}% complete. Click to edit profile.`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="block">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 60, damping: 15, delay: 0.3 }
          }
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
          }}
        />
      </svg>
      {/* Center percentage text */}
      <span
        className="absolute inset-0 flex items-center justify-center font-mono font-medium leading-none"
        style={{
          fontSize: size < 40 ? '9px' : '11px',
          color: ringColor,
        }}
      >
        {displayValue}
      </span>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap rounded-md px-3 py-1.5 text-xs z-50"
          style={{
            background: 'var(--foreground)',
            color: 'var(--background)',
          }}
        >
          Add more details for better alerts
          {/* Arrow */}
          <div
            className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent"
            style={{ borderBottomColor: 'var(--foreground)' }}
          />
        </div>
      )}
    </div>
  )
}
