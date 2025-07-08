import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AboutPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8">
        {/* Хлебные крошки */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm">
            <Skeleton className="h-4 w-16" />
            <span>/</span>
            <Skeleton className="h-4 w-12" />
          </div>
        </nav>

        {/* Заголовок */}
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-96 mx-auto mb-4" />
          <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
          <Skeleton className="h-6 w-2/3 mx-auto" />
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-12">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/80">
              <CardContent className="p-3 lg:p-6 text-center">
                <Skeleton className="w-10 h-10 lg:w-12 lg:h-12 rounded-full mx-auto mb-2 lg:mb-3" />
                <Skeleton className="h-6 lg:h-8 w-16 mx-auto mb-1" />
                <Skeleton className="h-3 lg:h-4 w-20 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Основной контент */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>

          <div>
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <Skeleton className="w-8 h-8 rounded-full flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Услуги */}
        <div className="mb-16">
          <Skeleton className="h-8 w-48 mx-auto mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-4 lg:p-6 text-center">
                  <Skeleton className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl mx-auto mb-3" />
                  <Skeleton className="h-6 w-32 mx-auto mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Реквизиты */}
        <Card>
          <CardContent className="p-8">
            <Skeleton className="h-7 w-48 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Skeleton className="h-5 w-32 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
              <div>
                <Skeleton className="h-5 w-36 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
