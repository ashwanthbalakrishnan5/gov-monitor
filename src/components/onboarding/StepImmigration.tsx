import { AnimatePresence, motion } from 'framer-motion'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StepField } from './StepField'
import { SelectionCard } from './SelectionCard'
import { SelectionChip } from './SelectionChip'
import type { UserProfile, VisaType, OptCptStatus } from '@/types/profile'

const VISA_OPTIONS: { value: VisaType; label: string }[] = [
  { value: 'f1', label: 'F-1 (Student)' },
  { value: 'h1b', label: 'H-1B (Specialty Occupation)' },
  { value: 'j1', label: 'J-1 (Exchange Visitor)' },
  { value: 'l1', label: 'L-1 (Intracompany Transfer)' },
  { value: 'o1', label: 'O-1 (Extraordinary Ability)' },
  { value: 'b1_b2', label: 'B-1/B-2 (Business/Tourist)' },
  { value: 'other', label: 'Other' },
]

const OPT_OPTIONS: { value: OptCptStatus; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'cpt', label: 'CPT' },
  { value: 'pre_opt', label: 'Pre-completion OPT' },
  { value: 'post_opt', label: 'Post-completion OPT' },
  { value: 'stem_opt', label: 'STEM OPT Extension' },
]

const STEM_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'not_sure', label: 'Not sure' },
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

interface StepImmigrationProps {
  data: Partial<UserProfile>
  onChange: (data: Partial<UserProfile>) => void
  accentColor?: string
}

export function StepImmigration({ data, onChange, accentColor = '#7C3AED' }: StepImmigrationProps) {
  const immigration = data.immigration ?? { visaType: undefined as unknown as VisaType }
  const isF1 = immigration.visaType === 'f1'

  function handleVisaChange(value: string) {
    onChange({
      ...data,
      immigration: {
        visaType: value as VisaType,
        optCptStatus: value === 'f1' ? immigration.optCptStatus : undefined,
        stemEligible: value === 'f1' ? immigration.stemEligible : undefined,
      },
    })
  }

  function handleOptChange(value: string) {
    onChange({
      ...data,
      immigration: {
        ...immigration,
        optCptStatus: value as OptCptStatus,
      },
    })
  }

  function handleStemChange(value: string) {
    let stemVal: boolean | null = null
    if (value === 'yes') stemVal = true
    else if (value === 'no') stemVal = false
    onChange({
      ...data,
      immigration: {
        ...immigration,
        stemEligible: stemVal,
      },
    })
  }

  function getStemValue(): string {
    if (immigration.stemEligible === true) return 'yes'
    if (immigration.stemEligible === false) return 'no'
    if (immigration.stemEligible === null) return 'not_sure'
    return ''
  }

  return (
    <div className="space-y-7">
      <StepField index={0} label="Visa Type">
        <div className="grid grid-cols-2 gap-2.5">
          {VISA_OPTIONS.map((opt) => (
            <SelectionCard
              key={opt.value}
              label={opt.label}
              selected={immigration.visaType === opt.value}
              onClick={() => handleVisaChange(opt.value)}
              accentColor={accentColor}
            />
          ))}
        </div>
      </StepField>

      <AnimatePresence>
        {isF1 && (
          <motion.div
            variants={expandVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="overflow-hidden"
          >
            <div className="space-y-7 pt-1">
              <StepField index={1} label="OPT/CPT Status">
                <Select
                  value={immigration.optCptStatus ?? ''}
                  onValueChange={handleOptChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select OPT/CPT status" />
                  </SelectTrigger>
                  <SelectContent>
                    {OPT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </StepField>

              <StepField index={2} label="STEM Extension Eligible?">
                <div className="flex flex-wrap gap-2.5">
                  {STEM_OPTIONS.map((opt) => (
                    <SelectionChip
                      key={opt.value}
                      label={opt.label}
                      selected={getStemValue() === opt.value}
                      onClick={() => handleStemChange(opt.value)}
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
