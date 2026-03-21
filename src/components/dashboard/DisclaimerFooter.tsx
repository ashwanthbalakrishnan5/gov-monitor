export function DisclaimerFooter() {
  return (
    <footer className="mt-12 border-t border-[var(--border)] px-4 py-6 pb-[max(24px,env(safe-area-inset-bottom))]">
      <p className="text-center text-[12px] leading-relaxed text-[var(--muted-foreground)]">
        Legisly provides informational summaries, not legal advice. Always
        consult a qualified attorney for decisions about your legal situation.
      </p>
    </footer>
  )
}
