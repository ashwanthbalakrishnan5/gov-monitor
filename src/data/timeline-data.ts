import type { UserProfile } from '@/types/profile'

/**
 * Real severity mapping derived from the mock-alerts templates.
 * Each legal change has an actual severity level, not a cycling placeholder.
 */
export const SEVERITY_MAP: Record<string, 'high' | 'medium' | 'low'> = {
  'imm-001': 'high',
  'imm-002': 'high',
  'imm-003': 'high',
  'imm-004': 'medium',
  'imm-005': 'medium',
  'imm-006': 'medium',
  'imm-007': 'high',
  'hous-001': 'low',
  'hous-002': 'medium',
  'emp-001': 'low',
  'health-001': 'high',
  'health-002': 'medium',
  'tax-001': 'medium',
  'edu-001': 'high',
  'az-001': 'high',
}

/**
 * Personalized impact text for the timeline, based on user profile.
 * Falls back to generic impact if no profile or no matching template.
 */
export function getPersonalizedImpact(changeId: string, profile: UserProfile | null): string {
  const impacts = IMPACT_MAP[changeId]
  if (!impacts) return 'Review this change to understand how it may affect your situation.'

  if (!profile) return impacts.default

  // Try to find the most specific match
  for (const rule of impacts.rules) {
    if (rule.condition(profile)) return rule.text
  }

  return impacts.default
}

interface ImpactRule {
  condition: (p: UserProfile) => boolean
  text: string
}

interface ImpactEntry {
  default: string
  rules: ImpactRule[]
}

const isVisa = (p: UserProfile) => p.residencyStatus === 'visa_holder'
const isStudent = (p: UserProfile) => p.currentSituation?.includes('student') ?? false
const isEmployed = (p: UserProfile) =>
  (p.currentSituation?.includes('employed') || p.currentSituation?.includes('self_employed')) ?? false
const isRenter = (p: UserProfile) => p.housing?.situation === 'renter'
const isHomeowner = (p: UserProfile) => p.housing?.situation?.startsWith('homeowner') ?? false
const isInAZ = (p: UserProfile) => p.location?.state === 'AZ'
const hasMarketplace = (p: UserProfile) => p.healthcare === 'marketplace'
const hasMedicaid = (p: UserProfile) => p.healthcare === 'medicaid'
const hasDependents = (p: UserProfile) => p.dependents === '1_2' || p.dependents === '3_plus'

