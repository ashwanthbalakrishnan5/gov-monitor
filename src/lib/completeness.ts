import type { UserProfile } from '@/types/profile'

/**
 * Calculate profile completeness (0-100).
 *
 * Step 1 (mandatory): 30 points (10 per field)
 * Step 2 (if visa_holder): 15 points
 * Step 3 (if employed/self_employed/business_owner): 15 points
 * Step 4: 10 points
 * Step 5 (if student): 15 points
 * Step 6: 15 points (split across sub-fields)
 *
 * Non-applicable conditional steps don't count against completeness.
 */
export function calculateCompleteness(profile: UserProfile): number {
  let earned = 0
  let possible = 0

  // Step 1: Core Info (30 points, always applicable)
  possible += 30
  if (profile.location?.state) earned += 10
  if (profile.residencyStatus) earned += 10
  if (profile.currentSituation?.length > 0) earned += 10

  // Step 2: Immigration (15 points, only if visa_holder)
  if (profile.residencyStatus === 'visa_holder') {
    possible += 15
    if (profile.immigration?.visaType) earned += 15
  }

  // Step 3: Employment (15 points, only if employed/self_employed/business_owner)
  const employmentSituations = ['employed', 'self_employed', 'business_owner'] as const
  if (profile.currentSituation?.some(s => (employmentSituations as readonly string[]).includes(s))) {
    possible += 15
    if (profile.employment?.industry || profile.employment?.type || profile.employment?.businessSize) {
      earned += 15
    }
  }

  // Step 4: Housing (10 points, always applicable)
  possible += 10
  if (profile.housing?.situation) earned += 10

  // Step 5: Education (15 points, only if student)
  if (profile.currentSituation?.includes('student')) {
    possible += 15
    if (profile.education?.degreeLevel) earned += 15
  }

  // Step 6: Additional (15 points, always applicable, split across fields)
  possible += 15
  const step6Fields = [
    profile.transportation && profile.transportation.length > 0,
    profile.healthcare,
    profile.filingStatus,
    profile.dependents,
  ]
  const step6Filled = step6Fields.filter(Boolean).length
  earned += Math.round((step6Filled / 4) * 15)

  return possible > 0 ? Math.round((earned / possible) * 100) : 0
}
