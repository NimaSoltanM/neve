import { Skeleton } from '@/components/ui/skeleton'

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-4 p-5 border rounded-xl">
          {/* Image skeleton - aspect ratio */}
          <Skeleton className="aspect-[4/3] w-full rounded-lg" />

          {/* Title skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>

          {/* Shop skeleton */}
          <Skeleton className="h-4 w-1/2" />

          {/* Price skeleton */}
          <div className="flex justify-between items-center pt-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>

          {/* Button skeleton */}
          <Skeleton className="h-10 w-full mt-4" />
        </div>
      ))}
    </div>
  )
}
