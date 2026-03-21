import type { PersonalizedAlert } from '@/types/alert'
import type { LegalChange } from '@/types/legal-change'
import type { UserProfile } from '@/types/profile'
import { extractTraits } from '@/lib/prefilter'

interface MockTemplate {
  relevanceBase: number
  severity: 'high' | 'medium' | 'low'
  summary: string
  impact: (prefix: string, profile: UserProfile) => string
  actionItems: { action: string; deadline?: string; contactInfo?: string }[]
  confidence: 'high' | 'medium' | 'low'
}

function profilePrefix(profile: UserProfile): string {
  const parts: string[] = []

  if (profile.residencyStatus === 'visa_holder') {
    if (profile.immigration?.visaType === 'f1') parts.push('an F-1 student')
    else if (profile.immigration?.visaType === 'h1b') parts.push('an H-1B worker')
    else if (profile.immigration?.visaType === 'j1') parts.push('a J-1 exchange visitor')
    else parts.push('a visa holder')
  } else if (profile.residencyStatus === 'permanent_resident') {
    parts.push('a permanent resident')
  } else if (profile.residencyStatus === 'us_citizen') {
    parts.push('a U.S. citizen')
  }

  if (profile.currentSituation?.includes('student') && !parts.some(p => p.includes('student'))) {
    parts.push('a student')
  }
  if (profile.currentSituation?.includes('employed') && !parts.some(p => p.includes('worker'))) {
    parts.push('currently employed')
  }
  if (profile.currentSituation?.includes('self_employed')) {
    parts.push('self-employed')
  }

  if (profile.location?.state === 'AZ') parts.push('living in Arizona')
  else if (profile.location?.state) parts.push(`living in ${profile.location.state}`)

  if (parts.length === 0) return 'Based on your profile'
  return `As ${parts.join(', ')}`
}

