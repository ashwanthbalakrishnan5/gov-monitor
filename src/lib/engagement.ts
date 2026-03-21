const VISITS_KEY = 'legisly-page-visits'

/** Record a page visit for engagement tracking. */
export function recordPageVisit(page: string): void {
  try {
    const raw = localStorage.getItem(VISITS_KEY)
    const visits: string[] = raw ? JSON.parse(raw) : []
    if (!visits.includes(page)) {
      visits.push(page)
      localStorage.setItem(VISITS_KEY, JSON.stringify(visits))
    }
  } catch { /* ignore */ }
}
