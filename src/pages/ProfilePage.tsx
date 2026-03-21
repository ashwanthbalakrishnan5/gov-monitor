import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  MapPin,
  Globe,
  Briefcase,
  Home,
  GraduationCap,
  Settings,
  Pencil,
  X,
  Check,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import { ProfileCompleteness } from '@/components/dashboard/ProfileCompleteness'
import { SelectionChip } from '@/components/onboarding/SelectionChip'
import { SelectionCard } from '@/components/onboarding/SelectionCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { cn } from '@/lib/utils'
import { getProfile, saveProfile, deleteProfile } from '@/lib/profile'
import { calculateCompleteness } from '@/lib/completeness'
import type {
  UserProfile,
  ResidencyStatus,
  CurrentSituation,
  VisaType,
  OptCptStatus,
  EmploymentType,
  BusinessSize,
  HousingSituation,
  LandlordType,
  DegreeLevel,
  InstitutionType,
  FilingStatus,
  Dependents,
} from '@/types/profile'

// ---------------------------------------------------------------------------
// Label maps - convert raw enum values to human-readable labels
// ---------------------------------------------------------------------------

const RESIDENCY_LABELS: Record<ResidencyStatus, string> = {
  us_citizen: 'US Citizen',
  permanent_resident: 'Permanent Resident',
  visa_holder: 'Visa Holder',
  undocumented: 'Undocumented',
  prefer_not_to_say: 'Prefer not to say',
}

const SITUATION_LABELS: Record<CurrentSituation, string> = {
  student: 'Student',
  employed: 'Employed',
  self_employed: 'Self-employed',
  business_owner: 'Business owner',
  unemployed: 'Unemployed',
  retired: 'Retired',
}

const VISA_LABELS: Record<VisaType, string> = {
  f1: 'F-1 (Student)',
  h1b: 'H-1B (Specialty Occupation)',
  j1: 'J-1 (Exchange Visitor)',
  l1: 'L-1 (Intracompany Transfer)',
  o1: 'O-1 (Extraordinary Ability)',
  b1_b2: 'B-1/B-2 (Business/Tourist)',
  other: 'Other',
}

const OPT_LABELS: Record<OptCptStatus, string> = {
  none: 'None',
  cpt: 'CPT',
  pre_opt: 'Pre-completion OPT',
  post_opt: 'Post-completion OPT',
  stem_opt: 'STEM OPT Extension',
}

const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  gig: 'Gig worker',
  contract: 'Contract',
}

const BUSINESS_SIZE_LABELS: Record<BusinessSize, string> = {
  solo: 'Solo',
  '2_10': '2-10 employees',
  '11_50': '11-50 employees',
  '50_plus': '50+ employees',
}

const HOUSING_LABELS: Record<HousingSituation, string> = {
  renter: 'Renter',
  homeowner_mortgage: 'Homeowner (mortgage)',
  homeowner_paid: 'Homeowner (paid off)',
  campus: 'Campus housing',
  family: 'Living with family',
}

const LANDLORD_LABELS: Record<LandlordType, string> = {
  individual: 'Individual landlord',
  company: 'Property management company',
}

const DEGREE_LABELS: Record<DegreeLevel, string> = {
  associate: "Associate's",
  bachelors: "Bachelor's",
  masters: "Master's",
  doctorate: 'Doctorate',
  certificate: 'Certificate',
}

const INSTITUTION_LABELS: Record<InstitutionType, string> = {
  public: 'Public',
  private: 'Private',
}

const FILING_LABELS: Record<FilingStatus, string> = {
  single: 'Single',
  married_joint: 'Married filing jointly',
  married_separate: 'Married filing separately',
  head_of_household: 'Head of household',
}

const DEPENDENTS_LABELS: Record<Dependents, string> = {
  '0': '0',
  '1_2': '1-2',
  '3_plus': '3+',
}

const HEALTHCARE_LABELS: Record<string, string> = {
  employer: 'Employer',
  marketplace: 'Marketplace (ACA)',
  medicaid: 'Medicaid',
  medicare: 'Medicare',
  university: 'University plan',
  uninsured: 'Uninsured',
  other: 'Other',
}