const TEMPLATES: Record<string, MockTemplate> = {
  'imm-001': {
    relevanceBase: 82,
    severity: 'high',
    summary: 'Proclamation 10998 restricts entry and visa issuance for nationals of 39 countries. Full bans apply to 19 countries; partial restrictions (including F, M, and J visa limitations) affect 20 more. Existing valid visas are not revoked.',
    impact: (prefix) =>
      `${prefix}, this expanded travel ban could affect your ability to travel internationally and re-enter the U.S. Even if your home country is not on the restricted list, the heightened screening environment may slow your visa processing and renewals. Consult your international student office before booking any international travel.`,
    actionItems: [
      { action: 'Check if your country of citizenship is on the 39-country list at travel.state.gov', deadline: 'Immediately' },
      { action: 'Consult your international student or scholar office before any international travel', contactInfo: 'Your university ISO' },
      { action: 'Keep I-20, DS-2019, or petition documents current and accessible' },
    ],
    confidence: 'high',
  },
  'imm-002': {
    relevanceBase: 78,
    severity: 'high',
    summary: 'USCIS is holding and reviewing all pending benefit applications from nationals of the 39 travel-ban countries. This delays EADs, extensions, and status changes with no specified timeline for resolution.',
    impact: (prefix) =>
      `${prefix}, if you have any pending USCIS applications (EAD, extension, change of status), they may be delayed indefinitely under this hold-and-review policy. Plan for potential gaps in your authorization documents and maintain communication with your designated school official (DSO) or attorney.`,
    actionItems: [
      { action: 'Check your USCIS case status online for any hold notifications', contactInfo: 'my.uscis.gov' },
      { action: 'Contact your DSO or immigration attorney if you have a pending application' },
      { action: 'Prepare backup documentation in case of processing delays' },
    ],
    confidence: 'high',
  },
  'imm-003': {
    relevanceBase: 75,
    severity: 'high',
    summary: 'The H-1B lottery now uses a weighted selection system that favors higher-wage petitions instead of random selection. Positions offering wages closer to or above prevailing wage levels receive proportionally more weight in the selection process.',
    impact: (prefix) =>
      `${prefix}, the new weighted H-1B selection means your chances in the lottery depend heavily on your offered salary relative to the prevailing wage for your occupation and area. Entry-level positions (Level 1 wages) will have significantly reduced selection probability. This affects your long-term immigration planning and may influence your job search strategy.`,
    actionItems: [
      { action: 'Research prevailing wage data for your occupation at FLCDataCenter.com' },
      { action: 'Discuss wage-tier implications with your employer or prospective employer', deadline: 'Before April lottery registration' },
      { action: 'Explore alternative visa categories if your wage tier is Level 1', contactInfo: 'Immigration attorney' },
    ],
    confidence: 'high',
  },
  'imm-004': {
    relevanceBase: 70,
    severity: 'medium',
    summary: 'USCIS filing fees increased effective March 1, 2026. OPT applications (I-765) rose to $1,780. H-1B premium processing is now $2,965. The $100K fee on new H-1B applications continues, but in-country status changes are exempt.',
    impact: (prefix) =>
      `${prefix}, these fee increases directly affect your immigration costs. If you are applying for OPT or planning an H-1B petition, budget for the higher fees. The $100K surcharge on new H-1B applications does not apply to changes of status filed from within the U.S., which is important if you are transitioning from F-1 to H-1B.`,
    actionItems: [
      { action: 'Budget for updated filing fees before submitting applications', deadline: 'Before your next filing' },
      { action: 'Confirm whether you qualify for the $100K fee exemption (in-country applicants)', contactInfo: 'Your DSO or immigration attorney' },
      { action: 'Check if your employer covers filing costs as part of sponsorship' },
    ],
    confidence: 'high',
  },
  'imm-005': {
    relevanceBase: 65,
    severity: 'medium',
    summary: 'All F-1, J-1, H-1B, and H-4 visa holders now face expanded social media screening during visa processing and renewals. Applicants must disclose social media accounts and identifiers.',
    impact: (prefix) =>
      `${prefix}, you are now required to disclose your social media accounts when applying for or renewing your visa. Your online activity may be reviewed as part of the vetting process. This applies to both new applications and renewals, so be aware of your digital footprint.`,
    actionItems: [
      { action: 'Review your social media accounts for any content that could be misinterpreted' },
      { action: 'Prepare a list of all social media accounts and identifiers for your next visa application' },
      { action: 'Avoid deleting accounts before an application, as this may raise flags' },
    ],
    confidence: 'medium',
  },
  'imm-006': {
    relevanceBase: 60,
    severity: 'medium',
    summary: 'A proposed rule would end "Duration of Status" for F-1, J-1, and I visa holders, replacing it with fixed admission periods (likely 2-4 years). Students would need to apply for extensions. Not yet finalized; public comment period expected.',
    impact: (prefix) =>
      `${prefix}, if this rule is finalized, you would no longer be admitted for the duration of your program. Instead, you would receive a fixed admission period and need to apply (and pay) for extensions to remain in the U.S. This could complicate degree programs that take longer than expected. Monitor this closely.`,
    actionItems: [
      { action: 'Monitor Federal Register for the public comment period and consider submitting comments' },
      { action: 'Plan your academic timeline to minimize the need for extensions' },
      { action: 'Ask your DSO for institutional guidance on this proposed change', contactInfo: 'Your university ISO' },
    ],
    confidence: 'medium',
  },
  'imm-007': {
    relevanceBase: 68,
    severity: 'high',
    summary: 'Automatic EAD extensions upon filing renewals have been eliminated for most categories. F-1 STEM OPT holders are exempt. Other EAD holders may face gaps in work authorization while waiting for renewal processing.',
    impact: (prefix) =>
      `${prefix}, if you hold an EAD outside of the STEM OPT category, your work authorization will no longer automatically extend while your renewal is pending. This means you could face a gap in employment authorization. File renewal applications well in advance and discuss contingency plans with your employer.`,
    actionItems: [
      { action: 'File EAD renewal applications as early as possible (up to 180 days before expiration)', deadline: '180 days before EAD expiry' },
      { action: 'Confirm whether your EAD category is exempt (STEM OPT renewals are exempt)' },
      { action: 'Notify your employer about potential authorization gaps', contactInfo: 'Your HR department' },
    ],
    confidence: 'high',
  },
  'hous-001': {
    relevanceBase: 55,
    severity: 'low',
    summary: 'An executive order directs federal agencies to prevent institutional investors from buying single-family homes through federal programs. It promotes owner-occupant first-look policies and directs antitrust review of large acquisitions.',
    impact: (prefix, profile) =>
      profile.housing?.situation?.startsWith('homeowner')
        ? `${prefix}, this order may help protect your home value by reducing institutional investor competition in your neighborhood. It also opens up antitrust scrutiny of large acquisitions that may have affected local housing markets.`
        : `${prefix}, this order may improve your future homebuying prospects by reducing competition from institutional investors. First-look policies would give individual buyers priority access to federally-backed home sales.`,
    actionItems: [
      { action: 'Monitor local housing market listings for first-look opportunities on HUD-owned properties' },
      { action: 'Check if your local housing authority has implemented first-look policies', contactInfo: 'Local HUD office' },
    ],
    confidence: 'medium',
  },
  'hous-002': {
    relevanceBase: 72,
    severity: 'medium',
    summary: 'Arizona cities can no longer charge Transaction Privilege Tax (TPT) on residential leases of 30+ days. Previously, cities like Tempe charged ~1.8% TPT on rent. For a $1,200/month apartment, this saves about $259/year.',
    impact: (prefix, profile) =>
      profile.housing?.situation === 'renter'
        ? `${prefix}, you should see a direct reduction in your monthly rent. Your landlord is required to stop collecting residential rental tax. For a typical apartment, this saves roughly $20/month. Verify that your landlord has removed the TPT line item from your next rent statement.`
        : `${prefix}, this tax elimination reduces the cost of renting in Arizona. If you are considering renting, monthly costs should be slightly lower than previously quoted rates. Short-term rentals under 30 days are still subject to TPT.`,
    actionItems: [
      { action: 'Review your next rent statement to confirm TPT has been removed', deadline: 'Next billing cycle' },
      { action: 'Contact your landlord if TPT is still being charged after January 1, 2026', contactInfo: 'Your landlord or property manager' },
    ],
    confidence: 'high',
  },
  'emp-001': {
    relevanceBase: 58,
    severity: 'low',
    summary: 'Arizona minimum wage increased to $15.15/hour effective January 1, 2026 (tipped: $12.15). Tucson ($15.50) and Flagstaff ($17.85) have higher local rates. Annual CPI-linked adjustment under the Fair Wages Act.',
    impact: (prefix, profile) =>
      profile.currentSituation?.includes('employed') || profile.currentSituation?.includes('student')
        ? `${prefix}, if you earn minimum wage or close to it, your hourly rate should have increased. If you work in Tucson or Flagstaff, check local rates which are higher than the state minimum. Verify your pay stubs reflect the updated rate.`
        : `${prefix}, this wage increase affects the cost of labor in Arizona and may indirectly impact prices for goods and services. Employers with minimum-wage workers must update pay rates and display the new wage poster.`,
    actionItems: [
      { action: 'Check your latest pay stub to confirm the updated rate', deadline: 'Next pay period' },
      { action: 'Report wage violations to the Arizona Industrial Commission', contactInfo: 'azica.gov/labor-department' },
    ],
    confidence: 'high',
  },
  'health-001': {
    relevanceBase: 70,
    severity: 'high',
    summary: 'ACA enhanced subsidies expired after 2025, causing ~49% average premium increases in Arizona. Two carriers (Banner Health, Aetna) exited the individual market. Only HMO plans remain. Up to 150,000 Arizonans may lose coverage.',
    impact: (prefix, profile) =>
      profile.healthcare === 'marketplace'
        ? `${prefix}, you are directly affected by the subsidy expiration. Your monthly premiums may double or triple compared to last year. With only HMO options remaining, your provider network may also change. Review your plan options during open enrollment carefully.`
        : profile.healthcare === 'uninsured'
          ? `${prefix}, obtaining marketplace coverage in Arizona has become significantly more expensive without subsidies. Explore Medicaid eligibility or short-term health plans as alternatives.`
          : `${prefix}, even if you have employer or university coverage now, these market changes affect your fallback options. If you lose current coverage, marketplace plans in Arizona are substantially more expensive than last year.`,
    actionItems: [
      { action: 'Review your 2026 marketplace plan options and compare premiums', contactInfo: 'healthcare.gov' },
      { action: 'Check if you qualify for Medicaid or other assistance programs', contactInfo: 'Arizona AHCCCS: azahcccs.gov' },
      { action: 'Confirm your current doctors are in-network under remaining HMO plans' },
    ],
    confidence: 'high',
  },
  'health-002': {
    relevanceBase: 55,
    severity: 'medium',
    summary: 'Under the OBBBA, Medicaid expansion adults (19-64) must complete 80 hours/month of work or approved activities starting December 2026. Eligibility renewals move to every 6 months. Service fees of up to $35 begin in 2028.',
    impact: (prefix, profile) =>
      profile.healthcare === 'medicaid'
        ? `${prefix}, you will need to document 80 hours/month of work, school, job training, or volunteering to maintain Medicaid coverage starting late 2026. Eligibility renewals will be every 6 months instead of annually. Start tracking your qualifying activities now.`
        : `${prefix}, these Medicaid changes affect anyone who may need to rely on Medicaid in the future. The new work requirements and more frequent renewals create additional barriers to maintaining coverage. Exemptions exist for pregnant women, caretaker relatives, and individuals with disabilities.`,
    actionItems: [
      { action: 'Track your monthly work or qualifying activity hours (80 hours/month required)', deadline: 'December 31, 2026' },
      { action: 'Check if you qualify for an exemption (pregnancy, disability, caretaker status)', contactInfo: 'Arizona AHCCCS' },
      { action: 'Set reminders for 6-month eligibility renewals' },
    ],
    confidence: 'medium',
  },
  'tax-001': {
    relevanceBase: 65,
    severity: 'medium',
    summary: 'Major federal tax changes: standard deduction rises to $15,750 (single) / $31,500 (joint). SALT cap raised to $40K. Up to $25K in tip and overtime income excluded from federal tax. Child tax credit increases to $2,200.',
    impact: (prefix, profile) => {
      const parts = [`${prefix}, these tax changes affect your 2025 return (filed in 2026). The higher standard deduction reduces your taxable income.`]
      if (profile.currentSituation?.includes('employed') || profile.currentSituation?.includes('self_employed')) {
        parts.push('If you earn tip or overtime income, you may exclude up to $25,000 ($12,500 single) from federal tax.')
      }
      if (profile.dependents === '1_2' || profile.dependents === '3_plus') {
        parts.push('The increased child tax credit ($2,200 per child) will also reduce your tax liability.')
      }
      parts.push('The SALT deduction cap increase from $10K to $40K benefits homeowners in high-tax states.')
      return parts.join(' ')
    },
    actionItems: [
      { action: 'Review updated tax brackets and standard deduction amounts before filing', deadline: 'April 15, 2026' },
      { action: 'Track tip and overtime income separately for the new exclusion' },
      { action: 'Consult a tax professional about whether to itemize with the new $40K SALT cap', contactInfo: 'IRS.gov or a CPA' },
    ],
    confidence: 'high',
  },
  'edu-001': {
    relevanceBase: 78,
    severity: 'high',
    summary: 'Grad PLUS Loans are eliminated for 2026-27. Parent PLUS capped at $20K/year ($65K lifetime). Foreign income now counts in Pell calculations. Students with full scholarships lose Pell eligibility.',
    impact: (prefix, profile) => {
      const parts = [`${prefix}, these financial aid changes significantly reshape how education is funded.`]
      if (profile.education?.degreeLevel === 'masters' || profile.education?.degreeLevel === 'doctorate') {
        parts.push('The elimination of Grad PLUS Loans means you will need alternative funding sources for graduate education, such as private loans, assistantships, or employer sponsorship.')
      }
      if (profile.education?.financialAid) {
        parts.push('Your Pell Grant eligibility may change if foreign income is part of your household AGI or if your scholarships cover full cost of attendance.')
      }
      if (profile.education?.studentLoans) {
        parts.push('The Parent PLUS cap at $20K/year may affect families who rely on these loans to cover remaining costs.')
      }
      return parts.join(' ')
    },
    actionItems: [
      { action: 'Complete the 2026-27 FAFSA early to understand your updated aid package', deadline: 'October 2025 (when available)' },
      { action: 'Explore alternative funding: assistantships, fellowships, private loans', contactInfo: 'Your financial aid office' },
      { action: 'Review whether foreign income affects your Pell Grant calculation' },
    ],
    confidence: 'high',
  },
  'az-001': {
    relevanceBase: 72,
    severity: 'high',
    summary: 'Four anti-immigration bills are moving through the AZ legislature: hospital citizenship reporting (HB 2689), banking restrictions on immigrant IDs (SB 1421), benefits verification (SB 1152), and sanctuary city bans (SB 1474). None are law yet.',
    impact: (prefix) =>
      `${prefix}, these bills could significantly affect daily life for immigrants in Arizona if passed. HB 2689 would require hospitals to ask about citizenship status. SB 1421 would restrict banking access for those using certain IDs. SB 1152 would require immigration status verification for public benefits. Track these bills and consider contacting your state representative.`,
    actionItems: [
      { action: 'Track bill progress at azleg.gov', contactInfo: 'Arizona Legislature: azleg.gov' },
      { action: 'Ensure your banking and identification documents are in order' },
      { action: 'Contact your state representative to share your perspective', contactInfo: 'azleg.gov/find-my-legislator' },
    ],
    confidence: 'medium',
  },
}

