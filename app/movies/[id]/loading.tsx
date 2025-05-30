export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <div className="w-full h-full bg-gray-800 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Poster */}
          <div className="lg:col-span-1">
            <div className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse" />
          </div>

          {/* Movie Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-6 w-16 bg-gray-800 rounded animate-pulse" />
                <div className="h-6 w-16 bg-gray-800 rounded animate-pulse" />
                <div className="h-6 w-24 bg-gray-800 rounded animate-pulse" />
              </div>

              <div className="h-12 w-3/4 bg-gray-800 rounded animate-pulse" />
              <div className="h-6 w-1/2 bg-gray-800 rounded animate-pulse" />

              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-6 w-20 bg-gray-800 rounded animate-pulse" />
                ))}
              </div>

              <div className="space-y-2">
                <div className="h-4 bg-gray-800 rounded animate-pulse" />
                <div className="h-4 bg-gray-800 rounded w-5/6 animate-pulse" />
                <div className="h-4 bg-gray-800 rounded w-4/6 animate-pulse" />
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="h-12 w-32 bg-gray-800 rounded animate-pulse" />
                <div className="h-12 w-32 bg-gray-800 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Technical Details */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="h-8 w-48 bg-gray-800 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="h-4 w-16 bg-gray-800 rounded animate-pulse mb-2" />
                <div className="h-6 w-24 bg-gray-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* File Information */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="h-8 w-48 bg-gray-800 rounded animate-pulse mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="h-4 w-24 bg-gray-800 rounded animate-pulse mb-2" />
                <div className="h-6 bg-gray-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
