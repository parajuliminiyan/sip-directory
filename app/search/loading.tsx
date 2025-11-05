import { Skeleton } from '@/components/ui/skeleton'

export default function SearchLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <aside className="hidden md:block w-64 space-y-6">
          <div>
            <Skeleton className="h-6 w-32 mb-3" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
          <div>
            <Skeleton className="h-6 w-32 mb-3" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-10 w-40" />
          </div>

          <div className="grid gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="border rounded-lg p-6">
                <Skeleton className="h-7 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
