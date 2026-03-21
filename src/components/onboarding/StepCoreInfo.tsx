import { Input } from '@/components/ui/input'
import { StepField } from './StepField'
import { SelectionCard } from './SelectionCard'
import { SelectionChip } from './SelectionChip'
import type { UserProfile, ResidencyStatus, CurrentSituation } from '@/types/profile'

const RESIDENCY_OPTIONS: { value: ResidencyStatus; label: string }[] = [
  { value: 'us_citizen', label: 'US Citizen' },
  { value: 'permanent_resident', label: 'Permanent Resident' },
  { value: 'visa_holder', label: 'Visa Holder' },
  { value: 'undocumented', label: 'Undocumented' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

const SITUATION_OPTIONS: { value: CurrentSituation; label: string }[] = [
  { value: 'student', label: 'Student' },
  { value: 'employed', label: 'Employed' },
  { value: 'self_employed', label: 'Self-employed' },
  { value: 'business_owner', label: 'Business owner' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'retired', label: 'Retired' },
]

interface StepCoreInfoProps {
  data: Partial<UserProfile>
  onChange: (data: Partial<UserProfile>) => void
  accentColor?: string
}

export function StepCoreInfo({ data, onChange, accentColor = '#C4703E' }: StepCoreInfoProps) {
  const location = data.location ?? { state: '' }
  const residencyStatus = data.residencyStatus
  const currentSituation = data.currentSituation ?? []

  function handleLocationChange(value: string) {
    onChange({
      ...data,
      location: { ...location, zipCode: value, state: deriveState(value) },
    })
  }

  function handleResidencyChange(value: ResidencyStatus) {
    onChange({ ...data, residencyStatus: value })
  }

  function handleSituationToggle(value: CurrentSituation) {
    const updated = currentSituation.includes(value)
      ? currentSituation.filter((s) => s !== value)
      : [...currentSituation, value]
    onChange({ ...data, currentSituation: updated })
  }

  return (
    <div className="space-y-7">
      <StepField
        index={0}
        label="Location"
        helperText="We will use this to track state and local laws"
      >
        <Input
          id="location"
          placeholder="e.g. 85281 or Tempe, AZ"
          value={location.zipCode ?? ''}
          onChange={(e) => handleLocationChange(e.target.value)}
          className="transition-shadow duration-200 focus-visible:ring-2 focus-visible:ring-offset-1"
          style={{
            '--tw-ring-color': `${accentColor}30`,
          } as React.CSSProperties}
        />
      </StepField>

      <StepField index={1} label="Residency Status">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {RESIDENCY_OPTIONS.map((opt) => (
            <SelectionCard
              key={opt.value}
              label={opt.label}
              selected={residencyStatus === opt.value}
              onClick={() => handleResidencyChange(opt.value)}
              accentColor={accentColor}
            />
          ))}
        </div>
      </StepField>

      <StepField index={2} label="Current Situation">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/50 p-4">
          <div className="flex flex-wrap gap-2.5">
            {SITUATION_OPTIONS.map((opt) => (
              <SelectionChip
                key={opt.value}
                label={opt.label}
                selected={currentSituation.includes(opt.value)}
                onClick={() => handleSituationToggle(opt.value)}
                accentColor={accentColor}
              />
            ))}
          </div>
        </div>
      </StepField>
    </div>
  )
}

/**
 * Simple state derivation from zip code.
 * For the MVP/demo, we handle common Arizona zip codes and some patterns.
 * A full implementation would use a zip code API.
 */
function deriveState(input: string): string {
  const trimmed = input.trim()

  // Check for "City, ST" pattern
  const commaMatch = trimmed.match(/,\s*([A-Z]{2})\s*$/i)
  if (commaMatch) {
    return commaMatch[1].toUpperCase()
  }

  // Check for Arizona zip codes (850xx-865xx)
  const zipMatch = trimmed.match(/^(\d{5})/)
  if (zipMatch) {
    const zip = parseInt(zipMatch[1])
    if (zip >= 85000 && zip <= 86599) return 'AZ'
    if (zip >= 90000 && zip <= 96199) return 'CA'
    if (zip >= 10000 && zip <= 14999) return 'NY'
    if (zip >= 77000 && zip <= 79999) return 'TX'
    // Default to AZ for the demo
    return 'AZ'
  }

  return ''
}
