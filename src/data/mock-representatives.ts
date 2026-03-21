export interface Representative {
  id: string
  name: string
  title: string
  party: 'D' | 'R' | 'I'
  level: 'federal' | 'state'
  chamber: 'senate' | 'house'
  district?: string
  photoUrl?: string
  phone: string
  email: string
  website: string
  office: string
  alignmentScore: number // 0-100, how aligned with user's interests
  votingRecord: VoteRecord[]
  committees: string[]
}

export interface VoteRecord {
  billId: string
  billTitle: string
  category: string
  vote: 'yea' | 'nay' | 'abstain'
  alignedWithUser: boolean
  date: string
}

export const mockRepresentatives: Representative[] = [
  {
    id: 'kelly',
    name: 'Mark Kelly',
    title: 'U.S. Senator',
    party: 'D',
    level: 'federal',
    chamber: 'senate',
    phone: '(202) 224-2235',
    email: 'contact@kelly.senate.gov',
    website: 'kelly.senate.gov',
    office: '516 Hart Senate Office Building, Washington, DC 20510',
    alignmentScore: 72,
    committees: ['Armed Services', 'Commerce, Science & Transportation', 'Energy & Natural Resources'],
    votingRecord: [
      { billId: 'hr-2882', billTitle: 'ACA Subsidy Extension Act', category: 'healthcare', vote: 'yea', alignedWithUser: true, date: '2026-02-15' },
      { billId: 's-1247', billTitle: 'H-1B Visa Reform Act', category: 'immigration', vote: 'yea', alignedWithUser: true, date: '2026-01-28' },
      { billId: 's-892', billTitle: 'Federal Housing Stability Act', category: 'housing', vote: 'yea', alignedWithUser: true, date: '2025-12-10' },
      { billId: 's-445', billTitle: 'Student Loan Forgiveness Expansion', category: 'education', vote: 'nay', alignedWithUser: false, date: '2025-11-20' },
      { billId: 'hr-3301', billTitle: 'Border Security Supplemental', category: 'immigration', vote: 'yea', alignedWithUser: true, date: '2025-10-05' },
    ],
  },
  {
    id: 'gallego',
    name: 'Ruben Gallego',
    title: 'U.S. Senator',
    party: 'D',
    level: 'federal',
    chamber: 'senate',
    phone: '(202) 224-4521',
    email: 'contact@gallego.senate.gov',
    website: 'gallego.senate.gov',
    office: '317 Hart Senate Office Building, Washington, DC 20510',
    alignmentScore: 68,
    committees: ['Judiciary', 'Veterans Affairs', 'Commerce, Science & Transportation'],
    votingRecord: [
      { billId: 'hr-2882', billTitle: 'ACA Subsidy Extension Act', category: 'healthcare', vote: 'yea', alignedWithUser: true, date: '2026-02-15' },
      { billId: 's-1247', billTitle: 'H-1B Visa Reform Act', category: 'immigration', vote: 'yea', alignedWithUser: true, date: '2026-01-28' },
      { billId: 's-892', billTitle: 'Federal Housing Stability Act', category: 'housing', vote: 'nay', alignedWithUser: false, date: '2025-12-10' },
      { billId: 's-445', billTitle: 'Student Loan Forgiveness Expansion', category: 'education', vote: 'yea', alignedWithUser: true, date: '2025-11-20' },
      { billId: 'hr-3301', billTitle: 'Border Security Supplemental', category: 'immigration', vote: 'nay', alignedWithUser: false, date: '2025-10-05' },
    ],
  },
  {
    id: 'stanton',
    name: 'Greg Stanton',
    title: 'U.S. Representative',
    party: 'D',
    level: 'federal',
    chamber: 'house',
    district: 'AZ-4',
    phone: '(202) 225-9888',
    email: 'contact@stanton.house.gov',
    website: 'stanton.house.gov',
    office: '2234 Rayburn House Office Building, Washington, DC 20515',
    alignmentScore: 81,
    committees: ['Judiciary', 'Transportation & Infrastructure'],
    votingRecord: [
      { billId: 'hr-2882', billTitle: 'ACA Subsidy Extension Act', category: 'healthcare', vote: 'yea', alignedWithUser: true, date: '2026-02-15' },
      { billId: 'hr-1599', billTitle: 'DREAM Act Reauthorization', category: 'immigration', vote: 'yea', alignedWithUser: true, date: '2026-01-10' },
      { billId: 'hr-2201', billTitle: 'Rent Stabilization Act', category: 'housing', vote: 'yea', alignedWithUser: true, date: '2025-12-15' },
      { billId: 'hr-887', billTitle: 'Small Business Tax Relief', category: 'taxation', vote: 'yea', alignedWithUser: true, date: '2025-11-01' },
    ],
  },
  {
    id: 'az-sen-1',
    name: 'T.J. Shope',
    title: 'State Senator',
    party: 'R',
    level: 'state',
    chamber: 'senate',
    district: 'LD-16',
    phone: '(602) 926-3012',
    email: 'tshope@azleg.gov',
    website: 'azleg.gov/senate-member/?legislature=57&legislator=2060',
    office: '1700 W. Washington St, Phoenix, AZ 85007',
    alignmentScore: 45,
    committees: ['Appropriations', 'Commerce'],
    votingRecord: [
      { billId: 'sb-1234', billTitle: 'AZ Rental Protection Act', category: 'housing', vote: 'nay', alignedWithUser: false, date: '2026-02-20' },
      { billId: 'sb-789', billTitle: 'State Education Funding', category: 'education', vote: 'yea', alignedWithUser: true, date: '2026-01-15' },
      { billId: 'hb-456', billTitle: 'AZ Healthcare Access', category: 'healthcare', vote: 'nay', alignedWithUser: false, date: '2025-12-01' },
    ],
  },
]
