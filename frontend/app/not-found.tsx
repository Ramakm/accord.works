export default function NotFound() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-bold">404 - Page Not Found</h2>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <a
        href="/"
        className="mt-4 inline-flex items-center rounded-md bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:opacity-95"
      >
        Go Home
      </a>
    </div>
  )
}
