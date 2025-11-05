'use client'

import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <AlertCircle className="h-24 w-24 text-destructive mb-6" />
      <h1 className="text-4xl font-bold mb-2">Something went wrong!</h1>
      <p className="text-lg text-muted-foreground mb-2 max-w-md">
        An unexpected error occurred. Please try again.
      </p>
      {error.message && (
        <p className="text-sm text-muted-foreground mb-8 font-mono bg-muted p-3 rounded-md max-w-lg">
          {error.message}
        </p>
      )}
      <div className="flex gap-4">
        <Button onClick={reset}>Try Again</Button>
        <Button variant="outline" onClick={() => (window.location.href = '/')}>
          Go Home
        </Button>
      </div>
    </div>
  )
}
