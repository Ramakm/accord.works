export type Plan = 'free' | 'pro'
export const PRO_CREDITS = 1000

const k = (userId: string, name: string) => `contractai:${name}:${userId}`

export function getPlan(userId: string): Plan {
  if (typeof window === 'undefined') return 'free'
  return (localStorage.getItem(k(userId, 'plan')) as Plan) || 'free'
}

export function setPlan(userId: string, plan: Plan) {
  if (typeof window === 'undefined') return
  localStorage.setItem(k(userId, 'plan'), plan)
}

export function getCredits(userId: string): number {
  if (typeof window === 'undefined') return 0
  const raw = localStorage.getItem(k(userId, 'credits'))
  if (raw == null) return 10 // default free credits
  return Math.max(0, parseInt(raw, 10) || 0)
}

export function setCredits(userId: string, credits: number) {
  if (typeof window === 'undefined') return
  localStorage.setItem(k(userId, 'credits'), String(credits))
}

export function consumeCredit(userId: string) {
  const left = getCredits(userId)
  if (left > 0) setCredits(userId, left - 1)
}

export function consumeCreditsBy(userId: string, amount: number) {
  if (amount <= 0) return
  const left = getCredits(userId)
  const next = Math.max(0, left - amount)
  setCredits(userId, next)
}

// Upgrade helper: set plan to pro and top up to PRO_CREDITS if below that
export function upgradeToPro(userId: string) {
  setPlan(userId, 'pro')
  const current = getCredits(userId)
  if (current < PRO_CREDITS) setCredits(userId, PRO_CREDITS)
}

// Helper to signal a prompt was used; dashboards can listen and consume a credit
export function dispatchPromptUsed() {
  if (typeof window === 'undefined') return
  try {
    window.dispatchEvent(new CustomEvent('contractai:prompt-used'))
  } catch {}
}

export function dispatchCreditsUpdated() {
  if (typeof window === 'undefined') return
  try {
    window.dispatchEvent(new CustomEvent('contractai:credits-updated'))
  } catch {}
}
