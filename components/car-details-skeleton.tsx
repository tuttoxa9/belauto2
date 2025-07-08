export default function CarDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Хлебные крошки */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2">
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            <span>/</span>
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            <span>/</span>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </nav>

        {/* Заголовок */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-72 animate-pulse mb-2"></div>
          <div className="h-5 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка - галерея и основная информация */}
          <div className="lg:col-span-2 space-y-6">
            {/* Галерея изображений */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="aspect-video bg-gray-200 rounded-xl animate-pulse mb-4"></div>
              <div className="flex space-x-2 overflow-x-auto">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-20 h-16 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"></div>
                ))}
              </div>
            </div>

            {/* Основная информация */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse mb-4"></div>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    <div className="h-5 bg-gray-200 rounded w-28 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Описание */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Правая колонка - цена и действия */}
          <div className="space-y-6">
            {/* Цена */}
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <div className="h-8 bg-gray-200 rounded w-40 animate-pulse mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse mb-6"></div>

              {/* Кнопки действий */}
              <div className="space-y-3">
                <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>

              {/* Дополнительные опции */}
              <div className="mt-6 space-y-3">
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Табы */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex space-x-4 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
