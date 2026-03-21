import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { getProfile } from '@/lib/profile'

interface AppLayoutProps {
  onRefresh?: () => void
}

export function AppLayout({ onRefresh }: AppLayoutProps) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!getProfile()) navigate('/onboarding', { replace: true })
  }, [navigate])

  return (
    <div className="min-h-dvh" style={{ backgroundColor: 'var(--background)' }}>
      {/* Subtle ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            width: 600,
            height: 600,
            top: '-12%',
            right: '-8%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 500,
            height: 500,
            bottom: '0%',
            left: '-8%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.03) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Grain */}
      <svg
        className="pointer-events-none fixed inset-0 z-[1] h-full w-full"
        style={{ opacity: 0.015 }}
      >
        <filter id="app-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#app-grain)" />
      </svg>

      <Sidebar onRefresh={onRefresh} />

      {/* Main content area */}
      <main className="relative z-10 md:ml-[220px] lg:ml-[240px] pb-16 md:pb-0">
        <Outlet />
      </main>
    </div>
  )
}
