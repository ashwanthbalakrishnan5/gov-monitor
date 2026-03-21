import { useState, useMemo, useCallback, Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  User,
  Globe,
  Briefcase,
  Home,
  GraduationCap,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { saveProfile } from '@/lib/profile'
import { calculateCompleteness } from '@/lib/completeness'
import { useMouseSpotlight } from '@/hooks/use-mouse-spotlight'
import type { UserProfile } from '@/types/profile'

import { StepCoreInfo } from './StepCoreInfo'
import { StepImmigration } from './StepImmigration'
import { StepEmployment } from './StepEmployment'
import { StepHousing } from './StepHousing'
import { StepEducation } from './StepEducation'
import { StepAdditional } from './StepAdditional'

// -------------------------------------------------------------------
// Step configuration
// -------------------------------------------------------------------
interface StepConfig {
  id: string
  title: string
  subtitle: string
  required: boolean
  contextHeading: string
  accentColor: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  component: React.ComponentType<{
    data: Partial<UserProfile>
    onChange: (data: Partial<UserProfile>) => void
    accentColor?: string
  }>
}

const ALL_STEPS: StepConfig[] = [
  {
    id: 'core',
    title: 'About you',
    subtitle: 'The basics help us find what matters to you',
    required: true,
    contextHeading: 'Your identity shapes your legal landscape',
    accentColor: '#C4703E',
    icon: User,
    component: StepCoreInfo,
  },
  {
    id: 'immigration',
    title: 'Immigration details',
    subtitle: 'Help us track visa and immigration policy changes',
    required: false,
    contextHeading: 'Navigating policy across borders',
    accentColor: '#7C3AED',
    icon: Globe,
    component: StepImmigration,
  },
  {
    id: 'employment',
    title: 'Employment',
    subtitle: 'We track labor laws and workplace policy changes',
    required: false,
    contextHeading: 'Your livelihood, protected',
    accentColor: '#2563EB',
    icon: Briefcase,
    component: StepEmployment,
  },
  {
    id: 'housing',
    title: 'Housing',
    subtitle: 'Rental laws, property tax, and housing policy updates',
    required: false,
    contextHeading: 'Where you live shapes what laws apply',
    accentColor: '#059669',
    icon: Home,
    component: StepHousing,
  },
  {
    id: 'education',
    title: 'Education',
    subtitle: 'Financial aid, tuition, and education policy changes',
    required: false,
    contextHeading: 'Investing in knowledge, tracking change',
    accentColor: '#DB2777',
    icon: GraduationCap,
    component: StepEducation,
  },
  {
    id: 'additional',
    title: 'A few more things',
    subtitle: 'Optional details for even more relevant alerts',
    required: false,
    contextHeading: 'The details that complete the picture',
    accentColor: '#D97706',
    icon: Settings,
    component: StepAdditional,
  },
]

function getActiveSteps(data: Partial<UserProfile>): StepConfig[] {
  const steps: StepConfig[] = [ALL_STEPS[0]] // Core is always first

  if (data.residencyStatus === 'visa_holder') {
    steps.push(ALL_STEPS[1]) // Immigration
  }

  const employmentSituations = ['employed', 'self_employed', 'business_owner']
  if (data.currentSituation?.some((s) => employmentSituations.includes(s))) {
    steps.push(ALL_STEPS[2]) // Employment
  }

  steps.push(ALL_STEPS[3]) // Housing always

  if (data.currentSituation?.includes('student')) {
    steps.push(ALL_STEPS[4]) // Education
  }

  steps.push(ALL_STEPS[5]) // Additional always

  return steps
}

function isCoreInfoValid(data: Partial<UserProfile>): boolean {
  return Boolean(
    data.location?.state &&
      data.location.state.length > 0 &&
      data.residencyStatus &&
      data.currentSituation &&
      data.currentSituation.length > 0
  )
}

// -------------------------------------------------------------------
// Constants
// -------------------------------------------------------------------
const RING_RADIUS = 54
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

// -------------------------------------------------------------------
// Animation variants (direction-aware)
// -------------------------------------------------------------------
const stepContentVariants = {
  enter: (dir: number) => ({
    opacity: 0,
    y: dir > 0 ? 24 : -24,
    scale: 0.96,
    filter: 'blur(4px)',
  }),
  center: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
  },
  exit: (dir: number) => ({
    opacity: 0,
    y: dir > 0 ? -12 : 12,
    scale: 0.98,
    filter: 'blur(4px)',
  }),
}

const contextTextVariants = {
  enter: (dir: number) => ({ opacity: 0, y: dir > 0 ? 16 : -16 }),
  center: { opacity: 1, y: 0 },
  exit: (dir: number) => ({ opacity: 0, y: dir > 0 ? -16 : 16 }),
}

