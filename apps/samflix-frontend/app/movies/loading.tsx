export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-8 w-48 bg-gray-800 rounded animate-pulse mb-2" />
        <div className="h-4 w-64 bg-gray-800 rounded animate-pulse" />
      </div>

      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 h-10 bg-gray-800 rounded animate-pulse" />
          <div className="w-48 h-10 bg-gray-800 rounded animate-pulse" />
          <div className="w-48 h-10 bg-gray-800 rounded animate-pulse" />
          <div className="w-24 h-10 bg-gray-800 rounded animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] bg-gray-800 rounded animate-pulse" />
        ))}
      </div>
    </div>
  )
}
