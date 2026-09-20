"use client";

import { useEffect } from "react";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[admin] page error", error.digest ?? "");
  }, [error]);

  return (
    <div className="p-8">
      <div className="mx-auto max-w-md rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <h2 className="font-black text-gray-900">Impossible de charger cette page</h2>
        <p className="mt-2 text-sm text-gray-500">Une erreur est survenue. Vos données ne sont pas affectées.</p>
        <button onClick={reset} className="mt-5 rounded-lg bg-[#D99A12] px-5 py-2 text-sm font-semibold text-white hover:bg-[#C8912D]">
          Réessayer
        </button>
      </div>
    </div>
  );
}
