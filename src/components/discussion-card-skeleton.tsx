import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DiscussionCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex gap-4">
          {/* Vertical Voting Skeleton */}
          <div className="flex flex-col items-center gap-1 pt-1">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-4 w-6" />
            <Skeleton className="h-8 w-8" />
          </div>

          {/* Content Skeleton */}
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>

            {/* Title */}
            <Skeleton className="h-6 w-3/4" />

            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
