// Simple in-memory store for credits and processed webhook events (ephemeral on serverless)
const credits = new Map<string, number>();
const processedEvents = new Set<string>();

export function addCredits(email: string, amount: number) {
  const key = (email || "").toLowerCase();
  const prev = credits.get(key) || 0;
  credits.set(key, prev + amount);
}

export function setCredits(email: string, amount: number) {
  const key = (email || "").toLowerCase();
  credits.set(key, Number(amount || 0));
}

export function getCredits(email: string) {
  const key = (email || "").toLowerCase();
  return Number(credits.get(key) || 0);
}

export function isProcessed(eventId: string) {
  return processedEvents.has(eventId);
}

export function markProcessed(eventId: string) {
  if (eventId) processedEvents.add(eventId);
}
