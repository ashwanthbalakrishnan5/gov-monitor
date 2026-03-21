import type { LegalCategory } from './legal-change'

export type DeliveryFrequency = 'realtime' | 'daily' | 'weekly'
export type SeverityThreshold = 'all' | 'low' | 'medium' | 'high'

export interface NotificationChannel {
  enabled: boolean
  value?: string
}

export interface AlertPreferences {
  channels: {
    push: NotificationChannel
    email: NotificationChannel
    sms: NotificationChannel
  }
  subscribedCategories: LegalCategory[]
  severityThreshold: SeverityThreshold
  deliveryFrequency: DeliveryFrequency
  keywords: string[]
  updatedAt: string
}
