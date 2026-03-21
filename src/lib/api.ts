import type { LegalChange } from '@/types/legal-change'
import type { PersonalizedAlert } from '@/types/alert'
import type { UserProfile } from '@/types/profile'

const WORKER_URL =
  import.meta.env.VITE_WORKER_URL || 'https://legisly-api.ashwanthbalakrishnan5.workers.dev'

const CACHE_KEY_PREFIX = 'legisly-alerts-'

interface AnalyzeResponse {
  alerts: RawAlert[]
  processedAt: string
}

// The shape returned by the worker before frontend merging
interface RawAlert {
  legalChangeId: string
  relevanceScore: number
  severity: 'high' | 'medium' | 'low'
  summary: string
  personalImpact: string
  matchedBecause: string[]
  actionItems: { action: string; deadline?: string; contactInfo?: string }[]
  confidence: 'high' | 'medium' | 'low'
  // These may already be populated by the worker, but we re-merge from source for safety
  title?: string
  category?: string
  datePublished?: string
  sourceUrl?: string
  sourceDocument?: string
  dismissed?: boolean
  savedForLater?: boolean
}

function getCacheKey(profile: UserProfile, changeIds: string[]): string {
  const keyData = JSON.stringify({
    residencyStatus: profile.residencyStatus,
    currentSituation: profile.currentSituation,
    immigration: profile.immigration,
    employment: profile.employment,
    housing: profile.housing,
    education: profile.education,
    location: profile.location,
    healthcare: profile.healthcare,
    filingStatus: profile.filingStatus,
    dependents: profile.dependents,
    transportation: profile.transportation,
    changeIds: changeIds.sort(),
  })
  let hash = 0
  for (let i = 0; i < keyData.length; i++) {
    const char = keyData.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return CACHE_KEY_PREFIX + String(Math.abs(hash))
}

function getCachedAlerts(
  profile: UserProfile,
  changeIds: string[],
): PersonalizedAlert[] | null {
  const key = getCacheKey(profile, changeIds)
  const raw = sessionStorage.getItem(key)
  if (!raw) return null
  try {
    return JSON.parse(raw) as PersonalizedAlert[]
  } catch {
    return null
  }
}

function setCachedAlerts(
  profile: UserProfile,
  changeIds: string[],
  alerts: PersonalizedAlert[],
): void {
  const key = getCacheKey(profile, changeIds)
  try {
    sessionStorage.setItem(key, JSON.stringify(alerts))
  } catch {
    // sessionStorage may be full; silently fail
  }
}

export async function analyzeChanges(
  profile: UserProfile,
  changes: LegalChange[],
): Promise<PersonalizedAlert[]> {
  const changeIds = changes.map((c) => c.id)

  // Check cache first
  const cached = getCachedAlerts(profile, changeIds)
  if (cached) return cached

  const response = await fetch(`${WORKER_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile, changes }),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }

  const data: AnalyzeResponse = await response.json()

  // Build a lookup map from the original changes for merging
  const changeMap = new Map<string, LegalChange>()
  for (const change of changes) {
    changeMap.set(change.id, change)
  }

  // Merge alert data with original LegalChange data
  const mergedAlerts: PersonalizedAlert[] = data.alerts.map((alert) => {
    const originalChange = changeMap.get(alert.legalChangeId)
    return {
      legalChangeId: alert.legalChangeId,
      relevanceScore: alert.relevanceScore,
      severity: alert.severity,
      summary: alert.summary,
      personalImpact: alert.personalImpact,
      matchedBecause: alert.matchedBecause,
      actionItems: alert.actionItems,
      confidence: alert.confidence,
      // Merge from original change data for accuracy
      title: originalChange?.title ?? alert.title ?? 'Unknown Change',
      category: originalChange?.category ?? (alert.category as PersonalizedAlert['category']) ?? 'consumer',
      datePublished: originalChange?.datePublished ?? alert.datePublished ?? '',
      sourceUrl: originalChange?.sourceUrl ?? alert.sourceUrl ?? '',
      sourceDocument: originalChange?.sourceDocument ?? alert.sourceDocument ?? '',
      dismissed: false,
      savedForLater: false,
    }
  })

  // Sort by relevance score descending
  mergedAlerts.sort((a, b) => b.relevanceScore - a.relevanceScore)

  // Filter out changes with relevance score below 10
  const filteredAlerts = mergedAlerts.filter(
    (alert) => alert.relevanceScore >= 10,
  )

  // Cache the processed result
  setCachedAlerts(profile, changeIds, filteredAlerts)

  return filteredAlerts
}

export function clearAlertCache(): void {
  const keys: string[] = []
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i)
    if (key?.startsWith(CACHE_KEY_PREFIX)) {
      keys.push(key)
    }
  }
  keys.forEach((k) => sessionStorage.removeItem(k))
}
