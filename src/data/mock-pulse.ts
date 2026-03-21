export interface PulseEntry {
  legalChangeId: string
  title: string
  category: string
  totalResponses: number
  sentiment: {
    concerned: number
    neutral: number
    supportive: number
  }
  demographics: {
    label: string
    concerned: number
    neutral: number
    supportive: number
  }[]
  trending: 'up' | 'down' | 'stable'
  weeklyChange: number // percentage points
  topConcern: string
}

export const mockPulseData: PulseEntry[] = [
  {
    legalChangeId: 'h1b-wage-rule-2026',
    title: 'H-1B Prevailing Wage Rule Change',
    category: 'immigration',
    totalResponses: 12847,
    sentiment: { concerned: 62, neutral: 18, supportive: 20 },
    demographics: [
      { label: 'Visa Holders', concerned: 78, neutral: 12, supportive: 10 },
      { label: 'Employers', concerned: 55, neutral: 20, supportive: 25 },
      { label: 'Students', concerned: 68, neutral: 22, supportive: 10 },
      { label: 'Citizens', concerned: 35, neutral: 25, supportive: 40 },
    ],
    trending: 'up',
    weeklyChange: 8,
    topConcern: 'Salary threshold increase may price out smaller employers',
  },
  {
    legalChangeId: 'aca-subsidy-cliff-2026',
    title: 'ACA Subsidy Cliff Returns',
    category: 'healthcare',
    totalResponses: 9234,
    sentiment: { concerned: 71, neutral: 14, supportive: 15 },
    demographics: [
      { label: 'Self-Employed', concerned: 82, neutral: 10, supportive: 8 },
      { label: 'Part-Time Workers', concerned: 75, neutral: 15, supportive: 10 },
      { label: 'Families', concerned: 68, neutral: 18, supportive: 14 },
      { label: 'Retirees', concerned: 60, neutral: 20, supportive: 20 },
    ],
    trending: 'up',
    weeklyChange: 12,
    topConcern: 'Premium costs could double for households near the subsidy cliff',
  },
  {
    legalChangeId: 'az-rent-cap-2026',
    title: 'Arizona Rent Stabilization Act',
    category: 'housing',
    totalResponses: 7561,
    sentiment: { concerned: 35, neutral: 20, supportive: 45 },
    demographics: [
      { label: 'Renters', concerned: 15, neutral: 15, supportive: 70 },
      { label: 'Landlords', concerned: 80, neutral: 10, supportive: 10 },
      { label: 'Homeowners', concerned: 40, neutral: 35, supportive: 25 },
      { label: 'Students', concerned: 20, neutral: 20, supportive: 60 },
    ],
    trending: 'stable',
    weeklyChange: 2,
    topConcern: 'Landlords may reduce maintenance spending to offset capped rents',
  },
  {
    legalChangeId: 'student-loan-idr-2026',
    title: 'Student Loan IDR Plan Changes',
    category: 'education',
    totalResponses: 11203,
    sentiment: { concerned: 58, neutral: 22, supportive: 20 },
    demographics: [
      { label: 'Current Borrowers', concerned: 72, neutral: 15, supportive: 13 },
      { label: 'Recent Grads', concerned: 65, neutral: 20, supportive: 15 },
      { label: 'Parents', concerned: 50, neutral: 25, supportive: 25 },
      { label: 'Educators', concerned: 45, neutral: 30, supportive: 25 },
    ],
    trending: 'up',
    weeklyChange: 5,
    topConcern: 'Monthly payment increase under new IDR formula',
  },
  {
    legalChangeId: 'gig-worker-abc-2026',
    title: 'Gig Worker Classification (ABC Test)',
    category: 'employment',
    totalResponses: 8912,
    sentiment: { concerned: 48, neutral: 22, supportive: 30 },
    demographics: [
      { label: 'Gig Workers', concerned: 40, neutral: 15, supportive: 45 },
      { label: 'Platforms', concerned: 75, neutral: 15, supportive: 10 },
      { label: 'Consumers', concerned: 30, neutral: 35, supportive: 35 },
      { label: 'Small Business', concerned: 55, neutral: 25, supportive: 20 },
    ],
    trending: 'down',
    weeklyChange: -3,
    topConcern: 'Reduced flexibility if reclassified as employees',
  },
  {
    legalChangeId: 'salt-cap-2026',
    title: 'SALT Deduction Cap Extension',
    category: 'taxation',
    totalResponses: 6789,
    sentiment: { concerned: 52, neutral: 28, supportive: 20 },
    demographics: [
      { label: 'High-Tax State', concerned: 70, neutral: 15, supportive: 15 },
      { label: 'Low-Tax State', concerned: 25, neutral: 40, supportive: 35 },
      { label: 'Homeowners', concerned: 60, neutral: 20, supportive: 20 },
      { label: 'Renters', concerned: 30, neutral: 45, supportive: 25 },
    ],
    trending: 'stable',
    weeklyChange: 1,
    topConcern: 'Continued cap limits deductions for high-tax state residents',
  },
]
