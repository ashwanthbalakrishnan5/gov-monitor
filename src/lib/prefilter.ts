import type { LegalChange } from '@/types/legal-change'
import type { UserProfile } from '@/types/profile'

/**
 * Extract profile traits as string tags for matching against affectedGroups.
 */
export function extractTraits(profile: UserProfile): string[] {
  const traits: string[] = []

  // Residency
  traits.push(profile.residencyStatus)
  if (profile.residencyStatus === 'visa_holder') {
    traits.push('visa_holder')
    if (profile.immigration?.visaType) {
      traits.push(`${profile.immigration.visaType}_visa`)
      // Specific aliases
      if (profile.immigration.visaType === 'f1') traits.push('f1_visa', 'international_student')
      if (profile.immigration.visaType === 'h1b') traits.push('h1b_visa', 'h1b_worker')
      if (profile.immigration.visaType === 'j1') traits.push('j1_visa', 'exchange_visitor')
    }
    if (profile.immigration?.optCptStatus && profile.immigration.optCptStatus !== 'none') {
      traits.push('opt_holders', profile.immigration.optCptStatus)
      if (profile.immigration.optCptStatus === 'stem_opt') traits.push('stem_opt')
    }
    traits.push('immigrant')
  }

  // Situation
  for (const situation of profile.currentSituation) {
    traits.push(situation)
    if (situation === 'student') traits.push('students')
    if (situation === 'employed') traits.push('workers', 'employees')
  }

  // Employment
  if (profile.employment?.type === 'gig') traits.push('gig_workers')
  if (profile.employment?.type === 'part_time') traits.push('part_time_workers')
  if (profile.employment?.type) traits.push(`${profile.employment.type}_workers`)

  // Housing
  if (profile.housing?.situation) {
    traits.push(profile.housing.situation)
    if (profile.housing.situation === 'renter') traits.push('renters', 'tenants')
    if (profile.housing.situation.startsWith('homeowner')) traits.push('homeowners', 'homebuyers')
  }

  // Education
  if (profile.education) {
    traits.push('students')
    if (profile.education.financialAid) traits.push('financial_aid_recipients')
    if (profile.education.studentLoans) traits.push('student_loan_borrowers')
    if (profile.education.degreeLevel === 'masters' || profile.education.degreeLevel === 'doctorate') {
      traits.push('graduate_students')
    }
  }

  // Healthcare
  if (profile.healthcare) {
    traits.push(profile.healthcare)
    if (profile.healthcare === 'marketplace') traits.push('aca_enrollees')
    if (profile.healthcare === 'medicaid') traits.push('medicaid_recipients')
    if (profile.healthcare === 'uninsured') traits.push('uninsured')
  }

  // Location
  if (profile.location?.state) {
    traits.push(`state_${profile.location.state.toLowerCase()}`)
    if (profile.location.state === 'AZ') traits.push('arizona_resident')
  }

  // Tax
  if (profile.filingStatus) traits.push(profile.filingStatus)
  traits.push('taxpayers')

  return [...new Set(traits)]
}

/**
 * Pre-filter legal changes before sending to Claude API.
 * Keeps all federal changes + state changes matching user's state +
 * any change whose affectedGroups overlap with user's profile traits.
 */
export function preFilterChanges(changes: LegalChange[], profile: UserProfile): LegalChange[] {
  const traits = extractTraits(profile)

  return changes.filter(change => {
    // Always include federal changes
    if (change.jurisdiction === 'federal') return true

    // Include state changes matching user's state
    if (change.jurisdiction === 'state' && change.state === profile.location.state) return true

    // Check keyword/group overlap with profile
    return change.affectedGroups.some(group => traits.includes(group))
  })
}
