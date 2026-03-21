import { AnimatePresence, motion } from 'framer-motion'
import { StepField } from './StepField'
import { SelectionCard } from './SelectionCard'
import { SelectionChip } from './SelectionChip'
import type { UserProfile, HousingSituation, LandlordType } from '@/types/profile'

const HOUSING_OPTIONS: { value: HousingSituation; label: string }[] = [
  { value: 'renter', label: 'Renter' },
  { value: 'homeowner_mortgage', label: 'Homeowner (mortgage)' },
  { value: 'homeowner_paid', label: 'Homeowner (paid off)' },
  { value: 'campus', label: 'Campus housing' },
  { value: 'family', label: 'Living with family' },
]

const LANDLORD_OPTIONS: { value: LandlordType; label: string }[] = [
  { value: 'individual', label: 'Individual landlord' },
  { value: 'company', label: 'Property management company' },
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

interface StepHousingProps {
  data: Partial<UserProfile>
  onChange: (data: Partial<UserProfile>) => void
  accentColor?: string
}

export function StepHousing({ data, onChange, accentColor = '#059669' }: StepHousingProps) {
  const housing = data.housing
  const isRenter = housing?.situation === 'renter'

  function handleSituationChange(value: HousingSituation) {
    onChange({
      ...data,
      housing: {
        situation: value,
        landlordType: value === 'renter' ? housing?.landlordType : undefined,
      },
    })
  }

  function handleLandlordChange(value: LandlordType) {
    onChange({
      ...data,
      housing: {
        situation: housing?.situation ?? 'renter',
        landlordType: value,
      },
    })
  }

  return (
    <div className="space-y-7">
      <StepField index={0} label="Housing Situation">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {HOUSING_OPTIONS.map((opt) => (
            <SelectionCard
              key={opt.value}
              label={opt.label}
              selected={housing?.situation === opt.value}
              onClick={() => handleSituationChange(opt.value)}
              accentColor={accentColor}
            />
          ))}
        </div>
      </StepField>

      <AnimatePresence>
        {isRenter && (
          <motion.div
            variants={expandVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="overflow-hidden"
          >
            <div className="pt-1">
              <StepField index={1} label="Landlord Type">
                <div className="flex flex-wrap gap-2.5">
                  {LANDLORD_OPTIONS.map((opt) => (
                    <SelectionChip
                      key={opt.value}
                      label={opt.label}
                      selected={housing?.landlordType === opt.value}
                      onClick={() => handleLandlordChange(opt.value)}
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
