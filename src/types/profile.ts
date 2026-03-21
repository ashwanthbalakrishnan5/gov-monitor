export type ResidencyStatus =
  | 'us_citizen'
  | 'permanent_resident'
  | 'visa_holder'
  | 'undocumented'
  | 'prefer_not_to_say'

export type CurrentSituation =
  | 'student'
  | 'employed'
  | 'self_employed'
  | 'business_owner'
  | 'unemployed'
  | 'retired'

export type VisaType = 'f1' | 'h1b' | 'j1' | 'l1' | 'o1' | 'b1_b2' | 'other'

export type OptCptStatus = 'none' | 'cpt' | 'pre_opt' | 'post_opt' | 'stem_opt'

export type EmploymentType = 'full_time' | 'part_time' | 'gig' | 'contract'

export type BusinessSize = 'solo' | '2_10' | '11_50' | '50_plus'

export type HousingSituation =
  | 'renter'
  | 'homeowner_mortgage'
  | 'homeowner_paid'
  | 'campus'
  | 'family'

export type LandlordType = 'individual' | 'company'

export type DegreeLevel = 'associate' | 'bachelors' | 'masters' | 'doctorate' | 'certificate'

export type InstitutionType = 'public' | 'private'

export type FilingStatus = 'single' | 'married_joint' | 'married_separate' | 'head_of_household'

export type Dependents = '0' | '1_2' | '3_plus'

export interface UserProfile {
  // Step 1 - Mandatory
  location: {
    zipCode?: string
    city?: string
    state: string
  }
  residencyStatus: ResidencyStatus
  currentSituation: CurrentSituation[]

  // Step 2 - Immigration (conditional)
  immigration?: {
    visaType: VisaType
    optCptStatus?: OptCptStatus
    stemEligible?: boolean | null
  }

  // Step 3 - Employment (conditional)
  employment?: {
    industry?: string
    type?: EmploymentType
    gigPlatform?: string
    businessSize?: BusinessSize
  }

  // Step 4 - Housing (optional)
  housing?: {
    situation: HousingSituation
    landlordType?: LandlordType
  }

  // Step 5 - Education (conditional)
  education?: {
    degreeLevel: DegreeLevel
    institutionType: InstitutionType
    financialAid: boolean
    studentLoans: boolean
  }

  // Step 6 - Additional (optional)
  transportation?: string[]
  healthcare?: string
  filingStatus?: FilingStatus
  dependents?: Dependents

  // Meta
  profileCompleteness: number
  createdAt: string
  updatedAt: string
}
