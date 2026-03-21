import { useRef, useState, useCallback, useMemo } from 'react'
import {
  motion,
  useInView,
  useReducedMotion,
  AnimatePresence,
} from 'framer-motion'
import {
  Bell,
  Mail,
  Smartphone,
  Globe,
  Home,
  Briefcase,
  Receipt,
  GraduationCap,
  Heart,
  ShieldCheck,
  Car,
  X,
  Plus,
  CheckCircle2,
  Send,
  Sparkles,
  Eye,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { getProfile } from '@/lib/profile'
import { extractTraits } from '@/lib/prefilter'
import {
  getAlertPreferences,
  saveAlertPreferences,
  getDefaultPreferences,
} from '@/lib/alert-preferences'
import type { AlertPreferences, DeliveryFrequency, SeverityThreshold } from '@/types/alert-preferences'
import type { LegalCategory } from '@/types/legal-change'

/* ── category config (mirrors FilterBar) ── */
const CATEGORIES: {
  value: LegalCategory
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}[] = [
  { value: 'immigration', label: 'Immigration', icon: Globe, color: '#7C3AED' },
  { value: 'housing', label: 'Housing', icon: Home, color: '#059669' },
  { value: 'employment', label: 'Employment', icon: Briefcase, color: '#2563EB' },
  { value: 'taxation', label: 'Tax', icon: Receipt, color: '#D97706' },
  { value: 'education', label: 'Education', icon: GraduationCap, color: '#DB2777' },
  { value: 'healthcare', label: 'Healthcare', icon: Heart, color: '#DC2626' },
  { value: 'business', label: 'Business', icon: Briefcase, color: '#2563EB' },
  { value: 'consumer', label: 'Consumer', icon: ShieldCheck, color: '#94A3B8' },
  { value: 'transportation', label: 'Transport', icon: Car, color: '#EA580C' },
]

const SEVERITY_OPTIONS: { value: SeverityThreshold; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'low', label: 'Low+' },
  { value: 'medium', label: 'Medium+' },
  { value: 'high', label: 'High Only' },
]

