import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StepField } from './StepField'
import { SelectionChip } from './SelectionChip'
import type { UserProfile, DegreeLevel, InstitutionType } from '@/types/profile'

const DEGREE_OPTIONS: { value: DegreeLevel; label: string }[] = [
  { value: 'associate', label: "Associate's" },
  { value: 'bachelors', label: "Bachelor's" },
  { value: 'masters', label: "Master's" },
  { value: 'doctorate', label: 'Doctorate' },
  { value: 'certificate', label: 'Certificate' },
]

const INSTITUTION_OPTIONS: { value: InstitutionType; label: string }[] = [
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
]

interface StepEducationProps {
  data: Partial<UserProfile>
  onChange: (data: Partial<UserProfile>) => void
  accentColor?: string
}

export function StepEducation({ data, onChange, accentColor = '#DB2777' }: StepEducationProps) {
  const education = data.education

  function update(patch: Partial<NonNullable<UserProfile['education']>>) {
    onChange({
      ...data,
      education: {
        degreeLevel: education?.degreeLevel ?? (undefined as unknown as DegreeLevel),
        institutionType: education?.institutionType ?? (undefined as unknown as InstitutionType),
        financialAid: education?.financialAid ?? false,
        studentLoans: education?.studentLoans ?? false,
        ...patch,
      },
    })
  }

  return (
    <div className="space-y-7">
      <StepField index={0} label="Degree Level">
        <Select
          value={education?.degreeLevel ?? ''}
          onValueChange={(val) => update({ degreeLevel: val as DegreeLevel })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select degree level" />
          </SelectTrigger>
          <SelectContent>
            {DEGREE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </StepField>

      <StepField index={1} label="Institution Type">
        <div className="flex flex-wrap gap-2.5">
          {INSTITUTION_OPTIONS.map((opt) => (
            <SelectionChip
              key={opt.value}
              label={opt.label}
              selected={education?.institutionType === opt.value}
              onClick={() => update({ institutionType: opt.value })}
              accentColor={accentColor}
            />
          ))}
        </div>
      </StepField>

      <StepField index={2} label="Receiving Financial Aid?">
        <div className="flex flex-wrap gap-2.5">
          {[
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
          ].map((opt) => (
            <SelectionChip
              key={String(opt.value)}
              label={opt.label}
              selected={education?.financialAid === opt.value}
              onClick={() => update({ financialAid: opt.value })}
              accentColor={accentColor}
            />
          ))}
        </div>
      </StepField>

      <StepField index={3} label="Student Loans?">
        <div className="flex flex-wrap gap-2.5">
          {[
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
          ].map((opt) => (
            <SelectionChip
              key={String(opt.value)}
              label={opt.label}
              selected={education?.studentLoans === opt.value}
              onClick={() => update({ studentLoans: opt.value })}
              accentColor={accentColor}
            />
          ))}
        </div>
      </StepField>
    </div>
  )
}
