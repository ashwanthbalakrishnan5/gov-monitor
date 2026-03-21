import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export function OnboardingPage() {
  return (
    <main className="relative min-h-dvh w-full overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Warm mesh gradient background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            'radial-gradient(ellipse 80% 60% at 20% 10%, rgba(26,43,74,0.05) 0%, transparent 60%)',
            'radial-gradient(ellipse 60% 50% at 80% 30%, rgba(196,112,62,0.06) 0%, transparent 55%)',
            'radial-gradient(ellipse 70% 50% at 50% 90%, rgba(124,58,237,0.03) 0%, transparent 50%)',
            'radial-gradient(ellipse 50% 40% at 10% 70%, rgba(5,150,105,0.03) 0%, transparent 50%)',
          ].join(', '),
        }}
      />

      {/* Floating translucent orbs - CSS only for performance */}
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 500,
          height: 500,
          top: '-10%',
          right: '-5%',
          background: 'radial-gradient(circle, rgba(196,112,62,0.08) 0%, transparent 70%)',
          animation: 'orbFloat1 25s ease-in-out infinite',
        }}
      />
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 400,
          height: 400,
          bottom: '-8%',
          left: '-5%',
          background: 'radial-gradient(circle, rgba(26,43,74,0.07) 0%, transparent 70%)',
          animation: 'orbFloat2 30s ease-in-out infinite',
        }}
      />
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 300,
          height: 300,
          top: '40%',
          left: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%)',
          animation: 'orbFloat3 20s ease-in-out infinite',
        }}
      />
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 350,
          height: 350,
          top: '20%',
          left: '20%',
          background: 'radial-gradient(circle, rgba(5,150,105,0.04) 0%, transparent 70%)',
          animation: 'orbFloat4 28s ease-in-out infinite',
        }}
      />

      {/* CSS keyframes for orbs */}
      <style>{`
        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-30px, 20px) scale(1.05); }
          66% { transform: translate(20px, -15px) scale(0.97); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(25px, -20px) scale(1.03); }
          66% { transform: translate(-15px, 25px) scale(0.98); }
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-20px, -25px) scale(1.06); }
          66% { transform: translate(30px, 15px) scale(0.95); }
        }
        @keyframes orbFloat4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(15px, 30px) scale(1.04); }
          66% { transform: translate(-25px, -10px) scale(0.96); }
        }
        @media (prefers-reduced-motion: reduce) {
          .pointer-events-none[style*="animation"] {
            animation: none !important;
          }
        }
      `}</style>

      {/* The wizard fills the full viewport */}
      <div className="relative z-10 min-h-dvh w-full">
        <OnboardingWizard />
      </div>
    </main>
  )
}
