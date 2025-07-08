export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-8">
      <div className="container mx-auto">
        {/* Header skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div className="w-32 h-8 bg-slate-200 rounded-md animate-pulse"></div>
          <div className="flex space-x-4">
            <div className="w-16 h-8 bg-slate-200 rounded-md animate-pulse"></div>
            <div className="w-16 h-8 bg-slate-200 rounded-md animate-pulse"></div>
            <div className="w-16 h-8 bg-slate-200 rounded-md animate-pulse"></div>
          </div>
        </div>

        {/* Hero section skeleton */}
        <div className="text-center mb-12">
          <div className="w-96 h-12 bg-slate-200 rounded-md animate-pulse mx-auto mb-4"></div>
          <div className="w-64 h-6 bg-slate-200 rounded-md animate-pulse mx-auto mb-6"></div>
          <div className="w-full max-w-2xl h-20 bg-slate-200 rounded-md animate-pulse mx-auto"></div>
        </div>

        {/* Cards grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="w-full h-48 bg-slate-200 rounded-md animate-pulse mb-4"></div>
              <div className="w-3/4 h-6 bg-slate-200 rounded-md animate-pulse mb-2"></div>
              <div className="w-1/2 h-4 bg-slate-200 rounded-md animate-pulse mb-4"></div>
              <div className="w-full h-10 bg-slate-200 rounded-md animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
