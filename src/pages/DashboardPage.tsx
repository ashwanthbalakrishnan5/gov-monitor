import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

import { NavBar } from '@/components/dashboard/NavBar'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { AlertFeed } from '@/components/dashboard/AlertFeed'
import { AnalysisStatus } from '@/components/dashboard/AnalysisStatus'
import { SkeletonCards } from '@/components/dashboard/SkeletonCard'
import { DisclaimerFooter } from '@/components/dashboard/DisclaimerFooter'

import { getProfile } from '@/lib/profile'
import { preFilterChanges } from '@/lib/prefilter'
import { analyzeChanges } from '@/lib/api'
import { legalChanges } from '@/data/legal-changes/index'
import type { PersonalizedAlert, Severity } from '@/types/alert'

const DISMISSED_KEY = 'legisly-dismissed-ids'
const SAVED_KEY = 'legisly-saved-ids'

function loadStringArray(key: string): string[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    return JSON.parse(raw) as string[]
  } catch {
    return []
  }
}

function saveStringArray(key: string, arr: string[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(arr))
  } catch {
    // silently fail
  }
}

export function DashboardPage() {
  const navigate = useNavigate()

  const [alerts, setAlerts] = useState<PersonalizedAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [severityFilter, setSeverityFilter] = useState<'all' | Severity>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => loadStringArray(DISMISSED_KEY))
  const [savedIds, setSavedIds] = useState<string[]>(() => loadStringArray(SAVED_KEY))

  // Check for profile on mount, redirect if missing
  useEffect(() => {
    const profile = getProfile()
    if (!profile) {
      navigate('/onboarding', { replace: true })
      return
    }

    // Load and analyze changes
    async function loadAlerts() {
      const profile = getProfile()
      if (!profile) return

      setIsLoading(true)
      setError(null)

      try {
        // Pre-filter changes based on profile
        const relevantChanges = preFilterChanges(legalChanges, profile)

        // Call API (handles caching internally)
        const results = await analyzeChanges(profile, relevantChanges)
        setAlerts(results)
      } catch (err) {
        console.error('Failed to analyze changes:', err)
        setError(
          err instanceof Error ? err.message : 'Failed to load personalized alerts'
        )

        // Fallback: show generic summaries from pre-loaded data
        const profile = getProfile()
        if (profile) {
          const relevantChanges = preFilterChanges(legalChanges, profile)
          const fallbackAlerts: PersonalizedAlert[] = relevantChanges.map((change) => ({
            legalChangeId: change.id,
            relevanceScore: 50,
            severity: 'medium' as const,
            summary: change.genericSummary,
            personalImpact: '',
            matchedBecause: [],
            actionItems: [],
            confidence: 'low' as const,
            title: change.title,
            category: change.category,
            datePublished: change.datePublished,
            sourceUrl: change.sourceUrl,
            sourceDocument: change.sourceDocument,
            dismissed: false,
            savedForLater: false,
          }))
          setAlerts(fallbackAlerts)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadAlerts()
  }, [navigate])

  // Retry handler
  const handleRetry = useCallback(() => {
    const profile = getProfile()
    if (!profile) return

    setIsLoading(true)
    setError(null)

    const relevantChanges = preFilterChanges(legalChanges, profile)

    analyzeChanges(profile, relevantChanges)
      .then((results) => {
        setAlerts(results)
      })
      .catch((err) => {
        console.error('Retry failed:', err)
        setError(err instanceof Error ? err.message : 'Failed to load personalized alerts')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  // Dismiss handler
  const handleDismiss = useCallback((id: string) => {
    setDismissedIds((prev) => {
      const next = [...prev, id]
      saveStringArray(DISMISSED_KEY, next)
      return next
    })
  }, [])

  // Save handler
  const handleSave = useCallback((id: string) => {
    setSavedIds((prev) => {
      const isAlreadySaved = prev.includes(id)
      const next = isAlreadySaved ? prev.filter((s) => s !== id) : [...prev, id]
      saveStringArray(SAVED_KEY, next)
      return next
    })
  }, [])

  // Filter alerts
  const filteredAlerts = useMemo(() => {
    return alerts
      .filter((alert) => !dismissedIds.includes(alert.legalChangeId))
      .filter((alert) => {
        if (severityFilter !== 'all' && alert.severity !== severityFilter) return false
        if (categoryFilter !== 'all' && alert.category !== categoryFilter) return false
        return true
      })
      .map((alert) => ({
        ...alert,
        savedForLater: savedIds.includes(alert.legalChangeId),
      }))
  }, [alerts, dismissedIds, savedIds, severityFilter, categoryFilter])

  return (
    <div
      className="min-h-dvh"
      style={{
        backgroundColor: 'var(--background)',
        backgroundImage:
          'radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Navigation */}
      <NavBar />

      {/* Filters */}
      <FilterBar
        severityFilter={severityFilter}
        categoryFilter={categoryFilter}
        onSeverityChange={setSeverityFilter}
        onCategoryChange={setCategoryFilter}
      />

      {/* Main content */}
      <main className="mx-auto max-w-3xl px-4 pt-6 pb-8">
        {/* Analysis status */}
        <AnimatePresence>
          {isLoading && <AnalysisStatus isVisible={isLoading} />}
        </AnimatePresence>

        {/* Content */}
        {isLoading ? (
          <SkeletonCards count={4} />
        ) : (
          <AlertFeed
            alerts={filteredAlerts}
            onDismiss={handleDismiss}
            onSave={handleSave}
            error={error}
            onRetry={handleRetry}
          />
        )}
      </main>

      {/* Disclaimer */}
      <DisclaimerFooter />
    </div>
  )
}
