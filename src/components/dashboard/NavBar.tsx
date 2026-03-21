import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/Logo'
import { ProfileCompleteness } from './ProfileCompleteness'
import { getProfile } from '@/lib/profile'
import { calculateCompleteness } from '@/lib/completeness'

export function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  const [completeness, setCompleteness] = useState(0)

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

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 w-full transition-shadow duration-200',
        'backdrop-blur-xl bg-white/75 border-b border-black/[0.06]',
        scrolled && 'shadow-[0_1px_8px_rgba(0,0,0,0.06)]'
      )}
    >
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          to="/dashboard"
          className="hover:opacity-80 transition-opacity"
        >
          <Logo size="sm" />
        </Link>

        {/* Right side: Profile ring + link */}
        <div className="flex items-center gap-3">
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
    </nav>
  )
}
