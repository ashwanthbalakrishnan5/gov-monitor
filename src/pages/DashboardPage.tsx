import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Undo2 } from 'lucide-react'

import { ChatPanel } from '@/components/chat/ChatPanel'
import type { ChatContext } from '@/components/chat/chat-mock'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { AlertFeed } from '@/components/dashboard/AlertFeed'
import { AnalysisStatus } from '@/components/dashboard/AnalysisStatus'
import { SkeletonCards } from '@/components/dashboard/SkeletonCard'
import { DisclaimerFooter } from '@/components/dashboard/DisclaimerFooter'

import { getProfile } from '@/lib/profile'
import { preFilterChanges } from '@/lib/prefilter'
import { analyzeChangesBatched } from '@/lib/api'
import { legalChanges } from '@/data/legal-changes/index'
import { recordPageVisit } from '@/lib/engagement'
import type { PersonalizedAlert, Severity } from '@/types/alert'

const DISMISSED_KEY = 'legisly-dismissed-ids'
const SAVED_KEY = 'legisly-saved-ids'
const UNDO_TIMEOUT = 5000

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
  const prefersReducedMotion = useReducedMotion()

  const [alerts, setAlerts] = useState<PersonalizedAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expectedCount, setExpectedCount] = useState(0)
  const [processedCount, setProcessedCount] = useState(0)
  const [severityFilter, setSeverityFilter] = useState<'all' | Severity>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [savedOnly, setSavedOnly] = useState(false)
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => loadStringArray(DISMISSED_KEY))
  const [savedIds, setSavedIds] = useState<string[]>(() => loadStringArray(SAVED_KEY))

  // Chat context state
  const [chatContext, setChatContext] = useState<ChatContext | undefined>(undefined)
  const [chatAutoSend, setChatAutoSend] = useState<{ message: string; ts: number } | null>(null)

  // Undo dismiss state
  const [undoItem, setUndoItem] = useState<{ id: string; title: string } | null>(null)
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup undo timer
  useEffect(() => {
    return () => {
      if (undoTimer.current) clearTimeout(undoTimer.current)
    }
  }, [])

  // Load alerts
  const loadAlerts = useCallback(async () => {
    const profile = getProfile()
    if (!profile) return

    setIsLoading(true)
    setError(null)
    setAlerts([])
    setProcessedCount(0)

    try {
      const relevantChanges = preFilterChanges(legalChanges, profile)
      setExpectedCount(relevantChanges.length)

      await analyzeChangesBatched(profile, relevantChanges, (accumulated, processed) => {
        setAlerts(accumulated)
        setProcessedCount(processed)
      })
    } catch (err) {
      console.error('Failed to analyze changes:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to load personalized alerts'
      )

      // Fallback: show generic summaries
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
  }, [])

  // Check for profile on mount, redirect if missing
  useEffect(() => {
    const profile = getProfile()
    if (!profile) {
      navigate('/onboarding', { replace: true })
      return
    }
    recordPageVisit('dashboard')
    loadAlerts()
  }, [navigate, loadAlerts])

  // Retry handler
  const handleRetry = useCallback(() => {
    loadAlerts()
  }, [loadAlerts])

  // Dismiss handler with undo
  const handleDismiss = useCallback((id: string) => {
    // Find alert title for toast
    const alert = alerts.find(a => a.legalChangeId === id)
    const title = alert?.title ?? 'Alert'

    setDismissedIds((prev) => {
      const next = [...prev, id]
      saveStringArray(DISMISSED_KEY, next)
      return next
    })

    // Clear previous undo timer
    if (undoTimer.current) clearTimeout(undoTimer.current)

    // Show undo toast
    setUndoItem({ id, title })
    undoTimer.current = setTimeout(() => {
      setUndoItem(null)
    }, UNDO_TIMEOUT)
  }, [alerts])

  // Undo dismiss
  const handleUndoDismiss = useCallback(() => {
    if (!undoItem) return

    setDismissedIds((prev) => {
      const next = prev.filter((id) => id !== undoItem.id)
      saveStringArray(DISMISSED_KEY, next)
      return next
    })

    if (undoTimer.current) clearTimeout(undoTimer.current)
    setUndoItem(null)
  }, [undoItem])

  // Chat about handler
  const handleChatAbout = useCallback((alert: PersonalizedAlert, action?: string) => {
    setChatContext({
      alertTitle: alert.title,
      alertCategory: alert.category,
      alertSeverity: alert.severity,
      alertSummary: alert.summary,
      alertPersonalImpact: alert.personalImpact,
    })

    const messages: Record<string, string> = {
      'draft-letter': `Help me draft a letter to my representative about "${alert.title}"`,
      'find-hearings': `Are there any upcoming public hearings related to "${alert.title}"?`,
      'public-comment': `Help me write a public comment about "${alert.title}"`,
    }
    const message = action ? messages[action] : `How does "${alert.title}" affect me specifically?`
    if (message) {
      setChatAutoSend({ message, ts: Date.now() })
    }
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

  // Count alerts before filtering (after dismiss, before severity/category/saved filters)
  const totalUnfilteredCount = useMemo(() => {
    return alerts.filter((a) => !dismissedIds.includes(a.legalChangeId)).length
  }, [alerts, dismissedIds])

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
      .filter((alert) => {
        if (savedOnly && !alert.savedForLater) return false
        return true
      })
  }, [alerts, dismissedIds, savedIds, severityFilter, categoryFilter, savedOnly])

  return (
    <div className="px-4 pt-6 pb-8 sm:px-8 lg:px-12">
      {/* Filters */}
      <FilterBar
        severityFilter={severityFilter}
        categoryFilter={categoryFilter}
        savedOnly={savedOnly}
        onSeverityChange={setSeverityFilter}
        onCategoryChange={setCategoryFilter}
        onSavedOnlyChange={setSavedOnly}
      />

      {/* Analysis status with progress */}
      <AnimatePresence>
        {isLoading && (
          <AnalysisStatus
            isVisible={isLoading}
            loaded={processedCount}
            total={expectedCount}
          />
        )}
      </AnimatePresence>

      {/* Alerts that have arrived so far */}
      {filteredAlerts.length > 0 && (
        <AlertFeed
          alerts={filteredAlerts}
          totalUnfilteredCount={totalUnfilteredCount}
          onDismiss={handleDismiss}
          onSave={handleSave}
          onChatAbout={handleChatAbout}
          error={!isLoading ? error : null}
          onRetry={handleRetry}
        />
      )}

      {/* Remaining skeletons while batches are processing */}
      {isLoading && (
        <div className={filteredAlerts.length > 0 ? 'mt-4' : ''}>
          <SkeletonCards
            count={
              expectedCount > 0
                ? Math.min(4, Math.max(1, expectedCount - processedCount))
                : 4
            }
          />
        </div>
      )}

      {/* Empty/error state after loading completes */}
      {!isLoading && filteredAlerts.length === 0 && (
        <AlertFeed
          alerts={[]}
          totalUnfilteredCount={totalUnfilteredCount}
          onDismiss={handleDismiss}
          onSave={handleSave}
          onChatAbout={handleChatAbout}
          error={error}
          onRetry={handleRetry}
        />
      )}

      {/* Disclaimer */}
      <DisclaimerFooter />

      {/* AI Chat Assistant */}
      <ChatPanel context={chatContext} autoSend={chatAutoSend} />

      {/* Undo dismiss toast */}
      <AnimatePresence>
        {undoItem && (
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div
              className="flex items-center gap-3 rounded-xl px-5 py-3 border border-white/[0.1]"
              style={{
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                color: '#FFFFFF',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              <span className="text-sm font-medium max-w-[200px] truncate">
                Dismissed
              </span>
              <button
                type="button"
                onClick={handleUndoDismiss}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 transition-colors cursor-pointer min-h-[34px]"
              >
                <Undo2 className="h-3.5 w-3.5" />
                Undo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
