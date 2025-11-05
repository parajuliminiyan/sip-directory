import { Skeleton } from '@/components/ui/skeleton'

export default function CompareLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-9 w-64 mb-4" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border p-4 bg-muted">
                <Skeleton className="h-6 w-32" />
              </th>
              <th className="border p-4">
                <Skeleton className="h-7 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </th>
              <th className="border p-4">
                <Skeleton className="h-7 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <tr key={i}>
                <td className="border p-4 bg-muted">
                  <Skeleton className="h-5 w-32" />
                </td>
                <td className="border p-4">
                  <Skeleton className="h-5 w-40" />
                </td>
                <td className="border p-4">
                  <Skeleton className="h-5 w-40" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
