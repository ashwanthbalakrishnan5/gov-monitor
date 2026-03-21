export type LegalCategory =
  | 'immigration'
  | 'housing'
  | 'employment'
  | 'taxation'
  | 'transportation'
  | 'education'
  | 'healthcare'
  | 'consumer'
  | 'business'

export type Jurisdiction = 'federal' | 'state' | 'local'

export interface LegalChange {
  id: string
  title: string
  category: LegalCategory
  subcategory?: string
  datePublished: string
  dateEffective?: string
  jurisdiction: Jurisdiction
  state?: string
  sourceUrl: string
  sourceDocument: string
  rawText: string
  genericSummary: string
  affectedGroups: string[]
  keywords: string[]
}
