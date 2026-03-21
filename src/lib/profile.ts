import type { UserProfile } from '@/types/profile'

const PROFILE_KEY = 'legisly-profile'

export function getProfile(): UserProfile | null {
  const raw = localStorage.getItem(PROFILE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as UserProfile
  } catch {
    return null
  }
}

export function saveProfile(profile: UserProfile): void {
  profile.updatedAt = new Date().toISOString()
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export function deleteProfile(): void {
  localStorage.removeItem(PROFILE_KEY)
}

export function hasProfile(): boolean {
  return localStorage.getItem(PROFILE_KEY) !== null
}
