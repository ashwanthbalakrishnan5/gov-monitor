import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  motion,
  useInView,
  useReducedMotion,
} from 'framer-motion'
import {
  Shield,
  Database,
  Eye,
  Lock,
  Trash2,
  Download,
  Brain,
  Scale,
  Server,
  Smartphone,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { deleteProfile } from '@/lib/profile'

interface DataItem {
  label: string
  stored: boolean
  location: 'localStorage' | 'never stored'
  description: string
}

const DATA_INVENTORY: DataItem[] = [
  { label: 'Profile Information', stored: true, location: 'localStorage', description: 'Your visa status, employment, state, and selected interests' },
  { label: 'Alert Preferences', stored: true, location: 'localStorage', description: 'Saved and dismissed alert IDs' },
  { label: 'Theme Preference', stored: true, location: 'localStorage', description: 'Light or dark mode selection' },
  { label: 'Cached Alerts', stored: true, location: 'localStorage', description: 'Previously generated personalized alerts' },
  { label: 'Chat Messages', stored: false, location: 'never stored', description: 'Conversations are not saved between sessions' },
  { label: 'Browsing Activity', stored: false, location: 'never stored', description: 'We do not track pages you visit or actions you take' },
  { label: 'Location Data', stored: false, location: 'never stored', description: 'Only your selected state is stored, never precise location' },
  { label: 'Personal Documents', stored: false, location: 'never stored', description: 'We never ask for or store documents or IDs' },
]

interface TransparencyItem {
  icon: typeof Brain
  title: string
  description: string
  status: 'active' | 'planned'
}

const TRANSPARENCY_ITEMS: TransparencyItem[] = [
  {
    icon: Brain,
    title: 'AI Reasoning Transparency',
    description: 'Every alert shows why it was flagged for you with "Matched because" tags showing which profile traits triggered the match.',
    status: 'active',
  },
  {
    icon: Scale,
    title: 'Bias Indicators',
    description: 'Confidence scores (high/medium/low) on each alert indicate how certain the analysis is. Lower confidence means the match is more speculative.',
    status: 'active',
  },
  {
    icon: Eye,
    title: 'Source Citations',
    description: 'Every alert links to the original source document so you can verify the information independently.',
    status: 'active',
  },
  {
    icon: Server,
    title: 'No Server-Side Storage',
    description: 'All your data lives on your device. Nothing is sent to or stored on our servers. The AI analysis happens in-browser with pre-computed data.',
    status: 'active',
  },
  {
    icon: Smartphone,
    title: 'Offline Capable',
    description: 'As a PWA, Legisly works offline with cached data. Your alerts are available even without an internet connection.',
    status: 'active',
  },
  {
    icon: Lock,
    title: 'End-to-End Privacy',
    description: 'Future versions will use client-side AI models to analyze legal changes without ever sending your profile to a server.',
    status: 'planned',
  },
]

function DataInventoryCard({ item, index }: { item: DataItem; index: number }) {
  const prefersReducedMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  return (
    <motion.div
      ref={ref}
      initial={prefersReducedMotion ? undefined : { opacity: 0, x: -10 }}
      animate={isInView ? { opacity: 1, x: 0 } : undefined}
      transition={{ type: 'spring', stiffness: 200, damping: 22, delay: index * 0.05 }}
      className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--card)]"
    >
      <div className={`flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 ${item.stored ? 'bg-amber-500/10' : 'bg-emerald-500/10'}`}>
        {item.stored ? (
          <Database className="h-4 w-4 text-amber-400" />
        ) : (
          <XCircle className="h-4 w-4 text-emerald-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--foreground)]">{item.label}</span>
          <span className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-full ${item.stored ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
            {item.location}
          </span>
        </div>
        <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">{item.description}</p>
      </div>
    </motion.div>
  )
}

function TransparencyCard({ item, index }: { item: TransparencyItem; index: number }) {
  const prefersReducedMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const Icon = item.icon

  return (
    <motion.div
      ref={ref}
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{ type: 'spring', stiffness: 200, damping: 22, delay: index * 0.08 }}
      className="glass-panel rounded-2xl p-5 relative overflow-hidden"
      style={{ boxShadow: 'var(--elevation-1)' }}
    >
      {item.status === 'planned' && (
        <span className="absolute top-3 right-3 text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400">
          Planned
        </span>
      )}
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10">
          <Icon className="h-4 w-4 text-indigo-400" />
        </div>
        <h3 className="text-sm font-semibold text-[var(--foreground)]">{item.title}</h3>
      </div>
      <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{item.description}</p>
    </motion.div>
  )
}

export function PrivacyPage() {
  const navigate = useNavigate()
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-30px' })
  const prefersReducedMotion = useReducedMotion()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleExportData = () => {
    const data: Record<string, unknown> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('legisly')) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || '')
        } catch {
          data[key] = localStorage.getItem(key)
        }
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `legisly-data-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDeleteAll = () => {
    deleteProfile()
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('legisly')) keysToRemove.push(key)
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key))
    navigate('/', { replace: true })
  }

  // Calculate storage usage
  let storageBytes = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('legisly')) {
      storageBytes += (localStorage.getItem(key) || '').length * 2 // UTF-16
    }
  }
  const storageKB = (storageBytes / 1024).toFixed(1)

  return (
    <div ref={sectionRef} className="px-4 pt-6 pb-8 sm:px-8 lg:px-12 max-w-4xl">
        {/* Page header */}
        <motion.div
          className="mb-8"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-[var(--foreground)]">
              Privacy & Transparency
            </h1>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] max-w-lg">
            Full visibility into what data we store, how AI analysis works, and controls to export or delete everything.
          </p>
        </motion.div>

        {/* Privacy promise banner */}
        <motion.div
          className="mb-8 glass-panel rounded-2xl p-5 border-l-4 border-emerald-500"
          style={{ boxShadow: 'var(--elevation-1)' }}
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.1 }}
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)] mb-1">
                Your data never leaves your device
              </h2>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Legisly stores all information in your browser's localStorage. No accounts, no cookies,
                no server-side storage. Currently using {storageKB} KB of local storage.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Data Inventory */}
        <motion.div
          className="mb-8"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.15 }}
        >
          <h2 className="text-sm font-mono uppercase tracking-widest text-[var(--muted-foreground)] mb-4">
            Data Inventory
          </h2>
          <div className="space-y-2">
            {DATA_INVENTORY.map((item, i) => (
              <DataInventoryCard key={item.label} item={item} index={i} />
            ))}
          </div>
        </motion.div>

        {/* Transparency & AI */}
        <motion.div
          className="mb-8"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.2 }}
        >
          <h2 className="text-sm font-mono uppercase tracking-widest text-[var(--muted-foreground)] mb-4">
            Transparency & AI Ethics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TRANSPARENCY_ITEMS.map((item, i) => (
              <TransparencyCard key={item.title} item={item} index={i} />
            ))}
          </div>
        </motion.div>

        {/* Data controls */}
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.25 }}
        >
          <h2 className="text-sm font-mono uppercase tracking-widest text-[var(--muted-foreground)] mb-4">
            Your Controls
          </h2>
          <div className="glass-panel rounded-2xl p-5" style={{ boxShadow: 'var(--elevation-1)' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExportData}
                className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-[var(--foreground)] border border-[var(--border)] hover:border-indigo-500/50 hover:bg-indigo-500/[0.04] transition-all cursor-pointer min-h-[44px]"
              >
                <Download className="h-4 w-4 text-indigo-500" />
                Export My Data
              </button>

              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-red-400 border border-red-500/30 hover:border-red-500/50 hover:bg-red-500/[0.06] transition-all cursor-pointer min-h-[44px]"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete All Data
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDeleteAll}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-all cursor-pointer min-h-[44px]"
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium text-[var(--muted-foreground)] border border-[var(--border)] hover:bg-[var(--muted)] transition-all cursor-pointer min-h-[44px]"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
    </div>
  )
}
