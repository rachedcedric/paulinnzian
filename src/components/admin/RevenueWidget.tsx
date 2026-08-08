"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";

type Period = "day" | "week" | "month" | "year";

const PERIODS: { key: Period; label: string }[] = [
  { key: "day",   label: "Jour" },
  { key: "week",  label: "Semaine" },
  { key: "month", label: "Mois" },
  { key: "year",  label: "Année" },
];

interface Props {
  totalRevenue: number;
  revenueDay:   number;
  revenueWeek:  number;
  revenueMonth: number;
  revenueYear:  number;
}

function fmt(amount: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(amount) + " F CFA";
}

export function RevenueWidget({ totalRevenue, revenueDay, revenueWeek, revenueMonth, revenueYear }: Props) {
  const [period, setPeriod] = useState<Period>("month");

  const values: Record<Period, number> = { day: revenueDay, week: revenueWeek, month: revenueMonth, year: revenueYear };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-50 text-green-600">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500">Chiffre d'affaires total</p>
          <p className="text-2xl font-black text-black">{fmt(totalRevenue)}</p>
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
          {period === "day" && "Aujourd'hui"}
          {period === "week" && "7 derniers jours"}
          {period === "month" && "Ce mois-ci"}
          {period === "year" && "Cette année"}
        </p>
        <p className="text-3xl font-black text-[#FF6500]">{fmt(values[period])}</p>
      </div>
    </div>
  );
}
