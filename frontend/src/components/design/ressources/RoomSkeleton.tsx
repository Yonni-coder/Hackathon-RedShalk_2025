import { Card, CardContent, CardHeader } from "@/components/ui/card";


export function RoomSkeleton() {
  return (
    <Card className="overflow-hidden h-full">
      <div className="relative">
        <div className="w-full h-48 bg-gray-200 animate-pulse" />
        <div className="absolute top-4 left-4">
          <div className="h-6 w-20 bg-gray-300 rounded-full animate-pulse" />
        </div>
        <div className="absolute top-4 right-4">
          <div className="h-6 w-16 bg-gray-300 rounded-full animate-pulse" />
        </div>
      </div>

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function RoomSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <RoomSkeleton key={index} />
      ))}
    </div>
  );
}