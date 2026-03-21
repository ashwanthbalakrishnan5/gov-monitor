import type { AlertPreferences } from '@/types/alert-preferences'

const PREFS_KEY = 'legisly-alert-preferences'

export function getAlertPreferences(): AlertPreferences | null {
  const raw = localStorage.getItem(PREFS_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AlertPreferences
  } catch {
    return null
  }
}

export function saveAlertPreferences(prefs: AlertPreferences): void {
  prefs.updatedAt = new Date().toISOString()
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
}

export function deleteAlertPreferences(): void {
  localStorage.removeItem(PREFS_KEY)
}

export function getDefaultPreferences(): AlertPreferences {
  return {
    channels: {
      push: { enabled: true },
      email: { enabled: false, value: '' },
      sms: { enabled: false, value: '' },
    },
    subscribedCategories: [
      'immigration',
      'housing',
      'employment',
      'taxation',
      'education',
      'healthcare',
    ],
    severityThreshold: 'all',
    deliveryFrequency: 'realtime',
    keywords: [],
    updatedAt: new Date().toISOString(),
  }
}
