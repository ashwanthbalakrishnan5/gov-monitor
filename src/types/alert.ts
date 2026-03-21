import type { LegalCategory } from './legal-change'

export type Severity = 'high' | 'medium' | 'low'
export type Confidence = 'high' | 'medium' | 'low'

export interface ActionItem {
  action: string
  deadline?: string
  contactInfo?: string
}

export interface PersonalizedAlert {
  legalChangeId: string
  relevanceScore: number
  severity: Severity
  summary: string
  personalImpact: string
  matchedBecause: string[]
  actionItems: ActionItem[]
  confidence: Confidence

  // From the original LegalChange
  title: string
  category: LegalCategory
  datePublished: string
  sourceUrl: string
  sourceDocument: string

  // UI state
  dismissed: boolean
  savedForLater: boolean
}
