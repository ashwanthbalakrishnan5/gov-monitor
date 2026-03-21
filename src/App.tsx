import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AppLayout } from '@/components/dashboard/AppLayout'
import { LandingPage } from '@/pages/LandingPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { RepresentativesPage } from '@/pages/RepresentativesPage'
import { TimelinePage } from '@/pages/TimelinePage'
import { CommunityPulsePage } from '@/pages/CommunityPulsePage'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { EngagementPage } from '@/pages/EngagementPage'
import { Logo } from '@/components/Logo'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function NotFound() {
  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-6 text-center"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <Logo size="md" />
      <h1 className="mt-8 text-4xl font-display text-[var(--foreground)]">404</h1>
      <p className="mt-3 text-sm text-[var(--muted-foreground)] max-w-sm leading-relaxed">
        This page does not exist. You may have followed an outdated link.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-lg px-6 min-h-[44px] flex items-center text-sm font-medium text-white"
        style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
      >
        Back to home
      </Link>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/representatives" element={<RepresentativesPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/pulse" element={<CommunityPulsePage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/engagement" element={<EngagementPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