// -------------------------------------------------------------------
// ProgressDots -- horizontal step indicators
// -------------------------------------------------------------------
function ProgressDots({
  steps,
  currentIndex,
  compact = false,
}: {
  steps: StepConfig[]
  currentIndex: number
  compact?: boolean
}) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const isComplete = i < currentIndex
        const isCurrent = i === currentIndex

        const dotSize = compact
          ? isCurrent ? 10 : 6
          : isCurrent ? 12 : 8

        return (
          <Fragment key={step.id}>
            <div className="relative flex-shrink-0">
              {/* Pulse ring for current dot */}
              {isCurrent && !prefersReducedMotion && !compact && (
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: dotSize,
                    height: dotSize,
                    top: 0,
                    left: 0,
                    backgroundColor: step.accentColor,
                  }}
                  animate={{
                    scale: [1, 2.2, 1],
                    opacity: [0.25, 0, 0.25],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
              <motion.div
                className="rounded-full"
                initial={false}
                animate={{
                  width: dotSize,
                  height: dotSize,
                  backgroundColor:
                    isComplete || isCurrent
                      ? step.accentColor
                      : 'var(--border-strong)',
                }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 25,
                }}
              />
            </div>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div
                className="relative flex-1"
                style={{
                  height: compact ? 1.5 : 2,
                  minWidth: compact ? 8 : 12,
                  marginInline: compact ? 3 : 4,
                }}
              >
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: 'var(--border)' }}
                />
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full origin-left"
                  initial={false}
                  animate={{ scaleX: isComplete ? 1 : 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 25,
                  }}
                  style={{
                    width: '100%',
                    backgroundColor: step.accentColor,
                  }}
                />
              </div>
            )}
          </Fragment>
        )
      })}
    </div>
  )
}

// -------------------------------------------------------------------
// CircularProgressRing -- SVG ring with animated icon
// -------------------------------------------------------------------
function CircularProgressRing({
  step,
  progressFraction,
}: {
  step: StepConfig
  progressFraction: number
}) {
  const prefersReducedMotion = useReducedMotion()
  const StepIcon = step.icon

  return (
    <div className="relative mx-auto" style={{ width: 128, height: 128 }}>
      <svg width={128} height={128} viewBox="0 0 128 128" className="block">
        {/* Track */}
        <circle
          cx="64"
          cy="64"
          r={RING_RADIUS}
          fill="none"
          stroke="var(--border)"
          strokeWidth="2.5"
        />
        {/* Progress arc */}
        <motion.circle
          cx="64"
          cy="64"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
          }}
          initial={false}
          animate={{
            stroke: step.accentColor,
            strokeDashoffset: RING_CIRCUMFERENCE * (1 - progressFraction),
          }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 20,
          }}
        />
      </svg>

      {/* Icon in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id + '-ring-icon'}
            initial={
              prefersReducedMotion
                ? undefined
                : { scale: 0.5, opacity: 0, rotate: -15 }
            }
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={
              prefersReducedMotion
                ? undefined
                : { scale: 0.5, opacity: 0, rotate: 15 }
            }
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
          >
            <StepIcon
              className="h-10 w-10 lg:h-12 lg:w-12"
              style={{ color: step.accentColor }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Glow behind ring */}
      <motion.div
        className="pointer-events-none absolute inset-3 rounded-full blur-xl"
        animate={{
          backgroundColor: step.accentColor,
          opacity: 0.1,
        }}
        transition={{ duration: 0.6 }}
      />
    </div>
  )
}

