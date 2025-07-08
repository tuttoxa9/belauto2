export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-slate-900 mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Загрузка...</p>
      </div>
    </div>
  )
}
