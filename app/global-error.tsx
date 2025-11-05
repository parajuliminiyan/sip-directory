'use client'

import { AlertCircle } from 'lucide-react'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-background">
          <AlertCircle className="h-24 w-24 text-destructive mb-6" />
          <h1 className="text-4xl font-bold mb-2">500 - Server Error</h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-md">
            A critical error occurred. Please refresh the page or contact support if the problem persists.
          </p>
          <button
            onClick={reset}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  )
}