const FREQUENCY_OPTIONS: { value: DeliveryFrequency; label: string }[] = [
  { value: 'realtime', label: 'Real-time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
]

const TRAIT_TO_CATEGORIES: Record<string, LegalCategory[]> = {
  visa_holder: ['immigration'],
  immigrant: ['immigration'],
  f1_visa: ['immigration'],
  h1b_visa: ['immigration'],
  renter: ['housing'],
  homeowner: ['housing'],
  tenants: ['housing'],
  employed: ['employment'],
  self_employed: ['employment', 'business'],
  business_owner: ['business', 'employment'],
  workers: ['employment'],
  student: ['education'],
  students: ['education'],
  taxpayers: ['taxation'],
  aca_enrollees: ['healthcare'],
  medicaid_recipients: ['healthcare'],
  uninsured: ['healthcare'],
}

const TRAIT_TO_KEYWORDS: Record<string, string[]> = {
  visa_holder: ['visa renewal', 'work authorization', 'immigration reform'],
  f1_visa: ['OPT extension', 'SEVP', 'CPT'],
  h1b_visa: ['H-1B cap', 'wage rule', 'LCA'],
  student: ['tuition', 'financial aid', 'student loans'],
  renter: ['rent control', 'eviction', 'tenant rights'],
  employed: ['minimum wage', 'overtime', 'labor rights'],
  self_employed: ['1099', 'freelance tax', 'self-employment'],
  business_owner: ['SBA', 'business tax', 'licensing'],
  taxpayers: ['tax bracket', 'deductions', 'filing deadline'],
}

const FREQUENCY_LABELS: Record<DeliveryFrequency, string> = {
  realtime: 'Push Notification',
  daily: 'Daily Email Digest',
  weekly: 'Weekly Summary',
}

const SEVERITY_COLORS: Record<SeverityThreshold, string> = {
  all: '#6366F1',
  low: '#2563EB',
  medium: '#D97706',
  high: '#DC2626',
}

/* ── toggle switch ── */
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer min-h-[44px] min-w-[44px] justify-center"
    >
      <span
        className={`inline-block h-6 w-11 rounded-full transition-colors duration-200 ${enabled ? 'bg-indigo-500' : 'bg-white/10'}`}
      >
        <motion.span
          className="block h-5 w-5 rounded-full bg-white shadow-sm"
          style={{ marginTop: 2 }}
          animate={{ marginLeft: enabled ? 22 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </span>
    </button>
  )
}

/* ── segmented control ── */
function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  layoutId,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  layoutId: string
}) {
  return (
    <div className="flex rounded-xl bg-white/[0.04] p-1 gap-0.5">
      {options.map((opt) => {
        const isActive = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`relative flex-1 text-xs font-mono uppercase tracking-wider py-2.5 rounded-lg min-h-[44px] cursor-pointer transition-colors duration-150 z-10 ${
              isActive
                ? 'text-[var(--foreground)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 rounded-lg bg-white/[0.08]"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ── main page ── */
export function AlertsPage() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-30px' })
  const prefersReducedMotion = useReducedMotion()

  const [prefs, setPrefs] = useState<AlertPreferences>(
    () => getAlertPreferences() ?? getDefaultPreferences()
  )
  const [testToast, setTestToast] = useState(false)
  const [keywordInput, setKeywordInput] = useState('')
  const testTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const updatePrefs = useCallback((partial: Partial<AlertPreferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...partial, updatedAt: new Date().toISOString() }
      saveAlertPreferences(next)
      return next
    })
  }, [])

  const updateChannel = useCallback(
    (channel: 'push' | 'email' | 'sms', patch: Partial<AlertPreferences['channels']['push']>) => {
      setPrefs((prev) => {
        const next = {
          ...prev,
          channels: { ...prev.channels, [channel]: { ...prev.channels[channel], ...patch } },
          updatedAt: new Date().toISOString(),
        }
        saveAlertPreferences(next)
        return next
      })
    },
    []
  )

  /* profile-derived data */
  const profile = useMemo(() => getProfile(), [])
  const traits = useMemo(() => (profile ? extractTraits(profile) : []), [profile])

  const recommendedCategories = useMemo(() => {
    const cats = new Set<LegalCategory>()
    for (const trait of traits) {
      const mapped = TRAIT_TO_CATEGORIES[trait]
      if (mapped) mapped.forEach((c) => cats.add(c))
    }
    return cats
  }, [traits])

  const suggestedKeywords = useMemo(() => {
    const kws = new Set<string>()
    for (const trait of traits) {
      const mapped = TRAIT_TO_KEYWORDS[trait]
      if (mapped) mapped.forEach((k) => kws.add(k))
    }
    // remove already-added keywords
    return [...kws].filter((k) => !prefs.keywords.includes(k)).slice(0, 5)
  }, [traits, prefs.keywords])

  /* stats */
  const activeChannels = [prefs.channels.push, prefs.channels.email, prefs.channels.sms].filter(
    (c) => c.enabled
  ).length

  /* handlers */
  const toggleCategory = useCallback(
    (cat: LegalCategory) => {
      const has = prefs.subscribedCategories.includes(cat)
      updatePrefs({
        subscribedCategories: has
          ? prefs.subscribedCategories.filter((c) => c !== cat)
          : [...prefs.subscribedCategories, cat],
      })
    },
    [prefs.subscribedCategories, updatePrefs]
  )

  const addKeyword = useCallback(
    (kw: string) => {
      const trimmed = kw.trim().toLowerCase()
      if (!trimmed || prefs.keywords.includes(trimmed)) return
      updatePrefs({ keywords: [...prefs.keywords, trimmed] })
      setKeywordInput('')
    },
    [prefs.keywords, updatePrefs]
  )

  const removeKeyword = useCallback(
    (kw: string) => {
      updatePrefs({ keywords: prefs.keywords.filter((k) => k !== kw) })
    },
    [prefs.keywords, updatePrefs]
  )

  const sendTestNotification = useCallback(() => {
    if (testTimerRef.current) clearTimeout(testTimerRef.current)
    setTestToast(true)
    testTimerRef.current = setTimeout(() => setTestToast(false), 3000)
  }, [])

  /* preview data */
  const previewCategory = useMemo(() => {
    if (prefs.subscribedCategories.length === 0) return CATEGORIES[0]
    const cat = prefs.subscribedCategories[0]
    return CATEGORIES.find((c) => c.value === cat) ?? CATEGORIES[0]
  }, [prefs.subscribedCategories])

  /* motion helpers */
  const sectionMotion = (delay: number) => ({
    initial: prefersReducedMotion ? undefined : { opacity: 0, y: 12 } as const,
    animate: isInView ? { opacity: 1, y: 0 } as const : undefined,
    transition: { type: 'spring' as const, stiffness: 200, damping: 22, delay },
  })

  return (
    <div ref={sectionRef} className="px-4 pt-6 pb-8 sm:px-8 lg:px-12 max-w-4xl">
      {/* ── 1. Header ── */}
      <motion.div className="mb-8" {...sectionMotion(0)}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">
            Alerts & Notifications
          </h1>
        </div>
        <p className="text-sm text-[var(--muted-foreground)] max-w-lg">
          Control how and when you receive updates about legal changes that affect you.
        </p>
      </motion.div>

      {/* ── 2. Quick Stats ── */}
      <motion.div className="grid grid-cols-3 gap-3 mb-8" {...sectionMotion(0.05)}>
        <div
          className="glass-panel rounded-xl p-4 text-center"
          style={{ boxShadow: 'var(--elevation-1)' }}
        >
          <div className="text-2xl font-bold text-[var(--foreground)]">
            {prefs.subscribedCategories.length}
          </div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)] mt-1">
            Topics
          </div>
        </div>
        <div
          className="glass-panel rounded-xl p-4 text-center"
          style={{ boxShadow: 'var(--elevation-1)' }}
        >
          <div className="text-2xl font-bold text-[var(--foreground)]">12</div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)] mt-1">
            This Week
          </div>
        </div>
        <div
          className="glass-panel rounded-xl p-4 text-center"
          style={{ boxShadow: 'var(--elevation-1)' }}
        >
          <div className="text-2xl font-bold text-[var(--foreground)]">{activeChannels}</div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)] mt-1">
            Channels
          </div>
        </div>
      </motion.div>

      {/* ── 3. Notification Channels ── */}
      <motion.div className="mb-8" {...sectionMotion(0.1)}>
        <h2 className="text-sm font-mono uppercase tracking-widest text-[var(--muted-foreground)] mb-4">
          Notification Channels
        </h2>
        <div className="space-y-3">
          {/* Push */}
          <div
            className="glass-panel rounded-2xl p-5"
            style={{ boxShadow: 'var(--elevation-1)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10">
                  <Bell className="h-4 w-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--foreground)]">
                    Push Notifications
                  </h3>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    Instant browser alerts for high-priority changes
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {prefs.channels.push.enabled && (
                  <button
                    type="button"
                    onClick={sendTestNotification}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium text-indigo-400 border border-indigo-500/30 hover:border-indigo-500/50 hover:bg-indigo-500/[0.06] transition-all cursor-pointer min-h-[44px]"
                  >
                    <Send className="h-3 w-3" />
                    Test
                  </button>
                )}
                <Toggle
                  enabled={prefs.channels.push.enabled}
                  onChange={(v) => updateChannel('push', { enabled: v })}
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div
            className="glass-panel rounded-2xl p-5"
            style={{ boxShadow: 'var(--elevation-1)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-violet-500/10">
                  <Mail className="h-4 w-4 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--foreground)]">Email Digest</h3>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    Receive a summary of changes to your inbox
                  </p>
                </div>
              </div>
              <Toggle
                enabled={prefs.channels.email.enabled}
                onChange={(v) => updateChannel('email', { enabled: v })}
              />
            </div>
            <AnimatePresence>
              {prefs.channels.email.enabled && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={prefs.channels.email.value ?? ''}
                      onChange={(e) => updateChannel('email', { value: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* SMS */}
          <div
            className="glass-panel rounded-2xl p-5"
            style={{ boxShadow: 'var(--elevation-1)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10">
                  <Smartphone className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--foreground)]">SMS Alerts</h3>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    Text alerts for critical changes only
                  </p>
                </div>
              </div>
              <Toggle
                enabled={prefs.channels.sms.enabled}
                onChange={(v) => updateChannel('sms', { enabled: v })}
              />
            </div>
            <AnimatePresence>
              {prefs.channels.sms.enabled && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    <Input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={prefs.channels.sms.value ?? ''}
                      onChange={(e) => updateChannel('sms', { value: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* ── 4. Topic Subscriptions ── */}
      <motion.div className="mb-8" {...sectionMotion(0.15)}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-mono uppercase tracking-widest text-[var(--muted-foreground)]">
            Topics ({prefs.subscribedCategories.length}/{CATEGORIES.length})
          </h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                updatePrefs({ subscribedCategories: CATEGORIES.map((c) => c.value) })
              }
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={() => updatePrefs({ subscribedCategories: [] })}
              className="text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            const isActive = prefs.subscribedCategories.includes(cat.value)
            const isRecommended = recommendedCategories.has(cat.value)
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => toggleCategory(cat.value)}
                className={`relative glass-panel rounded-2xl p-4 text-center transition-all duration-200 cursor-pointer min-h-[44px] ${
                  isActive
                    ? 'border-transparent'
                    : 'opacity-60 hover:opacity-80'
                }`}
                style={{
                  boxShadow: isActive ? `0 2px 12px ${cat.color}20` : 'var(--elevation-1)',
                  borderColor: isActive ? `${cat.color}40` : undefined,
                  borderWidth: isActive ? 1 : undefined,
                  backgroundColor: isActive ? `${cat.color}08` : undefined,
                }}
              >
                {isRecommended && (
                  <span className="absolute top-2 right-2 flex items-center gap-0.5 text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-400">
                    <Sparkles className="h-2.5 w-2.5" />
                    For You
                  </span>
                )}
                <div
                  className={`mx-auto w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-colors ${
                    isActive ? '' : 'bg-white/[0.04]'
                  }`}
                  style={
                    isActive
                      ? { backgroundColor: `${cat.color}15` }
                      : undefined
                  }
                >
                  <span style={{ color: isActive ? cat.color : 'var(--muted-foreground)' }}>
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <span
                  className={`text-xs font-medium ${isActive ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'}`}
                >
                  {cat.label}
                </span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* ── 5. Alert Sensitivity ── */}
      <motion.div className="mb-8" {...sectionMotion(0.2)}>
        <h2 className="text-sm font-mono uppercase tracking-widest text-[var(--muted-foreground)] mb-4">
          Alert Sensitivity
        </h2>
        <div
          className="glass-panel rounded-2xl p-5 space-y-5"
          style={{ boxShadow: 'var(--elevation-1)' }}
        >
          <div>
            <label className="text-xs font-medium text-[var(--foreground)] mb-2 block">
              Minimum Severity
            </label>
            <SegmentedControl
              options={SEVERITY_OPTIONS}
              value={prefs.severityThreshold}
              onChange={(v) => updatePrefs({ severityThreshold: v })}
              layoutId="severity-seg"
            />
          </div>
          <div className="border-t border-white/[0.06] pt-5">
            <label className="text-xs font-medium text-[var(--foreground)] mb-2 block">
              Delivery Frequency
            </label>
            <SegmentedControl
              options={FREQUENCY_OPTIONS}
              value={prefs.deliveryFrequency}
              onChange={(v) => updatePrefs({ deliveryFrequency: v })}
              layoutId="freq-seg"
            />
          </div>
        </div>
      </motion.div>

      {/* ── 6. Keyword Watchlist ── */}
      <motion.div className="mb-8" {...sectionMotion(0.25)}>
        <h2 className="text-sm font-mono uppercase tracking-widest text-[var(--muted-foreground)] mb-4">
          Keyword Watchlist
        </h2>
        <div
          className="glass-panel rounded-2xl p-5"
          style={{ boxShadow: 'var(--elevation-1)' }}
        >
          {/* Input */}
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              placeholder="Add a keyword..."
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addKeyword(keywordInput)
                }
              }}
              className="flex-1 text-sm"
            />
            <button
              type="button"
              onClick={() => addKeyword(keywordInput)}
              className="flex items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-medium text-white transition-all cursor-pointer min-h-[44px]"
              style={{
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                boxShadow: '0 2px 8px rgba(99,102,241,0.25)',
              }}
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>

          {/* Active keywords */}
          <div className="flex flex-wrap gap-2 mb-4 min-h-[32px]">
            <AnimatePresence mode="popLayout">
              {prefs.keywords.map((kw) => (
                <motion.span
                  key={kw}
                  layout
                  initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium bg-white/[0.06] border border-[var(--border)] text-[var(--foreground)]"
                >
                  {kw}
                  <button
                    type="button"
                    onClick={() => removeKeyword(kw)}
                    className="p-0.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label={`Remove ${kw}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
            {prefs.keywords.length === 0 && (
              <span className="text-xs text-[var(--muted-foreground)] italic">
                No keywords added yet
              </span>
            )}
          </div>

          {/* Suggested keywords */}
          {suggestedKeywords.length > 0 && (
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)] block mb-2">
                Suggested for you
              </span>
              <div className="flex flex-wrap gap-2">
                {suggestedKeywords.map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => addKeyword(kw)}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] border border-dashed border-[var(--border-strong)] hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-indigo-500/[0.04] transition-all cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── 7. Notification Preview ── */}
      <motion.div {...sectionMotion(0.3)}>
        <h2 className="text-sm font-mono uppercase tracking-widest text-[var(--muted-foreground)] mb-4">
          <span className="inline-flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            Preview
          </span>
        </h2>
        <div
          className="glass-panel rounded-2xl overflow-hidden"
          style={{ boxShadow: 'var(--elevation-2)' }}
        >
          {/* Severity bar */}
          <div
            className="h-1"
            style={{ backgroundColor: SEVERITY_COLORS[prefs.severityThreshold] }}
          />
          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="p-1.5 rounded-lg"
                  style={{ backgroundColor: `${previewCategory.color}15` }}
                >
                  <span style={{ color: previewCategory.color }}>
                    <previewCategory.icon className="h-3.5 w-3.5" />
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
                  {previewCategory.label}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[var(--muted-foreground)]">Just now</span>
            </div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">
              New {previewCategory.label} Regulation Published
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-3">
              A new rule affecting {previewCategory.label.toLowerCase()} policies has been published
              in the Federal Register. Based on your profile, this may directly impact you.
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">
                via {FREQUENCY_LABELS[prefs.deliveryFrequency]}
              </span>
              <span className="text-[10px] text-[var(--muted-foreground)]">
                This is a preview of how your alerts will appear
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Test notification toast ── */}
      <AnimatePresence>
        {testToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-emerald-100 border border-emerald-500/30"
              style={{
                backgroundColor: 'rgba(16,185,129,0.15)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Test notification sent successfully
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
