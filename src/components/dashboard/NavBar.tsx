import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw, Menu, X, Calendar, Users, BarChart3, Award, Shield } from 'lucide-react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/Logo'
import { ProfileCompleteness } from './ProfileCompleteness'
import { getProfile } from '@/lib/profile'
import { calculateCompleteness } from '@/lib/completeness'

const NAV_LINKS = [
  { to: '/timeline', label: 'Timeline', icon: Calendar, color: '#F43F5E' },
  { to: '/representatives', label: 'Reps', icon: Users, color: '#6366F1' },
  { to: '/pulse', label: 'Pulse', icon: BarChart3, color: '#10B981' },
  { to: '/engagement', label: 'Score', icon: Award, color: '#F59E0B' },
  { to: '/privacy', label: 'Privacy', icon: Shield, color: '#06B6D4' },
]

interface NavBarProps {
  onRefresh?: () => void
}

export function NavBar({ onRefresh }: NavBarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [completeness, setCompleteness] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    const profile = getProfile()
    if (profile) {
      setCompleteness(calculateCompleteness(profile))
    }
  }, [])

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleRefresh = useCallback(() => {
    if (!onRefresh) return
    setIsRefreshing(true)
    onRefresh()
    setTimeout(() => setIsRefreshing(false), 1000)
  }, [onRefresh])

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        'glass-panel-heavy',
      )}
      style={{
        boxShadow: scrolled
          ? '0 4px 24px rgba(0,0,0,0.08), 0 1px 0 var(--glass-border)'
          : '0 1px 0 var(--glass-border)',
      }}
    >
      {/* Accent line at top - animated on scroll */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[1px]"
        initial={false}
        animate={{
          opacity: scrolled ? 1 : 0,
          background: scrolled
            ? 'linear-gradient(90deg, transparent, #6366F1, #8B5CF6, #F43F5E, transparent)'
            : 'transparent',
        }}
        transition={{ duration: 0.4 }}
      />

      <div className="flex h-14 items-center justify-between px-4 sm:px-8 lg:px-16 xl:px-24">
        {/* Logo */}
        <Link
          to="/dashboard"
          className="hover:opacity-80 transition-opacity"
        >
          <Logo size="sm" />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50 transition-all text-xs font-medium min-h-[36px]"
              >
                <Icon className="h-3.5 w-3.5" style={{ color: link.color }} />
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-1">
          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex md:hidden items-center justify-center h-[44px] w-[44px] rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50 transition-all cursor-pointer"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          {/* Refresh button */}
          {onRefresh && (
            <button
              type="button"
              onClick={handleRefresh}
              className="flex items-center justify-center h-[44px] w-[44px] rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50 transition-all cursor-pointer"
              aria-label="Refresh alerts"
            >
              <motion.div
                animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
                transition={isRefreshing ? { duration: 0.8, ease: 'linear' } : { duration: 0 }}
              >
                <RefreshCw className="h-4 w-4" />
              </motion.div>
            </button>
          )}

          {/* Profile link */}
          <Link
            to="/profile"
            className="flex items-center gap-2.5 group min-h-[44px] px-1"
          >
            <ProfileCompleteness percentage={completeness} size={36} />
            <span className="hidden sm:inline text-sm font-medium text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">
              Profile
            </span>
          </Link>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="md:hidden overflow-hidden border-t border-[var(--border)]"
          >
            <div className="px-4 py-2 space-y-1">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50 transition-all text-sm font-medium min-h-[44px]"
                  >
                    <Icon className="h-4 w-4" style={{ color: link.color }} />
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
