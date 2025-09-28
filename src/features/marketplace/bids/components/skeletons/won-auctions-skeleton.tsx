import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function WonAuctionsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-32" />
      {[...Array(2)].map((_, i) => (
        <Card key={i}>
          <div className="flex items-center p-4 gap-4">
            <Skeleton className="h-20 w-20 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-10 w-28" />
          </div>
        </Card>
      ))}
    </div>
  )
}
