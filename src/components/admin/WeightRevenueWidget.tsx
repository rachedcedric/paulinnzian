"use client";

import { useState } from "react";
import { Scale } from "lucide-react";

type Period = "day" | "week" | "month" | "year";

const PERIODS: { key: Period; label: string }[] = [
  { key: "day",   label: "Jour" },
  { key: "week",  label: "Semaine" },
  { key: "month", label: "Mois" },
  { key: "year",  label: "Année" },
];

interface Props {
  weightRevenue: { total: number; day: number; week: number; month: number; year: number; rate: number };
}

function fmt(n: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n) + " F CFA";
}

export function WeightRevenueWidget({ weightRevenue }: Props) {
  const [period, setPeriod] = useState<Period>("month");

  const values: Record<Period, number> = {
    day:   weightRevenue.day,
    week:  weightRevenue.week,
    month: weightRevenue.month,
    year:  weightRevenue.year,
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600">
          <Scale className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500">
            Frais transport total <span className="text-gray-400">({fmt(weightRevenue.rate)}/kg)</span>
          </p>
          <p className="text-2xl font-black text-black">{fmt(weightRevenue.total)}</p>
        </div>
      </div>

      {/* Period tabs */}
      <div className="flex gap-1 mt-4 bg-gray-100 p-1 rounded-xl">
        {PERIODS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all ${
              period === key ? "bg-[#FF6500] text-white shadow-sm" : "text-gray-500 hover:text-black"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-50">
        <p className="text-xs text-gray-400 mb-1">
          {period === "day"   && "Aujourd'hui"}
          {period === "week"  && "7 derniers jours"}
          {period === "month" && "Ce mois-ci"}
          {period === "year"  && "Cette année"}
        </p>
        <p className="text-3xl font-black text-blue-600">{fmt(values[period])}</p>
        <p className="text-xs text-gray-400 mt-1">Toute fraction de kg comptée comme 1 kg</p>
      </div>
    </div>
  );
}