// ---------------------------------------------------------------------------
// Option lists for edit forms (same as onboarding steps)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      type: 'spring' as const,
      stiffness: 300,
      damping: 25,
    },
  }),
}

const expandVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { type: 'spring' as const, stiffness: 300, damping: 25 },
      opacity: { duration: 0.2, delay: 0.05 },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: {
      height: { type: 'spring' as const, stiffness: 300, damping: 25 },
      opacity: { duration: 0.12 },
    },
  },
}

// ---------------------------------------------------------------------------
// Value badge component
// ---------------------------------------------------------------------------

function ValueBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.06] px-3 py-1 text-sm font-mono text-[var(--foreground)]">
      {children}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Section type definition
// ---------------------------------------------------------------------------

type SectionId = 'core' | 'immigration' | 'employment' | 'housing' | 'education' | 'additional'

interface SectionConfig {
  id: SectionId
  title: string
  icon: React.ReactNode
  isVisible: (profile: UserProfile) => boolean
  hasData: (profile: UserProfile) => boolean
}

const SECTIONS: SectionConfig[] = [
  {
    id: 'core',
    title: 'Core Info',
    icon: <MapPin className="h-[18px] w-[18px]" />,
    isVisible: () => true,
    hasData: (p) =>
      Boolean(p.location?.state || p.location?.zipCode || p.residencyStatus || (p.currentSituation && p.currentSituation.length > 0)),
  },
  {
    id: 'immigration',
    title: 'Immigration',
    icon: <Globe className="h-[18px] w-[18px]" />,
    isVisible: (p) => p.residencyStatus === 'visa_holder',
    hasData: (p) => Boolean(p.immigration?.visaType),
  },
  {
    id: 'employment',
    title: 'Employment',
    icon: <Briefcase className="h-[18px] w-[18px]" />,
    isVisible: (p) =>
      Boolean(p.currentSituation?.some((s) => ['employed', 'self_employed', 'business_owner'].includes(s))),
    hasData: (p) => Boolean(p.employment?.industry || p.employment?.type || p.employment?.businessSize),
  },
  {
    id: 'housing',
    title: 'Housing',
    icon: <Home className="h-[18px] w-[18px]" />,
    isVisible: () => true,
    hasData: (p) => Boolean(p.housing?.situation),
  },
  {
    id: 'education',
    title: 'Education',
    icon: <GraduationCap className="h-[18px] w-[18px]" />,
    isVisible: (p) => Boolean(p.currentSituation?.includes('student')),
    hasData: (p) => Boolean(p.education?.degreeLevel),
  },
  {
    id: 'additional',
    title: 'Additional',
    icon: <Settings className="h-[18px] w-[18px]" />,
    isVisible: () => true,
    hasData: (p) =>
      Boolean(
        (p.transportation && p.transportation.length > 0) ||
          p.healthcare ||
          p.filingStatus ||
          p.dependents
      ),
  },
]

// ---------------------------------------------------------------------------
// Completeness message
// ---------------------------------------------------------------------------

function getCompletenessMessage(pct: number): string {
  if (pct >= 90) return 'Your profile is nearly complete. Great job!'
  if (pct >= 70) return 'Good progress. A few more details will sharpen your alerts.'
  if (pct >= 40) return 'Halfway there. More details means more accurate alerts.'
  return 'Your profile is just getting started. Add more for better results.'
}

// ---------------------------------------------------------------------------
// Simple state derivation (same as onboarding)
// ---------------------------------------------------------------------------

function deriveState(input: string): string {
  const trimmed = input.trim()
  const commaMatch = trimmed.match(/,\s*([A-Z]{2})\s*$/i)
  if (commaMatch) return commaMatch[1].toUpperCase()
  const zipMatch = trimmed.match(/^(\d{5})/)
  if (zipMatch) {
    const zip = parseInt(zipMatch[1])
    if (zip >= 85000 && zip <= 86599) return 'AZ'
    if (zip >= 90000 && zip <= 96199) return 'CA'
    if (zip >= 10000 && zip <= 14999) return 'NY'
    if (zip >= 77000 && zip <= 79999) return 'TX'
    return 'AZ'
  }
  return ''
}

