export default function CarDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Хлебные крошки */}
        <div className="flex items-center space-x-2 mb-6">
          <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
          <span className="text-gray-400">/</span>
          <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
          <span className="text-gray-400">/</span>
          <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
        </div>

        {/* Заголовок */}
        <div className="mb-8">
          <div className="h-8 bg-gray-300 rounded w-80 animate-pulse mb-3"></div>
          <div className="h-5 bg-gray-300 rounded w-48 animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Левая колонка - изображение */}
          <div className="space-y-4">
            <div className="aspect-video bg-gray-300 rounded-lg animate-pulse"></div>
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-20 h-16 bg-gray-300 rounded animate-pulse flex-shrink-0"></div>
              ))}
            </div>
          </div>

          {/* Правая колонка - информация */}
          <div className="space-y-6">
            {/* Цена */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="h-10 bg-gray-300 rounded w-48 animate-pulse mb-4"></div>
              <div className="h-6 bg-gray-300 rounded w-32 animate-pulse mb-6"></div>

              {/* Кнопки */}
              <div className="space-y-3">
                <div className="h-12 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-12 bg-gray-300 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Характеристики */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="h-6 bg-gray-300 rounded w-40 animate-pulse mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
                    <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Описание */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow-sm">
          <div className="h-6 bg-gray-300 rounded w-32 animate-pulse mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-4/6 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
