import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { Logo } from './Logo'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-dvh flex flex-col items-center justify-center px-6 text-center"
          style={{ backgroundColor: 'var(--background)' }}
        >
          <Logo size="md" />
          <h1 className="mt-8 text-2xl font-semibold text-[var(--foreground)]">
            Something went wrong
          </h1>
          <p className="mt-3 text-sm text-[var(--muted-foreground)] max-w-md leading-relaxed">
            An unexpected error occurred. Try refreshing the page. If the problem
            persists, clearing your browser data for this site may help.
          </p>
          {this.state.error && (
            <pre className="mt-4 text-xs font-mono text-[var(--muted-foreground)] bg-[var(--muted)] rounded-lg px-4 py-3 max-w-md overflow-auto">
              {this.state.error.message}
            </pre>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg px-6 min-h-[44px] text-sm font-medium text-white cursor-pointer"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Refresh page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
