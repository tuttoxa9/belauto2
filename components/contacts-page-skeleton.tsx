import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ContactsPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      <div className="container px-4 py-8">
        {/* Хлебные крошки скелетон */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-16" />
            <span className="text-gray-300">/</span>
            <Skeleton className="h-4 w-20" />
          </div>
        </nav>

        {/* Заголовок скелетон */}
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Левая колонка - Карта и форма */}
          <div className="space-y-6">
            {/* Заголовок карты */}
            <div>
              <Skeleton className="h-8 w-48 mb-4" />
              {/* Карта скелетон */}
              <Skeleton className="h-72 lg:h-80 rounded-xl" />
            </div>

            {/* Форма обратной связи скелетон */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
                <Skeleton className="h-6 w-64 bg-blue-400" />
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-28 mb-2" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Правая колонка - Контактная информация */}
          <div className="space-y-6">
            <Skeleton className="h-8 w-56 mb-6" />

            {/* Контактные карточки скелетоны */}
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white/90 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Skeleton className="w-14 h-14 rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Социальные сети скелетон */}
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white">
                <div className="flex items-center">
                  <Skeleton className="h-5 w-5 mr-2 bg-slate-400" />
                  <Skeleton className="h-6 w-48 bg-slate-400" />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                      <Skeleton className="w-12 h-12 rounded-xl" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
