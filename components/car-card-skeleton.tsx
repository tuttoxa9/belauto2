import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function CarCardSkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse border border-gray-200 bg-white rounded-xl h-full">
      {/* Image Section - Компактная */}
      <div className="relative">
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-xl">
          <Skeleton className="w-full h-40 sm:h-44 rounded-t-xl" />

          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <Skeleton className="h-6 w-16 rounded-lg" />
          </div>

          {/* Year Badge */}
          <div className="absolute top-2 right-2">
            <Skeleton className="h-6 w-12 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Content Section - Компактная */}
      <CardContent className="p-3 sm:p-4 space-y-3">
        {/* Title and Price */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Specifications Grid - Компактная */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-50 rounded-lg p-2">
            <Skeleton className="h-3 w-12 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>

          <div className="bg-gray-50 rounded-lg p-2">
            <Skeleton className="h-3 w-16 mb-1" />
            <Skeleton className="h-3 w-8" />
          </div>

          <div className="bg-gray-50 rounded-lg p-2">
            <Skeleton className="h-3 w-14 mb-1" />
            <Skeleton className="h-3 w-12" />
          </div>

          <div className="bg-gray-50 rounded-lg p-2">
            <Skeleton className="h-3 w-8 mb-1" />
            <Skeleton className="h-3 w-14" />
          </div>
        </div>

        {/* Call to Action - Компактный */}
        <div className="pt-2 mt-auto">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <Skeleton className="h-4 w-20 mx-auto" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