// -------------------------------------------------------------------
// Main wizard component
// -------------------------------------------------------------------
export function OnboardingWizard() {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1) // 1 forward, -1 backward
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({})
  const prefersReducedMotion = useReducedMotion()
  const {
    mousePos,
    isHovered,
    handlers: spotlightHandlers,
  } = useMouseSpotlight()

  const activeSteps = useMemo(() => getActiveSteps(profileData), [profileData])
  const currentStep = activeSteps[currentIndex]
  const isFirstStep = currentIndex === 0
  const isLastStep = currentIndex === activeSteps.length - 1
  const isMandatory = currentStep?.required ?? false

  const canContinue = useMemo(() => {
    if (!currentStep) return false
    if (currentStep.id === 'core') return isCoreInfoValid(profileData)
    return true
  }, [currentStep, profileData])

  const handleChange = useCallback((newData: Partial<UserProfile>) => {
    setProfileData(newData)
  }, [])

  function goNext() {
    if (isLastStep) {
      finishOnboarding()
      return
    }
    setDirection(1)
    const nextSteps =
      currentStep?.id === 'core' ? getActiveSteps(profileData) : activeSteps
    const nextIndex = Math.min(currentIndex + 1, nextSteps.length - 1)
    setCurrentIndex(nextIndex)
  }

  function goBack() {
    if (isFirstStep) return
    setDirection(-1)
    setCurrentIndex(currentIndex - 1)
  }

  function handleSkip() {
    goNext()
  }

  function finishOnboarding() {
    const now = new Date().toISOString()
    const profile: UserProfile = {
      location: profileData.location ?? { state: '' },
      residencyStatus: profileData.residencyStatus ?? 'prefer_not_to_say',
      currentSituation: profileData.currentSituation ?? [],
      immigration: profileData.immigration,
      employment: profileData.employment,
      housing: profileData.housing,
      education: profileData.education,
      transportation: profileData.transportation,
      healthcare: profileData.healthcare,
      filingStatus: profileData.filingStatus,
      dependents: profileData.dependents,
      profileCompleteness: 0,
      createdAt: now,
      updatedAt: now,
    }
    profile.profileCompleteness = calculateCompleteness(profile)
    saveProfile(profile)
    navigate('/dashboard')
  }

  if (!currentStep) return null

  const StepComponent = currentStep.component
  const stepNumber = String(currentIndex + 1).padStart(2, '0')
  const totalSteps = String(activeSteps.length).padStart(2, '0')
  const progressFraction = (currentIndex + 1) / activeSteps.length

  return (
    <div className="relative flex min-h-dvh w-full flex-col md:flex-row overflow-hidden">
      {/* ============================================= */}
      {/* DYNAMIC BACKGROUND -- shifts color per step   */}
      {/* ============================================= */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute w-[70%] h-[60%] top-[15%] left-[5%] rounded-full blur-3xl transition-[background-color] duration-700 ease-in-out"
          style={{ backgroundColor: `${currentStep.accentColor}0A` }}
        />
        <div
          className="absolute w-[50%] h-[50%] top-[5%] right-[5%] rounded-full blur-3xl transition-[background-color] duration-700 ease-in-out"
          style={{ backgroundColor: `${currentStep.accentColor}07` }}
        />
        <div
          className="absolute w-[40%] h-[40%] bottom-[10%] left-[30%] rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(26,43,74,0.03)' }}
        />
      </div>

      {/* Noise / grain texture */}
      <svg
        className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
        style={{ opacity: 0.025 }}
      >
        <filter id="onboarding-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#onboarding-grain)" />
      </svg>

      {/* ============================================= */}
      {/* MOBILE: Fixed progress bar                     */}
      {/* ============================================= */}
      <div className="block md:hidden fixed top-0 left-0 right-0 z-30">
        <div className="relative h-[3px]">
          <div className="absolute inset-0 bg-[var(--border)]" />
          <motion.div
            className="absolute left-0 top-0 h-full origin-left"
            initial={false}
            animate={{ width: `${progressFraction * 100}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            style={{ backgroundColor: currentStep.accentColor }}
          />
        </div>
      </div>

      {/* ============================================= */}
      {/* LEFT PANEL: Ring + Dots + Context              */}
      {/* ============================================= */}
      <div className="hidden md:flex md:w-[42%] flex-col justify-center items-start p-12 lg:p-16 pl-10 lg:pl-14 relative z-10">
        {/* Gradient blob behind card */}
        <motion.div
          className="pointer-events-none absolute rounded-full blur-3xl"
          style={{ width: 320, height: 320, top: '25%', left: '8%' }}
          animate={{
            backgroundColor: currentStep.accentColor,
            opacity: 0.12,
          }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />

        <div
          className="relative w-full max-w-md rounded-2xl p-8 lg:p-10"
          style={{
            background: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          {/* Progress dots (persistent, not inside AnimatePresence) */}
          <div className="mb-8">
            <ProgressDots
              steps={activeSteps}
              currentIndex={currentIndex}
            />
          </div>

          {/* Circular progress ring (persistent) */}
          <div className="mb-8">
            <CircularProgressRing
              step={currentStep}
              progressFraction={progressFraction}
            />
          </div>

          {/* Context text (transitions per step) */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep.id + '-context'}
              custom={direction}
              variants={contextTextVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
              }}
            >
              {/* Step counter */}
              <div className="flex items-center gap-2 mb-4">
                <motion.span
                  className="inline-flex items-center justify-center rounded-full text-[11px] font-mono font-medium text-white"
                  style={{
                    width: 28,
                    height: 28,
                    backgroundColor: currentStep.accentColor,
                  }}
                >
                  {stepNumber}
                </motion.span>
                <span className="text-xs font-mono tracking-wider text-[var(--muted-foreground)]">
                  of {totalSteps}
                </span>
              </div>

              {/* Context heading */}
              <h2
                className="font-display text-2xl lg:text-3xl text-[var(--foreground)]"
                style={{ letterSpacing: '-0.02em', lineHeight: 1.15 }}
              >
                {currentStep.contextHeading}
              </h2>

              {/* Trust note */}
              <p className="mt-5 text-sm text-[var(--muted-foreground)] leading-relaxed">
                Your data stays on your device. Nothing is sent to any server
                until you view your dashboard.
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ============================================= */}
      {/* RIGHT PANEL: Form content with spotlight       */}
      {/* ============================================= */}
      <div className="flex-1 flex flex-col justify-center items-center px-5 pt-6 pb-8 md:pt-0 md:pb-0 md:px-8 lg:px-12 relative z-10">
        <div
          {...spotlightHandlers}
          className="relative w-full max-w-lg rounded-2xl p-6 md:p-8 lg:p-10 flex flex-col"
          style={{
            background: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: isHovered
              ? '0 16px 48px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.03)'
              : '0 1px 3px rgba(0,0,0,0.03)',
            transition: 'box-shadow 0.3s ease',
          }}
        >
          {/* Mouse spotlight overlay */}
          {isHovered && !prefersReducedMotion && (
            <div
              className="pointer-events-none absolute inset-0 z-[5] rounded-2xl"
              style={{
                background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, ${currentStep.accentColor}06, transparent 40%)`,
              }}
            />
          )}

          {/* Mobile: progress dots + step label */}
          <div className="block md:hidden mb-6">
            <ProgressDots
              steps={activeSteps}
              currentIndex={currentIndex}
              compact
            />
            <AnimatePresence mode="wait">
              <motion.p
                key={currentStep.id + '-mobile-label'}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
                className="mt-3 text-xs font-mono tracking-wider"
                style={{ color: currentStep.accentColor }}
              >
                {stepNumber} / {totalSteps}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Step title and subtitle */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep.id + '-title'}
              custom={direction}
              initial={{ opacity: 0, y: direction > 0 ? 10 : -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: direction > 0 ? -5 : 5 }}
              transition={{ duration: 0.25 }}
              className="mb-8 relative z-20"
            >
              <h3 className="text-xl md:text-2xl font-semibold text-[var(--foreground)]">
                {currentStep.title}
              </h3>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {currentStep.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Step content with AnimatePresence */}
          <div className="relative min-h-[320px] flex-1 z-20">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep.id}
                custom={direction}
                variants={stepContentVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 25,
                }}
              >
                <StepComponent
                  data={profileData}
                  onChange={handleChange}
                  accentColor={currentStep.accentColor}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ======================================= */}
          {/* Bottom navigation bar                   */}
          {/* ======================================= */}
          <div className="mt-8 flex flex-col md:flex-row items-center gap-3 md:gap-0 md:justify-between border-t border-[var(--border)] pt-6 relative z-20">
            {/* Back button */}
            <div className="w-full md:w-24 order-3 md:order-1">
              {!isFirstStep && (
                <Button
                  variant="ghost"
                  onClick={goBack}
                  className="gap-1.5 text-[var(--muted-foreground)] w-full md:w-auto min-h-[44px]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
            </div>

            {/* Skip */}
            <div className="order-2 md:order-2">
              {!isMandatory && !isLastStep && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer min-h-[44px] px-4"
                >
                  Skip this step
                </button>
              )}
            </div>

            {/* Continue / Finish button with shimmer */}
            <div className="w-full md:w-auto order-1 md:order-3 flex justify-end">
              <button
                type="button"
                onClick={goNext}
                disabled={!canContinue}
                className={cn(
                  'group relative overflow-hidden rounded-lg px-8 min-h-[48px] w-full md:w-auto md:min-w-[140px] text-sm font-semibold text-white transition-all duration-200 cursor-pointer',
                  'disabled:opacity-40 disabled:cursor-not-allowed',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
                )}
                style={{
                  background: canContinue
                    ? `linear-gradient(135deg, ${currentStep.accentColor}, ${currentStep.accentColor}dd)`
                    : currentStep.accentColor,
                }}
              >
                {/* Shimmer sweep overlay */}
                <span
                  className={cn(
                    'absolute inset-0 -translate-x-full',
                    'bg-gradient-to-r from-transparent via-white/20 to-transparent',
                    'transition-transform duration-700',
                    canContinue && 'group-hover:translate-x-full'
                  )}
                />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLastStep ? 'Finish' : 'Continue'}
                  {!isLastStep && (
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile trust note */}
        <p className="block md:hidden mt-4 text-center text-xs text-[var(--muted-foreground)] px-4 pb-[env(safe-area-inset-bottom)]">
          Your data stays on your device. Nothing is sent to any server until
          you view your dashboard.
        </p>
      </div>
    </div>
  )
}
