// Location: src/components/Skeleton.tsx

export const SkeletonCard = () => {
  return (
    <div className="animate-pulse bg-white p-4 rounded-xl shadow-sm border border-slate-100 w-full">
      <div className="flex items-center gap-4">
        {/* تصویر پروفایل */}
        <div className="w-16 h-16 bg-slate-200 rounded-full"></div>

        {/* متن‌ها */}
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          <div className="h-3 bg-slate-200 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
};
