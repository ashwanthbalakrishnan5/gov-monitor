import type { LegalChange } from '@/types/legal-change'
import type { PersonalizedAlert } from '@/types/alert'
import type { UserProfile } from '@/types/profile'
import type { ChatContext } from '@/components/chat/chat-mock'
import { generateMockAlerts } from '@/data/mock-alerts'

const API_BASE = 'https://legisly-api.ashwanthbalakrishnan5.workers.dev'

export interface ChatApiMessage {
  role: 'user' | 'assistant'
  content: string
}

const CACHE_KEY_PREFIX = 'legisly-alerts-'

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
  const raw = localStorage.getItem(key)
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
    localStorage.setItem(key, JSON.stringify(alerts))
  } catch {
    // localStorage may be full; silently fail
  }
}

/**
 * Analyze a single batch of changes using mock data.
 * Returns personalized alerts sorted by relevance (score >= 10 only).
 */
export async function analyzeChanges(
  profile: UserProfile,
  changes: LegalChange[],
): Promise<PersonalizedAlert[]> {
  const changeIds = changes.map((c) => c.id)

  // Check cache first
  const cached = getCachedAlerts(profile, changeIds)
  if (cached) return cached

  // Use mock backend for demo
  const alerts = await generateMockAlerts(profile, changes)

  // Sort by relevance score descending
  alerts.sort((a, b) => b.relevanceScore - a.relevanceScore)

  // Filter out low-relevance changes
  const filtered = alerts.filter((a) => a.relevanceScore >= 10)

  // Cache the result
  setCachedAlerts(profile, changeIds, filtered)

  return filtered
}

const BATCH_SIZE = 3

/**
 * Splits changes into batches and processes them in parallel.
 * Calls onBatch as each batch completes so the UI shows results progressively.
 */
export async function analyzeChangesBatched(
  profile: UserProfile,
  changes: LegalChange[],
  onBatch: (accumulated: PersonalizedAlert[], processedCount: number) => void,
): Promise<PersonalizedAlert[]> {
  const changeIds = changes.map((c) => c.id)

  // Check full-set cache first
  const cached = getCachedAlerts(profile, changeIds)
  if (cached) {
    onBatch(cached, changes.length)
    return cached
  }

  // Split into batches
  const batches: LegalChange[][] = []
  for (let i = 0; i < changes.length; i += BATCH_SIZE) {
    batches.push(changes.slice(i, i + BATCH_SIZE))
  }

  const accumulated: PersonalizedAlert[] = []
  let processedChanges = 0

  // Fire all batches in parallel, call onBatch as each resolves
  await Promise.all(
    batches.map(async (batch) => {
      const results = await analyzeChanges(profile, batch)
      processedChanges += batch.length
      accumulated.push(...results)
      accumulated.sort((a, b) => b.relevanceScore - a.relevanceScore)
      onBatch([...accumulated], processedChanges)
    }),
  )

  // Cache the full combined result
  setCachedAlerts(profile, changeIds, accumulated)

  return accumulated
}

export async function sendChatMessage(
  messages: ChatApiMessage[],
  context?: ChatContext,
  profile?: UserProfile,
): Promise<string> {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, context, profile }),
  })

  if (!response.ok) {
    throw new Error(`Chat API error: ${response.status}`)
  }

  const data = (await response.json()) as { response: string }
  return data.response
}

export function clearAlertCache(): void {
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(CACHE_KEY_PREFIX)) {
      keys.push(key)
    }
  }
  keys.forEach((k) => localStorage.removeItem(k))
}
