export function Spinner({ size = 20, className = "" }: { size?: number; className?: string }) {
  const border = Math.max(2, Math.round(size / 10))
  return (
    <div
      className={`inline-block animate-spin rounded-full border border-slate-200 border-b-indigo-600 ${className}`}
      style={{ width: size, height: size, borderWidth: border }}
    />
  )
}
