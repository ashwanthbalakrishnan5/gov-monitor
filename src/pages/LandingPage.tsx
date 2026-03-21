import { Hero } from '@/components/landing/Hero'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { ImpactQuote } from '@/components/landing/ImpactQuote'
import { TrustGrid } from '@/components/landing/TrustGrid'
import { FinalCTA } from '@/components/landing/FinalCTA'

export function LandingPage() {
  return (
    <div
      className="relative w-full"
      style={{ scrollBehavior: 'smooth', background: 'var(--background)' }}
    >
      {/* Grain texture overlay -- CSS-only, no JS, no perf hit */}
      <svg
        className="pointer-events-none fixed inset-0 z-50 h-full w-full"
        style={{ opacity: 0.022 }}
      >
        <filter id="landing-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.6"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#landing-grain)" />
      </svg>

      <Hero />
      <HowItWorks />
      <ImpactQuote />
      <TrustGrid />
      <FinalCTA />
    </div>
  )
}
