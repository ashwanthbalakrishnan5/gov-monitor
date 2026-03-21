import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StepField } from './StepField'
import { SelectionChip } from './SelectionChip'
import type { UserProfile, FilingStatus, Dependents } from '@/types/profile'

const TRANSPORTATION_OPTIONS = [
  'Own car',
  'Lease car',
  'Public transit',
  'Bicycle/Walk',
  'Fly regularly',
]

const HEALTHCARE_OPTIONS = [
  { value: 'employer', label: 'Employer' },
  { value: 'marketplace', label: 'Marketplace (ACA)' },
  { value: 'medicaid', label: 'Medicaid' },
  { value: 'medicare', label: 'Medicare' },
  { value: 'university', label: 'University plan' },
  { value: 'uninsured', label: 'Uninsured' },
  { value: 'other', label: 'Other' },
]

const FILING_OPTIONS: { value: FilingStatus; label: string }[] = [
  { value: 'single', label: 'Single' },
  { value: 'married_joint', label: 'Married filing jointly' },
  { value: 'married_separate', label: 'Married filing separately' },
  { value: 'head_of_household', label: 'Head of household' },
]

const DEPENDENT_OPTIONS: { value: Dependents; label: string }[] = [
  { value: '0', label: '0' },
  { value: '1_2', label: '1-2' },
  { value: '3_plus', label: '3+' },
]

interface StepAdditionalProps {
  data: Partial<UserProfile>
  onChange: (data: Partial<UserProfile>) => void
  accentColor?: string
}

export function StepAdditional({ data, onChange, accentColor = '#D97706' }: StepAdditionalProps) {
  const transportation = data.transportation ?? []

  function handleTransportToggle(value: string) {
    const updated = transportation.includes(value)
      ? transportation.filter((t) => t !== value)
      : [...transportation, value]
    onChange({ ...data, transportation: updated })
  }

  return (
    <div className="space-y-7">
      <StepField index={0} label="Transportation">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted)]/50 p-4">
          <div className="flex flex-wrap gap-2.5">
            {TRANSPORTATION_OPTIONS.map((opt) => (
              <SelectionChip
                key={opt}
                label={opt}
                selected={transportation.includes(opt)}
                onClick={() => handleTransportToggle(opt)}
                accentColor={accentColor}
              />
            ))}
          </div>
        </div>
      </StepField>

      <StepField index={1} label="Healthcare Coverage">
        <Select
          value={data.healthcare ?? ''}
          onValueChange={(val) => onChange({ ...data, healthcare: val })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select healthcare coverage" />
          </SelectTrigger>
          <SelectContent>
            {HEALTHCARE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </StepField>

      <StepField index={2} label="Filing Status">
        <Select
          value={data.filingStatus ?? ''}
          onValueChange={(val) =>
            onChange({ ...data, filingStatus: val as FilingStatus })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select filing status" />
          </SelectTrigger>
          <SelectContent>
            {FILING_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </StepField>

      <StepField index={3} label="Dependents">
        <div className="flex flex-wrap gap-2.5">
          {DEPENDENT_OPTIONS.map((opt) => (
            <SelectionChip
              key={opt.value}
              label={opt.label}
              selected={data.dependents === opt.value}
              onClick={() => onChange({ ...data, dependents: opt.value })}
              accentColor={accentColor}
            />
          ))}
        </div>
      </StepField>
    </div>
  )
}
