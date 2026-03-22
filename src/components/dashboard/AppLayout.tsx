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
      {/* Animated atmospheric background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Floating orb 1 - indigo, top-right */}
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: 800,
            height: 800,
            top: '-20%',
            right: '-15%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
            animation: 'appOrb1 30s ease-in-out infinite',
          }}
        />
        {/* Floating orb 2 - violet, bottom-left */}
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: 700,
            height: 700,
            bottom: '-10%',
            left: '-15%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
            animation: 'appOrb2 35s ease-in-out infinite',
          }}
        />
        {/* Floating orb 3 - rose, center-right */}
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: 600,
            height: 600,
            top: '35%',
            right: '0%',
            background: 'radial-gradient(circle, rgba(244,63,94,0.08) 0%, transparent 65%)',
            animation: 'appOrb3 40s ease-in-out infinite',
          }}
        />
        {/* Floating orb 4 - cyan accent, top-left */}
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: 500,
            height: 500,
            top: '5%',
            left: '10%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 65%)',
            animation: 'appOrb4 45s ease-in-out infinite',
          }}
        />
        {/* Floating orb 5 - amber warm glow, bottom-right */}
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: 550,
            height: 550,
            bottom: '10%',
            right: '10%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 65%)',
            animation: 'appOrb2 50s ease-in-out infinite reverse',
          }}
        />

        {/* Subtle dot grid overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Grain texture */}
      <svg
        className="pointer-events-none fixed inset-0 z-[1] h-full w-full"
        style={{ opacity: 0.018 }}
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
      <main className="relative z-10 md:ml-[220px] lg:ml-[240px] pb-24 md:pb-0">
        <Outlet />
      </main>
    </div>
  )
}