/**
 * Generate mock personalized alerts without calling the real API.
 * Simulates a processing delay for realistic progressive loading.
 */
export async function generateMockAlerts(
  profile: UserProfile,
  changes: LegalChange[],
): Promise<PersonalizedAlert[]> {
  // Simulate network/processing delay (400-900ms)
  await new Promise(r => setTimeout(r, 400 + Math.random() * 500))

  const traits = extractTraits(profile)
  const prefix = profilePrefix(profile)

  return changes.map(change => {
    const template = TEMPLATES[change.id]
    const matchedBecause = change.affectedGroups.filter(g => traits.includes(g))

    // Adjust relevance based on trait overlap
    const traitBonus = Math.min(20, matchedBecause.length * 5)
    const baseScore = template?.relevanceBase ?? 40
    const relevanceScore = Math.min(100, baseScore + traitBonus)

    if (!template) {
      return {
        legalChangeId: change.id,
        relevanceScore: Math.min(80, matchedBecause.length * 15 + 10),
        severity: 'medium' as const,
        summary: change.genericSummary,
        personalImpact: `${prefix}, this change may affect you. Review the source document for full details.`,
        matchedBecause,
        actionItems: [],
        confidence: 'medium' as const,
        title: change.title,
        category: change.category,
        datePublished: change.datePublished,
        sourceUrl: change.sourceUrl,
        sourceDocument: change.sourceDocument,
        dismissed: false,
        savedForLater: false,
      }
    }

    return {
      legalChangeId: change.id,
      relevanceScore,
      severity: template.severity,
      summary: template.summary,
      personalImpact: template.impact(prefix, profile),
      matchedBecause,
      actionItems: template.actionItems,
      confidence: template.confidence,
      title: change.title,
      category: change.category,
      datePublished: change.datePublished,
      sourceUrl: change.sourceUrl,
      sourceDocument: change.sourceDocument,
      dismissed: false,
      savedForLater: false,
    }
  })
}