const IMPACT_MAP: Record<string, ImpactEntry> = {
  'imm-001': {
    default: 'This expanded travel ban affects visa holders and may slow renewals even for those not on the restricted list.',
    rules: [
      { condition: isVisa, text: 'This travel ban could directly affect your ability to travel internationally and re-enter the U.S. Consult your international student office before booking travel.' },
    ],
  },
  'imm-002': {
    default: 'Pending USCIS applications from affected nationals face indefinite delays under this hold-and-review policy.',
    rules: [
      { condition: isVisa, text: 'If you have pending USCIS applications (EAD, extension, change of status), they may be delayed indefinitely. Maintain communication with your DSO or attorney.' },
    ],
  },
  'imm-003': {
    default: 'The H-1B lottery now weights selection toward higher-wage petitions, affecting entry-level position odds.',
    rules: [
      { condition: isVisa, text: 'Your H-1B lottery chances now depend on your offered salary relative to prevailing wages. Entry-level positions have significantly reduced selection probability.' },
      { condition: isStudent, text: 'If you plan to transition from student to H-1B status, the new wage-weighted lottery means your salary offer matters more than ever.' },
    ],
  },
  'imm-004': {
    default: 'USCIS filing fees have increased for OPT and H-1B applications effective March 2026.',
    rules: [
      { condition: isVisa, text: 'Budget for higher filing fees on your next application. The $100K H-1B surcharge does not apply to in-country status changes, which is important for F-1 to H-1B transitions.' },
      { condition: isStudent, text: 'OPT application fees rose to $1,780. Factor this into your budget when planning your post-graduation timeline.' },
    ],
  },
  'imm-005': {
    default: 'Expanded social media screening now applies to all F-1, J-1, H-1B, and H-4 visa holders during processing.',
    rules: [
      { condition: isVisa, text: 'You must disclose your social media accounts when applying for or renewing your visa. Review your online presence before your next application.' },
    ],
  },
  'imm-006': {
    default: 'A proposed rule would end "Duration of Status" for student visa holders, replacing it with fixed admission periods.',
    rules: [
      { condition: isStudent, text: 'If finalized, you would need to apply for extensions to remain in the U.S. beyond a fixed admission period. Plan your academic timeline carefully.' },
      { condition: isVisa, text: 'This proposed change could require you to apply and pay for extensions. Monitor the Federal Register for the comment period.' },
    ],
  },
  'imm-007': {
    default: 'Automatic EAD extensions upon filing renewals have been eliminated for most categories. Plan for potential gaps.',
    rules: [
      { condition: isVisa, text: 'Your work authorization will no longer auto-extend while renewal is pending. File renewals up to 180 days early and notify your employer about potential gaps.' },
      { condition: isEmployed, text: 'If you employ visa holders, be aware that EAD auto-extensions are ending. Employees may face authorization gaps during renewal processing.' },
    ],
  },
  'hous-001': {
    default: 'Federal agencies are directed to prevent institutional investors from buying single-family homes through federal programs.',
    rules: [
      { condition: isHomeowner, text: 'This order may help protect your home value by reducing institutional investor competition in your neighborhood.' },
      { condition: isRenter, text: 'This order may improve your future homebuying prospects by reducing competition from institutional investors.' },
    ],
  },
  'hous-002': {
    default: 'Arizona cities can no longer charge rental tax (TPT) on residential leases of 30+ days, saving renters about $20/month.',
    rules: [
      { condition: (p) => isRenter(p) && isInAZ(p), text: 'You should see a direct reduction in your monthly rent. Verify your landlord has removed the TPT line item from your next statement.' },
      { condition: isRenter, text: 'If you rent in Arizona, your monthly costs should be lower. Short-term rentals under 30 days are still subject to TPT.' },
      { condition: isInAZ, text: 'This tax elimination reduces the cost of renting in Arizona. Landlords must stop collecting residential rental tax.' },
    ],
  },
  'emp-001': {
    default: 'Arizona minimum wage increased to $15.15/hour. Tucson ($15.50) and Flagstaff ($17.85) have higher local rates.',
    rules: [
      { condition: (p) => isEmployed(p) && isInAZ(p), text: 'If you earn near minimum wage, your hourly rate should have increased. Check your pay stubs for the updated rate.' },
      { condition: isEmployed, text: 'This wage increase may affect labor costs and indirectly impact prices. Employers with minimum-wage workers must update pay rates.' },
    ],
  },
  'health-001': {
    default: 'ACA enhanced subsidies expired, causing ~49% average premium increases in Arizona. Two carriers exited the market.',
    rules: [
      { condition: hasMarketplace, text: 'Your monthly premiums may double or triple. With only HMO options remaining, your provider network may change. Review plan options carefully.' },
      { condition: (p) => p.healthcare === 'uninsured', text: 'Marketplace coverage in Arizona is now significantly more expensive without subsidies. Explore Medicaid eligibility as an alternative.' },
    ],
  },
  'health-002': {
    default: 'Medicaid expansion adults must complete 80 hours/month of work or approved activities starting late 2026.',
    rules: [
      { condition: hasMedicaid, text: 'You will need to document 80 hours/month of qualifying activities to maintain coverage. Start tracking now. Renewals move to every 6 months.' },
    ],
  },
  'tax-001': {
    default: 'Major tax changes: higher standard deduction, $40K SALT cap, tip/overtime exclusions up to $25K, increased child tax credit.',
    rules: [
      { condition: (p) => hasDependents(p) && isEmployed(p), text: 'The increased child tax credit ($2,200/child) plus tip/overtime exclusions could significantly reduce your tax liability this year.' },
      { condition: isEmployed, text: 'If you earn tip or overtime income, you may exclude up to $25,000 from federal tax. The higher standard deduction also reduces your taxable income.' },
      { condition: hasDependents, text: 'The child tax credit increases to $2,200 per child. Combined with the higher standard deduction, your tax burden should decrease.' },
    ],
  },
  'edu-001': {
    default: 'Grad PLUS Loans eliminated for 2026-27. Parent PLUS capped. Foreign income now counts in Pell calculations.',
    rules: [
      { condition: isStudent, text: 'These changes reshape education funding. If pursuing graduate studies, you will need alternative sources like assistantships or private loans.' },
    ],
  },
  'az-001': {
    default: 'Four anti-immigration bills are moving through the AZ legislature. None are law yet but could affect daily life if passed.',
    rules: [
      { condition: (p) => isVisa(p) && isInAZ(p), text: 'These bills could affect hospital access, banking, and benefits verification for immigrants in Arizona. Track progress and contact your state representative.' },
      { condition: isVisa, text: 'If you live in or plan to move to Arizona, these proposed bills could affect access to hospitals, banking, and public benefits for immigrants.' },
      { condition: isInAZ, text: 'These bills moving through the AZ legislature would affect hospitals, banking, and benefits verification. Consider contacting your state representative.' },
    ],
  },
}
