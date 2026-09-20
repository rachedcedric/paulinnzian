export default function AdminLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8" aria-busy="true" aria-label="Chargement">
      <div className="mb-6 space-y-2">
        <div className="h-7 w-56 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-gray-100" />
      </div>
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-white shadow-sm" />)}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="h-96 animate-pulse rounded-xl bg-white shadow-sm" />
        <div className="h-96 animate-pulse rounded-xl bg-white shadow-sm" />
      </div>
    </div>
  );
}
