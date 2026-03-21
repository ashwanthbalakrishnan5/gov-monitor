import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Calendar,
  Users,
  BarChart3,
  Award,
  Bell,
  Shield,
  RefreshCw,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/Logo'
import { ProfileCompleteness } from './ProfileCompleteness'
import { getProfile } from '@/lib/profile'
import { calculateCompleteness } from '@/lib/completeness'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#6366F1' },
  { to: '/timeline', label: 'Timeline', icon: Calendar, color: '#F43F5E' },
  { to: '/representatives', label: 'Representatives', icon: Users, color: '#8B5CF6' },
  { to: '/pulse', label: 'Community Pulse', icon: BarChart3, color: '#10B981' },
  { to: '/engagement', label: 'Engagement', icon: Award, color: '#F59E0B' },
  { to: '/alerts', label: 'Alerts', icon: Bell, color: '#F97316' },
  { to: '/privacy', label: 'Privacy', icon: Shield, color: '#06B6D4' },
]

const MOBILE_TABS = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/timeline', label: 'Timeline', icon: Calendar },
  { to: '/representatives', label: 'Reps', icon: Users },
  { to: '/pulse', label: 'Pulse', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: User },
]

interface SidebarProps {
  onRefresh?: () => void
}

export function Sidebar({ onRefresh }: SidebarProps) {
  const location = useLocation()
  const [completeness, setCompleteness] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const profile = getProfile()
    if (profile) setCompleteness(calculateCompleteness(profile))
  }, [])

  const handleRefresh = useCallback(() => {
    if (!onRefresh) return
    setIsRefreshing(true)
    onRefresh()
    setTimeout(() => setIsRefreshing(false), 1000)
  }, [onRefresh])

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-[220px] lg:w-[240px] z-40 border-r border-white/[0.06] bg-[#0A0A0F]/80 backdrop-blur-xl">
        {/* Logo */}
        <div className="flex items-center h-14 px-5">
          <Link to="/dashboard" className="hover:opacity-80 transition-opacity">
            <Logo size="sm" />
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[40px]',
                  isActive
                    ? 'bg-white/[0.06] text-[var(--foreground)]'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'
                )}
              >
                {isActive && (
                  <div
                    className="absolute left-0 w-[3px] h-5 rounded-r-full"
                    style={{ backgroundColor: item.color }}
                  />
                )}
                <Icon
                  className="h-4 w-4 flex-shrink-0"
                  style={isActive ? { color: item.color } : undefined}
                />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-4 space-y-2 border-t border-white/[0.06]">
          {/* Refresh */}
          {onRefresh && (
            <button
              type="button"
              onClick={handleRefresh}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.03] transition-all cursor-pointer min-h-[40px]"
            >
              <motion.div
                animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
                transition={isRefreshing ? { duration: 0.8, ease: 'linear' } : { duration: 0 }}
              >
                <RefreshCw className="h-4 w-4" />
              </motion.div>
              <span>Refresh</span>
            </button>
          )}

          {/* Profile */}
          <Link
            to="/profile"
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2 rounded-xl transition-all min-h-[40px]',
              location.pathname === '/profile'
                ? 'bg-white/[0.06] text-[var(--foreground)]'
                : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'
            )}
          >
            <ProfileCompleteness percentage={completeness} size={28} />
            <span className="text-sm font-medium">Profile</span>
          </Link>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.06] bg-[#0A0A0F]/90 backdrop-blur-xl" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-around h-14">
          {MOBILE_TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = location.pathname === tab.to
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-[56px] min-h-[44px] justify-center transition-colors',
                  isActive ? 'text-indigo-400' : 'text-white/30'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[9px] font-mono uppercase tracking-wider">{tab.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
