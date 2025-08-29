interface PostSkeletonProps {
  count?: number;
}

function SinglePostSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm animate-pulse">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-24"></div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>

      {/* Media placeholder */}
      <div className="h-48 bg-gray-300 rounded-lg mb-4"></div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-6">
          <div className="h-8 bg-gray-300 rounded w-16"></div>
          <div className="h-8 bg-gray-300 rounded w-16"></div>
          <div className="h-8 bg-gray-300 rounded w-16"></div>
        </div>
        <div className="h-8 bg-gray-300 rounded w-12"></div>
      </div>
    </div>
  );
}

export function PostSkeleton({ count = 1 }: PostSkeletonProps) {
  if (count === 1) {
    return <SinglePostSkeleton />;
  }

  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, index) => (
        <SinglePostSkeleton key={index} />
      ))}
    </div>
  );
}

export default PostSkeleton;