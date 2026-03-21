import { AnimatePresence, motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StepField } from './StepField'
import { SelectionChip } from './SelectionChip'
import type { UserProfile, EmploymentType, BusinessSize } from '@/types/profile'

const INDUSTRY_OPTIONS = [
  'Tech',
  'Healthcare',
  'Education',
  'Finance',
  'Retail',
  'Food Service',
  'Construction',
  'Other',
]

const EMPLOYMENT_TYPE_OPTIONS: { value: EmploymentType; label: string }[] = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'gig', label: 'Gig worker' },
  { value: 'contract', label: 'Contract' },
]

const BUSINESS_SIZE_OPTIONS: { value: BusinessSize; label: string }[] = [
  { value: 'solo', label: 'Solo' },
  { value: '2_10', label: '2-10 employees' },
  { value: '11_50', label: '11-50 employees' },
  { value: '50_plus', label: '50+ employees' },
]

const expandVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { type: 'spring' as const, stiffness: 300, damping: 25 },
      opacity: { duration: 0.2, delay: 0.1 },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: { type: 'spring' as const, stiffness: 300, damping: 25 },
      opacity: { duration: 0.15 },
    },
  },
}

interface StepEmploymentProps {
  data: Partial<UserProfile>
  onChange: (data: Partial<UserProfile>) => void
  accentColor?: string
}

export function StepEmployment({ data, onChange, accentColor = '#2563EB' }: StepEmploymentProps) {
  const employment = data.employment ?? {}
  const isGig = employment.type === 'gig'
  const isBusinessOwner = data.currentSituation?.includes('business_owner') ?? false

  function update(patch: Partial<UserProfile['employment']>) {
    onChange({
      ...data,
      employment: { ...employment, ...patch },
    })
  }

  return (
    <div className="space-y-7">
      <StepField index={0} label="Industry Sector">
        <Select
          value={employment.industry ?? ''}
          onValueChange={(val) => update({ industry: val })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your industry" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRY_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt.toLowerCase().replace(/\s+/g, '_')}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </StepField>

      <StepField index={1} label="Employment Type">
        <Select
          value={employment.type ?? ''}
          onValueChange={(val) => update({ type: val as EmploymentType })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select employment type" />
          </SelectTrigger>
          <SelectContent>
            {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </StepField>

      <AnimatePresence>
        {isGig && (
          <motion.div
            variants={expandVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="overflow-hidden"
          >
            <div className="pt-1">
              <StepField index={2} label="Platform Type">
                <Input
                  id="gig-platform"
                  placeholder="e.g. Rideshare, Delivery, Freelance"
                  value={employment.gigPlatform ?? ''}
                  onChange={(e) => update({ gigPlatform: e.target.value })}
                />
              </StepField>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isBusinessOwner && (
          <motion.div
            variants={expandVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="overflow-hidden"
          >
            <div className="pt-1">
              <StepField index={3} label="Business Size">
                <div className="flex flex-wrap gap-2.5">
                  {BUSINESS_SIZE_OPTIONS.map((opt) => (
                    <SelectionChip
                      key={opt.value}
                      label={opt.label}
                      selected={employment.businessSize === opt.value}
                      onClick={() => update({ businessSize: opt.value })}
                      accentColor={accentColor}
                    />
                  ))}
                </div>
              </StepField>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
