export default function DoctorCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-5 animate-pulse">
      <div className="flex gap-4">
        <div className="w-24 h-24 rounded-xl bg-slate-200" />
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-slate-200 rounded w-40" />
          <div className="h-4 bg-slate-200 rounded w-28" />
          <div className="h-4 bg-slate-200 rounded w-20" />
          <div className="h-4 bg-slate-200 rounded w-32" />
        </div>
      </div>

      <div className="mt-5 flex justify-between items-center">
        <div className="h-5 bg-slate-200 rounded w-24" />
        <div className="h-10 bg-slate-200 rounded-xl w-32" />
      </div>
    </div>
  );
}
