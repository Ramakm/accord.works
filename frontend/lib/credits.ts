export type Plan = 'free' | 'pro'

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
  const plan = getPlan(userId)
  if (plan === 'pro') return // unlimited
  const left = getCredits(userId)
  if (left > 0) setCredits(userId, left - 1)
}