// ---------------------------------------------------------------------------
// Profile Page
// ---------------------------------------------------------------------------

export function ProfilePage() {
  const navigate = useNavigate()
  const prefersReducedMotion = useReducedMotion()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editingSection, setEditingSection] = useState<SectionId | null>(null)
  const [editDraft, setEditDraft] = useState<Partial<UserProfile>>({})
  const [completeness, setCompleteness] = useState(0)
  const [showSaveFlash, setShowSaveFlash] = useState<SectionId | null>(null)
  const [deleteStep, setDeleteStep] = useState(0) // 0 = hidden, 1 = confirm, 2 = deleting
  const saveFlashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load profile
  useEffect(() => {
    const p = getProfile()
    if (!p) {
      navigate('/onboarding', { replace: true })
      return
    }
    setProfile(p)
    setCompleteness(calculateCompleteness(p))
  }, [navigate])

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (saveFlashTimer.current) clearTimeout(saveFlashTimer.current)
    }
  }, [])

  // Start editing a section
  const startEditing = useCallback(
    (sectionId: SectionId) => {
      if (!profile) return
      setEditingSection(sectionId)
      setEditDraft({ ...profile })
    },
    [profile]
  )

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setEditingSection(null)
    setEditDraft({})
  }, [])

  // Save edits
  const saveEdits = useCallback(() => {
    if (!profile || !editingSection) return

    const updated: UserProfile = {
      ...profile,
      ...editDraft,
      profileCompleteness: 0, // will be recalculated
      updatedAt: new Date().toISOString(),
    }
    updated.profileCompleteness = calculateCompleteness(updated)

    saveProfile(updated)
    setProfile(updated)
    setCompleteness(updated.profileCompleteness)

    // Flash save confirmation
    setShowSaveFlash(editingSection)
    if (saveFlashTimer.current) clearTimeout(saveFlashTimer.current)
    saveFlashTimer.current = setTimeout(() => setShowSaveFlash(null), 1500)

    setEditingSection(null)
    setEditDraft({})
  }, [profile, editingSection, editDraft])

  // Delete data handler
  const handleDelete = useCallback(() => {
    if (deleteStep === 0) {
      setDeleteStep(1)
      return
    }
    if (deleteStep === 1) {
      setDeleteStep(2)
      // Clear all legisly data
      deleteProfile()
      localStorage.removeItem('legisly-dismissed-ids')
      localStorage.removeItem('legisly-saved-ids')
      sessionStorage.clear()
      // Short delay for visual feedback
      setTimeout(() => navigate('/', { replace: true }), 300)
    }
  }, [deleteStep, navigate])

  if (!profile) return null

  const visibleSections = SECTIONS.filter((s) => s.isVisible(profile))

  return (
    <div className="px-4 pt-6 pb-8 sm:px-8 lg:px-12 max-w-2xl">
        {/* Profile completeness ring + heading */}
        <motion.div
          className="mt-8 flex flex-col items-center text-center"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 25 }}
        >
          <ProfileCompleteness percentage={completeness} size={88} />
          <h1
            className="mt-5 font-display text-[clamp(28px,5vw,40px)] text-[var(--foreground)]"
            style={{ letterSpacing: '-0.02em', lineHeight: 1.1 }}
          >
            Your Profile
          </h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)] max-w-xs">
            {completeness}% complete. {getCompletenessMessage(completeness)}
          </p>
        </motion.div>

        {/* Profile sections */}
        <div className="mt-10 space-y-4">
          {visibleSections.map((section, i) => (
            <ProfileSection
              key={section.id}
              section={section}
              profile={profile}
              index={i}
              isEditing={editingSection === section.id}
              editDraft={editDraft}
              onEditDraftChange={setEditDraft}
              onStartEditing={() => startEditing(section.id)}
              onCancel={cancelEditing}
              onSave={saveEdits}
              showSaveFlash={showSaveFlash === section.id}
              prefersReducedMotion={!!prefersReducedMotion}
            />
          ))}
        </div>

        {/* Delete data section */}
        <motion.div
          className="mt-12 pt-8 border-t border-[var(--border)]"
          custom={visibleSections.length + 1}
          variants={cardVariants}
          initial={prefersReducedMotion ? false : 'hidden'}
          animate="visible"
        >
          <div className="flex flex-col items-center text-center gap-3">
            <p className="text-sm text-[var(--muted-foreground)]">
              All your data is stored locally on this device.
            </p>
            <AnimatePresence mode="wait">
              {deleteStep === 0 && (
                <motion.div
                  key="delete-initial"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Button
                    variant="outline"
                    size="default"
                    className="text-[var(--destructive)] border-[var(--destructive)]/30 hover:bg-[var(--destructive)]/5 hover:border-[var(--destructive)]/50 min-h-[44px]"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Delete My Data
                  </Button>
                </motion.div>
              )}
              {deleteStep === 1 && (
                <motion.div
                  key="delete-confirm"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="flex items-center gap-2 text-sm text-[var(--destructive)]">
                    <AlertTriangle className="h-4 w-4" />
                    This will erase all your profile data and alerts.
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-[44px]"
                      onClick={() => setDeleteStep(0)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="min-h-[44px]"
                      onClick={handleDelete}
                    >
                      Yes, Delete Everything
                    </Button>
                  </div>
                </motion.div>
              )}
              {deleteStep === 2 && (
                <motion.div
                  key="delete-done"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-[var(--muted-foreground)]"
                >
                  Clearing data...
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Profile Section Component
// ---------------------------------------------------------------------------

interface ProfileSectionProps {
  section: SectionConfig
  profile: UserProfile
  index: number
  isEditing: boolean
  editDraft: Partial<UserProfile>
  onEditDraftChange: (draft: Partial<UserProfile>) => void
  onStartEditing: () => void
  onCancel: () => void
  onSave: () => void
  showSaveFlash: boolean
  prefersReducedMotion: boolean
}

function ProfileSection({
  section,
  profile,
  index,
  isEditing,
  editDraft,
  onEditDraftChange,
  onStartEditing,
  onCancel,
  onSave,
  showSaveFlash,
  prefersReducedMotion,
}: ProfileSectionProps) {
  const hasSectionData = section.hasData(profile)

  return (
    <motion.div
      custom={index + 1}
      variants={cardVariants}
      initial={prefersReducedMotion ? false : 'hidden'}
      animate="visible"
      className={cn(
        'relative rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm overflow-hidden transition-shadow duration-200',
        isEditing && 'ring-1 ring-[var(--accent)]/30'
      )}
    >
      {/* Save flash overlay */}
      <AnimatePresence>
        {showSaveFlash && (
          <motion.div
            className="absolute inset-0 z-20 flex items-center justify-center bg-emerald-500/10 backdrop-blur-sm rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            >
              <div className="flex items-center gap-2 text-emerald-400 font-medium text-sm">
                <Check className="h-5 w-5 text-emerald-400" />
                Saved
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-[var(--muted-foreground)]">{section.icon}</span>
          <h2 className="text-[15px] font-semibold text-[var(--foreground)]">
            {section.title}
          </h2>
        </div>
        {!isEditing && (
          <button
            onClick={onStartEditing}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors min-h-[44px] cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        )}
        {isEditing && (
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors min-h-[44px] cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
            <Button
              size="sm"
              variant="accent"
              className="min-h-[44px] text-xs"
              onClick={onSave}
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              Save
            </Button>
          </div>
        )}
      </div>

      {/* Content: read mode or edit mode */}
      <div className="px-5 pb-5">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="edit"
              variants={expandVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="overflow-hidden"
            >
              <SectionEditForm
                sectionId={section.id}
                draft={editDraft}
                onChange={onEditDraftChange}
              />
            </motion.div>
          ) : (
            <motion.div
              key="read"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {hasSectionData ? (
                <SectionReadValues sectionId={section.id} profile={profile} />
              ) : (
                <p className="text-sm text-[var(--muted-foreground)]/70 italic">
                  Not provided.{' '}
                  <button
                    onClick={onStartEditing}
                    className="text-[var(--accent)] hover:underline not-italic cursor-pointer"
                  >
                    Add details
                  </button>
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Section Read Values (display mode)
// ---------------------------------------------------------------------------

function SectionReadValues({ sectionId, profile }: { sectionId: SectionId; profile: UserProfile }) {
  switch (sectionId) {
    case 'core':
      return (
        <div className="flex flex-wrap gap-2">
          {profile.location?.zipCode && (
            <ValueBadge>{profile.location.zipCode}</ValueBadge>
          )}
          {profile.location?.state && !profile.location?.zipCode && (
            <ValueBadge>{profile.location.state}</ValueBadge>
          )}
          {profile.residencyStatus && (
            <ValueBadge>{RESIDENCY_LABELS[profile.residencyStatus]}</ValueBadge>
          )}
          {profile.currentSituation?.map((s) => (
            <ValueBadge key={s}>{SITUATION_LABELS[s]}</ValueBadge>
          ))}
        </div>
      )

    case 'immigration':
      return (
        <div className="flex flex-wrap gap-2">
          {profile.immigration?.visaType && (
            <ValueBadge>{VISA_LABELS[profile.immigration.visaType]}</ValueBadge>
          )}
          {profile.immigration?.optCptStatus && profile.immigration.optCptStatus !== 'none' && (
            <ValueBadge>{OPT_LABELS[profile.immigration.optCptStatus]}</ValueBadge>
          )}
          {profile.immigration?.stemEligible === true && (
            <ValueBadge>STEM Eligible</ValueBadge>
          )}
          {profile.immigration?.stemEligible === false && (
            <ValueBadge>Not STEM Eligible</ValueBadge>
          )}
          {profile.immigration?.stemEligible === null && (
            <ValueBadge>STEM Eligibility Unknown</ValueBadge>
          )}
        </div>
      )

    case 'employment':
      return (
        <div className="flex flex-wrap gap-2">
          {profile.employment?.industry && (
            <ValueBadge>{profile.employment.industry.charAt(0).toUpperCase() + profile.employment.industry.slice(1).replace(/_/g, ' ')}</ValueBadge>
          )}
          {profile.employment?.type && (
            <ValueBadge>{EMPLOYMENT_TYPE_LABELS[profile.employment.type]}</ValueBadge>
          )}
          {profile.employment?.gigPlatform && (
            <ValueBadge>{profile.employment.gigPlatform}</ValueBadge>
          )}
          {profile.employment?.businessSize && (
            <ValueBadge>{BUSINESS_SIZE_LABELS[profile.employment.businessSize]}</ValueBadge>
          )}
        </div>
      )

    case 'housing':
      return (
        <div className="flex flex-wrap gap-2">
          {profile.housing?.situation && (
            <ValueBadge>{HOUSING_LABELS[profile.housing.situation]}</ValueBadge>
          )}
          {profile.housing?.landlordType && (
            <ValueBadge>{LANDLORD_LABELS[profile.housing.landlordType]}</ValueBadge>
          )}
        </div>
      )

    case 'education':
      return (
        <div className="flex flex-wrap gap-2">
          {profile.education?.degreeLevel && (
            <ValueBadge>{DEGREE_LABELS[profile.education.degreeLevel]}</ValueBadge>
          )}
          {profile.education?.institutionType && (
            <ValueBadge>{INSTITUTION_LABELS[profile.education.institutionType]}</ValueBadge>
          )}
          {profile.education?.financialAid === true && (
            <ValueBadge>Financial Aid</ValueBadge>
          )}
          {profile.education?.studentLoans === true && (
            <ValueBadge>Student Loans</ValueBadge>
          )}
        </div>
      )

    case 'additional':
      return (
        <div className="flex flex-wrap gap-2">
          {profile.transportation?.map((t) => (
            <ValueBadge key={t}>{t}</ValueBadge>
          ))}
          {profile.healthcare && (
            <ValueBadge>{HEALTHCARE_LABELS[profile.healthcare] ?? profile.healthcare}</ValueBadge>
          )}
          {profile.filingStatus && (
            <ValueBadge>{FILING_LABELS[profile.filingStatus]}</ValueBadge>
          )}
          {profile.dependents && (
            <ValueBadge>{DEPENDENTS_LABELS[profile.dependents]} dependents</ValueBadge>
          )}
        </div>
      )

    default:
      return null
  }
}

// ---------------------------------------------------------------------------
// Section Edit Forms
// ---------------------------------------------------------------------------

interface SectionEditFormProps {
  sectionId: SectionId
  draft: Partial<UserProfile>
  onChange: (draft: Partial<UserProfile>) => void
}

function SectionEditForm({ sectionId, draft, onChange }: SectionEditFormProps) {
  switch (sectionId) {
    case 'core':
      return <EditCoreInfo draft={draft} onChange={onChange} />
    case 'immigration':
      return <EditImmigration draft={draft} onChange={onChange} />
    case 'employment':
      return <EditEmployment draft={draft} onChange={onChange} />
    case 'housing':
      return <EditHousing draft={draft} onChange={onChange} />
    case 'education':
      return <EditEducation draft={draft} onChange={onChange} />
    case 'additional':
      return <EditAdditional draft={draft} onChange={onChange} />
    default:
      return null
  }
}

// ---------------------------------------------------------------------------
// Edit forms - reuse same components/patterns from onboarding
// ---------------------------------------------------------------------------

function EditCoreInfo({
  draft,
  onChange,
}: {
  draft: Partial<UserProfile>
  onChange: (d: Partial<UserProfile>) => void
}) {
  const location = draft.location ?? { state: '' }
  const residencyStatus = draft.residencyStatus
  const currentSituation = draft.currentSituation ?? []

  return (
    <div className="space-y-5 pt-1">
      <div>
        <label className="mb-2 block text-[12px] font-medium uppercase tracking-widest text-[var(--muted-foreground)] font-mono">
          Location
        </label>
        <Input
          placeholder="e.g. 85281 or Tempe, AZ"
          value={location.zipCode ?? ''}
          onChange={(e) =>
            onChange({
              ...draft,
              location: {
                ...location,
                zipCode: e.target.value,
                state: deriveState(e.target.value),
              },
            })
          }
        />
      </div>

      <div>
        <label className="mb-2 block text-[12px] font-medium uppercase tracking-widest text-[var(--muted-foreground)] font-mono">
          Residency Status
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {RESIDENCY_OPTIONS.map((opt) => (
            <SelectionCard
              key={opt.value}
              label={opt.label}
              selected={residencyStatus === opt.value}
              onClick={() => onChange({ ...draft, residencyStatus: opt.value })}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-[12px] font-medium uppercase tracking-widest text-[var(--muted-foreground)] font-mono">
          Current Situation
        </label>
        <div className="flex flex-wrap gap-2">
          {SITUATION_OPTIONS.map((opt) => (
            <SelectionChip
              key={opt.value}
              label={opt.label}
              selected={currentSituation.includes(opt.value)}
              onClick={() => {
                const updated = currentSituation.includes(opt.value)
                  ? currentSituation.filter((s) => s !== opt.value)
                  : [...currentSituation, opt.value]
                onChange({ ...draft, currentSituation: updated })
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function EditImmigration({
  draft,
  onChange,
}: {
  draft: Partial<UserProfile>
  onChange: (d: Partial<UserProfile>) => void
}) {
  const immigration = draft.immigration ?? { visaType: undefined as unknown as VisaType }
  const isF1 = immigration.visaType === 'f1'

  function getStemValue(): string {
    if (immigration.stemEligible === true) return 'yes'
    if (immigration.stemEligible === false) return 'no'
    if (immigration.stemEligible === null) return 'not_sure'
    return ''
  }

  return (
    <div className="space-y-5 pt-1">
      <div>
        <label className="mb-2 block text-[12px] font-medium uppercase tracking-widest text-[var(--muted-foreground)] font-mono">
          Visa Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {VISA_OPTIONS.map((opt) => (
            <SelectionCard
              key={opt.value}
              label={opt.label}
              selected={immigration.visaType === opt.value}
              onClick={() =>
                onChange({
                  ...draft,
                  immigration: {
                    visaType: opt.value,
                    optCptStatus: opt.value === 'f1' ? immigration.optCptStatus : undefined,
                    stemEligible: opt.value === 'f1' ? immigration.stemEligible : undefined,
                  },
                })
              }
              accentColor="#7C3AED"
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isF1 && (
          <motion.div
            variants={expandVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="overflow-hidden"
          >
            <div className="space-y-5 pt-1">
              <div>
                <label className="mb-2 block text-[12px] font-medium uppercase tracking-widest text-[var(--muted-foreground)] font-mono">
                  OPT/CPT Status
                </label>
                <Select
                  value={immigration.optCptStatus ?? ''}
                  onValueChange={(val) =>
                    onChange({
                      ...draft,
                      immigration: { ...immigration, optCptStatus: val as OptCptStatus },
                    })
                  }
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
              </div>

              <div>
                <label className="mb-2 block text-[12px] font-medium uppercase tracking-widest text-[var(--muted-foreground)] font-mono">
                  STEM Extension Eligible?
                </label>
                <div className="flex flex-wrap gap-2">
                  {STEM_OPTIONS.map((opt) => (
                    <SelectionChip
                      key={opt.value}
                      label={opt.label}
                      selected={getStemValue() === opt.value}
                      onClick={() => {
                        let stemVal: boolean | null = null
                        if (opt.value === 'yes') stemVal = true
                        else if (opt.value === 'no') stemVal = false
                        onChange({
                          ...draft,
                          immigration: { ...immigration, stemEligible: stemVal },
                        })
                      }}
                      accentColor="#7C3AED"
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function EditEmployment({
  draft,
  onChange,
}: {
  draft: Partial<UserProfile>
  onChange: (d: Partial<UserProfile>) => void
}) {
  const employment = draft.employment ?? {}
  const isGig = employment.type === 'gig'
  const isBusinessOwner = draft.currentSituation?.includes('business_owner') ?? false

  function update(patch: Partial<UserProfile['employment']>) {
    onChange({ ...draft, employment: { ...employment, ...patch } })
  }

  return (
    <div className="space-y-5 pt-1">
      <div>
        <label className="mb-2 block text-[12px] font-medium uppercase tracking-widest text-[var(--muted-foreground)] font-mono">
          Industry Sector
        </label>
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
      </div>

      <div>
        <label className="mb-2 block text-[12px] font-medium uppercase tracking-widest text-[var(--muted-foreground)] font-mono">
          Employment Type
        </label>
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
      </div>

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
              <label className="mb-2 block text-[12px] font-medium uppercase tracking-widest text-[var(--muted-foreground)] font-mono">
                Platform Type
              </label>
              <Input
                placeholder="e.g. Rideshare, Delivery, Freelance"
                value={employment.gigPlatform ?? ''}
                onChange={(e) => update({ gigPlatform: e.target.value })}
              />
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
              <label className="mb-2 block text-[12px] font-medium uppercase tracking-widest text-[var(--muted-foreground)] font-mono">
                Business Size
              </label>
              <div className="flex flex-wrap gap-2">
                {BUSINESS_SIZE_OPTIONS.map((opt) => (
                  <SelectionChip
                    key={opt.value}
                    label={opt.label}
                    selected={employment.businessSize === opt.value}
                    onClick={() => update({ businessSize: opt.value })}
                    accentColor="#2563EB"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function EditHousing({
  draft,
  onChange,
}: {
  draft: Partial<UserProfile>
  onChange: (d: Partial<UserProfile>) => void
}) {
  const housing = draft.housing
  const isRenter = housing?.situation === 'renter'

  return (
    <div className="space-y-5 pt-1">
      <div>
        <label className="mb-2 block text-[12px] font-medium uppercase tracking-widest text-[var(--muted-foreground)] font-mono">
          Housing Situation
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {HOUSING_OPTIONS.map((opt) => (
            <SelectionCard
              key={opt.value}
              label={opt.label}
              selected={housing?.situation === opt.value}
              onClick={() =>
                onChange({
                  ...draft,
                  housing: {
                    situation: opt.value,
                    landlordType: opt.value === 'renter' ? housing?.landlordType : undefined,
                  },
                })
              }
              accentColor="#059669"
            />
          ))}
        </div>
      </div>

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
              <label className="mb-2 block text-[12px] font-medium uppercase tracking-widest text-[var(--muted-foreground)] font-mono">
                Landlord Type
              </label>
              <div className="flex flex-wrap gap-2">
                {LANDLORD_OPTIONS.map((opt) => (
                  <SelectionChip
                    key={opt.value}
                    label={opt.label}
                    selected={housing?.landlordType === opt.value}
                    onClick={() =>
                      onChange({
                        ...draft,
                        housing: {
                          situation: housing?.situation ?? 'renter',
                          landlordType: opt.value,
                        },
                      })
                    }
                    accentColor="#059669"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function EditEducation({
  draft,
  onChange,
}: {
  draft: Partial<UserProfile>
  onChange: (d: Partial<UserProfile>) => void
}) {
  const education = draft.education

  function update(patch: Partial<NonNullable<UserProfile['education']>>) {
    onChange({
      ...draft,
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
    <div className="space-y-5 pt-1">
      <div>
        <label className="mb-2 block text-[12px] font-medium uppercase tracking-widest text-[var(--muted-foreground)] font-mono">
          Degree Level
        </label>
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
      </div>

      <div>
        <label className="mb-2 block text-[12px] font-medium uppercase tracking-widest text-[var(--muted-foreground)] font-mono">
          Institution Type
        </label>
        <div className="flex flex-wrap gap-2">
          {INSTITUTION_OPTIONS.map((opt) => (
            <SelectionChip
              key={opt.value}
              label={opt.label}
              selected={education?.institutionType === opt.value}
              onClick={() => update({ institutionType: opt.value })}
              accentColor="#DB2777"
            />
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-[12px] font-medium uppercase tracking-widest text-[var(--muted-foreground)] font-mono">
          Receiving Financial Aid?
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
          ].map((opt) => (
            <SelectionChip
              key={String(opt.value)}
              label={opt.label}
              selected={education?.financialAid === opt.value}
              onClick={() => update({ financialAid: opt.value })}
              accentColor="#DB2777"
            />
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-[12px] font-medium uppercase tracking-widest text-[var(--muted-foreground)] font-mono">
          Student Loans?
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
          ].map((opt) => (
            <SelectionChip
              key={String(opt.value)}
              label={opt.label}
              selected={education?.studentLoans === opt.value}
              onClick={() => update({ studentLoans: opt.value })}
              accentColor="#DB2777"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function EditAdditional({
  draft,
  onChange,
}: {
  draft: Partial<UserProfile>
  onChange: (d: Partial<UserProfile>) => void
}) {
  const transportation = draft.transportation ?? []

  return (
    <div className="space-y-5 pt-1">
      <div>
        <label className="mb-2 block text-[12px] font-medium uppercase tracking-widest text-[var(--muted-foreground)] font-mono">
          Transportation
        </label>
        <div className="flex flex-wrap gap-2">
          {TRANSPORTATION_OPTIONS.map((opt) => (
            <SelectionChip
              key={opt}
              label={opt}
              selected={transportation.includes(opt)}
              onClick={() => {
                const updated = transportation.includes(opt)
                  ? transportation.filter((t) => t !== opt)
                  : [...transportation, opt]
                onChange({ ...draft, transportation: updated })
              }}
              accentColor="#D97706"
            />
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-[12px] font-medium uppercase tracking-widest text-[var(--muted-foreground)] font-mono">
          Healthcare Coverage
        </label>
        <Select
          value={draft.healthcare ?? ''}
          onValueChange={(val) => onChange({ ...draft, healthcare: val })}
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
      </div>

      <div>
        <label className="mb-2 block text-[12px] font-medium uppercase tracking-widest text-[var(--muted-foreground)] font-mono">
          Filing Status
        </label>
        <Select
          value={draft.filingStatus ?? ''}
          onValueChange={(val) => onChange({ ...draft, filingStatus: val as FilingStatus })}
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
      </div>

      <div>
        <label className="mb-2 block text-[12px] font-medium uppercase tracking-widest text-[var(--muted-foreground)] font-mono">
          Dependents
        </label>
        <div className="flex flex-wrap gap-2">
          {DEPENDENT_OPTIONS.map((opt) => (
            <SelectionChip
              key={opt.value}
              label={opt.label}
              selected={draft.dependents === opt.value}
              onClick={() => onChange({ ...draft, dependents: opt.value })}
              accentColor="#D97706"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
