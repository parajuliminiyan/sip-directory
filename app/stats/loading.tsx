import { Skeleton } from '@/components/ui/skeleton'

export default function StatsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-9 w-48 mb-4" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Stats Cards */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border rounded-lg p-6">
            <Skeleton className="h-7 w-48 mb-6" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="flex justify-between items-center">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
